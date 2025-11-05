"use client";
import Link from "next/link";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
    updateInvoiceInformation,
} from "../redux/slices/invoiceSlice";
import { InvoiceInformation } from "../redux/slices/invoiceSlice";

export default function CustomersPage() {
    const invoiceData = useSelector(
        (state: RootState) => state.invoices.invoiceData
    );

    const dispatch = useDispatch();

    const handleCustomerChange = (
        invoiceIndex: number,
        field: keyof InvoiceInformation,
        value: string
    ) => {
        dispatch(updateInvoiceInformation({ invoiceIndex, data: { [field]: value } }));
    };

    const sumAmounts = (invoice: any) => {
        const payable = parseFloat(invoice.chargesAndTotals?.amountPayable || "0");
        if (!isNaN(payable) && payable > 0) return payable;

        return (invoice.items || []).reduce((acc: number, it: any) => {
            return acc + parseFloat(it.amount || "0");
        }, 0);
    };

    return (
        <section className="max-w-5xl mx-auto p-8">
            <div className="mb-6">
                <Link href="/" className="text-sm text-sky-600">
                    ← Back to home
                </Link>
            </div>

            <header>
                <h2 className="text-2xl font-semibold">Customers</h2>
                <p className="mt-2 text-slate-600">Customer details from invoices.</p>
            </header>

            {!invoiceData?.length ? (
                <div className="mt-6 text-slate-500">
                    No invoices found. Upload invoice files first.
                </div>
            ) : (
                <div className="overflow-x-auto space-y-8 mt-6">
                    {invoiceData.map((invoice, invoiceIndex) => {
                        const customer = invoice.invoiceInformation || {};

                        const invoiceCount = invoiceData.filter(
                            (inv) =>
                                inv.invoiceInformation?.consignee ===
                                customer.consignee
                        ).length;

                        const totalPurchase = sumAmounts(invoice);

                        return (
                            <div
                                key={invoiceIndex}
                                className="border bg-white rounded-lg shadow-lg p-6"
                            >
                                <div className="flex justify-between mb-4">
                                    <h3 className="text-lg font-semibold">
                                        Customer: {customer.consignee || "New Customer"}
                                    </h3>
                                </div>

                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Name</th>
                                            <th className="px-6 py-3 text-left">Phone</th>
                                            <th className="px-6 py-3 text-left">GSTIN</th>
                                            <th className="px-6 py-3 text-left">Address</th>
                                            <th className="px-6 py-3 text-left">Invoices Count</th>
                                            <th className="px-6 py-3 text-left">Total Purchase</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr className="hover:bg-gray-100 border-b">
                                            {/* Name */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={customer.consignee || ""}
                                                    onChange={(e) =>
                                                        handleCustomerChange(
                                                            invoiceIndex,
                                                            "consignee",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-md p-2 border border-gray-300"
                                                />
                                            </td>

                                            {/* Phone */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={customer.consigneePhone || ""}
                                                    onChange={(e) =>
                                                        handleCustomerChange(
                                                            invoiceIndex,
                                                            "consigneePhone",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-md p-2 border border-gray-300"
                                                />
                                            </td>

                                            {/* GSTIN */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={customer.gstin || ""}
                                                    onChange={(e) =>
                                                        handleCustomerChange(
                                                            invoiceIndex,
                                                            "gstin",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </td>

                                            {/* Address */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={customer.consigneeAddress || ""}
                                                    onChange={(e) =>
                                                        handleCustomerChange(
                                                            invoiceIndex,
                                                            "consigneeAddress",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </td>

                                            {/* Invoice Count */}
                                            <td className="px-6 py-4 font-medium">
                                                {invoiceCount}
                                            </td>

                                            {/* Totals */}
                                            <td className="px-6 py-4 font-semibold">
                                                ₹{totalPurchase.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
