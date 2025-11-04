"use client";

import Link from "next/link";
import SectionCard from "./components/SectionCard";
import UploadBtn from "./components/UploadBtn";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <section className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-semibold text-gray-900">Invoice Management</h1>
          <p className="mt-2 text-gray-600">Manage your invoices, products and customers from one place.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-medium text-slate-900">Upload</h3>
            <p className="mt-2 text-sm text-slate-600">Upload your files using this upload button, all file types (Excel, PDF, images)</p>
            <div className="mt-4 text-sm text-sky-600 font-medium"><UploadBtn /></div>
          </div>
          <Link href="/invoices" aria-label="Invoices">
            <SectionCard
              title="Invoices"
              description="View and manage all invoices. Create, edit and track invoice status."
            />
          </Link>

          <Link href="/products" aria-label="Products">
            <SectionCard
              title="Products"
              description="Add or edit products, prices and inventory used on invoices."
            />
          </Link>

          <Link href="/customers" aria-label="Customers">
            <SectionCard
              title="Customers"
              description="Manage customer contact details, billing information and history."
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
