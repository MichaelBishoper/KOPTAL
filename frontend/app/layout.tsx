import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/system/AppShell";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
