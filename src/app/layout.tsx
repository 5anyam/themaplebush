import './styles/globals.css';
import ReactQueryProvider from '../../components/ReactQueryProvider';
import { CartProvider } from '../../lib/cart';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { AuthProvider } from '../../lib/AuthContext';
import Script from 'next/script';
import { ThemeProvider } from '../../components/ThemeProvider';
import Loader from '../../components/Loader';

export const metadata = {
  title: 'KD Book Bazaar - Shop Everything You Love | Best Deals Online India',
  description: 'KD Book Bazaar is your one-stop online shopping destination in India. Shop electronics, fashion, home essentials, beauty, sports, toys & more at the best prices. 100% authentic products with fast delivery.',
  keywords: 'online shopping india, buy electronics online, fashion online india, home essentials, beauty products, sports equipment, kdbookbazaar, best deals india, authentic products, fast delivery, kdbookbazaar.com',
  openGraph: {
    title: 'KD Book Bazaar - Shop Everything You Love',
    description: 'Your trusted online shopping destination. Best prices on electronics, fashion, home essentials & more with 100% authentic products.',
    url: 'https://kdbookbazaar.com',
    siteName: 'KD Book Bazaar',
    images: [
      {
        url: '/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'KD Book Bazaar - Shop Everything You Love',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KD Book Bazaar - Shop Everything You Love',
    description: 'Your trusted online shopping destination in India. Best prices, fast delivery, easy returns.',
    images: ['/logo.jpg'],
    creator: '@kdbookbazaar',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://kdbookbazaar.com',
  },
  category: 'ecommerce',
  classification: 'Online Shopping & Retail',
  authors: [{ name: 'KD Book Bazaar' }],
  creator: 'KD Book Bazaar',
  publisher: 'KD Book Bazaar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtagId = 'AW-XXXXXXXXX';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ff3131" />
        <meta name="msapplication-TileColor" content="#1a1a1a" />

        {/* Preload Critical Assets */}
        <link rel="preload" href="/logo.jpg" as="image" type="image/jpeg" />

        {/* Additional SEO Meta Tags */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "KD Book Bazaar",
              "description": "India's trusted online shopping destination offering electronics, fashion, home essentials, beauty, sports and more at best prices.",
              "url": "https://kdbookbazaar.com",
              "logo": "https://kdbookbazaar.com/logo.jpg",
              "foundingDate": "2024",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Delhi",
                "addressRegion": "Delhi",
                "postalCode": "110001",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9911636888",
                "contactType": "customer service",
                "email": "support@kdbookbazaar.com",
                "availableLanguage": ["English", "Hindi"]
              },
              "sameAs": [
                "https://www.facebook.com/kdbookbazaar",
                "https://www.instagram.com/kdbookbazaar",
                "https://www.youtube.com/@kdbookbazaar"
              ],
              "brand": {
                "@type": "Brand",
                "name": "KD Book Bazaar",
                "logo": "https://kdbookbazaar.com/logo.jpg",
                "slogan": "Shop Everything You Love"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1200",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />

        {/* WebSite + Sitelinks Searchbox Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "KD Book Bazaar",
              "url": "https://kdbookbazaar.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://kdbookbazaar.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Product Categories ItemList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "KD Book Bazaar Product Categories",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Electronics", "url": "https://kdbookbazaar.com/category/mobile-electronics-accessories" },
                { "@type": "ListItem", "position": 2, "name": "Fashion", "url": "https://kdbookbazaar.com/category/fashion" },
                { "@type": "ListItem", "position": 3, "name": "Home & Kitchen", "url": "https://kdbookbazaar.com/category/home-kitchen" },
                { "@type": "ListItem", "position": 4, "name": "Home Decor", "url": "https://kdbookbazaar.com/category/home-decor" },
                { "@type": "ListItem", "position": 5, "name": "Sports & Outdoors", "url": "https://kdbookbazaar.com/category/sports-outdoors" },
                { "@type": "ListItem", "position": 6, "name": "Toys & Games", "url": "https://kdbookbazaar.com/category/toys-games" },
                { "@type": "ListItem", "position": 7, "name": "Bike & Car", "url": "https://kdbookbazaar.com/category/bike-car-accessories" },
                { "@type": "ListItem", "position": 8, "name": "Office Products", "url": "https://kdbookbazaar.com/category/office-products" }
              ]
            })
          }}
        />

        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kdbookbazaar.com" },
                { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://kdbookbazaar.com/collections" }
              ]
            })
          }}
        />

        {/* Microsoft Clarity */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "upgau66qzf");
            `
          }}
        />

        {/* Meta Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1944720636112584');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1944720636112584&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtagId}', {
              page_title: 'KD Book Bazaar',
              page_location: window.location.href,
            });
          `}
        </Script>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `}
        </Script>
      </head>

      <body className="overflow-x-hidden overflow-y-scroll antialiased bg-white transition-colors duration-300">
        {/* GTM noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <Loader />

        <ThemeProvider>
          <ReactQueryProvider>
            <CartProvider>
              <AuthProvider>
                <Header />
                <main role="main" className="min-h-screen">
                  {children}
                </main>
                <Footer />
              </AuthProvider>
            </CartProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
