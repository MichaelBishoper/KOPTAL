"use client";

import { useState } from "react";
import Image from "next/image";
import { HeartIcon, ShareIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

interface ProductCartBoxProps {
  product: {
    id: string;
    name: string;
    price: number;
    unitType: "grams" | "pieces";
    tenantName: string;
    location: string;
    images: string[];
    availability: number;
  };
}

export default function ProductCartBox({ product }: ProductCartBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const pricePerUnit = product.unitType === "grams" ? product.price / 100 : product.price;
  const subtotal = Math.round(pricePerUnit * quantity);

  return (
    <div className="border-2 border-gray-300 rounded-lg p-4 h-fit sticky top-8 bg-white">
      <div className="flex gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        </div>
        <p className="font-semibold text-gray-800 text-xs line-clamp-2">{product.name}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-gray-600 hover:text-gray-800 font-semibold"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-8 text-center font-semibold border-none outline-none text-sm"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            +
          </button>
        </div>
        <p className="text-gray-700 text-xs">
          Stok: <span className="font-semibold">{product.availability}</span>
        </p>
      </div>

      <div className="mb-2">
        <p className="text-gray-500 line-through text-xs">Rp{Math.round(subtotal * 1.2).toLocaleString()}</p>
      </div>

      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-gray-600 text-xs mb-1">Subtotal</p>
        <p className="text-2xl font-bold text-gray-800">Rp{subtotal.toLocaleString()}</p>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <button className="w-full bg-[#01a49e] hover:bg-[#057f7b] text-white font-semibold py-2 rounded-lg transition-colors text-sm">
          + Basket
        </button>
      </div>
    </div>
  );
}