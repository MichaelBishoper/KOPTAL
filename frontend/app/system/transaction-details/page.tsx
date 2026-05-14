import { TransactionDetails } from "@/components/system/TransactionDetails";
import { Suspense } from "react";

export default function TransactionDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <TransactionDetails />
    </Suspense>
  );
}
