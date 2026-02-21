"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Building2,
  FileText,
  Shield,
  Users,
  Briefcase,
  ArrowLeft,
  CheckCircle,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const icons = [Scale, Building2, FileText, Shield, Users, Briefcase];

export default function ServiceDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const { t, tRaw } = useLanguage();

  const servicesList: { title: string; description: string; features: string[] }[] =
    tRaw("services.list") || [];
  const detailsList: { articles: { title: string; content: string; keyPoints: string[] }[]; documents: { name: string; description: string }[] }[] =
    tRaw("services.details") || [];

  if (isNaN(id) || id < 0 || id >= servicesList.length) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("services.notFoundTitle")}</h1>
          <Link href="/#services">
            <Button>{t("services.backToServices")}</Button>
          </Link>
        </div>
        <LegalFooter />
      </div>
    );
  }

  const service = servicesList[id];
  const details = detailsList[id];
  const Icon = icons[id];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Back link */}
        <Link
          href="/#services"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("services.backToServices")}
        </Link>

        {/* Header */}
        <div className="flex items-start space-x-4 mb-12">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Icon className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {service.title}
            </h1>
            <p className="text-lg text-gray-600">{service.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {service.features.map((feature, idx) => (
            <Card key={idx} className="p-4 text-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-800">{feature}</span>
            </Card>
          ))}
        </div>

        {details && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles */}
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("services.articlesTitle")}
              </h2>
              {details.articles?.map((article, idx) => (
                <Card key={idx} className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {article.content}
                  </p>
                  {article.keyPoints && (
                    <div className="grid grid-cols-2 gap-2">
                      {article.keyPoints.map((point, pidx) => (
                        <div key={pidx} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-gray-700">{point}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Documents */}
              {details.documents && details.documents.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("services.documentsTitle")}
                  </h3>
                  <div className="space-y-3">
                    {details.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{doc.name}</div>
                          <div className="text-xs text-gray-500">{doc.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* CTA */}
              <Card className="p-6 bg-slate-800 text-white">
                <h3 className="font-semibold mb-2">{t("services.needHelp")}</h3>
                <p className="text-sm text-gray-300 mb-4">
                  {t("services.contactUs")}
                </p>
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => {
                    window.open("https://api.whatsapp.com/send?phone=77075333733", "_blank", "noopener,noreferrer");
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {t("services.getConsultation")}
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      <LegalFooter />
    </div>
  );
}
