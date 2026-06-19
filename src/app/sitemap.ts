import type { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `https://www.kdbookbazaar.com/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: `https://www.kdbookbazaar.com/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.kdbookbazaar.com/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.kdbookbazaar.com/disclaimer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.kdbookbazaar.com/shipping-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.kdbookbazaar.com/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.kdbookbazaar.com/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.kdbookbazaar.com/returns-and-refunds-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.kdbookbazaar.com/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `https://www.kdbookbazaar.com/sale`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];

  return [...staticPages];
}
