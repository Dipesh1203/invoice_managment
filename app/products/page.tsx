"use client";
import Link from "next/link";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { InvoiceItem, removeItem, updateItem } from "../redux/slices/invoiceSlice";

export default function ProductsPage() {
    const invoiceData = useSelector(
        (state: RootState) => state.invoices.invoiceData
    );

    console.log("Product ", invoiceData);
    const dispatch = useDispatch();

    const handleProductChange = (
        invoiceIndex: number,
        itemIndex: number,
        field: string,
        value: string
    ) => {
        dispatch(updateItem({ invoiceIndex, itemIndex, field, value }));
    };

    return (
        <section className="max-w-5xl mx-auto p-8">
            <div className="mb-6">
                <Link href="/" className="text-sm text-sky-600">
                    ← Back to home
                </Link>
            </div>

            <header>
                <h2 className="text-2xl font-semibold">Products</h2>
                <p className="mt-2 text-slate-600">
                    Manage invoice product items.
                </p>
            </header>

            {invoiceData?.length === 0 ? (
                <div className="mt-6">
                    <p className="text-slate-500">
                        No products available. Create products inside invoices first.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto space-y-8 mt-6">
                    {invoiceData?.map((invoice, invoiceIndex) =>
                        invoice.items?.map((product, itemIndex) => (
                            <div
                                key={`${invoiceIndex}-${product.id ?? itemIndex}`}
                                className="border bg-white rounded-lg shadow-lg p-6"
                            >
                                <div className="flex justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Product: {product.description || "Unnamed"}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() =>
                                            dispatch(removeItem({ invoiceIndex, itemIndex }))
                                        }
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Remove Product
                                    </button>
                                </div>

                                <table className="min-w-full bg-white rounded-md">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Product Name</th>
                                            <th className="px-6 py-3 text-left">Quantity</th>
                                            <th className="px-6 py-3 text-left">Rate</th>
                                            <th className="px-6 py-3 text-left">Taxable Value</th>
                                            <th className="px-6 py-3 text-left">GST</th>
                                            <th className="px-6 py-3 text-left">Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr className="hover:bg-gray-100 border-b last:border-b-0">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={product.description || ""}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border-gray-300 rounded-md p-2"
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={product.quantity || ""}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border-gray-300 rounded-md p-2"
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={product.rate || ""}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "rate",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border-gray-300 rounded-md p-2"
                                                />
                                            </td>

                                            <td className="px-6 py-4">{product.taxableValue || "0.00"}</td>
                                            <td className="px-6 py-4">{product.gst || "0.00"}</td>
                                            <td className="px-6 py-4 font-medium">
                                                ₹{product.amount || "0.00"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ))
                    )}
                </div>
            )}
        </section>
    );
}
