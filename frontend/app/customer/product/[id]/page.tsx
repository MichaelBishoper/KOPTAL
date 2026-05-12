"use client";

import React from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ProductDetails from "@/components/customer/product_details";
import Gap from "@/components/system/Gap";
// Mock product data
const mockProducts: Record<
  string,
  {
    id: string;
    name: string;
    price: number;
    unitType: "grams" | "pieces";
    tenantName: string;
    location: string;
    images: string[];
    description: string;
    availability: number;
  }
> = {
  "1": {
    id: "1",
    name: "Fresh Tomatoes",
    price: 25000,
    unitType: "grams",
    tenantName: "Green Farm Co.",
    location: "Jakarta, West Java",
    images: ["/product-placeholder.jpg", "/product-placeholder.jpg", "/product-placeholder.jpg"],
    description:
      "High-quality fresh tomatoes grown using organic farming methods. Perfect for salads, cooking, and sauces. Harvested fresh daily.",
    availability: 500,
  },
  "2": {
    id: "2",
    name: "Organic Spinach",
    price: 15000,
    unitType: "grams",
    tenantName: "Organic Harvest",
    location: "Bogor, West Java",
    images: ["/product-placeholder.jpg", "/product-placeholder.jpg"],
    description:
      "Crisp and fresh organic spinach packed with nutrients. Great for smoothies, salads, and cooking. Pesticide-free.",
    availability: 300,
  },
  "3": {
    id: "3",
    name: "Fresh Cabbage",
    price: 8000,
    unitType: "pieces",
    tenantName: "Local Market",
    location: "Tangerang, Banten",
    images: ["/product-placeholder.jpg"],
    description:
      "Fresh green cabbage heads, crisp and tender. Ideal for coleslaw, stir-frying, and various Asian dishes.",
    availability: 50,
  },
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const product = mockProducts[id];

  if (!product) {
    return (
      <main className="w-full min-h-screen bg-white">
        <div className="p-8">
          <p className="text-lg text-gray-600">Product not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-white">
      <Gap height="h-4" />  
      <ProductDetails product={product} />
    </main>
  );
}
