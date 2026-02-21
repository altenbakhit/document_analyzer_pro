import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Блог — Юридические статьи и новости",
  description: "Полезные статьи о юридических вопросах в Казахстане. Гражданское, корпоративное, трудовое право — советы от опытных юристов Alten Consulting.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
