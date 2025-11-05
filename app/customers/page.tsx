"use client";
import Link from "next/link";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateCustomer } from "../redux/slices/invoiceSlice";

export default function CustomersPage() {
    const invoiceData = useSelector(
        (state: RootState) => state.invoices.invoiceData
    );
    console.log("Customer ", invoiceData);

    const dispatch = useDispatch();

    const handleCustomerChange = (
        invoiceIndex: number,
        field: string,
        value: string
    ) => {
        dispatch(updateCustomer({ invoiceIndex, field, value }));
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
                <p className="mt-2 text-slate-600">
                    Customer details based on created invoices.
                </p>
            </header>

            {invoiceData?.length === 0 ? (
                <div className="mt-6">
                    <p className="text-slate-500">
                        No invoices found. Create an invoice to manage customer details.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto space-y-8 mt-6">
                    {invoiceData?.map((invoice, invoiceIndex) => {
                        const customer = invoice.invoiceInformation || {};

                        return (
                            <div
                                key={invoiceIndex}
                                className="border bg-white rounded-lg shadow-lg p-6"
                            >
                                <div className="flex justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Customer: {customer.consignee || "New Customer"}
                                        </h3>
                                    </div>
                                </div>

                                <table className="min-w-full bg-white rounded-md">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Name</th>
                                            <th className="px-6 py-3 text-left">Phone</th>
                                            <th className="px-6 py-3 text-left">GSTIN</th>
                                            <th className="px-6 py-3 text-left">Invoices Count</th>
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
                                                    className="w-full border-gray-300 rounded-md p-2"
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
                                                    className="w-full border-gray-300 rounded-md p-2"
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
                                                    className="w-full border-gray-300 rounded-md p-2"
                                                />
                                            </td>

                                            {/* Count of invoices this customer appears in */}
                                            <td className="px-6 py-4 font-medium">
                                                {invoice.items?.length || 0}
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
