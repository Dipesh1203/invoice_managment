"use client";
import Link from "next/link";

export default function ProductsPage() {
    return (
        <section className="max-w-5xl mx-auto p-8">
            <header>
                <h2 className="text-2xl font-semibold">Products</h2>
                <p className="mt-2 text-slate-600">Manage products and pricing (placeholder).</p>
            </header>

            <div className="mt-6">
                <p className="text-slate-500">This page will list products and allow creating/editing them. Connect to your store or API to render data here.</p>
            </div>

            <div className="mt-6">
                <Link href="/" className="text-sm text-sky-600">← Back to home</Link>
            </div>
        </section>
    );
}
