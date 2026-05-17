"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../system/Navbar";
import Footer from "../system/Footer";
import PageHeader from "../system/PageHeader";
import ScrollToTop from "../system/ScrollToTop";
import {
  getAuthSession,
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
  const [, setDataVersion] = useState(0);
  const hasPreloadedRef = useRef(false);
  const isLoginPage = pathname === "/login";
  const isCheckoutPage = pathname === "/system/checkout";
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    if (isLoginPage || hasPreloadedRef.current) return;

    hasPreloadedRef.current = true;

    void (async () => {
      await Promise.all([
        loadAdminSettings(),
        loadTenants(),
        loadCustomers(),
        loadUnits(),
        loadTenantProducts(),
      ]);

      const session = await getAuthSession();
      if (session.role === "customer" || session.role === "tennant") {
        await loadPurchaseOrders();
      }

      setDataVersion((current) => current + 1);
    })();
  }, [isLoginPage]);

  if (isLoginPage || isCheckoutPage || isAdminPage) {
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