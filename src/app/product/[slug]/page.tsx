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
      title: 'Product not found | KD Book Bazaar',
      description: 'The book you are looking for is unavailable.',
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
    'KD Book Bazaar',
  ]


  let intentKeywords: string[] = []
  let catchyBenefit = 'Books Online India'
  let description =
    'Discover a wide range of books across all genres at the best prices. Shop online at KD Book Bazaar for fast delivery across India.'


  // Phone Case specific keywords
  if (slugLower.includes('case') || slugLower.includes('cover')) {
    intentKeywords = [
      'phone case India',
      'mobile cover online',
      'protective phone case',
      'slim phone case',
      'shockproof cover',
      'premium phone case',
      'designer phone cover',
    ]
    catchyBenefit = 'Premium Protection & Style'
    description =
      'Military-grade protection meets elegant design. Premium phone cases with shockproof technology, raised edges for camera protection, and precise cutouts. Authentic quality guaranteed.'
  } else if (slugLower.includes('screen') || slugLower.includes('protector') || slugLower.includes('guard')) {
    intentKeywords = [
      'screen protector',
      'tempered glass',
      'screen guard India',
      '9H hardness',
      'anti-scratch protector',
      'bubble-free installation',
    ]
    catchyBenefit = 'Crystal Clear Protection'
    description =
      '9H tempered glass screen protector with bubble-free installation, oleophobic coating, and ultra-clear transparency. Military-grade protection for your phone screen.'
  } else if (slugLower.includes('charger') || slugLower.includes('cable') || slugLower.includes('adapter')) {
    intentKeywords = [
      'fast charger India',
      'USB cable',
      'phone charger online',
      'quick charge adapter',
      'type-c cable',
      'lightning cable',
    ]
    catchyBenefit = 'Fast & Reliable Charging'
    description =
      'Premium fast charging cables and adapters with durable construction, tangle-free design, and intelligent charging technology. Certified safe and efficient.'
  } else if (slugLower.includes('stand') || slugLower.includes('holder') || slugLower.includes('mount')) {
    intentKeywords = [
      'phone stand India',
      'mobile holder',
      'desk stand',
      'car mount',
      'adjustable phone stand',
    ]
    catchyBenefit = 'Hands-Free Convenience'
    description =
      'Premium phone stands and holders with adjustable angles, stable grip, and elegant design. Perfect for desk, car, or bedside use.'
  }


  const keywords = Array.from(new Set([...baseKeywords, ...intentKeywords]))


  const brand = 'KD Book Bazaar'
  const title = `${product.name} – ${catchyBenefit} | ${brand}`


  const canonical = new URL(`/products/${product.slug}`, 'https://www.thecurioshelf.in')
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
