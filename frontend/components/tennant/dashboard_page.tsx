"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAuthSessionFromAPI } from "@/fetch/auth";
import { formatCurrency, getTenantProducts, getTenantProfileImage, getUnitLabel, loadTenantProducts, shouldUseNativeImage, toTenantDashboardCard, type EditableUserRow } from "@/lib";
import type { TenantRow } from "@/structure/db";

export default function TennantDashboardPage() {
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [tenantProfile, setTenantProfile] = useState<TenantRow | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [productsVersion, setProductsVersion] = useState(0);

  useEffect(() => {
    void (async () => {
      const session = await fetchAuthSessionFromAPI();
      if (session.role === "tennant" && session.userId) {
        setTenantId(session.userId);
      }
      setIsSessionReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    void (async () => {
      const [profileRes] = await Promise.all([
        fetch("/api/iam/tenants/profile", {
          credentials: "include",
          cache: "no-store",
        }),
        loadTenantProducts(),
      ]);

      if (profileRes.ok) {
        const profile = (await profileRes.json()) as EditableUserRow;
        setTenantProfile(profile as TenantRow);
      }

      setProductsVersion((current) => current + 1);
    })();
  }, [tenantId]);

  const tenant = tenantProfile ?? undefined;
  const tenantImage = getTenantProfileImage(tenant);
  const useNativeTenantImage = shouldUseNativeImage(tenantImage);
  const rows = useMemo(() => {
    if (!tenantId) return [];
    return getTenantProducts().filter((row) => row.tenant_id === tenantId);
  }, [tenantId, productsVersion]);
  const cards = useMemo(() => rows.map(toTenantDashboardCard), [rows]);

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
                {useNativeTenantImage ? (
                  <img
                    src={tenantImage}
                    alt={tenant?.name ?? "Tenant"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={tenantImage}
                    alt={tenant?.name ?? "Tenant"}
                    width={448}
                    height={448}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Tenant Profile</p>
              <h1 className="mt-2 text-xl sm:text-2xl font-bold text-stone-900 truncate w-full">
                {tenant?.name ?? "Tenant profile unavailable"}
              </h1>
              {tenant?.created_at ? (
                <p className="mt-1 text-sm text-stone-600">{new Date(tenant.created_at).getFullYear()}</p>
              ) : null}
              {tenant?.location ? <p className="mt-1 text-sm text-stone-600">{tenant.location}</p> : null}
            </div>
          </aside>

          <section className="rounded-3xl border border-stone-200 bg-white shadow-sm p-6">
            {isSessionReady && !tenantId ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                Tenant session not found. Please sign in again.
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cards.map((card) => {
                const row = rowById[card.id];
                if (!row) return null;

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
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-stone-900 truncate">{card.name}</h3>
                      <p className="text-sm text-stone-600 mt-1">Rp{formatCurrency(row.price)}</p>
                      <p className="text-xs text-stone-500 mt-1">{row.quantity} {getUnitLabel(row.unit_id)}</p>
                    </div>
                  </div>
                );
              })}

              {isSessionReady && tenantId && cards.length === 0 ? (
                <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm font-medium text-stone-600">
                  No products found for your tenant account yet.
                </div>
              ) : null}

              {/* Add Product Card */}
              <Link
                href="/tennant/product_add"
                className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 overflow-hidden flex items-center justify-center aspect-square hover:border-teal-400 hover:bg-teal-50 transition-colors group"
              >
                <span className="text-5xl font-light text-stone-300 group-hover:text-teal-400 transition-colors leading-none">+</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
