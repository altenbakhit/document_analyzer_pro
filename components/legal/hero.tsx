"use client";

import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function LegalHero() {
  const { t, tRaw } = useLanguage();

  const achievements: string[] = tRaw("hero.achievements") || [];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-asian-lawyer.jpg"
          alt="Alten Consulting"
          className="w-full h-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 mt-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t("hero.title")}{" "}
            <span className="text-amber-400">{t("hero.titleAccent")}</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            {t("hero.description")}
          </p>

          {/* Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-white/90"
              >
                <CheckCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <span className="font-medium">{achievement}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-amber-500 text-white hover:bg-amber-600 shadow-lg font-semibold"
              onClick={() => {
                const contactSection = document.getElementById("contact");
                contactSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Phone className="mr-2 h-5 w-5" />
              {t("hero.freeConsultation")}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white text-white bg-white/15 backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-300"
              onClick={() => {
                window.open("https://api.whatsapp.com/send?phone=77075333733", "_blank", "noopener,noreferrer");
              }}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {t("hero.writeWhatsApp")}
            </Button>
          </div>

          {/* Trust Indicator */}
          <div className="mt-8 text-sm text-white/80">
            {t("hero.trustIndicator")}
          </div>
        </div>
      </div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
}
