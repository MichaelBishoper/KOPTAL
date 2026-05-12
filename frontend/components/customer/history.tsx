"use client";

import { useState } from "react";
import Image from "next/image";

type HistoryItem = {
  id: string;
  tenantName: string;
  date: string;
  status: "Delivered" | "On the way";
  tenantImage: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
};

const histories: HistoryItem[] = [
  {
    id: "history-1",
    tenantName: "Green Farm Co.",
    date: "12 May 2026",
    status: "Delivered",
    tenantImage: "/product-placeholder.jpg",
    products: [
      {
        id: "h1-p1",
        name: "Fresh Tomatoes",
        quantity: 2,
        price: 25000,
        image: "/product-placeholder.jpg",
      },
      {
        id: "h1-p2",
        name: "Organic Spinach",
        quantity: 1,
        price: 15000,
        image: "/product-placeholder.jpg",
      },
    ],
  },
  {
    id: "history-2",
    tenantName: "Local Market",
    date: "11 May 2026",
    status: "On the way",
    tenantImage: "/product-placeholder.jpg",
    products: [
      {
        id: "h2-p1",
        name: "Fresh Cabbage",
        quantity: 3,
        price: 8000,
        image: "/product-placeholder.jpg",
      },
      {
        id: "h2-p2",
        name: "Carrots Bundle",
        quantity: 2,
        price: 12000,
        image: "/product-placeholder.jpg",
      },
    ],
  },
];

export default function History() {
  const [openHistoryId, setOpenHistoryId] = useState(histories[0].id);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col gap-4">
        {histories.map((history) => {
          const isOpen = openHistoryId === history.id;

          return (
            <div key={history.id} className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenHistoryId(isOpen ? "" : history.id)}
                className="w-full p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                      <Image
                        src={history.tenantImage}
                        alt={history.tenantName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-bold text-gray-900 truncate">{history.tenantName}</p>
                      <p className="text-sm text-gray-600 mt-1">{history.date}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        history.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {history.status}
                    </span>
                    <span className="text-gray-400 text-sm">{isOpen ? "Hide" : "Show"}</span>
                  </div>
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-gray-200 p-4 sm:p-5 bg-gray-50">
                    <div className="grid grid-cols-1 gap-4">
                      {history.products.map((product) => (
                        <div
                          key={product.id}
                          className="grid grid-cols-[72px_1fr_auto] gap-4 items-center rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                            <p className="text-sm text-gray-600 mt-1">Product Quantity: {product.quantity}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-500">Price</p>
                            <p className="text-base font-bold text-gray-900">
                              Rp{(product.price * product.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}