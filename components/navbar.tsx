"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Scale, LogOut, User, Shield, Globe, Menu, X, FileSearch } from "lucide-react";
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

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  const navLinks = [
    { href: "/#services", label: t("legalNav.services") },
    { href: "/#about", label: t("legalNav.about") },
    { href: "/blog", label: t("legalNav.blog") },
    { href: "/templates", label: t("legalNav.templates") },
    { href: "/analyzer", label: t("legalNav.analyzer") },
    { href: "/pricing", label: t("nav.pricing") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-gradient-to-br from-slate-800 to-slate-600 p-2 rounded-lg">
              <Scale className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Alten Consulting
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600">
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side: language, auth, mobile toggle */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1.5">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={lang === l.code ? "bg-blue-50 text-blue-700" : ""}
                  >
                    <span className="mr-2">{l.flag}</span>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Controls */}
            {status === "authenticated" && session ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/analyzer">
                  <Button variant="ghost" size="sm">
                    <FileSearch className="h-4 w-4 mr-1" />
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                {session?.user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      <Shield className="h-4 w-4 mr-1" />
                      {t("nav.admin")}
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="hidden xl:inline max-w-[120px] truncate">{session?.user?.email}</span>
                </div>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("nav.logout")}</span>
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button
                    size="sm"
                    className="bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    {t("nav.login")}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gray-100 pt-2 mt-2">
                {status === "authenticated" && session ? (
                  <>
                    <Link
                      href="/analyzer"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md flex items-center"
                    >
                      <FileSearch className="h-4 w-4 mr-2" />
                      {t("nav.dashboard")}
                    </Link>
                    {session?.user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2 text-purple-600 hover:bg-gray-50 rounded-md flex items-center"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {t("nav.admin")}
                      </Link>
                    )}
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {session?.user?.email}
                    </div>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50 rounded-md flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 text-white bg-slate-800 hover:bg-slate-700 rounded-md text-center block"
                  >
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
