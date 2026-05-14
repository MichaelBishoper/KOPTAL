"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { resolvePageHeaderAction, resolvePageHeaderTitle, shouldHidePageHeader } from "@/lib/navigation/page-header";

export default function PageHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const shouldHide = shouldHidePageHeader(pathname);
  const isTransactionDetails = pathname === "/system/transaction-details";
  const action = useMemo(() => resolvePageHeaderAction(pathname), [pathname]);
  const title = useMemo(() => resolvePageHeaderTitle(pathname), [pathname]);

  if (shouldHide) return null;

  return (
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Page</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
      </div>

      {isTransactionDetails ? (
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </button>
      ) : !action ? <div /> : (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {action.label}
        </Link>
      )}
    </div>
  );
}