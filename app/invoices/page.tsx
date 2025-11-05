"use client";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { updateInvoice } from "../redux/slices/invoiceSlice";

export default function InvoicesPage() {
    const invoiceData = useSelector((state: RootState) => state.invoices.invoiceData);
    const dispatch = useDispatch();

    console.log("Invoice ", invoiceData);
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        invoiceIndex: number,
        itemIndex: number,
        field: string
    ) => {
        let updatedValue = e.target.value;

        if (field === 'quantity' || field === 'amount') {
            updatedValue = updatedValue.replace(/,/g, '');
        }

        dispatch(
            updateInvoice({ invoiceIndex, itemIndex, field, value: updatedValue })
        );
    };

    const formatNumberWithoutCommas = (value: string | number) => {
        if (!value) return '';
        return Number(String(value).replace(/,/g, ''));
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <section className="max-w-5xl mx-auto p-8">
            <div className="mb-6">
                <Link href="/" className="text-sm text-sky-600">← Back to home</Link>
            </div>
            <header>
                <h2 className="text-2xl font-semibold">Invoices</h2>
                <p className="mt-2 text-slate-600">List and manage invoices (placeholder).</p>
            </header>

            {invoiceData?.length === 0 ? <div className="mt-6">
                <p className="text-slate-500">This page will list invoices and allow creating/editing them. Connect to your store or API to render data here.</p>
            </div> : (
                <div className="overflow-x-auto">
                    <div className="space-y-6">
                        {invoiceData?.map((invoice, invoiceIndex) => (
                            <div
                                key={invoiceIndex}
                                className="border bg-white rounded-lg shadow-lg p-6"
                            >
                                {/* Invoice Header */}
                                <div className="flex justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Invoice Number:{' '}
                                            {invoice.invoiceInformation?.invoiceNumber}
                                        </h3>
                                        <p className="text-gray-600">
                                            Customer Name:{' '}
                                            <input
                                                type="text"
                                                value={invoice.invoiceInformation?.consignee || ''}
                                                onChange={(e) =>
                                                    handleChange(e, invoiceIndex, -1, 'consignee')
                                                }
                                                className="w-auto border-gray-300 rounded-md p-2 ml-2"
                                            />
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">
                                            Invoice Date:{' '}
                                            <input
                                                readOnly
                                                type="date"
                                                value={
                                                    invoice.invoiceInformation?.invoiceDate
                                                        ? formatDate(invoice.invoiceInformation.invoiceDate)
                                                        : ''
                                                }
                                                onChange={(e) =>
                                                    handleChange(e, invoiceIndex, -1, 'invoiceDate')
                                                }
                                                className="w-auto border-gray-300 rounded-md p-2"
                                            />
                                        </p>
                                    </div>
                                </div>
                                {/* Invoice Items */}
                                <table className="min-w-full bg-white rounded-md">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Product Name</th>
                                            <th className="px-6 py-3 text-left">Quantity</th>
                                            <th className="px-6 py-3 text-left">Tax</th>
                                            <th className="px-6 py-3 text-left">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="rounded-md">
                                        {invoice.items?.map((item, itemIndex) => (
                                            <tr
                                                key={itemIndex}
                                                className="hover:bg-gray-100 border-b last:border-b-0"
                                            >
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={item.description || item.productName || ''}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                e,
                                                                invoiceIndex,
                                                                itemIndex,
                                                                'description'
                                                            )
                                                        }
                                                        className="w-full border-gray-300 rounded-md p-2"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={formatNumberWithoutCommas(
                                                            item.quantity || ''
                                                        )}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                e,
                                                                invoiceIndex,
                                                                itemIndex,
                                                                'quantity'
                                                            )
                                                        }
                                                        className="w-full border-gray-300 rounded-md p-2"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={item.gst ? item.gst.split(' ')[0] : ''}
                                                        onChange={(e) =>
                                                            handleChange(e, invoiceIndex, itemIndex, 'gst')
                                                        }
                                                        className="w-full border-gray-300 rounded-md p-2"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={formatNumberWithoutCommas(item.amount || 0)}
                                                        onChange={(e) =>
                                                            handleChange(e, invoiceIndex, itemIndex, 'amount')
                                                        }
                                                        className="w-full border-gray-300 rounded-md p-2"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
