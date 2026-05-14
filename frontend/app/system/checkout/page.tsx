"use client";

import { Suspense } from "react";
import CheckoutPageContent from "@/components/system/CheckoutPageContent";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
