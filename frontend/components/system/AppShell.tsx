"use client";

import { usePathname } from "next/navigation";
import Navbar from "../system/Navbar";
import Footer from "../system/Footer";
import PageHeader from "../system/PageHeader";
import ScrollToTop from "../system/ScrollToTop";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isCheckoutPage = pathname === "/system/checkout";

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