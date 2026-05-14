import CustomerProductPage from "@/components/customer/product_page";

export default async function ProductPage({
  params,
}: {
  params?: Promise<{
    id?: string;
  }>;
}) {
  const resolvedParams = (await params) ?? {};
  return <CustomerProductPage id={resolvedParams.id ?? ""} />;
}
