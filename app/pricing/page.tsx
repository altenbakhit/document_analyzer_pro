"use client";

import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X, Zap, Star, Crown, Rocket } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    currency: "₸",
    period: "",
    description: "Try out Document Analyzer",
    icon: Zap,
    color: "from-gray-400 to-gray-500",
    features: [
      { text: "3 analyses total", included: true },
      { text: "Resume analysis", included: true },
      { text: "Contract analysis", included: true },
      { text: "PDF report export", included: true },
      { text: "Monthly reset", included: false },
      { text: "Priority processing", included: false },
      { text: "API access", included: false },
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Basic",
    price: "2,990",
    currency: "₸",
    period: "/month",
    description: "For regular document analysis",
    icon: Star,
    color: "from-blue-500 to-blue-600",
    features: [
      { text: "5 analyses per month", included: true },
      { text: "Resume analysis", included: true },
      { text: "Contract analysis", included: true },
      { text: "PDF report export", included: true },
      { text: "Monthly reset", included: true },
      { text: "Priority processing", included: false },
      { text: "API access", included: false },
    ],
    buttonText: "Get Basic",
    buttonVariant: "default" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "9,990",
    currency: "₸",
    period: "/month",
    description: "Unlimited analysis power",
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    features: [
      { text: "Unlimited analyses", included: true },
      { text: "Resume analysis", included: true },
      { text: "Contract analysis", included: true },
      { text: "PDF report export", included: true },
      { text: "Monthly reset", included: true },
      { text: "Priority processing", included: true },
      { text: "API access", included: false },
    ],
    buttonText: "Get Pro",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    currency: "",
    period: "",
    description: "For teams and organizations",
    icon: Rocket,
    color: "from-amber-500 to-orange-500",
    features: [
      { text: "Unlimited analyses", included: true },
      { text: "Resume analysis", included: true },
      { text: "Contract analysis", included: true },
      { text: "PDF report export", included: true },
      { text: "Monthly reset", included: true },
      { text: "Priority processing", included: true },
      { text: "API access", included: true },
    ],
    buttonText: "Contact Us",
    buttonVariant: "outline" as const,
    popular: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession() || {};
  const currentPlan = (session?.user as any)?.plan || "free";

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
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start for free, upgrade as you grow. All plans include AI-powered document analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlan === plan.name.toLowerCase();
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
                    Most Popular
                  </div>
                )}

                <div className={`p-6 ${plan.popular ? "pt-10" : ""}`}>
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.currency}{plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500">{plan.period}</span>
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
                    {isCurrentPlan ? "Current Plan" : plan.buttonText}
                  </Button>

                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.text} className="flex items-center space-x-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ or info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500">
            Questions? Contact us at{" "}
            <a href="mailto:bakhitzhankenzhebayev@gmail.com" className="text-blue-600 hover:underline">
              bakhitzhankenzhebayev@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
