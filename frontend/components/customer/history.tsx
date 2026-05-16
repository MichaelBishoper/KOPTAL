"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatCurrency,
  formatOrderDate,
  getPurchaseOrders,
  getStatusBadgeClass,
  getStatusLabel,
  getTenantById,
  getTenantProfileImage,
  getTaxRate,
  isAcceptedOrderStatus,
  loadPurchaseOrders,
  shouldUseNativeImage,
} from "@/lib";
import { updatePurchaseOrderStatusOnAPI } from "@/fetch/purchase-orders";

export default function History() {
  const [ordersVersion, setOrdersVersion] = useState(0);
  const [updatingHistoryId, setUpdatingHistoryId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [openHistoryId, setOpenHistoryId] = useState("");
  const [statusById, setStatusById] = useState<Record<string, string>>({});
  const hasInitializedOpenHistoryRef = useRef(false);

  useEffect(() => {
    void (async () => {
      await loadPurchaseOrders();
      setOrdersVersion((current) => current + 1);
    })();
  }, []);

  const taxRate = getTaxRate();

  const histories = useMemo(
    () =>
      getPurchaseOrders().map((po) => ({
        id: po.id,
        poId: po.po_id,
        tenantImage: po.tenantImage ?? getTenantProfileImage(getTenantById(po.tenant_id)),
        tenantName: po.tenantName ?? po.name,
        date: formatOrderDate(po.order_date),
        shippingAddress: po.shipping_address,
        status: po.status,
        subtotal: po.subtotal,
        taxAmount: Math.round(po.subtotal * (taxRate / 100)),
        totalAmount: po.subtotal + Math.round(po.subtotal * (taxRate / 100)),
        products: po.items,
      })),
    [ordersVersion, taxRate],
  );

  useEffect(() => {
    if (!hasInitializedOpenHistoryRef.current && histories[0]?.id) {
      setOpenHistoryId(histories[0].id);
      hasInitializedOpenHistoryRef.current = true;
    }

    setStatusById(Object.fromEntries(histories.map((history) => [history.id, history.status])));
  }, [histories]);

  const markAsDelivered = async (historyId: string, poId: number) => {
    if (updatingHistoryId) return;

    setStatusError(null);

    const currentStatus = (statusById[historyId] ?? "").toLowerCase();
    if (!['ontheway', 'shipped', 'confirmed'].includes(currentStatus)) return;

    setUpdatingHistoryId(historyId);
    try {
      const updated = await updatePurchaseOrderStatusOnAPI(poId, "delivered");

      if (!updated) {
        setStatusError("Failed to update status to delivered. Please try again.");
        return;
      }

      setStatusById((current) => ({
        ...current,
        [historyId]: updated.status,
      }));

      await loadPurchaseOrders();
      setOrdersVersion((current) => current + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update status to delivered.";
      setStatusError(message);
      if (typeof window !== "undefined") {
        console.error(message);
      }
    } finally {
      setUpdatingHistoryId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {statusError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {statusError}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {histories.map((history) => {
          const isOpen = openHistoryId === history.id;
          const currentStatus = statusById[history.id] ?? history.status;
          const normalizedStatus = currentStatus.toLowerCase();
          const isDelivered = normalizedStatus === "delivered";
          const isAccepted = isAcceptedOrderStatus(currentStatus);
          const canShowDeliveryStatus = normalizedStatus !== "cancelled";
          const useNativeTenantImage = shouldUseNativeImage(history.tenantImage);

          return (
            <div key={history.id} className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpenHistoryId(isOpen ? "" : history.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpenHistoryId(isOpen ? "" : history.id);
                  }
                }}
                className="w-full p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                      {useNativeTenantImage ? (
                        <img src={history.tenantImage} alt={history.tenantName} className="h-full w-full object-cover" />
                      ) : (
                        <Image
                          src={history.tenantImage}
                          alt={history.tenantName}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-bold text-gray-900 truncate">{history.tenantName}</p>
                      <p className="text-sm text-gray-600 mt-1">{history.date}</p>
                      <p className="text-sm text-gray-500 mt-1 truncate">Address: {history.shippingAddress}</p>
                      <Link
                        href={`/system/transaction-details?id=${history.poId}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-block mt-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
                      >
                        Details
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(currentStatus)}`}
                    >
                      {getStatusLabel(currentStatus)}
                    </span>
                    <p className={`text-xs font-semibold ${isAccepted ? "text-emerald-700" : "text-gray-600"}`}>
                      {isAccepted ? "Accepted" : "Not accepted"}
                    </p>
                    <span className="text-gray-400 text-sm">{isOpen ? "Hide" : "Show"}</span>
                  </div>
                </div>
              </div>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-gray-200 p-4 sm:p-5 bg-gray-50">
                    {canShowDeliveryStatus && (
                      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Delivery status</p>
                          <p className="text-xs text-gray-600">
                            {isDelivered
                              ? "This transaction is locked as delivered."
                              : isAccepted
                                ? "You can mark this transaction as delivered."
                                : "Waiting for tenant to accept this PO."}
                          </p>
                        </div>

                        <button
                          type="button"
                            onClick={() => void markAsDelivered(history.id, history.poId)}
                            disabled={isDelivered || !isAccepted || updatingHistoryId === history.id}
                          className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 bg-teal-600 text-white hover:bg-teal-700"
                        >
                            {updatingHistoryId === history.id
                              ? "Updating..."
                              : isDelivered
                                ? "Locked"
                                : isAccepted
                                  ? "Mark Delivered"
                                  : "Waiting Acceptance"}
                        </button>
                      </div>
                    )}

                    {normalizedStatus === "cancelled" && (
                      <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                        <p className="text-sm font-semibold text-rose-800">Order cancelled</p>
                        <p className="text-xs text-rose-700">PO details are still shown below for reference.</p>
                      </div>
                    )}

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
                            <p className="text-sm text-gray-600 mt-1">Qty: {product.quantity} {product.unitLabel}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-500">Price</p>
                            <p className="text-base font-bold text-gray-900">
                              Rp{formatCurrency(product.price * product.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Payment Summary</p>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between text-gray-700">
                          <span>Subtotal</span>
                          <span className="font-semibold">Rp{formatCurrency(history.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-700">
                          <span>Tax (PPN {taxRate}%)</span>
                          <span className="font-semibold">Rp{formatCurrency(history.taxAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-gray-900">
                          <span className="font-semibold">Total</span>
                          <span className="text-base font-bold">Rp{formatCurrency(history.totalAmount)}</span>
                        </div>
                      </div>
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