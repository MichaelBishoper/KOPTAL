import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/system/Navbar";
import Footer from "../components/system/Footer";

export const metadata: Metadata = {
  title: "Frontend",
  description: "Koptal frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
