"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
  createEmptyProductDraft,
  createProductDraftFromRow,
  formatCurrency,
  getAdminCategories,
  hasApprovedCategory,
  loadAdminSettings,
  readImageFileAsDataUrl,
  saveTenantProductDraft,
} from "@/lib";
import type { ProductDraft, ProductMode } from "@/structure/tenant-product";
import type { TenantProductRow } from "@/structure/db";

type ProductEditorProps = {
  mode: ProductMode;
  // Accept the DB-shaped row directly from the backend/fetch helper
  initialProduct?: TenantProductRow;
};

export default function ProductEditor({ mode, initialProduct }: ProductEditorProps) {
  // Initialize internal editor draft (frontend-friendly) from DB-shaped `TenantProductRow`.
  const [draft, setDraft] = useState<ProductDraft>(() =>
    initialProduct ? createProductDraftFromRow(initialProduct) : createEmptyProductDraft(),
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => getAdminCategories());

  useEffect(() => {
    void loadAdminSettings().then(() => {
      setCategoryOptions(getAdminCategories());
    });
  }, []);

  const updateField = <K extends keyof ProductDraft>(field: K, value: ProductDraft[K]) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    setSavedMessage(null);
    setErrorMessage(null);
  };

  const saveLabel = mode === "add" ? "Create Product" : "Save Product";
  const heading = mode === "add" ? "Add Product" : "Edit Product";

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    void readImageFileAsDataUrl(file)
      .then((uploadedImage) => {
        setDraft((currentDraft) => ({
          ...currentDraft,
          images: [uploadedImage],
        }));
        setSavedMessage(null);
      })
      .catch(() => {
        setErrorMessage("Failed to read image file.");
      });

    // Allow selecting the same file again.
    event.currentTarget.value = "";
  };

  const handleSave = async () => {
    if (!hasApprovedCategory(draft.category)) {
      setSavedMessage(null);
      setErrorMessage("Choose an approved category before saving this product.");
      return;
    }

    const savedProduct = await saveTenantProductDraft(draft, initialProduct);
    if (!savedProduct) {
      setSavedMessage(null);
      setErrorMessage("Backend save failed. Check your auth token and service status.");
      return;
    }

    setErrorMessage(null);
    setSavedMessage(mode === "add" ? "Product created in backend." : "Product updated in backend.");
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] items-start">
          <aside className="lg:sticky lg:top-[136px] self-start">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
              <div className="h-56 w-56 sm:h-72 sm:w-72 rounded-3xl overflow-hidden border border-stone-200 bg-stone-100">
                <Image
                  src={draft.images[0] || "/product-placeholder.jpg"}
                  alt={draft.name || "Product preview"}
                  width={448}
                  height={448}
                  className="h-full w-full object-cover"
                />
              </div>

              <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                + Upload Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </aside>

          <section className="rounded-3xl border border-stone-200 bg-white shadow-sm p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Product Preview</p>
                  <h2 className="mt-2 text-xl sm:text-2xl font-bold text-stone-900 truncate">{draft.name || "New Product"}</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                    Product name
                    <input
                      value={draft.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-teal-600"
                      placeholder="Enter product name"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                    Price
                    <input
                      value={draft.price}
                      onChange={(event) => updateField("price", event.target.value)}
                      className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-teal-600"
                      placeholder="25000"
                      inputMode="numeric"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                    Category
                    <select
                      value={draft.category}
                      onChange={(event) => updateField("category", event.target.value)}
                      className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-teal-600 bg-white"
                    >
                      <option value="">Select approved category</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                    Unit type
                    <select
                      value={draft.unitType}
                      onChange={(event) => updateField("unitType", event.target.value as ProductDraft["unitType"])}
                      className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-teal-600 bg-white"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="grams">Grams</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                    Availability
                    <input
                      value={draft.availability}
                      onChange={(event) => updateField("availability", event.target.value)}
                      className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-teal-600"
                      placeholder="50"
                      inputMode="numeric"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
                  Description
                  <textarea
                    value={draft.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    className="min-h-40 rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-teal-600 resize-y"
                    placeholder="Describe the product for customers"
                  />
                </label>

              </div>

              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 sticky top-[136px] self-start">
                <div className="rounded-2xl bg-white border border-stone-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Mode</p>
                  <p className="mt-1 text-lg font-bold text-stone-900">{mode === "add" ? "Add" : "Edit"}</p>
                </div>

                <div className="mt-4 rounded-2xl bg-white border border-stone-200 p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Preview price</p>
                    <p className="mt-1 text-2xl font-bold text-stone-900">
                      Rp{formatCurrency(Number(draft.price || 0))}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Category</p>
                    <p className="mt-1 text-base font-semibold text-stone-900">{draft.category || "Not selected"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Stock</p>
                    <p className="mt-1 text-base font-semibold text-stone-900">{draft.availability} items</p>
                  </div>

                </div>

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full rounded-2xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700 transition-colors"
                  >
                    {saveLabel}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDraft(
                        initialProduct
                          ? createProductDraftFromRow(initialProduct)
                          : createEmptyProductDraft(),
                      );
                      setSavedMessage(null);
                    }}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Reset
                  </button>

                  {savedMessage && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                      {savedMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
