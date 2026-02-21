"use client";

import { Navbar } from "@/components/navbar";
import { LegalFooter } from "@/components/legal/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Scale, Building2, FileText, Shield, Users, Briefcase } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const categoryIcons = [Scale, Building2, FileText, Shield, Users, Briefcase];

export default function PricelistPage() {
  const { t, tRaw } = useLanguage();
  const categories: { name: string; services: { name: string; price: string }[] }[] = tRaw("pricelist.categories") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("pricelist.title")}{" "}
            <span className="text-blue-600">{t("pricelist.titleAccent")}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("pricelist.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = categoryIcons[index] || Scale;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                  </div>

                  <div className="space-y-3">
                    {category.services.map((service, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-sm text-gray-700 pr-4">{service.name}</span>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {service.price} {t("pricelist.currency")}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-gray-800 mb-4">
              {t("pricelist.note")}
            </p>
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
              onClick={() => {
                window.location.href = "/#contact";
              }}
            >
              {t("pricelist.contactLink")}
            </Button>
          </div>
        </motion.div>
      </div>

      <LegalFooter />
    </div>
  );
}
