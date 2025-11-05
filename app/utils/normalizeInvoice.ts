export interface InvoiceItem {
  id?: string;
  description?: string;
  rate?: string;
  quantity?: string;
  taxableValue?: string;
  gst?: string;
  amount?: string;
  [key: string]: string | undefined;
}

export interface InvoiceData {
  invoiceInformation?: {
    consignee?: string;
    consigneePhone?: string;
    gstin?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    placeOfSupply?: string;
    companyName?: string;
    companyGSTIN?: string;
    companyPhone?: string;
  };
  items?: InvoiceItem[];
  chargesAndTotals?: { [key: string]: string | undefined };
  bankDetails?: { [key: string]: string | undefined };
  additionalNotes?: string;
}

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

export function normalizeRowsToInvoice(rows: any[]): InvoiceData {
  if (!rows || !rows.length) return {};

  const first = rows[0] || {};

  const items = rows.map((r: any, i: number) => {
    const description =
      findValueInRow(r, [
        "Description",
        "Product Name",
        "Item",
        "Particulars",
        "Product",
      ]) || "";

    const quantity =
      findValueInRow(r, ["Qty", "Quantity", "QTY", "Qty."]) || "";

    const rate =
      findValueInRow(r, ["Rate", "Unit Price", "Price", "Unit Rate"]) || "";

    const taxableValue =
      findValueInRow(r, ["Taxable Value", "Taxable", "Taxable Amount"]) || "";

    const gst = findValueInRow(r, ["GST", "Tax Rate", "GST %"]) || "";

    const amountRaw =
      findValueInRow(r, ["Amount", "Total", "Line Total", "Value"]) || "";

    const amountNum = parseNumberString(amountRaw);

    return {
      id: (i + 1).toString(),
      description: String(description || ""),
      quantity: String(quantity || ""),
      rate: String(rate || ""),
      taxableValue: String(taxableValue || ""),
      gst: String(gst || ""),
      amount: amountNum != null ? String(amountNum) : String(amountRaw || ""),
    } as InvoiceItem;
  });

  // Determine total: prefer a total-like field in first row, else sum item amounts
  let totalVal = findValueInRow(first, [
    "Total",
    "Grand Total",
    "Amount Due",
    "Net Total",
    "Total Amount",
  ]);

  if (!totalVal) {
    for (const r of rows) {
      const tv = findValueInRow(r, ["Total", "Grand Total", "Total Amount"]);
      if (tv) {
        totalVal = tv;
        break;
      }
    }
  }

  if (!totalVal) {
    const sums = items
      .map((it: any) => parseNumberString(it.amount))
      .filter((n: number | null) => n != null) as number[];
    if (sums.length) {
      const s = sums.reduce((a, b) => a + b, 0);
      totalVal = String(s);
    }
  }

  const responseData: InvoiceData = {
    invoiceInformation: {
      consignee: String(
        findValueInRow(first, [
          "Customer Name",
          "Name",
          "Customer",
          "Bill To",
          "Consignee",
        ]) || ""
      ),
      consigneePhone: String(
        findValueInRow(first, ["Phone", "Contact", "Mobile", "Mobile No"]) || ""
      ),
      gstin: String(findValueInRow(first, ["GSTIN", "Gstin", "GST No"]) || ""),
      invoiceNumber: String(
        findValueInRow(first, ["Invoice No", "Invoice Number", "Bill No"]) || ""
      ),
      invoiceDate: String(
        findValueInRow(first, ["Invoice Date", "Date"]) || ""
      ),
      placeOfSupply: String(
        findValueInRow(first, ["Place of Supply", "Supply Place"]) || ""
      ),
      companyName: String(
        findValueInRow(first, ["Company", "Vendor", "Supplier", "Seller"]) || ""
      ),
      companyGSTIN: String(
        findValueInRow(first, ["Company GSTIN", "Supplier GSTIN"]) || ""
      ),
      companyPhone: String(
        findValueInRow(first, ["Company Phone", "Phone"]) || ""
      ),
    },
    items,
    chargesAndTotals: {
      total: totalVal ? String(totalVal) : "",
    },
    bankDetails: {},
    additionalNotes: "",
  };

  return responseData;
}
