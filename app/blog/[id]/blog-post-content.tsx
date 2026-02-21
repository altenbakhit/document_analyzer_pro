"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface BlogPost {
  id: string;
  titleKk: string | null;
  titleRu: string | null;
  titleEn: string | null;
  titleZh: string | null;
  contentKk: string | null;
  contentRu: string | null;
  contentEn: string | null;
  contentZh: string | null;
  author: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  const { lang } = useLanguage();

  const title = ({
    kk: post.titleKk,
    ru: post.titleRu,
    en: post.titleEn,
    zh: post.titleZh,
  }[lang]) || post.titleRu || post.titleEn || "";

  const content = ({
    kk: post.contentKk,
    ru: post.contentRu,
    en: post.contentEn,
    zh: post.contentZh,
  }[lang]) || post.contentRu || post.contentEn || "";

  const locale = lang === "kk" ? "kk-KZ" : lang === "zh" ? "zh-CN" : lang === "ru" ? "ru-RU" : "en-US";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {lang === "ru" ? "Назад к блогу" : lang === "kk" ? "Блогқа оралу" : lang === "zh" ? "返回博客" : "Back to blog"}
          </Button>
        </Link>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8"
          />
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(post.createdAt).toLocaleDateString(locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {post.author && (
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
          )}
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
          {content}
        </div>
      </article>

      <LegalFooter />
    </div>
  );
}
