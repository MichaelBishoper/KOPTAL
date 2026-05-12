"use client";

import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  image: string;
  tenantName: string;
  location: string;
  price?: number;
}

interface CatalogProps {
  products?: Product[];
}

export default function Catalog({ products = [] }: CatalogProps) {
  // Mock data if no products provided
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Fresh Tomatoes",
      image: "/product-placeholder.jpg",
      tenantName: "Green Farm Co.",
      location: "Jakarta, West",
    },
    {
      id: "2",
      name: "Organic Spinach",
      image: "/product-placeholder.jpg",
      tenantName: "Organic Harvest",
      location: "Bogor, West Java",
    },
    {
      id: "3",
      name: "Fresh Cabbage",
      image: "/product-placeholder.jpg",
      tenantName: "Local Market",
      location: "Tangerang, Banten",
    },
    {
      id: "4",
      name: "Carrots Bundle",
      image: "/product-placeholder.jpg",
      tenantName: "Farmer's Pride",
      location: "Cikarang, West Java",
    },
    {
      id: "5",
      name: "Bell Peppers",
      image: "/product-placeholder.jpg",
      tenantName: "Fresh Supply",
      location: "Depok, West Java",
    },
    {
      id: "6",
      name: "Potatoes",
      image: "/product-placeholder.jpg",
      tenantName: "Green Farm Co.",
      location: "Jakarta, West",
    },
    {
      id: "7",
      name: "Onions",
      image: "/product-placeholder.jpg",
      tenantName: "Organic Harvest",
      location: "Bogor, West Java",
    },
    {
      id: "8",
      name: "Lettuce",
      image: "/product-placeholder.jpg",
      tenantName: "Local Market",
      location: "Tangerang, Banten",
    },
  ];

  const displayProducts = products.length > 0 ? products : mockProducts;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-6 py-8">
        {displayProducts.map((product) => (
          <Link key={product.id} href={`/customer/product/${product.id}`}>
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white h-full">
              {/* Product Image */}
              <div className="relative w-full aspect-square bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-600 mb-1">{product.tenantName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  📍 {product.location}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
