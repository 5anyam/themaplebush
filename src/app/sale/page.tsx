// app/sale/page.tsx
import { fetchProducts } from '../../../lib/woocommerceApi'
import SaleClient from './SaleClient'

export const metadata = {
  title: 'Sale — KD Book Bazaar',
  description: 'Best deals across all categories. Limited time offers.',
}

export default async function SalePage() {
  const allProducts = await fetchProducts().catch(() => [])
  return <SaleClient allProductsInitial={allProducts} />
}