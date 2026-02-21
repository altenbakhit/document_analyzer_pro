"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Card } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  id: string;
  title_kk: string | null;
  title_ru: string | null;
  title_en: string | null;
  title_zh: string | null;
  content_kk: string | null;
  content_ru: string | null;
  content_en: string | null;
  content_zh: string | null;
  author: string | null;
  image_url: string | null;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setPosts(data);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const getTitle = (post: BlogPost) => {
    const map: Record<string, string | null> = {
      kk: post.title_kk,
      ru: post.title_ru,
      en: post.title_en,
      zh: post.title_zh,
    };
    return map[lang] || post.title_ru || post.title_en || "";
  };

  const getContent = (post: BlogPost) => {
    const map: Record<string, string | null> = {
      kk: post.content_kk,
      ru: post.content_ru,
      en: post.content_en,
      zh: post.content_zh,
    };
    const content = map[lang] || post.content_ru || post.content_en || "";
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
                {post.image_url && (
                  <img
                    src={post.image_url}
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
                        {new Date(post.created_at).toLocaleDateString(
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
