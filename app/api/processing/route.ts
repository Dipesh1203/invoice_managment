import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { normalizeRowsToInvoice } from "@/app/utils/normalizeInvoice";

function normalizeKey(k: any) {
  if (k == null) return "";
  return String(k)
    .replace(/\ufeff/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseNumberString(v: any): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  // Remove common currency symbols and spaces, keep digits, dot, minus
  const cleaned = s.replace(/[^0-9.\-]+/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

function findValueInRow(row: any, candidates: string[]): string {
  if (!row) return "";
  const entryKeys = Object.keys(row || {});
  const normCandidates = candidates.map((c) => normalizeKey(c));

  // First exact match on normalized key
  for (const k of entryKeys) {
    const nk = normalizeKey(k);
    if (normCandidates.includes(nk)) {
      return row[k] ?? "";
    }
  }

  // Next: contains match (e.g., "customer name" vs "customer")
  for (const k of entryKeys) {
    const nk = normalizeKey(k);
    for (const cand of normCandidates) {
      if (nk.includes(cand) || cand.includes(nk)) {
        return row[k] ?? "";
      }
    }
  }

  return "";
}

async function tryReadWorkbook(buffer: Buffer) {
  // Try reading as binary workbook first
  try {
    const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
    if (wb && wb.SheetNames && wb.SheetNames.length > 0) return wb;
  } catch (err) {
    // continue to try string
  }

  // Fallback: try as utf8 string (useful for CSV)
  try {
    const txt = buffer.toString("utf8");
    const wb = XLSX.read(txt, { type: "string" });
    if (wb && wb.SheetNames && wb.SheetNames.length > 0) return wb;
  } catch (err) {
    // final fallback below
  }

  // As last resort, try reading with raw option
  try {
    const wb = XLSX.read(buffer, { type: "buffer", raw: false });
    return wb;
  } catch (err) {
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const { file: fileBase64 } = await req.json();
    if (!fileBase64) {
      return NextResponse.json(
        { success: false, message: "Missing fileBase64" },
        { status: 400 }
      );
    }

    const cleanedBase64 = fileBase64.includes(",")
      ? fileBase64.split(",")[1]
      : fileBase64;

    const buffer = Buffer.from(cleanedBase64, "base64");

    const workbook = await tryReadWorkbook(buffer);

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json(
        { success: false, message: "No sheets found in file" },
        { status: 400 }
      );
    }

    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<any>(sheet, {
      defval: "",
      blankrows: false,
      raw: false,
    });

    if (!rows || !rows.length) {
      return NextResponse.json(
        { success: false, message: "No rows found in file" },
        { status: 400 }
      );
    }

    let invoice = normalizeRowsToInvoice(rows);

    if (!invoice || typeof invoice !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid invoice format after normalize" },
        { status: 400 }
      );
    }

    invoice.items = invoice.items || [];

    invoice.items = invoice.items.map((item: any) => ({
      ...item,
      id:
        item?.id ||
        Date.now().toString() + Math.random().toString().slice(2, 8),
    }));

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Failed to extract invoice:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to extract invoice",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
