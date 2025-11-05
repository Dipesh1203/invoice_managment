import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { base64ToGenerativePart } from "@/app/utils/utils";

const API_KEY = process.env.GEMINI_API_KEY;

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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "LLM_API_KEY environment variable not set" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const cleanedFileBase64 = fileBase64.replace(/\s/g, "");
    const documentPart = base64ToGenerativePart(cleanedFileBase64, mimeType);

    const promptText = `Please extract all relevant information from the document or image and provide it as a raw JSON object string using the following structure. Fill in all available fields, and for any missing field, leave the value as an empty string ("").

{
  "invoiceInformation": {
    "consignee": "<Consignee Name>",
    "consigneePhone": "<Consignee Phone>",
    "gstin": "<GSTIN Number>",
    "invoiceNumber": "<Invoice Number>",
    "invoiceDate": "<Invoice Date>",
    "placeOfSupply": "<Place of Supply>",
    "companyName": "<Company Name>",
    "companyGSTIN": "<Company GSTIN>",
    "companyPhone": "<Company Phone>"
  },
  "items": [
    {
      "description": "<Item Description>",
      "rate": "<Item Rate>",
      "quantity": "<Item Quantity>",
      "taxableValue": "<Item Taxable Value>",
      "gst": "<GST Amount>",
      "amount": "<Item Amount>"
    }
  ],
  "chargesAndTotals": {
    "makingCharges": "<Making Charges>",
    "debitCardCharges": "<Debit Card Charges>",
    "shippingCharges": "<Shipping Charges>",
    "taxableAmount": "<Taxable Amount>",
    "cgst": "<CGST>",
    "sgst": "<SGST>",
    "total": "<Total>",
    "amountPayable": "<Amount Payable>",
    "totalAmountDue": "<Total Amount Due>",
    "totalItemsQty": "<Total Items Quantity>"
  },
  "bankDetails": {
    "bankName": "<Bank Name>",
    "accountNumber": "<Account Number>",
    "ifscCode": "<IFSC Code>",
    "branch": "<Branch>",
    "beneficiaryName": "<Beneficiary Name>"
  },
  "additionalNotes": "<Additional Notes or Terms>"
}

Do not include any text, comments, or markdown (like JSON code blocks) outside of the JSON object itself.`;

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
