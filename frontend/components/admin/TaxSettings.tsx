"use client";

import { getTaxRate, loadAdminSettings } from "@/lib";
import { useState, useEffect } from "react";

export function TaxSettings() {
  const [taxRate, setTaxRate] = useState<number>(11);

  useEffect(() => {
    void (async () => {
      await loadAdminSettings();
      setTaxRate(getTaxRate());
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-700">Tax Rate</h2>
          <p className="mt-1 text-xs text-stone-500">Global rate used for checkout and transaction totals.</p>
        </div>
        <div className="inline-flex items-baseline gap-1 rounded-lg bg-teal-50 px-4 py-2 text-teal-700">
          <span className="text-3xl font-bold leading-none">{taxRate}</span>
          <span className="text-sm font-semibold">%</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
        Tax rate is backend-managed. Frontend editing is disabled.
      </div>
    </div>
  );
}
