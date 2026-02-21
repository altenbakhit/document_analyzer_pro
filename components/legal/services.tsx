"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Building2,
  FileText,
  Shield,
  Users,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const icons = [
  <Scale key={0} className="h-8 w-8" />,
  <Building2 key={1} className="h-8 w-8" />,
  <FileText key={2} className="h-8 w-8" />,
  <Shield key={3} className="h-8 w-8" />,
  <Users key={4} className="h-8 w-8" />,
  <Briefcase key={5} className="h-8 w-8" />,
];

export function LegalServices() {
  const { t, tRaw } = useLanguage();

  const servicesList: { title: string; description: string; features: string[] }[] =
    tRaw("services.list") || [];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("services.title")}{" "}
            <span className="text-blue-600">{t("services.titleAccent")}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, index) => {
            const popular = index === 0 || index === 3;
            return (
              <Card
                key={index}
                className="relative p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white group cursor-pointer"
              >
                {popular && (
                  <Badge className="absolute -top-2 right-4 bg-amber-500 text-white">
                    {t("services.popular")}
                  </Badge>
                )}

                <div className="flex items-start space-x-4 mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {icons[index]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2 mb-6">
                  {service.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-800">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/service/${index}`}
                  className="flex items-center text-blue-600 font-medium text-sm group-hover:text-amber-500 transition-colors cursor-pointer"
                >
                  {t("services.learnMore")}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            {t("services.contactUs")}
          </p>
        </div>
      </div>
    </section>
  );
}
