"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Scale, LogOut, User, Shield, Globe, Menu, X, FileSearch, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Lang } from "@/lib/i18n/translations";

const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "kk", label: "Қазақша", flag: "🇰🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export function Navbar() {
  const { data: session, status } = useSession() || {};
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  const navLinks = [
    { href: "/#services", label: t("legalNav.services") },
    { href: "/#about", label: t("legalNav.about") },
    { href: "/blog", label: t("legalNav.blog") },
    { href: "/templates", label: t("legalNav.templates") },
    { href: "/analyzer", label: t("legalNav.analyzer") },
    { href: "/pricelist", label: t("nav.pricelist") },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07091A]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
          : "bg-[#07091A]/80 backdrop-blur-md border-b border-white/[0.04]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/10 rounded-lg border border-amber-500/30 group-hover:border-amber-400/50 transition-colors" />
              <Scale className="h-4.5 w-4.5 text-amber-400 relative z-10" style={{ width: 18, height: 18 }} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-white tracking-tight">Alten</span>
              <span className="text-[10px] text-amber-400/80 uppercase tracking-[0.15em] font-medium">Consulting</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm text-white/60 hover:text-white rounded-md hover:bg-white/[0.06] transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all text-sm">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="font-medium">{currentLang.code.toUpperCase()}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#0F1629] border-white/10 text-white min-w-[140px]"
              >
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`text-sm cursor-pointer ${
                      lang === l.code
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-white/70 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="mr-2">{l.flag}</span>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth */}
            {status === "authenticated" && session ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/analyzer">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] rounded-md transition-all">
                    <FileSearch className="h-3.5 w-3.5" />
                    {t("nav.dashboard")}
                  </button>
                </Link>
                {session?.user?.role === "admin" && (
                  <Link href="/admin">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-400/80 hover:text-purple-300 hover:bg-purple-500/10 rounded-md transition-all">
                      <Shield className="h-3.5 w-3.5" />
                      {t("nav.admin")}
                    </button>
                  </Link>
                )}
                <div className="h-4 w-px bg-white/10" />
                <span className="hidden xl:block text-xs text-white/40 max-w-[120px] truncate">
                  {session?.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("nav.logout")}</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link href="/auth/login">
                  <button className="px-4 py-1.5 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black rounded-md transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                    {t("nav.login")}
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/[0.06] rounded-md transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/[0.06] py-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] rounded-md transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/[0.06] mt-2 pt-3">
                {status === "authenticated" && session ? (
                  <>
                    <Link href="/analyzer" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] rounded-md">
                      <FileSearch className="h-4 w-4" />{t("nav.dashboard")}
                    </Link>
                    {session?.user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-purple-400 hover:bg-purple-500/10 rounded-md">
                        <Shield className="h-4 w-4" />{t("nav.admin")}
                      </Link>
                    )}
                    <p className="px-3 py-2 text-xs text-white/30">{session?.user?.email}</p>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-md"
                    >
                      <LogOut className="h-4 w-4" />{t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                    className="block text-center px-4 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black rounded-md transition-all">
                    {t("nav.login")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
