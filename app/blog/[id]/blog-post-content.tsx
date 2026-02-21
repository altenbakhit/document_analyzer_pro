"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Heart, MessageCircle, ExternalLink, Bot, Send } from "lucide-react";
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
  sourceUrl: string | null;
  aiGenerated: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

function getSessionId() {
  let id = localStorage.getItem("blog_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("blog_session_id", id);
  }
  return id;
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  const { lang } = useLanguage();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetch(`/api/blog/${post.id}/likes`).then(r => r.json()).then(d => setLikes(d.count || 0));
    fetch(`/api/blog/${post.id}/comments`).then(r => r.json()).then(d => { if (Array.isArray(d)) setComments(d); });
  }, [post.id]);

  const handleLike = async () => {
    const sessionId = getSessionId();
    const res = await fetch(`/api/blog/${post.id}/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    setLikes(data.count);
    setLiked(data.liked);
  };

  const handleComment = async () => {
    if (!commentAuthor.trim() || !commentText.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/blog/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: commentAuthor, content: commentText }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments(prev => [comment, ...prev]);
      setCommentText("");
    }
    setSubmitting(false);
  };

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

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
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

        {/* AI badge + source link */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-gray-200">
          {post.aiGenerated && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Bot className="h-3 w-3" />
              {lang === "ru" ? "Подготовлено с помощью ИИ" : lang === "kk" ? "ЖИ көмегімен дайындалды" : lang === "zh" ? "AI辅助撰写" : "AI-assisted content"}
            </span>
          )}
          {post.sourceUrl && (
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {lang === "ru" ? "Источник" : lang === "kk" ? "Дереккөз" : lang === "zh" ? "来源" : "Source"}
            </a>
          )}
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
          {content}
        </div>

        {/* Likes */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
              liked
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{likes}</span>
          </button>
        </div>

        {/* Comments */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {lang === "ru" ? "Комментарии" : lang === "kk" ? "Пікірлер" : lang === "zh" ? "评论" : "Comments"}
            {comments.length > 0 && <span className="text-sm text-gray-400">({comments.length})</span>}
          </h3>

          {/* Comment form */}
          <div className="mb-8 space-y-3">
            <input
              type="text"
              placeholder={lang === "ru" ? "Ваше имя" : lang === "kk" ? "Атыңыз" : lang === "zh" ? "您的姓名" : "Your name"}
              value={commentAuthor}
              onChange={e => setCommentAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
            <div className="flex gap-2">
              <textarea
                placeholder={lang === "ru" ? "Написать комментарий..." : lang === "kk" ? "Пікір жазу..." : lang === "zh" ? "写评论..." : "Write a comment..."}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                maxLength={2000}
              />
              <Button
                onClick={handleComment}
                disabled={submitting || !commentAuthor.trim() || !commentText.trim()}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">{c.author}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <LegalFooter />
    </div>
  );
}
