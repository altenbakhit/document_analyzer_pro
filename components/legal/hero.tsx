"use client";

import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function LegalHero() {
  const { t, tRaw } = useLanguage();
  const achievements: string[] = tRaw("hero.achievements") || [];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-[#07091A]">

      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[radial-gradient(ellipse,_rgba(37,99,235,0.12)_0%,_transparent_65%)] translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse,_rgba(201,168,76,0.08)_0%,_transparent_65%)] -translate-x-1/4 translate-y-1/4" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        {/* Photo overlay — right side */}
        <div className="absolute right-0 top-0 w-1/2 h-full">
          <img
            src="/hero-asian-lawyer.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07091A] via-[#07091A]/80 to-[#07091A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07091A] via-transparent to-[#07091A]/40" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-[680px]">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/[0.07] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.12em]">
              Alten Consulting · Алматы
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[3.25rem] md:text-[4.5rem] lg:text-[5rem] font-bold text-white leading-[1.04] tracking-[-0.03em] mb-6">
            {t("hero.title")}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                {t("hero.titleAccent")}
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-amber-400/60 to-transparent" />
            </span>
          </h1>

          {/* Description */}
          <p className="text-[1.125rem] text-white/50 leading-relaxed mb-10 max-w-[520px]">
            {t("hero.description")}
          </p>

          {/* Achievement pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {achievements.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-white/70">{item}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-14">
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-[15px] transition-all duration-200 shadow-[0_0_35px_rgba(245,158,11,0.3)] hover:shadow-[0_0_45px_rgba(245,158,11,0.5)] active:scale-[0.98]"
            >
              <Phone className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              {t("hero.freeConsultation")}
            </button>
            <button
              onClick={() => window.open("https://api.whatsapp.com/send?phone=77075333733", "_blank", "noopener,noreferrer")}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-[15px] transition-all duration-200 backdrop-blur-sm active:scale-[0.98]"
            >
              <MessageCircle className="h-4.5 w-4.5 text-green-400" style={{ width: 18, height: 18 }} />
              {t("hero.writeWhatsApp")}
            </button>
          </div>

          {/* Stats bar */}
          <div className="inline-grid grid-cols-3 divide-x divide-white/[0.07] border border-white/[0.07] rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm">
            {[
              { value: "500+", label: "Дел выиграно" },
              { value: "10+", label: "Лет опыта" },
              { value: "98%", label: "Довольных клиентов" },
            ].map((s, i) => (
              <div key={i} className="px-6 py-4 text-center hover:bg-white/[0.03] transition-colors">
                <div className="text-[1.75rem] font-bold text-white leading-none mb-1">{s.value}</div>
                <div className="text-[11px] text-white/35 uppercase tracking-widest font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trust note */}
          <p className="mt-6 text-xs text-white/25 flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3" />
            {t("hero.trustIndicator")}
          </p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#07091A] to-transparent pointer-events-none z-10" />
    </section>
  );
}
