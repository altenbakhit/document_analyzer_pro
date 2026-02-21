import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Тарифы — Стоимость юридических услуг",
  description: "Тарифы на юридические услуги Alten Consulting. Анализ документов, оценка резюме и договоров. Доступные цены для бизнеса и физических лиц.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
