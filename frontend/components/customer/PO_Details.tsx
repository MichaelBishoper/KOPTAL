"use client";

import { useState } from "react";
import Image from "next/image";
import { formatCurrency, getPurchaseOrders, type PurchaseOrder } from "@/lib";

export default function PO_Details() {
  const purchaseOrders = getPurchaseOrders();
  const [selectedPO, setSelectedPO] = useState(purchaseOrders[0]);
  const [items, setItems] = useState(selectedPO.items);

  const selectPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setSelectedPO(purchaseOrder);
    setItems(purchaseOrder.items);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter(Boolean),
    );
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-6 min-h-[500px] border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
        <aside className="border-b lg:border-b-0 lg:border-r border-gray-300 p-4 bg-gray-50">
          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
            {purchaseOrders.map((purchaseOrder) => (
              <button
                key={purchaseOrder.id}
                onClick={() => selectPurchaseOrder(purchaseOrder)}
                className={`text-left rounded-lg px-4 py-3 font-semibold transition-colors ${
                  selectedPO.id === purchaseOrder.id
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200 hover:border-teal-400"
                }`}
              >
                {purchaseOrder.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[40px_88px_1fr_auto] gap-4 items-start">
                <div className="flex flex-col items-center gap-1 pt-1 text-gray-500">
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="text-2xl leading-none hover:text-teal-600"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="text-2xl leading-none hover:text-teal-600"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    −
                  </button>
                </div>

                <div className="relative w-[88px] h-[88px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="min-w-0 border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-500">Product Name</p>
                      <p className="text-lg font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Product Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-500">Price</p>
                      <p className="text-lg font-bold text-gray-900">Rp{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{item.details}</p>
                </div>

                <div />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <div className="w-full max-w-sm">
              <div className="border-t-2 border-gray-300 pt-4 flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-700">Total Price</span>
                <span className="text-2xl font-bold text-gray-900">Rp{formatCurrency(totalPrice)}</span>
              </div>
              <button className="w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 transition-colors">
                Checkout
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}