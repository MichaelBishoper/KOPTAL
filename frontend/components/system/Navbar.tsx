"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { getAuthSession, type AppRole, safeImageSrc } from "@/lib";

export default function Navbar() {
  const pathname = usePathname();
  const [pagesOpen, setPagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [role, setRole] = useState<AppRole>("guest");
  const [userName, setUserName] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const pagesRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const effectiveRole: AppRole = role === "guest" ? "customer" : role;
  const avatarLetter = userName ? userName.trim()[0].toUpperCase() : (role === "guest" ? "?" : "U");

  const isHomeActive = pathname === "/" || pathname === "/home";

  function pagesItems() {
    if (role === "guest") {
      return [
        { label: "Marketplace", href: "/customer/marketplace" },
        { label: "Basket", href: "/customer/basket" },
      ];
    }

    if (effectiveRole === "admin") {
      return [
        { label: "Admin Dashboard", href: "/admin/a_dashboard" },
      ];
    }

    if (effectiveRole === "tennant") {
      return [
        { label: "T Dashboard", href: "/tennant/t_dashboard" },
        { label: "Add Product", href: "/tennant/product_add" },
        { label: "Transaction & Orders", href: "/tennant/t_transaction" },
      ];
    }

    if (effectiveRole === "customer") {
      return [
        { label: "Marketplace", href: "/customer/marketplace" },
        { label: "Basket", href: "/customer/basket" },
        { label: "Transaction", href: "/customer/c_transaction" },
      ];
    }

    return [
      { label: "Marketplace", href: "/customer/marketplace" },
    ];
  }

  const isPagesActive = pagesItems().some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    void (async () => {
  const session = await getAuthSession();
  setRole(session.role);
  setUserName(session.name ?? null);
  setUserImage((session as any).image ?? null);
    })();

    function onDoc(e: MouseEvent) {
      if (!(e.target instanceof Node)) return;
      const insidePages = pagesRef.current && pagesRef.current.contains(e.target);
      const insideContact = contactRef.current && contactRef.current.contains(e.target);
      if (!insidePages && !insideContact) {
        setPagesOpen(false);
        setProfileOpen(false);
        setContactOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    void (async () => {
  const session = await getAuthSession();
  setRole(session.role);
  setUserName(session.name ?? null);
  setUserImage((session as any).image ?? null);
    })();
  }, [pathname]);

  // No dynamic icon import here to avoid build-time module-resolution errors.

  return (
    <header className="fixed top-0 inset-x-0 z-50 w-full overflow-visible">
      <div className="bg-white shadow-sm overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-visible">
          <div className="flex items-center justify-between h-24 overflow-visible">
            <div className="flex items-center z-20">
              <Link href="/home" className="flex items-center h-24 pl-20">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={360}
                  height={160}
                  className="h-20 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-[78%] h-24 overflow-visible z-50">
              <Link href="/home" className={`text-base font-bold border-b-3 hover:pb-1 transition ${
                isHomeActive ? "text-black border-[#01A49E]" : "text-gray-800 border-transparent hover:text-black hover:border-[#01A49E]"
              }`}>HOME</Link>

              <div
                className="relative ml-3"
                ref={pagesRef}
                onMouseEnter={() => setPagesOpen(true)}
                onMouseLeave={() => setPagesOpen(false)}
              >
                <button
                  className={`text-base font-bold border-b-3 flex items-center gap-2 hover:pb-1 transition ${
                    isPagesActive ? "text-black border-[#01A49E]" : "text-gray-800 border-transparent hover:text-black hover:border-[#01A49E]"
                  }`}
                >
                  PAGES
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                {pagesOpen && (
                  <div
                    className="absolute left-0 mt-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                    onMouseEnter={() => setPagesOpen(true)}
                    onMouseLeave={() => setPagesOpen(false)}
                  >
                    {pagesItems().map((it, idx) => (
                      <Link key={it.href} href={it.href} className={`block px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer transition ${
                        idx !== pagesItems().length - 1 ? 'border-b border-gray-100' : ''
                      }`}>{it.label}</Link>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative"
                ref={contactRef}
                onMouseEnter={() => setContactOpen(true)}
                onMouseLeave={() => setContactOpen(false)}
              >
                <button
                  className="text-base font-bold text-gray-800 border-b-3 border-transparent hover:text-black flex items-center gap-2 hover:border-[#01A49E] hover:pb-1 transition"
                >
                  CONTACT
                </button>

                {contactOpen && (
                  <div
                    className="absolute left-0 mt-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-visible"
                    onMouseEnter={() => setContactOpen(true)}
                    onMouseLeave={() => setContactOpen(false)}
                  >
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition border-b border-gray-100">Email: support@example.com</div>
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition border-b border-gray-100">Phone: +1 (555) 123-4567</div>
                    <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition">Help Center</div>
                  </div>
                )}
              </div>
            </nav>

            <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-6 z-20">
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-500">WELCOME</div>
                {role === "guest" ? (
                  <Link href="/login" className="text-sm font-semibold text-black hover:underline">
                    LOG IN / REGISTER
                  </Link>
                ) : (
                  <Link href="/user" className="text-sm font-semibold text-black hover:underline">
                    {userName ?? "Account"}
                  </Link>
                )}
              </div>

              <Link href="/user" className="relative inline-flex items-center justify-center w-10 h-10" aria-label="Go to user profile">
                {userImage ? (
                  <Image src={safeImageSrc(userImage)} alt={userName ?? "avatar"} width={40} height={40} className="rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-[#01A49E] rounded-full flex items-center justify-center text-sm font-bold text-white hover:bg-teal-600 transition">{avatarLetter}</div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {(effectiveRole === "admin" || effectiveRole === "tennant") ? (
        <div className="h-10 bg-[#01A49E]" />
      ) : (
        <div className="bg-[#01A49E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex justify-center">
              <SearchBar />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
