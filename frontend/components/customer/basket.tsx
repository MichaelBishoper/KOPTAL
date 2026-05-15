"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatCurrency, getAuthSession, getBasketItems, getTaxRate, getTenantById, removeBasketItem, type BasketItem } from "@/lib";

type BasketGroup = {
  tenantId: number;
  tenantName: string;
  tenantLocation: string;
  items: BasketItem[];
};

export default function Basket() {
  const router = useRouter();
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(getBasketItems());
    setIsReady(true);
  }, []);

  const groupedItems = useMemo<BasketGroup[]>(() => {
    const groups = new Map<number, BasketItem[]>();

    for (const item of items) {
      const existing = groups.get(item.tenant_id) ?? [];
      groups.set(item.tenant_id, [...existing, item]);
    }

    return Array.from(groups.entries()).map(([tenantId, groupItems]) => {
      const tenant = getTenantById(tenantId);

      return {
        tenantId,
        tenantName: tenant?.name ?? `Tenant ${tenantId}`,
        tenantLocation: tenant?.location ?? "West Java",
        items: groupItems,
      };
    });
  }, [items]);

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items],
  );

  const taxRate = getTaxRate();
  const taxAmount = useMemo(() => Math.round(totalPrice * (taxRate / 100)), [totalPrice, taxRate]);
  const grandTotal = totalPrice + taxAmount;

  const handleRemove = (productId: number) => {
    const nextItems = removeBasketItem(productId);
    setItems(nextItems);
  };

  const redirectGuestToLogin = (nextPath: string) => {
    const loginPath = `/login?next=${encodeURIComponent(nextPath)}&reason=checkout-required`;
    router.push(loginPath);
  };

  const handleCheckoutTenant = async (tenantId: number) => {
    const session = await getAuthSession();
    const nextPath = `/system/checkout?tenantId=${tenantId}`;

    if (session.role === "guest") {
      redirectGuestToLogin(nextPath);
      return;
    }

    router.push(nextPath);
  };

  const handleCheckoutAll = async () => {
    const session = await getAuthSession();
    const nextPath = "/system/checkout";

    if (session.role === "guest") {
      redirectGuestToLogin(nextPath);
      return;
    }

    router.push(nextPath);
  };

  if (!isReady) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">Loading basket...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-2xl font-bold text-gray-900">Your basket is empty</p>
          <p className="mt-2 text-sm text-gray-600">Add products from the marketplace to see them here.</p>
          <Link
            href="/customer/marketplace"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <section className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="space-y-6">
            {groupedItems.map((group) => {
              const groupTotal = group.items.reduce((sum, item) => sum + item.subtotal, 0);
              const groupTax = Math.round(groupTotal * (taxRate / 100));
              const groupGrandTotal = groupTotal + groupTax;

              return (
                <div key={group.tenantId} className="rounded-3xl border border-gray-200 p-4 sm:p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Tenant</p>
                      <h2 className="mt-1 text-xl font-bold text-gray-900">{group.tenantName}</h2>
                      <p className="mt-1 text-sm text-gray-600">{group.tenantLocation}</p>
                    </div>

                    <div className="text-right">
                      <p className="mt-1 text-sm text-gray-600">Subtotal: Rp{formatCurrency(groupTotal)}</p>
                      <p className="text-sm text-gray-600">PPN {taxRate}%: Rp{formatCurrency(groupTax)}</p>
                      <p className="mt-1 text-lg font-bold text-gray-900">Rp{formatCurrency(groupGrandTotal)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.product_id} className="grid grid-cols-[88px_1fr_auto] gap-4 rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="relative h-[88px] w-[88px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-lg font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="mt-1 text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="mt-1 text-sm font-medium text-gray-800">Rp{formatCurrency(item.subtotal)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.product_id)}
                          className="inline-flex items-center gap-2 self-start rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-teal-100 bg-white px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Checkout this tenant only</p>
                      <p className="text-xs text-gray-600">Same tenant items become one purchase order. Different tenants become separate purchase orders.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheckoutTenant(group.tenantId)}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors bg-teal-600 hover:bg-teal-700"
                    >
                      Checkout Tenant
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sticky top-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Summary</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-semibold">Rp{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span>Tax (PPN {taxRate}%)</span>
              <span className="font-semibold">Rp{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-gray-900">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">Rp{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">Items in basket: {items.length}</p>
          <p className="mt-2 text-sm text-gray-600">Tenants: {groupedItems.length}</p>
          <button className="mt-6 w-full rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 transition" onClick={handleCheckoutAll}>
            💳 Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}