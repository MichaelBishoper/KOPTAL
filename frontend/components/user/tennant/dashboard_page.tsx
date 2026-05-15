"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, getTenants, getTenantProducts, getUnitLabel, loadTenantProducts, loadTenants, toTenantDashboardCard } from "@/lib";

export default function TennantDashboardPage() {
  const [tenant, setTenant] = useState(() => getTenants()[0]);
  const [rows, setRows] = useState(() => getTenantProducts());
  const cards = useMemo(() => rows.map(toTenantDashboardCard), [rows]);
  const [hiddenCardIds, setHiddenCardIds] = useState<string[]>([]);

  useEffect(() => {
    void Promise.all([loadTenants(), loadTenantProducts()]).then(([tenants, products]) => {
      setTenant(tenants[0]);
      setRows(products);
    });
  }, []);

  const removeCard = (cardId: string) => {
    setHiddenCardIds((current) => (current.includes(cardId) ? current : [...current, cardId]));
  };

  const rowById = useMemo(
    () => Object.fromEntries(rows.map((row) => [String(row.product_id), row])),
    [rows],
  );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] items-start">
          <aside className="lg:sticky lg:top-[175px] self-start">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
              <div className="h-56 w-56 sm:h-72 sm:w-72 rounded-3xl overflow-hidden border border-stone-200 bg-stone-100">
                <Image
                  src={tenant?.image ?? "/product-placeholder.jpg"}
                  alt={tenant?.name ?? "Tenant"}
                  width={448}
                  height={448}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Tenant Profile</p>
              <h1 className="mt-2 text-xl sm:text-2xl font-bold text-stone-900 truncate w-full">{tenant?.name ?? "Your Store"}</h1>
              <p className="mt-1 text-sm text-stone-600">{tenant ? new Date(tenant.created_at).getFullYear() : "2026"}</p>
              <p className="mt-1 text-sm text-stone-600">{tenant?.location ?? "West Java"}</p>
            </div>
          </aside>

          <section className="rounded-3xl border border-stone-200 bg-white shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cards.map((card) => {
                const row = rowById[card.id];
                if (!row) return null;
                if (hiddenCardIds.includes(card.id)) return null;

                return (
                <div key={card.id} className="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => removeCard(card.id)}
                    className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full border border-gray-200 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50"
                    aria-label={`Remove ${card.name}`}
                  >
                    -
                  </button>

                  <Link href={`/tennant/product_add?mode=edit&id=${row.product_id}`} className="block">
                    <div className="relative w-full aspect-square bg-gray-100">
                      <Image src={card.image} alt={card.name} fill className="object-cover" />
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{card.name}</h3>
                      <p className="text-xs text-gray-600">{card.tenantName}</p>
                      <p className="mt-2 text-sm font-bold text-gray-900">Rp{formatCurrency(row.price)}</p>
                      <p className="text-xs text-gray-600">{getUnitLabel(row.unit_id)}</p>
                    </div>
                  </Link>
                </div>
              )})}

              <Link href="/tennant/product_add" className="border border-dashed border-stone-300 rounded-lg flex items-center justify-center bg-stone-50">
                <div className="text-4xl text-stone-400">+</div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
