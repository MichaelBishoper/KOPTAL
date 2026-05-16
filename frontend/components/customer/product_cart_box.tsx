"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatCurrency, getUnitLabel, getUnitStep, saveBasketItemDraft, shouldUseNativeImage, safeImageSrc } from "@/lib";

import type { TenantProductRow } from "@/structure/db";

interface ProductCartBoxProps {
  // Accept DB-shaped tenant product row
  product: TenantProductRow & {
    // optional display helpers (may be provided by parent)
    tenantName?: string;
    location?: string;
    tenantImage?: string;
    image?: string;
  };
}

export default function ProductCartBox({ product }: ProductCartBoxProps) {
  const availableStock = Math.max(0, Math.floor(Number(product.quantity) || 0));
  const unitLabel = getUnitLabel(product.unit_id);
  const quantityStep = getUnitStep(product.unit_id);
  const minQuantity = availableStock > 0 ? Math.min(quantityStep, availableStock) : quantityStep;
  const [quantity, setQuantity] = useState(minQuantity);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const subtotal = Math.round(product.price * quantity);

  const maxQuantity = useMemo(() => {
    if (availableStock <= 0) return minQuantity;
    if (unitLabel !== "grams") return availableStock;
    const snapped = Math.floor(availableStock / quantityStep) * quantityStep;
    return snapped > 0 ? snapped : availableStock;
  }, [availableStock, minQuantity, quantityStep, unitLabel]);

  const normalizeQuantityInput = (raw: number): number => {
    if (!Number.isFinite(raw) || raw <= 0) return minQuantity;
    if (availableStock <= 0) return minQuantity;

    if (unitLabel !== "grams") {
      return Math.min(availableStock, Math.max(1, Math.floor(raw)));
    }

    const snapped = Math.round(raw / quantityStep) * quantityStep;
    const floorForStock = Math.floor(availableStock / quantityStep) * quantityStep;
    const cappedMax = floorForStock > 0 ? floorForStock : availableStock;
    return Math.max(minQuantity, Math.min(cappedMax, snapped));
  };

  const handleAddToBasket = async () => {
    if (availableStock <= 0) {
      setErrorMessage("This product is out of stock.");
      return;
    }

    if (quantity > availableStock) {
      setErrorMessage(`Only ${availableStock} ${unitLabel} available.`);
      return;
    }

    setErrorMessage(null);
    setSaveState("saving");

    try {
      const payload = await saveBasketItemDraft(product, quantity);
      console.log("Saving basket item", payload);
      setSaveState("saved");
    } catch {
      setErrorMessage("Cannot add more than available stock.");
      setSaveState("idle");
    }
  };

  return (
    <div className="border-2 border-gray-300 rounded-lg p-4 h-fit sticky top-8 bg-white">
      <div className="flex gap-3 mb-4 pb-4 border-b border-gray-200">
        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {(() => {
              const src = safeImageSrc(product.image) || "/product-placeholder.jpg";
              if (shouldUseNativeImage(src)) {
                // eslint-disable-next-line @next/next/no-img-element
                return <img src={src} alt={product.name} className="object-cover w-full h-full" />;
              }
              return <Image src={src} alt={product.name} fill className="object-cover" />;
            })()}
        </div>
        <p className="font-semibold text-gray-800 text-xs line-clamp-2">{product.name}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1">
          <button
            onClick={() => setQuantity(normalizeQuantityInput(quantity - quantityStep))}
            className="text-gray-600 hover:text-gray-800 font-semibold"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            min={minQuantity}
            max={maxQuantity}
            step={quantityStep}
            onChange={(e) => setQuantity(normalizeQuantityInput(parseInt(e.target.value, 10) || minQuantity))}
            className="w-8 text-center font-semibold border-none outline-none text-sm"
          />
          <button
            onClick={() => setQuantity(normalizeQuantityInput(quantity + quantityStep))}
            disabled={availableStock <= 0 || quantity >= maxQuantity}
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            +
          </button>
        </div>
        <p className="text-gray-700 text-xs">
          Stok: <span className="font-semibold">{availableStock} {unitLabel}</span>
        </p>
      </div>

      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-gray-600 text-xs mb-1">Subtotal</p>
        <p className="text-2xl font-bold text-gray-800">Rp{formatCurrency(subtotal)}</p>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <button
          type="button"
          onClick={handleAddToBasket}
          disabled={saveState === "saving" || availableStock <= 0}
          className="w-full bg-[#01a49e] hover:bg-[#057f7b] disabled:bg-[#7fbebc] text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          {availableStock <= 0
            ? "Out of Stock"
            : saveState === "saved"
              ? "Added to Basket"
              : saveState === "saving"
                ? "Saving..."
                : "+ Basket"}
        </button>
        {saveState === "saved" && (
          <p className="text-xs font-medium text-emerald-700 text-center">Saved locally. Backend can replace this with POST later.</p>
        )}
        {errorMessage && <p className="text-xs font-medium text-rose-700 text-center">{errorMessage}</p>}
      </div>
    </div>
  );
}