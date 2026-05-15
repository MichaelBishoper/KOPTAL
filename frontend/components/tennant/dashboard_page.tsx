"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { formatCurrency, loadTenantProducts, loadTenants, getUnitLabel, toTenantDashboardCard } from "@/lib";
import type { TenantProductRow, TenantRow } from "@/structure/db";

export default function TennantDashboardPage() {
  const [tenant, setTenant] = useState<TenantRow | undefined>(undefined);
  const [rows, setRows] = useState<TenantProductRow[]>([]);

  useEffect(() => {
    Promise.all([loadTenants(), loadTenantProducts()]).then(([tenants, products]) => {
      setTenant(tenants[0]);
      setRows(products);
    });
  }, []);

  const cards = useMemo(() => rows.map(toTenantDashboardCard), [rows]);
  const [hiddenCardIds, setHiddenCardIds] = useState<string[]>([]);

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
                  <div key={card.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm group">
                    <div className="relative">
                      <Link href={`/tennant/product_add?mode=edit&id=${card.id}`} className="block">
                        <div className="relative w-full aspect-square bg-stone-100 overflow-hidden">
                          <Image
                            src={card.image}
                            alt={card.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeCard(card.id)}
                        className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 shadow-md transition"
                      >
                        -
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-stone-900 truncate">{card.name}</h3>
                      <p className="text-sm text-stone-600 mt-1">Rp{formatCurrency(row.price)}</p>
                      <p className="text-xs text-stone-500 mt-1">{row.quantity} {getUnitLabel(row.unit_id)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
