import { fetchProducts, fetchProductCategories } from "../../lib/woocommerceApi";
import HomePageClient from "./homePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: object[] = [];
  let categories: object[] = [];

  try {
    [products, categories] = await Promise.all([
      fetchProducts(1, 100),
      fetchProductCategories(100, false),
    ]);
  } catch {
    products = [];
    categories = [];
  }

  const filteredCategories = (categories as { slug: string; name: string; count: number }[])
    .filter((c) => c.slug !== 'uncategorized' && c.name.toLowerCase() !== 'uncategorized')
    .sort((a, b) => b.count - a.count);

  return (
    <HomePageClient
      products={products as Parameters<typeof HomePageClient>[0]['products']}
      categories={filteredCategories as Parameters<typeof HomePageClient>[0]['categories']}
    />
  );
}
