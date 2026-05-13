"use client";

import Link from "next/link";
import {
  Scale, Building2, FileText, Shield, Users, Briefcase, ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const icons = [Scale, Building2, FileText, Shield, Users, Briefcase];

const cardAccents = [
  "from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-400/40",
  "from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:border-violet-400/40",
  "from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-400/40",
  "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-400/40",
  "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-400/40",
  "from-rose-500/10 to-rose-600/5 border-rose-500/20 hover:border-rose-400/40",
];

const iconColors = [
  "text-blue-400", "text-violet-400", "text-amber-400",
  "text-emerald-400", "text-cyan-400", "text-rose-400",
];

const glowColors = [
  "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
  "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
  "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
  "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
  "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]",
  "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]",
];

export function LegalServices() {
  const { t, tRaw } = useLanguage();
  const servicesList: { title: string; description: string; features: string[] }[] =
    tRaw("services.list") || [];

  return (
    <section id="services" className="py-28 bg-[#07091A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400/80 text-xs font-semibold uppercase tracking-[0.12em]">
              {t("services.title")}
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-[-0.025em] leading-tight max-w-xl">
              {t("services.titleAccent")}
            </h2>
            <p className="text-white/40 max-w-sm text-[15px] leading-relaxed lg:text-right">
              {t("services.subtitle")}
            </p>
          </div>
          <div className="mt-6 h-px bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-transparent" />
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicesList.map((service, index) => {
            const Icon = icons[index] || Scale;
            const accent = cardAccents[index] || cardAccents[0];
            const iconColor = iconColors[index] || iconColors[0];
            const glow = glowColors[index] || glowColors[0];
            const isPopular = index === 0 || index === 3;

            return (
              <Link
                key={index}
                href={`/service/${index}`}
                className={`group relative flex flex-col p-6 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:-translate-y-0.5 ${accent} ${glow}`}
              >
                {isPopular && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    {t("services.popular")}
                  </span>
                )}

                {/* Number + Icon */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] group-hover:border-white/[0.12] transition-colors ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white/15 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[17px] font-bold text-white mb-2.5 leading-snug">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-[13.5px] text-white/45 leading-relaxed mb-5 flex-1">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-1.5 mb-6">
                  {service.features?.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[12.5px] text-white/50">
                      <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${iconColor.replace("text-", "bg-")}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className={`flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-200 group-hover:gap-2.5 ${iconColor}`}>
                  {t("services.learnMore")}
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-sm text-white/25">
          {t("services.contactUs")}
        </p>
      </div>
    </section>
  );
}
