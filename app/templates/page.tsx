"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ChevronRight, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface Template {
  id: string;
  titleKk: string | null;
  titleRu: string | null;
  titleEn: string | null;
  titleZh: string | null;
  descriptionKk: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;
  descriptionZh: string | null;
  fileUrl: string | null;
  category: string | null;
  summary: string | null;
  keyTerms: string | null;
  contractHtml: string | null;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        if (Array.isArray(data)) setTemplates(data);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      }
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  const getTitle = (tpl: Template) => {
    const map: Record<string, string | null> = { kk: tpl.titleKk, ru: tpl.titleRu, en: tpl.titleEn, zh: tpl.titleZh };
    return map[lang] || tpl.titleRu || tpl.titleEn || "";
  };

  const getDescription = (tpl: Template) => {
    const map: Record<string, string | null> = { kk: tpl.descriptionKk, ru: tpl.descriptionRu, en: tpl.descriptionEn, zh: tpl.descriptionZh };
    return map[lang] || tpl.descriptionRu || tpl.descriptionEn || "";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("legalTemplates.title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("legalTemplates.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t("legalTemplates.comingSoon")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="relative"
                onMouseEnter={() => setHoveredId(tpl.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-default">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{getTitle(tpl)}</h3>
                      <p className="text-gray-600 text-sm mb-4">{getDescription(tpl)}</p>
                      {tpl.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tpl.category}
                        </span>
                      )}
                    </div>
                  </div>
                  {tpl.fileUrl && (
                    <div className="mt-4">
                      <a href={tpl.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          {t("legalTemplates.download")}
                        </Button>
                      </a>
                    </div>
                  )}
                </Card>

                {/* Hover overlay */}
                {hoveredId === tpl.id && (
                  <div className="absolute inset-0 z-10 rounded-xl overflow-hidden shadow-2xl border border-blue-100">
                    <div className="h-full bg-white flex flex-col">
                      {/* Header */}
                      <div className="bg-blue-600 px-4 py-3 flex items-center gap-2">
                        <Info className="h-4 w-4 text-white flex-shrink-0" />
                        <span className="text-white font-semibold text-sm truncate">{getTitle(tpl)}</span>
                        {tpl.category && (
                          <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                            {tpl.category}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex-1 px-4 py-3 overflow-auto">
                        {tpl.summary && (
                          <p className="text-sm text-gray-600 mb-3">{tpl.summary}</p>
                        )}
                        {tpl.keyTerms && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ключевые условия</p>
                            {tpl.keyTerms.split(",").map((term, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                {term.trim()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                        {tpl.contractHtml && (
                          <Link href={`/templates/${tpl.id}`} className="flex-1">
                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                              Открыть конструктор
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                        {tpl.fileUrl && (
                          <a href={tpl.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <LegalFooter />
    </div>
  );
}
