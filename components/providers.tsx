"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
