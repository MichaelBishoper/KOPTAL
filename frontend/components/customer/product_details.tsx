"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCartBox from "@/components/customer/product_cart_box";
import { formatCurrency, getUnitLabel, shouldUseNativeImage, safeImageSrc, toProductDetails, type TenantProductDetails } from "@/lib";

interface ProductDetailsProps {
  product: TenantProductDetails;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "review">("description");
  const [selectedImage, setSelectedImage] = useState(0);
  const details = toProductDetails(product);
  const images = details.images ?? [details.image ?? "/product-placeholder.jpg"];
  const unitPrice = product.price;
  const resolvedDescription = details.description ?? "No description has been added for this product yet.";
  const unitLabel = getUnitLabel(product.unit_id) === "Gram" ? "gram" : "piece";
  const categoryLabel = details.category?.trim() || "Uncategorized";
  const tenantImageSrcRaw = details.tenantImage ?? "/product-placeholder.jpg";
  const tenantImageSrc = safeImageSrc(tenantImageSrcRaw);
  const useNativeTenantImage = shouldUseNativeImage(tenantImageSrc);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_320px] gap-8 items-start">
        {/* Left Side - Images Only */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={safeImageSrc(images[selectedImage])}
              alt={`${details.name} - Image ${selectedImage + 1}`}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-teal-600"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image src={safeImageSrc(image)} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Middle - Product Details and Tabs */}
        <div className="flex flex-col gap-8">
          {/* Product Name and Price */}
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{details.name}</h1>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-800">Rp{formatCurrency(unitPrice)}</span>
              <span className="text-lg text-gray-600">
                per {unitLabel}
              </span>
            </div>
            <div className="mb-3 mt-4">
              <span className="inline-flex items-center rounded-full border border-[#01A49E]/20 bg-[#01A49E]/10 px-3 py-1 text-xs font-semibold text-[#057f7b]">
                Category: {categoryLabel}
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
              <p className="text-gray-700 leading-relaxed text-base">{resolvedDescription}</p>
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
              <Link
                href={{
                  pathname: "/customer/tennant",
                  query: {
                    name: details.tenantName,
                    location: details.location,
                  },
                }}
                className="relative w-16 h-16 bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden flex-shrink-0 hover:border-teal-600 transition-colors"
              >
                {useNativeTenantImage ? (
                  <img
                    src={tenantImageSrc}
                    alt={details.tenantName ?? "Tenant"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={tenantImageSrc}
                    alt={details.tenantName ?? "Tenant"}
                    fill
                    className="object-cover"
                  />
                )}
              </Link>

              {/* Tenant Details */}
              <div className="flex-1">
                <p className="text-sm text-gray-600">by</p>
                <Link
                  href={{
                    pathname: "/customer/tennant",
                    query: {
                      name: product.tenantName,
                      location: product.location,
                    },
                  }}
                  className="text-lg font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  {details.tenantName}
                </Link>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  📍 {details.location ?? "West Java"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Cart Box */}
        <ProductCartBox
          product={{
            ...details,
            image: images[0],
            tenantImage: details.tenantImage,
            location: details.location,
          }}
        />
      </div>
    </div>
  );
}
