import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Прайс-лист юридических услуг | Alten Consulting",
  description: "Стоимость юридических услуг в Алматы: гражданское, корпоративное, административное, уголовное, семейное и трудовое право. Консультации от 15 000 тенге.",
};

export default function PricelistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
