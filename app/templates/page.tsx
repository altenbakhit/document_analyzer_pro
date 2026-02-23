"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { motion } from "framer-motion";

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
  const [selected, setSelected] = useState<Template | null>(null);
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
              <Card
                key={tpl.id}
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-200"
                onClick={() => setSelected(tpl)}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{getTitle(tpl)}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{getDescription(tpl)}</p>
                    {tpl.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tpl.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium">
                  {tpl.contractHtml ? (
                    <><ChevronRight className="h-4 w-4" />Открыть конструктор</>
                  ) : tpl.fileUrl ? (
                    <><Download className="h-4 w-4" />{t("legalTemplates.download")}</>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <LegalFooter />

      {/* Template Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{getTitle(selected)}</h3>
                  {selected.category && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {selected.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {selected.summary && (
                <p className="text-sm text-gray-600 mb-4">{selected.summary}</p>
              )}
              {!selected.summary && getDescription(selected) && (
                <p className="text-sm text-gray-600 mb-4">{getDescription(selected)}</p>
              )}
              {selected.keyTerms && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Ключевые условия
                  </p>
                  <div className="space-y-1.5">
                    {selected.keyTerms.split(",").map((term, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        {term.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              {selected.contractHtml && (
                <Link href={`/templates/${selected.id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Открыть конструктор
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
              {selected.fileUrl && (
                <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" className={selected.contractHtml ? "" : "flex-1"}>
                  <Button variant="outline" className={selected.contractHtml ? "" : "w-full"}>
                    <Download className="h-4 w-4 mr-1" />
                    {t("legalTemplates.download")}
                  </Button>
                </a>
              )}
              <Button variant="outline" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
