"use client";

import React, { useState } from "react";
import Image from "next/image";
import ProductCartBox from "@/components/customer/product_cart_box";

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    price: number;
    unitType: "grams" | "pieces";
    tenantName: string;
    location: string;
    images: string[];
    description: string;
    availability: number;
  };
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "review">("description");
  const [selectedImage, setSelectedImage] = useState(0);

  const pricePerUnit = product.unitType === "grams" ? (product.price / 100).toFixed(0) : product.price;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_320px] gap-8 items-start">
        {/* Left Side - Images Only */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={product.images[selectedImage]}
              alt={`${product.name} - Image ${selectedImage + 1}`}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-teal-600"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Middle - Product Details and Tabs */}
        <div className="flex flex-col gap-8">
          {/* Product Name and Price */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-800">Rp {pricePerUnit}</span>
              <span className="text-lg text-gray-600">
                per {product.unitType === "grams" ? "100g" : "piece"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-3 font-semibold text-lg transition-colors ${
                  activeTab === "description"
                    ? "text-teal-600 border-b-3 border-teal-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`pb-3 font-semibold text-lg transition-colors ${
                  activeTab === "review"
                    ? "text-teal-600 border-b-3 border-teal-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Review
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "description" && (
              <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
            )}

            {activeTab === "review" && (
              <div className="text-gray-700 font-semibold text-center py-12 text-lg">
                Coming Soon
              </div>
            )}
          </div>

          <div className="h-px w-full bg-gray-200" />

          {/* Tenant Info */}
          <div>
            <div className="flex gap-4 items-start">
              {/* Tenant Logo Placeholder */}
              <div className="w-16 h-16 bg-gray-200 border-2 border-gray-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-gray-600 text-center">Logo</span>
              </div>

              {/* Tenant Details */}
              <div className="flex-1">
                <p className="text-sm text-gray-600">by</p>
                <p className="text-lg font-semibold text-gray-800">{product.tenantName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  📍 {product.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Cart Box */}
        <ProductCartBox product={product} />
      </div>
    </div>
  );
}
