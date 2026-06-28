import type { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `https://www.thecurioshelf.in/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: `https://www.thecurioshelf.in/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.thecurioshelf.in/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.thecurioshelf.in/disclaimer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.thecurioshelf.in/shipping-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.thecurioshelf.in/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.thecurioshelf.in/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.thecurioshelf.in/returns-and-refunds-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `https://www.thecurioshelf.in/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `https://www.thecurioshelf.in/sale`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];

  return [...staticPages];
}
