"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, LogOut, User, Shield, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Lang } from "@/lib/i18n/translations";

const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "kk", label: "Қазақша", flag: "🇰🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function Navbar() {
  const { data: session, status } = useSession() || {};
  const { lang, setLang, t } = useLanguage();

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Document Analyzer Pro
            </span>
          </Link>

          <div className="flex items-center space-x-3">
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

            {status === "authenticated" && session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
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
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{session?.user?.email}</span>
                </div>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("nav.logout")}</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm">
                    {t("nav.pricing")}
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                  >
                    {t("nav.login")}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
