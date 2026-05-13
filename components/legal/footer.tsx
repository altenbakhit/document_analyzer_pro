"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Scale, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function LegalFooter() {
  const { t, tRaw } = useLanguage();
  const servicesList: { title: string }[] = tRaw("services.list") || [];

  return (
    <footer className="bg-[#040710] border-t border-white/[0.05]">

      {/* CTA Banner */}
      <div className="border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0F1629] via-[#0F1A2E] to-[#0F1629] border border-white/[0.07] p-8 md:p-10">
            {/* Glow accents */}
            <div className="absolute top-0 left-1/4 w-64 h-32 bg-[radial-gradient(ellipse,_rgba(245,158,11,0.08)_0%,_transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-[radial-gradient(ellipse,_rgba(37,99,235,0.06)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-[11px] text-amber-400/70 uppercase tracking-[0.15em] font-semibold mb-2">
                  Бесплатная консультация
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Есть вопрос? Мы готовы помочь.
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <a
                  href="tel:+77075333733"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                >
                  <Phone className="w-4 h-4" />
                  Позвонить
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=77075333733"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/10 rounded-lg border border-amber-500/30" />
                <Scale className="w-[18px] h-[18px] text-amber-400 relative z-10" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-bold text-white tracking-tight">Alten</span>
                <span className="text-[10px] text-amber-400/70 uppercase tracking-[0.15em] font-medium">Consulting</span>
              </div>
            </Link>
            <p className="text-[13px] text-white/35 leading-relaxed mb-5">
              {t("footer.description")}
            </p>
            <div className="flex flex-col gap-2.5 text-[13px]">
              <a href="tel:+77075333733" className="flex items-center gap-2 text-white/40 hover:text-amber-400 transition-colors">
                <Phone className="w-3.5 h-3.5 text-amber-400/60" />
                +7 707 533 37 33
              </a>
              <a href="mailto:ten_bakhit@mail.ru" className="flex items-center gap-2 text-white/40 hover:text-amber-400 transition-colors">
                <Mail className="w-3.5 h-3.5 text-amber-400/60" />
                ten_bakhit@mail.ru
              </a>
              <a href="https://go.2gis.com/nsLNV" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-white/40 hover:text-white/70 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-amber-400/60 mt-0.5 flex-shrink-0" />
                {t("contact.addressLine1")}, {t("contact.addressLine2")}
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] text-white/30 uppercase tracking-[0.14em] font-bold mb-5">
              {t("footer.navigation")}
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/#services", label: t("footer.services") },
                { href: "/#about", label: t("footer.about") },
                { href: "/blog", label: t("footer.blog") },
                { href: "/templates", label: t("footer.templates") },
                { href: "/analyzer", label: t("footer.analyzer") },
                { href: "/pricelist", label: t("footer.pricelist") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-[13px] text-white/40 hover:text-white transition-colors group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[11px] text-white/30 uppercase tracking-[0.14em] font-bold mb-5">
              {t("footer.servicesTitle")}
            </h4>
            <ul className="space-y-3">
              {servicesList.slice(0, 5).map((service, i) => (
                <li key={i}>
                  <Link
                    href={`/service/${i}`}
                    className="inline-flex items-center gap-1 text-[13px] text-white/40 hover:text-white transition-colors group"
                  >
                    <span>{service.title}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Tools */}
          <div>
            <h4 className="text-[11px] text-white/30 uppercase tracking-[0.14em] font-bold mb-5">
              AI Инструменты
            </h4>
            <div className="space-y-3">
              {[
                { href: "/analyzer/resume", label: "Анализ резюме" },
                { href: "/analyzer/contract", label: "Анализ контрактов" },
                { href: "/templates", label: "Конструктор договоров" },
                { href: "/pricing", label: "Тарифы" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1 text-[13px] text-white/40 hover:text-white transition-colors group"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>

            {/* Social / WhatsApp */}
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <a
                href="https://api.whatsapp.com/send?phone=77075333733"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500/20 bg-green-500/[0.06] text-green-400 text-[13px] font-medium hover:bg-green-500/[0.12] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/20">
            &copy; {new Date().getFullYear()} Alten Consulting. {t("footer.rights")}
          </p>
          <a
            href="https://docs.google.com/document/d/e/2PACX-1vST-Re0uM-KbrfSjnzHpXDOQzGBFtvXjiiCuWlubA4WAd0sgab80tCXll_vinkC1V6e-3_3FHOH-mgk/pub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-white/20 hover:text-white/50 transition-colors"
          >
            {t("footer.privacy")}
          </a>
        </div>
      </div>
    </footer>
  );
}
