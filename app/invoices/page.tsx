"use client";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
    InvoiceInformation,
    InvoiceItem,
    updateInvoiceInformation,
    updateItem,
} from "../redux/slices/invoiceSlice";

export default function InvoicesPage() {
    const invoiceData = useSelector(
        (state: RootState) => state.invoices.invoiceData
    );
    const dispatch = useDispatch();

    const handleItemChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        invoiceIndex: number,
        itemIndex: number,
        field: keyof InvoiceItem
    ) => {
        let updatedValue = e.target.value.replace(/,/g, "");
        dispatch(updateItem({ invoiceIndex, itemIndex, field, value: updatedValue }));
    };

    const handleInvoiceInfoChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        invoiceIndex: number,
        field: keyof InvoiceInformation
    ) => {
        dispatch(
            updateInvoiceInformation({
                invoiceIndex,
                data: { [field]: e.target.value },
            })
        );
    };

    const formatNumberWithoutCommas = (value?: string | number) =>
        value ? Number(String(value).replace(/,/g, "")) : "";

    const formatDate = (rawDate: string) => {
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().slice(0, 10);
    };

    const isEmpty = (v: any) =>
        v == null || (typeof v === "string" && v.trim() === "");

    return (
        <section className="max-w-5xl mx-auto p-8">
            <div className="mb-6">
                <Link href="/" className="text-sm text-sky-600">
                    ← Back to home
                </Link>
            </div>

            <header>
                <h2 className="text-2xl font-semibold">Invoices</h2>
            </header>

            {invoiceData?.length === 0 ? (
                <div className="mt-6 text-slate-500">
                    No invoices found. Please upload to process invoice data.
                </div>
            ) : (
                <div className="space-y-6 mt-6">
                    {invoiceData?.map((invoice, invoiceIndex) => (
                        <div
                            key={invoiceIndex}
                            className="border bg-white rounded-lg shadow-lg p-6"
                        >
                            {/* Header */}
                            <div className="flex justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        #{invoiceIndex + 1} — Invoice Number:{" "}
                                        {invoice.invoiceInformation?.invoiceNumber}
                                    </h3>

                                    {/* Consignee Name */}
                                    <p className="text-gray-600">
                                        Customer:{" "}
                                        <input
                                            type="text"
                                            value={invoice.invoiceInformation?.consignee || ""}
                                            onChange={(e) =>
                                                handleInvoiceInfoChange(
                                                    e,
                                                    invoiceIndex,
                                                    "consignee"
                                                )
                                            }
                                            className={`border p-2 ml-2 rounded-md ${isEmpty(invoice.invoiceInformation?.consignee)
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                        />
                                    </p>
                                </div>

                                {/* Invoice Date */}
                                <div>
                                    <p className="text-gray-600">Invoice Date:</p>
                                    <input
                                        type="date"
                                        readOnly
                                        value={
                                            invoice.invoiceInformation?.invoiceDate
                                                ? formatDate(
                                                    invoice.invoiceInformation.invoiceDate
                                                )
                                                : ""
                                        }
                                        className="border-gray-300 rounded-md p-2"
                                    />
                                </div>

                                <div className="text-right">
                                    <p className="text-gray-600">Total Amount:</p>
                                    <div className="font-semibold">
                                        ₹{invoice.chargesAndTotals?.amountPayable || "0.00"}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <table className="min-w-full bg-white rounded-md">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Product</th>
                                        <th className="px-6 py-3 text-left">Qty</th>
                                        <th className="px-6 py-3 text-left">GST %</th>
                                        <th className="px-6 py-3 text-left">Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {invoice.items?.map((item, itemIndex) => (
                                        <tr key={itemIndex} className="border-b hover:bg-gray-100">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={item.description || ""}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            e,
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "description"
                                                        )
                                                    }
                                                    className="w-full border p-2 rounded-md"
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={formatNumberWithoutCommas(item.quantity)}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            e,
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "quantity"
                                                        )
                                                    }
                                                    className="w-full border p-2 rounded-md"
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={item.gstRate || ""}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            e,
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "gstRate"
                                                        )
                                                    }
                                                    className="w-full border p-2 rounded-md"
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={formatNumberWithoutCommas(item.amount)}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            e,
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "amount"
                                                        )
                                                    }
                                                    className="w-full border p-2 rounded-md"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
