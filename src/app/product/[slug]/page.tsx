// app/products/[slug]/page.tsx (Server Component)
import type { Metadata, ResolvingMetadata } from 'next'
import ProductClient from './product-client'
import { fetchProducts, type Product as WCProduct } from '../../../../lib/woocommerceApi'


type Props = { 
  params: Promise<{ slug: string }>
}


type ProductWire = {
  id: number
  name: string
  slug: string
  price: string
  regular_price: string
  description?: string
  short_description?: string
  images?: Array<{ src: string }>
  attributes?: Array<{ option: string }>
}


type ProductNormalized = {
  id: number
  name: string
  slug: string
  price: string
  regular_price: string
  description?: string
  short_description?: string
  images: Array<{ src: string }>
  attributes?: Array<{ option: string }>
}


function normalizeProduct(p: ProductWire): ProductNormalized {
  return {
    ...p,
    images: Array.isArray(p.images) ? p.images : [],
  }
}


async function getAllProducts() {
  const products = await fetchProducts() as ProductWire[]
  return products.map(normalizeProduct)
}


async function getProductBySlug(slug: string) {
  const products = await getAllProducts()
  return products.find(p => p.slug === slug || String(p.id) === slug)
}


export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)


  if (!product) {
    return {
      title: 'Product not found | The Curio Shelf',
      description: 'The piece you are looking for is unavailable.',
      robots: { index: false, follow: false },
    }
  }


  const slugLower = String(product.slug || '').toLowerCase()


  const baseKeywords = [
    product.name,
    'buy online',
    'price',
    'reviews',
    'India',
    'made in India',
    'The Curio Shelf',
  ]


  let intentKeywords: string[] = []
  let catchyBenefit = 'Curated Carry Goods'
  let description =
    'Curated, characterful carry goods you will actually reach for every day. Shop The Curio Shelf for lunch bags, pouches, organisers and more — made in India, delivered pan-India.'


  // Lunch bags & tiffin carriers
  if (/lunch|tiffin|casserole|insulat|thermal|bento/.test(slugLower)) {
    intentKeywords = [
      'insulated lunch bag India',
      'tiffin bag online',
      'office lunch bag',
      'thermal lunch bag',
      'lunch bag for women',
      'tiffin carrier bag',
    ]
    catchyBenefit = 'Warm Till Lunchtime'
    description =
      'Insulated lunch bags that keep food warm for 4–6 hours. Food-safe lining, sturdy zips and roomy enough for a multi-tier tiffin. Made in India, delivered pan-India.'
  } else if (/pouch|cosmetic|makeup|make-up|vanity|toiletr|purse|wallet|clutch/.test(slugLower)) {
    intentKeywords = [
      'makeup pouch online India',
      'cosmetic bag',
      'travel toiletry pouch',
      'vanity pouch for women',
      'small makeup bag',
      'zip pouch India',
    ]
    catchyBenefit = 'Small Outside, Roomy Inside'
    description =
      'Makeup and travel pouches that hold far more than they look. Smooth reinforced zips, wipe-clean lining and cabin-friendly sizes. Made in India, delivered pan-India.'
  } else if (/organi[sz]er|organi[sz]ing|storage|divider|drawer|caddy/.test(slugLower)) {
    intentKeywords = [
      'wardrobe organiser India',
      'drawer organiser',
      'storage organiser online',
      'foldable storage box',
      'travel organiser set',
    ]
    catchyBenefit = 'Finally, A Tidy Drawer'
    description =
      'Storage and wardrobe organisers that hold their shape when full and fold flat when empty. Sized for Indian wardrobes and drawers. Made in India, delivered pan-India.'
  } else if (/bag|tote|backpack|sling|duffel|handbag|shopper/.test(slugLower)) {
    intentKeywords = [
      'tote bag India',
      'sling bag online',
      'everyday bag for women',
      'travel bag India',
      'stylish handbag online',
    ]
    catchyBenefit = 'Everyday Carry, Elevated'
    description =
      'Bags built for real days — sturdy stitching, honest capacity and a shape that still looks good at 6pm. Made in India, delivered pan-India with 7-day easy returns.'
  }


  const keywords = Array.from(new Set([...baseKeywords, ...intentKeywords]))


  const brand = 'The Curio Shelf'
  const title = `${product.name} – ${catchyBenefit} | ${brand}`


  const canonical = new URL(`/product/${product.slug}`, 'https://www.thecurioshelf.in')
  const imageUrl =
    product.images?.[0]?.src
      ? new URL(product.images[0].src, 'https://www.thecurioshelf.in').toString()
      : 'https://www.thecurioshelf.in/logo.png'


  const previous = await parent
  const previousOgImages = previous.openGraph?.images ?? []


  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonical.toString() },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical.toString(),
      siteName: brand,
      images: [
        ...(Array.isArray(previousOgImages) ? previousOgImages : []),
        { url: imageUrl, width: 1200, height: 630, alt: product.name },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
    metadataBase: new URL('https://www.thecurioshelf.in'),
  }
}


export default async function Page({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  const products = await getAllProducts()

  // ✅ Cast to WCProduct to fix TypeScript error
  const productForClient = product as unknown as WCProduct | undefined
  const productsForClient = products as unknown as WCProduct[]

  return (
    <ProductClient
      initialProduct={productForClient}
      allProductsInitial={productsForClient}
      slug={slug}
    />
  )
}
