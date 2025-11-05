import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { base64ToGenerativePart } from "@/app/utils/utils";
import { v4 as uuidv4 } from "uuid";
import { InvoiceItem } from "@/app/redux/slices/invoiceSlice";

export async function GET(request: Request) {
  return NextResponse.json({ status: "OK" }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.file || typeof body.file !== "string" || !body.mimeType) {
      return NextResponse.json(
        { success: false, message: "Missing file (base64 string) or mimeType" },
        { status: 400 }
      );
    }
    console.log("Mimetype : ", body.mimeType);

    const mimeType = body.mimeType.toLowerCase();
    const fileBase64 = body.file.startsWith("data:")
      ? body.file.split(",")[1]
      : body.file;

    if (!["application/pdf", "image/png", "image/jpeg"].includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported file type. Use PDF, PNG, or JPEG.",
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log("PROD API KEY:", process.env.GEMINI_API_KEY);
    console.log("PROD PUB KEY:", process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "GEMINI_API_KEY environment variable not set on the server. Set a server-side env var named GEMINI_API_KEY in Vercel (recommended).",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const cleanedFileBase64 = fileBase64.replace(/\s/g, "");
    const documentPart = base64ToGenerativePart(cleanedFileBase64, mimeType);

    const promptText = `Extract all relevant information from the provided document or image and return ONLY a raw JSON object string following the exact structure below.

If a field is not present, set its value to an empty string "".
For arrays, return an empty array [] if no data exists.
Do NOT include any extra text, descriptions, or markdown — ONLY return the JSON.

{
  "invoiceInformation": {
    "consignee": "",
    "consigneePhone": "",
    "consigneeAddress": "",
    "gstin": "",
    "invoiceNumber": "",
    "invoiceDate": "",
    "placeOfSupply": "",
    "companyName": "",
    "companyAddress": "",
    "companyGSTIN": "",
    "companyPhone": "",
    "companyEmail": ""
  },
  "items": [
    {
      "id": "",
      "description": "",
      "quantity": "",
      "rate": "",
      "taxableValue": "",
      "gstRate": "",
      "gstAmount": "",
      "discount": "",
      "amount": ""
    }
  ],
  "chargesAndTotals": {
    "makingCharges": "",
    "debitCardCharges": "",
    "shippingCharges": "",
    "taxableAmount": "",
    "taxDetails": [
      {
        "taxType": "",
        "percentage": "",
        "amount": ""
      }
    ],
    "roundedTotal": "",
    "amountPayable": "",
    "totalAmountDue": "",
    "totalItemsQty": ""
  },
  "bankDetails": {
    "bankName": "",
    "accountNumber": "",
    "ifscCode": "",
    "branch": "",
    "beneficiaryName": ""
  },
  "notes": "",
  "terms": ""
}

Important Rules:
• Follow field names EXACTLY as provided.
• Do NOT modify structure.
• Do NOT include markdown formatting or a code block.
• Do NOT return explanation text — ONLY return the JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [documentPart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const extractedData = response.text ?? "";
    // Try to parse LLM response as JSON so downstream code receives an object
    try {
      const parsed = JSON.parse(extractedData);
      // If items is present and is an array, ensure each item has a unique id
      if (parsed && Array.isArray(parsed.items)) {
        parsed.items = parsed.items.map((i: InvoiceItem) => ({
          ...i,
          id: uuidv4(),
        }));
      }
      return NextResponse.json({ success: true, data: parsed });
    } catch (e) {
      // If parsing fails, return raw text but client should handle this case
      return NextResponse.json({ success: true, data: extractedData });
    }
  } catch (error) {
    console.error("Error processing file:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: `Processing failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Processing failed" },
      { status: 500 }
    );
  }
}
