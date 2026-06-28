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
  title: 'The Curio Shelf — Carry a little wonder.',
  description: 'The Curio Shelf — curated, characterful carry goods. A shelf of curiosities you actually use. Made in India.',
  keywords: 'curio shelf, bags india, pouches, cosmetic bags, lunch bags, travel bags, made in india, thecurioshelf',
  openGraph: {
    title: 'The Curio Shelf — Carry a little wonder.',
    description: 'Curated, characterful carry goods. A shelf of curiosities you actually use. Made in India.',
    url: 'https://thecurioshelf.in',
    siteName: 'The Curio Shelf',
    images: [
      {
        url: '/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'The Curio Shelf',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Curio Shelf — Carry a little wonder.',
    description: 'Curated, characterful carry goods. Made in India.',
    images: ['/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://thecurioshelf.in',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtagId = 'AW-XXXXXXXXX';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#FF6A2B" />

        {/* Google Fonts — brand typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Caveat:wght@500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Preload logo */}
        <link rel="preload" href="/logo.jpg" as="image" type="image/jpeg" />

        {/* SEO */}
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />

        {/* Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "The Curio Shelf",
              "description": "Curated, characterful carry goods. A shelf of curiosities you actually use. Made in India.",
              "url": "https://thecurioshelf.in",
              "logo": "https://thecurioshelf.in/logo.jpg",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Delhi",
                "addressRegion": "Delhi",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "hello@thecurioshelf.in"
              },
              "sameAs": [
                "https://www.instagram.com/thecurioshelf",
                "https://www.pinterest.com/thecurioshelf"
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
            gtag('config', '${gtagId}');
          `}
        </Script>
      </head>

      <body className="overflow-x-hidden overflow-y-scroll antialiased transition-colors duration-300" style={{ background: '#FFF6EF', color: '#2A0A22' }}>
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
