"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Card } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog");
        const data = await res.json();
        if (Array.isArray(data)) setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const getTitle = (post: BlogPost) => {
    const map: Record<string, string | null> = {
      kk: post.titleKk,
      ru: post.titleRu,
      en: post.titleEn,
      zh: post.titleZh,
    };
    return map[lang] || post.titleRu || post.titleEn || "";
  };

  const getContent = (post: BlogPost) => {
    const map: Record<string, string | null> = {
      kk: post.contentKk,
      ru: post.contentRu,
      en: post.contentEn,
      zh: post.contentZh,
    };
    const content = map[lang] || post.contentRu || post.contentEn || "";
    return content.length > 200 ? content.slice(0, 200) + "..." : content;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("blog.title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("blog.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t("blog.comingSoon")}</p>
            <p className="text-gray-400 mt-2">{t("blog.stayTuned")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={getTitle(post)}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {getTitle(post)}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {getContent(post)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(post.createdAt).toLocaleDateString(
                          lang === "kk" ? "kk-KZ" : lang === "zh" ? "zh-CN" : lang === "ru" ? "ru-RU" : "en-US",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </span>
                    </div>
                    {post.author && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <LegalFooter />
    </div>
  );
}
