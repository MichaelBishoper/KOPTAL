import type { BasketItem } from "../editor/basket";

export type PaymentMethod = "qris" | "creditcard" | "transfer" | "ewallet";
export type AddressMode = "saved" | "custom";

export type CheckoutPaymentMethodOption = {
  id: PaymentMethod;
  title: string;
  icon: string;
  description: string;
};

export const CHECKOUT_PAYMENT_METHODS: CheckoutPaymentMethodOption[] = [
  {
    id: "qris",
    title: "QRIS",
    icon: "📱",
    description: "Scan with mobile banking or e-wallet app",
  },
  {
    id: "creditcard",
    title: "Credit Card",
    icon: "💳",
    description: "Pay with Visa, Mastercard, or AmEx",
  },
  {
    id: "transfer",
    title: "Bank Transfer",
    icon: "🏦",
    description: "Transfer to virtual account manually",
  },
  {
    id: "ewallet",
    title: "E-Wallet",
    icon: "💰",
    description: "Pay with OVO, GoPay, Dana, or LinkAja",
  },
];

export function getCheckoutSubtotal({
  basketItems,
  subtotalParam,
  tenantIdParam,
}: {
  basketItems: BasketItem[];
  subtotalParam: number;
  tenantIdParam: string | null;
}): number {
  if (Number.isFinite(subtotalParam) && subtotalParam > 0) return Math.round(subtotalParam);

  if (tenantIdParam) {
    const tenantId = Number(tenantIdParam);
    if (Number.isFinite(tenantId)) {
      return basketItems
        .filter((item) => item.tenant_id === tenantId)
        .reduce((sum, item) => sum + item.subtotal, 0);
    }
  }

  return basketItems.reduce((sum, item) => sum + item.subtotal, 0);
}

export async function resolveSavedShippingAddress(
  customerId: number | null,
): Promise<string> {
  if (customerId === null) return "";

  try {
    const res = await fetch("/api/iam/customers/profile", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return "";

    const profile = (await res.json()) as { shipping_address?: string };
    return profile.shipping_address ?? "";
  } catch {
    return "";
  }
}

export function getCheckoutPaymentInstructions(method: PaymentMethod, amountLabel: string): string[] {
  if (method === "qris") {
    return [
      "Open your mobile banking or e-wallet app.",
      "Scan QRIS code (mock).",
      `Confirm amount Rp${amountLabel}.`,
    ];
  }

  if (method === "creditcard") {
    return [
      "Enter card number, expiry date, and CVV.",
      "Complete OTP verification from your bank.",
      `Confirm amount Rp${amountLabel}.`,
    ];
  }

  if (method === "transfer") {
    return [
      "Transfer to BCA VA 1234567890123.",
      `Use exact amount Rp${amountLabel}.`,
      "Keep transfer receipt for confirmation.",
    ];
  }

  return [
    "Select e-wallet provider in your app.",
    "Approve payment request (mock).",
    `Confirm amount Rp${amountLabel}.`,
  ];
}
