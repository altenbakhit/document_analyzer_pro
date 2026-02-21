"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
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
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
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
    const map: Record<string, string | null> = {
      kk: tpl.titleKk,
      ru: tpl.titleRu,
      en: tpl.titleEn,
      zh: tpl.titleZh,
    };
    return map[lang] || tpl.titleRu || tpl.titleEn || "";
  };

  const getDescription = (tpl: Template) => {
    const map: Record<string, string | null> = {
      kk: tpl.descriptionKk,
      ru: tpl.descriptionRu,
      en: tpl.descriptionEn,
      zh: tpl.descriptionZh,
    };
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
              <Card key={tpl.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {getTitle(tpl)}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {getDescription(tpl)}
                    </p>
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
            ))}
          </div>
        )}
      </div>

      <LegalFooter />
    </div>
  );
}
