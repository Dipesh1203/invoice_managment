"use client";

import React from "react";

type Props = {
    title: string;
    description?: string;
};

export default function SectionCard({ title, description }: Props) {
    return (
        <div className="cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-medium text-slate-900">{title}</h3>
            {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
            <div className="mt-4 text-sm text-sky-600 font-medium">Open →</div>
        </div>
    );
}
