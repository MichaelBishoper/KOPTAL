"use client";

import { useEffect, useState } from "react";
import { getPurchaseOrders, getTenantById, getStatusLabel, getStatusBadgeClass, formatCurrency, getTaxRate } from "@/lib";
import { loadPurchaseOrders } from "@/lib";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export function TransactionDetails() {
  const searchParams = useSearchParams();
  const poId = searchParams.get("id");

  const [orders, setOrders] = useState(() => getPurchaseOrders());

  useEffect(() => {
    void loadPurchaseOrders().then(setOrders);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  const order = poId ? orders.find((o) => o.po_id === parseInt(poId)) : null;

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const tenant = getTenantById(order.tenant_id);
  const statusClass = getStatusBadgeClass(order.status);
  const taxRate = getTaxRate();
  const taxAmount = Math.round(order.subtotal * (taxRate / 100));
  const totalAmount = order.subtotal + taxAmount;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order #{order.po_number}</h1>
              <p className="text-gray-600 mt-2">{new Date(order.order_date).toLocaleDateString("en-GB", { timeZone: "UTC" })}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold text-sm ${statusClass}`}>
              {getStatusLabel(order.status)}
            </div>
          </div>
        </div>

        {/* Both Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-600">👤</span> Customer Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                <p className="text-gray-800 font-semibold">Customer #{order.customer_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Shipping Address</p>
                <p className="text-gray-700">{order.shipping_address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Additional Notes</p>
                <p className="text-gray-700">{order.notes || "No additional notes"}</p>
              </div>
            </div>
          </div>

          {/* Tenant/Seller Info */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-emerald-600">🏪</span> Seller Information
            </h2>
            <div className="space-y-4">
              {tenant ? (
                <>
                  <div className="flex gap-4 pb-4 border-b">
                    <Image
                      src={tenant.image || "/product-placeholder.jpg"}
                      alt={tenant.name}
                      width={60}
                      height={60}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-bold text-gray-800">{tenant.name}</p>
                      <p className="text-sm text-gray-600">{tenant.location || "Location not specified"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Contact</p>
                    <p className="text-gray-700">{tenant.email}</p>
                    <p className="text-gray-700">{tenant.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                    <p className={tenant.verified ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                      {tenant.verified ? "✓ Verified" : "⏱ Pending Verification"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Seller information not available</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">Rp{formatCurrency(item.subtotal)}</p>
                  <p className="text-xs text-gray-500">@ Rp{formatCurrency(item.unit_price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <p className="text-gray-700">Subtotal</p>
              <p className="font-semibold text-gray-800">Rp{formatCurrency(order.subtotal)}</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <p className="text-gray-700">Tax (PPN {taxRate}%)</p>
              <p className="font-semibold text-gray-800">Rp{formatCurrency(taxAmount)}</p>
            </div>
            <div className="flex justify-between items-center pt-3">
              <p className="text-lg font-bold text-gray-800">Total Amount</p>
              <p className="text-2xl font-bold text-[#01A49E]">Rp{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
