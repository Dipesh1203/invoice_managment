"use client";
import React, { useState } from "react";
import Image from "next/image";
import { store } from "../redux/store";
import { addCustomer, addInvoice, addItem } from "../redux/slices/invoiceSlice";


interface ParsedInvoiceResponse {
    invoiceInformation: {
        consignee?: string;
        consigneePhone?: string;
        gstin?: string;
    };
    items?: any[];
    chargesAndTotals: {
        total?: string;
    };
    bankDetails?: any;
    additionalNotes?: string;
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
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"
    ];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(Array.from(e.target.files));
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        processFiles(Array.from(e.dataTransfer.files));
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => e.preventDefault();

    const processFiles = (newFiles: File[]) => {
        const valid: File[] = [];
        const errs: string[] = [];

        newFiles.forEach((file) => {
            const exists = files.find((f) => f.name === file.name);
            if (!SUPPORTED_FORMATS.includes(file.type)) {
                errs.push(`Unsupported format: ${file.name}`);
            } else if (file.size > MAX_FILE_SIZE) {
                errs.push(`File too large (max 5MB): ${file.name}`);
            } else if (exists) {
                errs.push(`File already added: ${file.name}`);
            } else {
                valid.push(file);
            }
        });

        const merged = mergeFiles(files, valid);
        setFiles(merged);
        generateFilePreviews(merged);

        if (merged.length > 0) setErrorMessages([]);
        else setErrorMessages(errs);
    };

    const mergeFiles = (current: File[], incoming: File[]) => {
        const names = new Set(current.map((f) => f.name));
        return [...current, ...incoming.filter((f) => !names.has(f.name))];
    };

    const generateFilePreviews = (fileList: File[]) => {
        const previews = fileList.map((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                return new Promise<string | null>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => resolve(null);
                });
            }
            return Promise.resolve(null);
        });

        Promise.all(previews).then(setFilePreviews).catch(() => setFilePreviews([]));
    };

    const removeFile = (index: number) => {
        const f = [...files];
        const p = [...filePreviews];
        f.splice(index, 1);
        p.splice(index, 1);
        setFiles(f);
        setFilePreviews(p);
    };

    const uploadFiles = async () => {
        if (files.length === 0) {
            window.alert("No files to upload.");
            return;
        }

        setLoading(true);
        try {
            const filePromises = files.map(
                (file) =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
                        reader.readAsDataURL(file);
                    })
            );

            const base64Files = await Promise.all(filePromises);

            const results = await Promise.all(
                base64Files.map(async (base64) => {
                    const mimeType = base64.split(",")[0].split(":")[1].split(";")[0];
                    const base64Data = base64.split(",")[1];
                    console.log("Mimetype ", mimeType)
                    if (
                        mimeType ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimeType === "application/vnd.ms-excel" || mimeType === "text/csv"
                    ) {
                        const res = await fetch("/api/processing", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ file: base64Data }),
                        });
                        const json = await res.json();
                        if (json.success) {
                            const parsed: ParsedInvoiceResponse = json.data;
                            const items = (parsed.items || []).map((i) => ({
                                ...i,
                                id: Date.now().toString() + Math.random().toString().slice(2, 8),
                            }));

                            const invoiceTotalAmount = parsed.chargesAndTotals?.total || "0.00";

                            const invoiceDetails = {
                                invoiceInformation: parsed.invoiceInformation || {},
                                items: items,
                                chargesAndTotals: parsed.chargesAndTotals || {},
                                bankDetails: parsed.bankDetails || {},
                                additionalNotes: parsed.additionalNotes || "",
                            };

                            store.dispatch(addInvoice(invoiceDetails));

                            // compute the invoice index we just added
                            const state = store.getState();
                            const invoiceIndex = (state.invoices.invoiceData?.length || 1) - 1;

                            if (invoiceDetails.invoiceInformation) {
                                store.dispatch(
                                    addCustomer({
                                        invoiceIndex,
                                        customer: {
                                            ...invoiceDetails.invoiceInformation,
                                        },
                                    })
                                );
                            }
                            if (items.length > 0) {
                                items.forEach((item) => {
                                    // addItem expects payload { invoiceIndex, item }
                                    store.dispatch(addItem({ invoiceIndex, item } as any));
                                });
                            }

                            console.log("Invoice data successfully processed and normalized.");
                            return true;
                        }
                        return false;
                    }

                    const res = await fetch("/api/extraction", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ file: base64Data, mimeType }),
                    });

                    const json = await res.json();
                    if (json.success) {
                        // LLM endpoint may return parsed JSON or a raw string; handle both
                        let parsed: ParsedInvoiceResponse;
                        if (typeof json.data === "string") {
                            const responseData = json.data.replace(/^```json|```$/g, "").trim();
                            parsed = JSON.parse(responseData);
                        } else {
                            parsed = json.data as ParsedInvoiceResponse;
                        }
                        let items = parsed.items || [];

                        // ensure items have unique ids
                        items = items.map((i) => ({
                            ...i,
                            id: Date.now().toString() + Math.random().toString().slice(2, 8),
                        }));

                        const invoiceTotalAmount = parsed.chargesAndTotals?.total || "0.00";

                        const invoiceDetails = {
                            invoiceInformation: parsed.invoiceInformation || {},
                            items: items,
                            chargesAndTotals: parsed.chargesAndTotals || {},
                            bankDetails: parsed.bankDetails || {},
                            additionalNotes: parsed.additionalNotes || "",
                        };

                        store.dispatch(addInvoice(invoiceDetails));

                        const state = store.getState();
                        const invoiceIndex = (state.invoices.invoiceData?.length || 1) - 1;

                        if (invoiceDetails.invoiceInformation) {
                            store.dispatch(
                                addCustomer({
                                    invoiceIndex,
                                    customer: {
                                        ...invoiceDetails.invoiceInformation,
                                    },
                                })
                            );
                        }
                        if (items.length > 0) {
                            items.forEach((item) => {
                                store.dispatch(addItem({ invoiceIndex, item } as any));
                            });
                        }

                        console.log("Invoice data successfully processed and normalized.");
                        return true;
                    }
                    return false;
                })
            );

            if (results.every(Boolean)) {
                window.alert("All files uploaded successfully.");
                setFiles([]);
                setFilePreviews([]);
                setDialogOpen(false);
            } else {
                window.alert("Some files failed to upload. See console for details.");
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            window.alert("An error occurred during upload. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setDialogOpen(true)}
                className="px-4 py-2 rounded-full border border-gray-800 text-gray-700 flex items-center gap-2 hover:shadow-md transition"
                type="button"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m0 0l3-3m-3 3l-3-3" />
                </svg>
                Upload Files
            </button>

            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setDialogOpen(false)}
                    />

                    <div className="relative z-10 w-[95%] sm:w-[420px] bg-white rounded-lg shadow-lg">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">Upload Files</h3>
                            <p className="text-sm text-gray-500">Drag & drop or click to select files (.pdf, .png, .jpg, .xlsx)</p>
                        </div>

                        <label
                            htmlFor="file-upload"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="block p-6 text-center cursor-pointer border-dashed border-2 border-gray-200 m-4 rounded-lg"
                        >
                            <p className="text-sm text-gray-600">Drop files here or click to browse</p>
                            <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
                        </label>

                        {errorMessages.length > 0 && files.length === 0 && (
                            <div className="px-4 text-red-600">
                                {errorMessages.map((m, i) => (
                                    <p key={i} className="text-sm">{m}</p>
                                ))}
                            </div>
                        )}

                        {files.length > 0 && (
                            <div className="p-4">
                                <p className="font-semibold mb-2">Selected Files</p>
                                <ul className="grid grid-cols-2 gap-3">
                                    {files.map((file, idx) => (
                                        <li key={file.name + idx} className="flex items-center gap-2">
                                            {filePreviews[idx] ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <Image src={filePreviews[idx]!} alt={file.name} width={48} height={48} className="object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-600">
                                                    {file.name.split(".").pop()?.toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-sm truncate">{file.name}</span>
                                            <button onClick={() => removeFile(idx)} className="ml-auto text-sm text-red-600">Remove</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2 p-4 border-t">
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="px-3 py-1 rounded bg-gray-100 text-gray-700"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={uploadFiles}
                                disabled={loading || files.length === 0}
                                className={`px-3 py-1 rounded text-white ${loading || files.length === 0 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                                type="button"
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
