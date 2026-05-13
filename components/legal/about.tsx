"use client";

import { GraduationCap, TrendingUp, Award, Star, Users, CheckCircle2, Quote } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const statIcons = [TrendingUp, Award, Star, Users];
const statColors = ["text-blue-400", "text-amber-400", "text-violet-400", "text-emerald-400"];
const statBg = ["bg-blue-500/10", "bg-amber-500/10", "bg-violet-500/10", "bg-emerald-500/10"];

export function LegalAbout() {
  const { t, tRaw } = useLanguage();
  const stats: { value: string; label: string }[] = tRaw("about.stats") || [];
  const achievements: string[] = tRaw("about.achievements") || [];

  return (
    <section id="about" className="py-28 bg-[#F7F6F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — Text content */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-900/10 bg-slate-900/[0.04] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 text-xs font-semibold uppercase tracking-[0.12em]">
                {t("about.badge")}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-[-0.025em] leading-tight mb-5">
              {t("about.title")}{" "}
              <span className="text-amber-500">{t("about.titleAccent")}</span>
            </h2>

            <p className="text-[16px] text-slate-500 leading-relaxed mb-8 max-w-lg">
              {t("about.description")}
            </p>

            {/* Achievement checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {achievements.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Education card */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-900 mb-1.5">
                  {t("about.educationTitle")}
                </p>
                <p className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-line">
                  {t("about.educationText")}
                </p>
              </div>
            </div>
          </div>

          {/* Right — Stats + Quote */}
          <div className="flex flex-col gap-5">

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => {
                const Icon = statIcons[i] || TrendingUp;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <div className={`inline-flex p-2 rounded-lg mb-3 ${statBg[i]}`}>
                      <Icon className={`w-4 h-4 ${statColors[i]}`} />
                    </div>
                    <div className={`text-3xl font-bold mb-1 tracking-tight ${statColors[i]}`}>
                      {stat.value}
                    </div>
                    <div className="text-[12.5px] text-slate-500 font-medium leading-snug">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quote / approach card */}
            <div className="relative p-6 rounded-2xl bg-[#07091A] border border-white/[0.06] overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[radial-gradient(ellipse,_rgba(201,168,76,0.08)_0%,_transparent_70%)] translate-x-1/3 -translate-y-1/3 pointer-events-none" />

              <Quote className="w-8 h-8 text-amber-400/30 mb-4" />

              <h3 className="text-[16px] font-bold text-white mb-3">
                {t("about.approachTitle")}
              </h3>
              <p className="text-[14px] text-white/50 leading-relaxed mb-4">
                {t("about.approachText")}
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm">
                  A
                </div>
                <span className="text-[13px] font-semibold text-amber-400">
                  {t("about.approachAuthor")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
