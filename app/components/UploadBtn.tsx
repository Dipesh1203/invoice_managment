"use client";
import React, { useState } from "react";
import Image from "next/image";
import { store } from "../redux/store";
import { addInvoice } from "../redux/slices/invoiceSlice";

interface ParsedInvoiceResponse {
    invoiceInformation?: any;
    items?: any[];
    chargesAndTotals?: any;
    bankDetails?: any;
    notes?: string;
    terms?: string;
}

export default function UploadBtn() {
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<(string | null)[]>([]);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const SUPPORTED_FORMATS = [
        "image/png",
        "image/jpeg",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
    ];
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const processFiles = (newFiles: File[]) => {
        const valid: File[] = [];
        const errs: string[] = [];

        newFiles.forEach((file) => {
            if (!SUPPORTED_FORMATS.includes(file.type)) {
                errs.push(`Unsupported: ${file.name}`);
            } else if (file.size > MAX_FILE_SIZE) {
                errs.push(`File too large: ${file.name}`);
            } else {
                valid.push(file);
            }
        });

        const merged = [...files, ...valid];
        setFiles(merged);
        generateFilePreviews(merged);

        setErrorMessages(errs);
    };

    const generateFilePreviews = (list: File[]) => {
        Promise.all(
            list.map(
                (file) =>
                    new Promise<string | null>((resolve) => {
                        if (file.type.startsWith("image/")) {
                            const r = new FileReader();
                            r.onload = () => resolve(r.result as string);
                            r.readAsDataURL(file);
                        } else resolve(null);
                    })
            )
        ).then(setFilePreviews);
    };

    const removeFile = (i: number) => {
        setFiles((prev) => prev.filter((_, idx) => idx !== i));
        setFilePreviews((prev) => prev.filter((_, idx) => idx !== i));
    };

    const uploadFiles = async () => {
        if (!files.length) return alert("No files selected.");

        setLoading(true);
        try {
            for (const file of files) {
                const base64File = await readAsBase64(file);
                const mimeType = base64File.split(",")[0].split(":")[1].split(";")[0];
                const b64data = base64File.split(",")[1];

                const endpoint = (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimeType === "application/vnd.ms-excel" || mimeType === "text/csv")
                    ? "/api/processing"
                    : "/api/extraction";

                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        file: b64data,
                        mimeType: file.type,
                    }),
                });

                const json = await res.json();
                if (!json.success) continue;

                let parsed: ParsedInvoiceResponse = typeof json.data === "string"
                    ? JSON.parse(json.data.replace(/^```json|```$/g, "").trim())
                    : json.data;

                /** ✅ NEW — MATCH updated invoice slice */
                const invoiceDetails = {
                    invoiceInformation: parsed.invoiceInformation || {},
                    items: parsed.items || [],
                    chargesAndTotals: parsed.chargesAndTotals || {},
                    bankDetails: parsed.bankDetails || {},
                    notes: parsed.notes || "",
                    terms: parsed.terms || "",
                };

                store.dispatch(addInvoice(invoiceDetails));
            }

            alert("✅ Upload completed!");
            setFiles([]);
            setFilePreviews([]);
            setDialogOpen(false);
        } catch (err) {
            console.error(err);
            alert("Upload error. Check console.");
        }
        setLoading(false);
    };

    const readAsBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = () => reject();
            r.readAsDataURL(file);
        });

    return (
        <>
            <button
                onClick={() => setDialogOpen(true)}
                className="px-4 py-2 rounded-full border border-gray-800"
            >
                Upload Files
            </button>

            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDialogOpen(false)} />
                    <div className="relative z-10 bg-white w-[95%] sm:w-[420px] rounded-lg shadow-lg">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Upload Files</h3>
                        </div>

                        <label className="block p-6 border-dashed border-2 m-4 rounded-lg text-center cursor-pointer">
                            Drag & drop files
                            <input type="file" multiple className="hidden" onChange={(e) =>
                                e.target.files && processFiles(Array.from(e.target.files))
                            } />
                        </label>

                        {filePreviews.length > 0 && (
                            <ul className="p-4 grid grid-cols-2 gap-3">
                                {files.map((file, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        {filePreviews[i] ? (
                                            <Image src={filePreviews[i]!} alt="" width={48} height={48} />
                                        ) : (
                                            <span className="p-2 bg-gray-200 text-xs rounded">{file.name.split(".").pop()}</span>
                                        )}
                                        <button className="ml-auto text-red-600 text-sm" onClick={() => removeFile(i)}>
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex items-center justify-end gap-2 p-4 border-t">
                            <button className="bg-gray-100 px-3 py-1" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className={`px-3 py-1 text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                                disabled={loading}
                                onClick={uploadFiles}
                            >
                                {loading ? "Uploading..." : "Upload Files"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
