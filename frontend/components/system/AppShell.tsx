"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../system/Navbar";
import Footer from "../system/Footer";
import PageHeader from "../system/PageHeader";
import ScrollToTop from "../system/ScrollToTop";
import {
  loadAdminSettings,
  loadCustomers,
  loadPurchaseOrders,
  loadTenantProducts,
  loadTenants,
  loadUnits,
} from "@/lib";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isCheckoutPage = pathname === "/system/checkout";

  useEffect(() => {
    void Promise.all([
      loadTenants(),
      loadUnits(),
      loadTenantProducts(),
      loadCustomers(),
      loadPurchaseOrders(),
      loadAdminSettings(),
    ]);
  }, []);

  if (isLoginPage || isCheckoutPage) {
    return (
      <>
        <ScrollToTop />
        <main className="min-h-screen bg-white">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ScrollToTop />
      <div className="pt-[150px]">
        <PageHeader />
        {children}
      </div>
      <Footer />
    </>
  );
}