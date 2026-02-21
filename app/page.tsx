"use client";

import { Navbar } from "@/components/navbar";
import { LegalHero } from "@/components/legal/hero";
import { LegalServices } from "@/components/legal/services";
import { LegalAbout } from "@/components/legal/about";
import { LegalContact } from "@/components/legal/contact";
import { LegalFooter } from "@/components/legal/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <LegalHero />
      <LegalServices />
      <LegalAbout />
      <LegalContact />
      <LegalFooter />
    </div>
  );
}
