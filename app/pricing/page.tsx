"use client";

import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X, Zap, Star, Crown, Rocket } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PricingPage() {
  const { data: session } = useSession() || {};
  const { t } = useLanguage();
  const currentPlan = (session?.user as any)?.plan || "free";

  const plans = [
    {
      nameKey: "pricing.free",
      descKey: "pricing.freeDesc",
      name: "free",
      price: "0",
      currency: "\u20B8",
      period: "",
      icon: Zap,
      color: "from-gray-400 to-gray-500",
      features: [
        { textKey: "pricing.analysesTotal", prefix: "3 ", included: true },
        { textKey: "pricing.resumeAnalysis", included: true },
        { textKey: "pricing.contractAnalysis", included: true },
        { textKey: "pricing.pdfExport", included: true },
        { textKey: "pricing.monthlyReset", included: false },
        { textKey: "pricing.priority", included: false },
        { textKey: "pricing.apiAccess", included: false },
      ],
      buttonTextKey: "pricing.currentPlan",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      nameKey: "pricing.basic",
      descKey: "pricing.basicDesc",
      name: "basic",
      price: "2,990",
      currency: "\u20B8",
      period: "pricing.month",
      icon: Star,
      color: "from-blue-500 to-blue-600",
      features: [
        { textKey: "pricing.analysesMonth", prefix: "5 ", included: true },
        { textKey: "pricing.resumeAnalysis", included: true },
        { textKey: "pricing.contractAnalysis", included: true },
        { textKey: "pricing.pdfExport", included: true },
        { textKey: "pricing.monthlyReset", included: true },
        { textKey: "pricing.priority", included: false },
        { textKey: "pricing.apiAccess", included: false },
      ],
      buttonTextKey: "pricing.getBasic",
      buttonVariant: "default" as const,
      popular: false,
    },
    {
      nameKey: "pricing.pro",
      descKey: "pricing.proDesc",
      name: "pro",
      price: "9,990",
      currency: "\u20B8",
      period: "pricing.month",
      icon: Crown,
      color: "from-purple-500 to-purple-600",
      features: [
        { textKey: "pricing.unlimited", included: true },
        { textKey: "pricing.resumeAnalysis", included: true },
        { textKey: "pricing.contractAnalysis", included: true },
        { textKey: "pricing.pdfExport", included: true },
        { textKey: "pricing.monthlyReset", included: true },
        { textKey: "pricing.priority", included: true },
        { textKey: "pricing.apiAccess", included: false },
      ],
      buttonTextKey: "pricing.getPro",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      nameKey: "pricing.enterprise",
      descKey: "pricing.enterpriseDesc",
      name: "enterprise",
      price: "Custom",
      currency: "",
      period: "",
      icon: Rocket,
      color: "from-amber-500 to-orange-500",
      features: [
        { textKey: "pricing.unlimited", included: true },
        { textKey: "pricing.resumeAnalysis", included: true },
        { textKey: "pricing.contractAnalysis", included: true },
        { textKey: "pricing.pdfExport", included: true },
        { textKey: "pricing.monthlyReset", included: true },
        { textKey: "pricing.priority", included: true },
        { textKey: "pricing.apiAccess", included: true },
      ],
      buttonTextKey: "pricing.contactUs",
      buttonVariant: "outline" as const,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("pricing.title")}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              {t("pricing.titleHighlight")}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlan === plan.name;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  plan.popular ? "ring-2 ring-purple-500 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center text-sm font-medium py-1">
                    {t("pricing.popular")}
                  </div>
                )}

                <div className={`p-6 ${plan.popular ? "pt-10" : ""}`}>
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">{t(plan.nameKey)}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t(plan.descKey)}</p>

                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.currency}{plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500">{t(plan.period)}</span>
                    )}
                  </div>

                  <Button
                    className={`w-full ${
                      isCurrentPlan
                        ? "bg-gray-100 text-gray-500 cursor-default hover:bg-gray-100"
                        : plan.popular
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                        : plan.buttonVariant === "outline"
                        ? ""
                        : "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                    }`}
                    variant={isCurrentPlan ? "secondary" : plan.buttonVariant}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? t("pricing.currentPlan") : t(plan.buttonTextKey)}
                  </Button>

                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.textKey} className="flex items-center space-x-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                          {feature.prefix || ""}{t(feature.textKey)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500">
            {t("pricing.questions")}{" "}
            <a href="mailto:bakhitzhankenzhebayev@gmail.com" className="text-blue-600 hover:underline">
              bakhitzhankenzhebayev@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
