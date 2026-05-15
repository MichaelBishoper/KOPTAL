"use client";

import Image from "next/image";
import Catalog from "@/components/marketplace/Catalog";
import { getTenantByName, getTenantProducts, getTenants, toCatalogCard } from "@/lib";

type TenantPageProps = {
  name?: string;
  location?: string;
};

export default function TenantPage({ name, location }: TenantPageProps) {
  const selectedTenant = (name ? getTenantByName(name) : undefined) ?? getTenants()[0];
  const displayedLocation = location ?? selectedTenant?.location;
  const joinedDate = selectedTenant?.created_at ? new Date(selectedTenant.created_at) : null;
  const joinedYear = joinedDate && !Number.isNaN(joinedDate.getTime()) ? joinedDate.getFullYear() : null;

  const products = selectedTenant
    ? getTenantProducts()
        .filter((product) => product.tenant_id === selectedTenant.tenant_id)
        .map(toCatalogCard)
    : [];

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] items-start">
          <aside className="lg:sticky lg:top-[175px] self-start">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
              <div className="h-56 w-56 sm:h-72 sm:w-72 rounded-3xl overflow-hidden border border-stone-200 bg-stone-100">
                <Image
                  src={selectedTenant?.image ?? "/product-placeholder.jpg"}
                  alt={selectedTenant?.name ?? "Tenant"}
                  width={448}
                  height={448}
                  className="h-full w-full object-cover"
                />
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Tenant Profile</p>
              <h1 className="mt-2 text-xl sm:text-2xl font-bold text-stone-900 truncate w-full">{selectedTenant?.name ?? "Tenant"}</h1>
              {joinedYear !== null ? <p className="mt-1 text-sm text-stone-600">{joinedYear}</p> : null}
              {displayedLocation ? <p className="mt-1 text-sm text-stone-600">{displayedLocation}</p> : null}
            </div>
          </aside>

          <section className="rounded-3xl border border-stone-200 bg-white shadow-sm">
            <Catalog columns={4} products={products} />
          </section>
        </div>
      </div>
    </main>
  );
}
