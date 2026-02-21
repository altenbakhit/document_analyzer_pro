import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "Alten Consulting — Юридические услуги в Алматы",
    template: "%s | Alten Consulting",
  },
  description: "Alten Consulting — опытные юристы в Алматы. Гражданское, корпоративное, уголовное, семейное и трудовое право. 500+ успешных дел, 15+ лет опыта. Бесплатная консультация.",
  keywords: ["юрист Алматы", "адвокат Казахстан", "юридические услуги", "гражданское право", "корпоративное право", "Alten Consulting", "заңгер Алматы"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    siteName: "Alten Consulting",
    title: "Alten Consulting — Юридические услуги в Алматы",
    description: "Опытные юристы в Алматы. Полный спектр юридических услуг для физических лиц и бизнеса. 500+ успешных дел.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
