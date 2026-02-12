"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X, Zap, Star, Crown, Rocket, CreditCard, QrCode, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export default function PricingPage() {
  const { data: session, update } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const currentPlan = (session?.user as any)?.plan || "free";

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showKaspiModal, setShowKaspiModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kaspiSent, setKaspiSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setSuccessMessage(t("payment.success"));
      update?.();
      router.replace("/pricing");
    }
    if (searchParams.get("canceled") === "true") {
      setErrorMessage(t("payment.canceled"));
      router.replace("/pricing");
    }
  }, [searchParams]);

  const handleSelectPlan = (planName: string) => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    if (planName === "enterprise") {
      window.location.href = "mailto:bakhitzhankenzhebayev@gmail.com?subject=Enterprise Plan";
      return;
    }
    setSelectedPlan(planName);
    setShowPaymentModal(true);
  };

  const handleStripePayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.error || "Payment error");
        setShowPaymentModal(false);
      }
    } catch {
      setErrorMessage("Payment error");
      setShowPaymentModal(false);
    }
    setLoading(false);
  };

  const handleKaspiPayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payment/kaspi-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.subscriptionId) {
        setShowPaymentModal(false);
        setShowKaspiModal(true);
      } else {
        setErrorMessage(data.error || "Payment error");
        setShowPaymentModal(false);
      }
    } catch {
      setErrorMessage("Payment error");
      setShowPaymentModal(false);
    }
    setLoading(false);
  };

  const planPrice = selectedPlan === "basic" ? "2 990" : selectedPlan === "pro" ? "9 990" : "";

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
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">&times;</button>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center space-x-3">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-auto text-red-600 hover:text-red-800">&times;</button>
          </motion.div>
        )}

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
            const isFreePlan = plan.name === "free";
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
                    disabled={isCurrentPlan || isFreePlan}
                    onClick={() => handleSelectPlan(plan.name)}
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

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !loading && setShowPaymentModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("payment.chooseMethod")}</h3>
            <p className="text-gray-500 mb-6">
              {t("payment.planLabel")}: <span className="font-semibold">{selectedPlan === "basic" ? t("pricing.basic") : t("pricing.pro")}</span> — <span className="font-bold">{planPrice} &#8376;</span>
            </p>

            <div className="space-y-4">
              <button
                onClick={handleStripePayment}
                disabled={loading}
                className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{t("payment.card")}</p>
                  <p className="text-sm text-gray-500">Visa, Mastercard</p>
                </div>
              </button>

              <button
                onClick={handleKaspiPayment}
                disabled={loading}
                className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <div className="bg-red-100 p-3 rounded-lg">
                  <QrCode className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Kaspi QR</p>
                  <p className="text-sm text-gray-500">{t("payment.kaspiDesc")}</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={loading}
              className="mt-6 w-full text-center text-gray-500 hover:text-gray-700 text-sm"
            >
              {t("payment.cancel")}
            </button>
          </motion.div>
        </div>
      )}

      {/* Kaspi QR Modal */}
      {showKaspiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !loading && setShowKaspiModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Kaspi QR</h3>
            <p className="text-gray-600 mb-4">
              {t("payment.kaspiScanQR")} <span className="font-bold">{planPrice} &#8376;</span>
            </p>

            <div className="flex justify-center mb-4">
              <img
                src="/kaspi-qr.png"
                alt="Kaspi QR Code"
                className="w-64 h-64 object-contain rounded-lg border border-gray-200"
              />
            </div>

            <p className="text-sm text-gray-500 mb-2">{t("payment.kaspiRecipient")}: <span className="font-semibold">ИП FITMART</span></p>

            {!kaspiSent ? (
              <Button
                onClick={() => setKaspiSent(true)}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 mt-4"
              >
                {t("payment.kaspiPaid")}
              </Button>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mt-4">
                <CheckCircle2 className="h-5 w-5 inline mr-2" />
                {t("payment.kaspiWaiting")}
              </div>
            )}

            <button
              onClick={() => { setShowKaspiModal(false); setKaspiSent(false); }}
              className="mt-4 w-full text-center text-gray-500 hover:text-gray-700 text-sm"
            >
              {t("payment.close")}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
