"use client";
import Link from "next/link";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
    removeItem,
    updateItem,
} from "../redux/slices/invoiceSlice";
import { InvoiceItem } from "../redux/slices/invoiceSlice";

export default function ProductsPage() {
    const invoiceData = useSelector(
        (state: RootState) => state.invoices.invoiceData
    );

    const dispatch = useDispatch();

    const handleProductChange = (
        invoiceIndex: number,
        itemIndex: number,
        field: keyof InvoiceItem,
        value: string
    ) => {
        dispatch(updateItem({ invoiceIndex, itemIndex, field, value }));
    };

    const computeTaxableValue = (item: InvoiceItem) => {
        const rate = parseFloat(item.rate || "0");
        const qty = parseFloat(item.quantity || "0");
        return isNaN(rate * qty) ? "" : (rate * qty).toFixed(2);
    };

    const computeGST = (item: InvoiceItem) => {
        const taxable = parseFloat(computeTaxableValue(item));
        const gstRate = parseFloat(item.gstRate || "0");
        return isNaN(taxable * (gstRate / 100))
            ? ""
            : (taxable * (gstRate / 100)).toFixed(2);
    };

    return (
        <section className="max-w-5xl mx-auto p-8">
            <Link href="/" className="text-sm text-sky-600">
                ← Back to home
            </Link>

            <header className="mt-4">
                <h2 className="text-2xl font-semibold">Products</h2>
                <p className="mt-2 text-slate-600">Manage invoice product items.</p>
            </header>

            {!invoiceData?.length ? (
                <p className="mt-6 text-slate-500">
                    No products available. Create products inside invoices first.
                </p>
            ) : (
                <div className="overflow-x-auto space-y-8 mt-6">
                    {invoiceData.map((invoice, invoiceIndex) =>
                        invoice.items?.map((product, itemIndex) => (
                            <div
                                key={`${invoiceIndex}-${itemIndex}-${product.id}`}
                                className="border bg-white rounded-lg shadow-lg p-6"
                            >
                                {/* Header */}
                                <div className="flex justify-between mb-4">
                                    <h3 className="text-lg font-semibold">
                                        Product: {product.description || "Unnamed"}
                                    </h3>
                                    <button
                                        onClick={() =>
                                            dispatch(removeItem({ invoiceIndex, itemIndex }))
                                        }
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Remove Product
                                    </button>
                                </div>

                                {/* Product Table */}
                                <table className="min-w-full bg-white rounded-md">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Product Name</th>
                                            <th className="px-6 py-3 text-left">Qty</th>
                                            <th className="px-6 py-3 text-left">Rate</th>
                                            <th className="px-6 py-3 text-left">Taxable Value</th>
                                            <th className="px-6 py-3 text-left">GST %</th>
                                            <th className="px-6 py-3 text-left">GST Amount</th>
                                            <th className="px-6 py-3 text-left">Total Amount</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr className="hover:bg-gray-100 border-b">
                                            {/* Description */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={product.description ?? ""}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-md p-2 border border-gray-300"
                                                />
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={product.quantity ?? ""}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </td>

                                            {/* Rate */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={product.rate ?? ""}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "rate",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </td>

                                            {/* Taxable Value ➝ Auto */}
                                            <td className="px-6 py-4 font-medium">
                                                {computeTaxableValue(product)}
                                            </td>

                                            {/* GST Rate */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={product.gstRate ?? ""}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            invoiceIndex,
                                                            itemIndex,
                                                            "gstRate",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                />
                                            </td>

                                            {/* GST Amount ➝ Auto */}
                                            <td className="px-6 py-4">
                                                {computeGST(product) || "0.00"}
                                            </td>

                                            {/* Total Amount → taxable + gst */}
                                            <td className="px-6 py-4 font-semibold">
                                                ₹
                                                {(
                                                    parseFloat(computeTaxableValue(product)) +
                                                    parseFloat(computeGST(product))
                                                ).toFixed(2)}
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
