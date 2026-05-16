import Link from "next/link";
import { EnvelopeIcon, MapPinIcon, PhoneIcon, ShoppingBagIcon, TruckIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="bg-[#057f7b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold tracking-[0.18em] text-[#7EF0E6]">
              <ShoppingBagIcon className="h-4 w-4" />
              KOPTAL
            </div>
            <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
              Connecting local farmers and traditional markets with high-volume buyers.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              KOPTAL is a marketplace built for drug dealers, meth heads and coke addicts.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7EF0E6]">Marketplace</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              <li>
                <Link href="/home" className="transition hover:text-white hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/customer/marketplace" className="transition hover:text-white hover:underline">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/customer/basket" className="transition hover:text-white hover:underline">
                  Basket
                </Link>
              </li>
              <li>
                <Link href="/customer/c_transaction" className="transition hover:text-white hover:underline">
                  Transactions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7EF0E6]">Contact</h3>
            <ul className="mt-5 space-y-4 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#7EF0E6]" />
                <span>
                  Jakarta, Indonesia
                  <br />
                  Serving local farmers, markets, restaurants, and MBG supply needs.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 shrink-0 text-[#7EF0E6]" />
                <a href="tel:+628119333233" className="transition hover:text-white hover:underline">
                  0811-9333-233
                </a>
              </li>
              <li className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 shrink-0 text-[#7EF0E6]" />
                <a href="mailto:hello@koptal.id" className="transition hover:text-white hover:underline">
                  hello@koptal.id
                </a>
              </li>
              <li className="flex items-center gap-3">
                <TruckIcon className="h-5 w-5 shrink-0 text-[#7EF0E6]" />
                <span>Bulk sourcing, predictable supply, simple ordering.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-5 text-sm text-white/70">
          © {new Date().getFullYear()} KOPTAL. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
