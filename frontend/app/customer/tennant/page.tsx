import TenantPage from "@/components/customer/tenant_page";

export default async function CustomerTennant({
  searchParams,
}: {
  searchParams?: Promise<{
    name?: string;
    location?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  return <TenantPage name={params.name} location={params.location} />;
}
