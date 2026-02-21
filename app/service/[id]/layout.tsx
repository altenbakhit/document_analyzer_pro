import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Услуги — Юридическая помощь",
  description: "Юридические услуги Alten Consulting в Алматы. Гражданское, корпоративное, уголовное, семейное, трудовое и административное право.",
};

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
