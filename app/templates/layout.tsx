import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Шаблоны документов — Договоры и юридические формы",
  description: "Скачайте готовые шаблоны юридических документов: договоры, заявления, доверенности. Бесплатные шаблоны от юристов Alten Consulting.",
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
