import { getTenantProducts, getAdminCategories, getTenantById } from "./index";

export interface SearchResult {
  id: string;
  type: "product" | "category";
  name: string;
  category?: string;
  price?: number;
  productId?: string;
  tenantName?: string;
  location?: string;
}

/**
 * Search products and categories by query string
 * Returns max 10 results (6 products + 4 categories max)
 */
export function searchProductsAndCategories(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  // Get unique categories that match
  const categories = getAdminCategories();
  const matchedCategories = new Set<string>();
  
  categories.forEach((category) => {
    if (category.toLowerCase().includes(lowerQuery)) {
      matchedCategories.add(category);
    }
  });

  // Add category results (max 4)
  matchedCategories.forEach((category) => {
    if (results.length < 4) {
      results.push({
        id: `category-${category}`,
        type: "category",
        name: category,
      });
    }
  });

  // Get and search products
  const products = getTenantProducts();
  const matchedProducts = products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(lowerQuery);
    const categoryMatch = product.category.toLowerCase().includes(lowerQuery);
    return nameMatch || categoryMatch;
  });

  // Add product results (max 6)
  matchedProducts.forEach((product) => {
    if (results.length < 10) {
      const tenant = getTenantById(product.tenant_id);
      results.push({
        id: String(product.product_id),
        type: "product",
        name: product.name,
        category: product.category,
        price: product.price,
        productId: String(product.product_id),
        tenantName: tenant?.name ?? "Unknown Tenant",
        location: tenant?.location ?? "West Java",
      });
    }
  });

  return results;
}

/**
 * Filter products by search query for marketplace display
 */
export function filterProductsBySearch(query: string) {
  if (!query.trim()) return getTenantProducts();

  const lowerQuery = query.toLowerCase();
  const products = getTenantProducts();

  return products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(lowerQuery);
    const categoryMatch = product.category.toLowerCase().includes(lowerQuery);
    return nameMatch || categoryMatch;
  });
}
