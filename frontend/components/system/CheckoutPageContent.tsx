"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateOrderTotal,
  CHECKOUT_PAYMENT_METHODS,
  formatCurrency,
  getBasketItems,
  getCheckoutPaymentInstructions,
  getCheckoutSubtotal,
  getTaxRate,
  readAuthSessionFromCookies,
  resolveSavedShippingAddress,
  type AddressMode,
  type PaymentMethod,
} from "@/lib";

export default function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [addressMode, setAddressMode] = useState<AddressMode>("saved");
  const [savedShippingAddress, setSavedShippingAddress] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const tenantIdParam = searchParams.get("tenantId");
  const subtotalParam = Number(searchParams.get("subtotal"));
  const basketItems = getBasketItems();

  const selectedSubtotal = useMemo(
    () => getCheckoutSubtotal({ basketItems, subtotalParam, tenantIdParam }),
    [basketItems, subtotalParam, tenantIdParam],
  );

  const subtotal = selectedSubtotal;
  const taxRate = getTaxRate();
  const { tax: taxAmount, total: orderTotal } = calculateOrderTotal(subtotal);
  const hasCheckoutItems = subtotal > 0;
  const formattedOrderTotal = formatCurrency(orderTotal);

  useEffect(() => {
    const session = readAuthSessionFromCookies();
    if (session.role !== "customer" || session.userId === null) {
      setSavedShippingAddress("");
      return;
    }

    const address = resolveSavedShippingAddress(session.userId);
    setSavedShippingAddress(address);
  }, []);

  useEffect(() => {
    if (!savedShippingAddress) setAddressMode("custom");
  }, [savedShippingAddress]);

  const shippingAddress = addressMode === "saved" ? savedShippingAddress : customAddress.trim();
  const hasValidShippingAddress = shippingAddress.length > 0;

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (!hasValidShippingAddress) {
      alert("Please choose or enter a shipping address");
      return;
    }

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsComplete(true);

    setTimeout(() => {
      router.push("/customer/c_transaction");
    }, 3000);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-6xl animate-bounce">✓</div>
          <h1 className="text-3xl font-bold text-emerald-600">Payment Successful!</h1>
          <p className="text-gray-600 text-lg">Your order has been placed successfully</p>
          <p className="text-sm text-gray-500">Redirecting to order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">How To Pay</h1>
        <p className="mt-2 text-sm text-gray-600">Choose one payment method below, follow the instructions, then click payment (mock).</p>

        {!hasCheckoutItems && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No checkout items found. Please select items from basket before paying.
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-600">Total payment</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">Rp{formattedOrderTotal}</p>
          <p className="mt-1 text-xs text-gray-500">Includes PPN {taxRate}% (Rp{formatCurrency(taxAmount)})</p>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-bold text-gray-900">Shipping Address</h2>

          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="address-mode"
                checked={addressMode === "saved"}
                onChange={() => setAddressMode("saved")}
                disabled={!savedShippingAddress}
                className="mt-1"
              />
              <span>
                Use my address: {savedShippingAddress || "No saved address found"}
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="address-mode"
                checked={addressMode === "custom"}
                onChange={() => setAddressMode("custom")}
                className="mt-1"
              />
              <span>Use custom address</span>
            </label>
          </div>

          {addressMode === "custom" && (
            <textarea
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="Enter shipping address"
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows={3}
            />
          )}

          {!hasValidShippingAddress && (
            <p className="mt-3 text-xs text-rose-600">Shipping address is required before payment.</p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {CHECKOUT_PAYMENT_METHODS.map((method) => (
            <PaymentMethodCard
              key={method.id}
              title={method.title}
              icon={method.icon}
              description={method.description}
              selected={paymentMethod === method.id}
              onClick={() => setPaymentMethod(method.id)}
            />
          ))}
        </div>

        {paymentMethod && (
          <div className="mt-6 rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900">Payment Instructions</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-gray-700">
              {getCheckoutPaymentInstructions(paymentMethod, formattedOrderTotal).map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handlePayment}
            disabled={!hasCheckoutItems || !paymentMethod || !hasValidShippingAddress || isProcessing}
            className={`flex-1 rounded-lg px-5 py-3 text-sm font-semibold text-white transition ${
              hasCheckoutItems && paymentMethod && hasValidShippingAddress && !isProcessing
                ? "bg-[#01A49E] hover:bg-[#057f7b]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "Processing..." : "Click Payment (MOCK)"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodCard({
  title,
  icon,
  description,
  selected,
  onClick,
}: {
  title: string;
  icon: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full p-4 rounded-lg border-2 transition text-left ${
        selected
          ? "border-[#01A49E] bg-[#01A49E]/5 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {selected && <div className="w-5 h-5 rounded-full bg-[#01A49E] mt-1" />}
      </div>
    </button>
  );
}
