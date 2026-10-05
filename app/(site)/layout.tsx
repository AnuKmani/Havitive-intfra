import type { Metadata, Viewport } from "next";
import Header, { MobileMenu } from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { SideMenu } from "@/components/site/ContactInfo";
import ThemeScripts from "@/components/site/ThemeScripts";
import ChatWidget from "@/components/chat/ChatWidget";
import JsonLd from "@/components/site/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Havitive Infra Pvt Ltd | Architecture, Engineering & Construction in Kerala",
    template: "%s | Havitive",
  },
  description: SITE.description,
  keywords: [
    "Havitive", "Havitive Infra", "architects in Trivandrum", "construction company Kerala",
    "structural engineering consultancy", "interior design Thiruvananthapuram", "public building design Kerala",
    "Kazhakkoottam architects",
  ],
  applicationName: SITE.shortName,
  alternates: { canonical: "/" },
  icons: { icon: "/upload/logos/hav.png", apple: "/upload/logos/hav.png" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_IN",
    url: SITE.url,
    title: "Havitive Infra Pvt Ltd",
    description: SITE.description,
    images: [{ url: "/upload/logos/havitive.jpeg", alt: "Havitive Infra Pvt Ltd" }],
  },
  twitter: { card: "summary_large_image", title: "Havitive Infra Pvt Ltd", description: SITE.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#052132", width: "device-width", initialScale: 1 };

const organization = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.shortName,
  url: SITE.url,
  logo: `${SITE.url}/upload/logos/hav.png`,
  image: `${SITE.url}/upload/logos/havitive.jpeg`,
  description: SITE.description,
  email: SITE.email,
  telephone: SITE.phones[0].tel,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.locality,
    addressRegion: SITE.address.region,
    addressCountry: SITE.address.country,
  },
  areaServed: "Kerala, India",
  sameAs: Object.values(SITE.social),
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap" />
        <link rel="stylesheet" href="/frontend/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/frontend/assets/css/fontawesome.min.css" />
        <link rel="stylesheet" href="/frontend/assets/css/magnific-popup.min.css" />
        <link rel="stylesheet" href="/frontend/assets/css/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/frontend/assets/css/style.css" />
        <link rel="stylesheet" href="/css/custom.css" />
      </head>
      <body className="bg-smoke">
        <a href="#main" className="visually-hidden-focusable">Skip to content</a>
        <JsonLd data={organization} />
        <div className="cursor-follower"></div>
        <div className="slider-drag-cursor">
          <i className="fas fa-angle-left me-2"></i> DRAG <i className="fas fa-angle-right ms-2"></i>
        </div>
        <MobileMenu />
        <SideMenu />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <div className="scroll-top">
          <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
            <path
              d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
              style={{ transition: "stroke-dashoffset 10ms linear 0s", strokeDasharray: "307.919, 307.919", strokeDashoffset: 307.919 }}
            ></path>
          </svg>
        </div>
        <ChatWidget />
        <ThemeScripts />
      </body>
    </html>
  );
}
