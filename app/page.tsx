"use client";

import { Navbar } from "@/components/navbar";
import { LegalHero } from "@/components/legal/hero";
import { LegalServices } from "@/components/legal/services";
import { LegalAbout } from "@/components/legal/about";
import { LegalContact } from "@/components/legal/contact";
import { LegalFooter } from "@/components/legal/footer";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "Alten Consulting",
    description: "Юридические услуги в Алматы. Гражданское, корпоративное, уголовное, семейное и трудовое право.",
    url: "https://alten.kz",
    telephone: "+77075333733",
    email: "ten_bakhit@mail.ru",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Толе би 189Д, 4 этаж, 401 кабинет",
      addressLocality: "Алматы",
      addressCountry: "KZ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.2551,
      longitude: 76.9126,
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "15:00" },
    ],
    priceRange: "$$",
    areaServed: { "@type": "Country", name: "Kazakhstan" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Alten Consulting",
    url: "https://alten.kz",
    logo: "https://alten.kz/favicon.svg",
    email: "ten_bakhit@mail.ru",
    telephone: "+77075333733",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Толе би 189Д, 4 этаж, 401 кабинет",
      addressLocality: "Алматы",
      addressCountry: "KZ",
    },
    sameAs: ["https://api.whatsapp.com/send?phone=77075333733"],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <LegalHero />
      <LegalServices />
      <LegalAbout />
      <LegalContact />
      <LegalFooter />
    </div>
  );
}
