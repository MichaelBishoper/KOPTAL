"use client";

import { getPurchaseOrders, getTenantById, getTenantProfileImage, getStatusLabel, getStatusBadgeClass, formatCurrency, getTaxRate, shouldUseNativeImage } from "@/lib";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export function TransactionDetails() {
  const searchParams = useSearchParams();
  const poId = searchParams.get("id");

  const orders = getPurchaseOrders();
  const order = poId ? orders.find((o) => o.po_id === parseInt(poId)) : null;

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const tenant = getTenantById(order.tenant_id);
  const tenantImage = order.tenantImage ?? getTenantProfileImage(tenant);
  const useNativeTenantImage = shouldUseNativeImage(tenantImage);
  const customerImage = order.customerImage ?? "/product-placeholder.png";
  const useNativeCustomerImage = shouldUseNativeImage(customerImage);
  const customerName = order.customerName ?? `Customer #${order.customer_id}`;
  const paymentMethod = (() => {
    const notes = String(order.notes ?? "").trim();
    const match = notes.match(/payment method\s*:\s*(.+)$/i);
    if (match?.[1]) return match[1].trim();
    return notes || "Not provided";
  })();
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
              <div className="flex gap-4 pb-4 border-b">
                {useNativeCustomerImage ? (
                  <img
                    src={customerImage}
                    alt={customerName}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <Image
                    src={customerImage}
                    alt={customerName}
                    width={60}
                    height={60}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div>
                  <p className="font-bold text-gray-800">{customerName}</p>
                  <p className="text-sm text-gray-600">Customer #{order.customer_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Shipping Address</p>
                  <p className="text-sm font-semibold text-gray-800">{order.shipping_address || "Not provided"}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-800">{paymentMethod}</p>
                </div>
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
                    {useNativeTenantImage ? (
                      <img
                        src={tenantImage}
                        alt={tenant.name}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <Image
                        src={tenantImage}
                        alt={tenant.name}
                        width={60}
                        height={60}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                    <div>
                      <p className="font-bold text-gray-800">{order.tenantName ?? tenant.name}</p>
                      <p className="text-sm text-gray-600">{order.tenantLocation ?? tenant.location ?? "Location not specified"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                      <p className="text-sm font-semibold text-gray-800">{tenant.phone || "Not provided"}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                      <p className="text-sm font-semibold text-gray-800">{order.tenantLocation ?? tenant.location ?? "Location not specified"}</p>
                    </div>
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
                  <p className="text-sm text-gray-600">Qty: {item.quantity} {item.unitLabel}</p>
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
