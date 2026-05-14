"use client";

import { useSearchParams } from "next/navigation";
import Catalog from "@/components/marketplace/Catalog";

export default function MarketplacePage() {
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("search") ?? "";

	return (
		<main className="w-full">
			<Catalog columns={5} searchQuery={searchQuery} />
		</main>
	);
}
