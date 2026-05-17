"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminCategories, getTenantProducts, loadAdminSettings, saveAdminCategories } from "@/lib";
import { TaxSettings } from "./TaxSettings";
import { CreateAdminForm } from "./CreateAdminForm";

export default function AdminDashboardComponent() {
  const [categories, setCategories] = useState<string[]>(() => getAdminCategories());
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const settings = await loadAdminSettings();
      setCategories(settings.categories);
    })();
  }, []);

  const productCountByCategory = useMemo(() => {
    const counter = new Map<string, number>();
    for (const product of getTenantProducts()) {
      const key = (product.category || "").trim();
      if (!key) continue;
      counter.set(key, (counter.get(key) ?? 0) + 1);
    }
    return counter;
  }, []);

  const addCategory = async () => {
    const normalized = newCategory.trim();
    if (!normalized) {
      setMessage("Category name cannot be empty.");
      return;
    }

    if (categories.some((category) => category.toLowerCase() === normalized.toLowerCase())) {
      setMessage("Category already exists.");
      return;
    }

    setIsSaving(true);
    const nextCategories = await saveAdminCategories([...categories, normalized]);
    setCategories(nextCategories);
    setIsSaving(false);
    setNewCategory("");
    setMessage(`Category \"${normalized}\" added.`);
  };

  const removeCategory = async (categoryName: string) => {
    const usedByCount = productCountByCategory.get(categoryName) ?? 0;
    if (usedByCount > 0) {
      setMessage(`Cannot remove \"${categoryName}\" because ${usedByCount} product(s) still use it.`);
      return;
    }

    setIsSaving(true);
    const nextCategories = await saveAdminCategories(categories.filter((category) => category !== categoryName));
    setCategories(nextCategories);
    setIsSaving(false);
    setMessage(`Category \"${categoryName}\" removed.`);
  };

  return (
    <main className="w-full">
      <div className="mx-auto mt-10 mb-20 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Admin Category Dashboard</h1>
              <p className="mt-1 text-sm text-stone-600">
                Every tenant product must use a category approved by admin.
              </p>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-stone-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Add category</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(event) => {
                    setNewCategory(event.target.value);
                    setMessage(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addCategory();
                  }}
                  placeholder="Type category name"
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  disabled={isSaving}
                  className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {isSaving ? "..." : "+"}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
              {message}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const usedByCount = productCountByCategory.get(category) ?? 0;

              return (
                <div
                  key={category}
                  className="rounded-2xl border border-stone-300 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">{category}</p>
                      <p className="mt-1 text-xs text-stone-500">{usedByCount} product(s)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      -
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tax Settings Section */}
        <div className="mt-8">
          <TaxSettings />
        </div>

        {/* Create Admin Section */}
        <div className="mt-8">
          <CreateAdminForm />
        </div>
      </div>
    </main>
  );
}
