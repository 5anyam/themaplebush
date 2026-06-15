import { fetchProducts } from '../../../../lib/woocommerceApi'
import CategoryClient from './CategoryClient'

export async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string }>
  }) {
    const { slug } = await params
    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    return { title: `${name} — KD Book Bazaar`, description: `Shop ${name} products` }
  }
export default async function CategoryPage({
    params,
  }: {
    params: Promise<{ slug: string }>   // 👈 Promise type
  }) {
    const { slug } = await params        // 👈 await karo pehle
  
    const allProducts = await fetchProducts().catch(() => [])
  
    const categoryName = slug             // ✅ ab safely use kar sako
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  
    return (
      <CategoryClient
        categorySlug={slug}
        categoryName={categoryName}
        allProductsInitial={allProducts}
      />
    )
  }