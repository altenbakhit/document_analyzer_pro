"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Info } from "lucide-react";

const defaultPlans = [
  { name: "free", label: "Free", limit: 3, period: "total", price: 0 },
  { name: "basic", label: "Basic", limit: 5, period: "monthly", price: 2990 },
  { name: "pro", label: "Pro", limit: -1, period: "monthly", price: 9990 },
  { name: "enterprise", label: "Enterprise", limit: -1, period: "monthly", price: 0 },
  { name: "api", label: "API", limit: -1, period: "monthly", price: 0 },
];

const planColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700",
  api: "bg-green-100 text-green-700",
};

export default function SettingsPage() {
  const [plans, setPlans] = useState(defaultPlans);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a full implementation, this would save to database
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure plans and system settings</p>
      </div>

      {/* Plan Configuration */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Plan Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-500 px-2">
              <span>Plan</span>
              <span>Limit</span>
              <span>Period</span>
              <span>Price (₸)</span>
              <span></span>
            </div>
            {plans.map((plan, idx) => (
              <div key={plan.name} className="grid grid-cols-5 gap-4 items-center p-2 rounded-lg hover:bg-gray-50">
                <Badge className={planColors[plan.name]} variant="secondary">
                  {plan.label}
                </Badge>
                <Input
                  type="number"
                  value={plan.limit === -1 ? "" : plan.limit}
                  placeholder="Unlimited"
                  className="h-9"
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : -1;
                    const updated = [...plans];
                    updated[idx] = { ...plan, limit: val };
                    setPlans(updated);
                  }}
                />
                <span className="text-sm text-gray-600">{plan.period}</span>
                <Input
                  type="number"
                  value={plan.price || ""}
                  placeholder="0"
                  className="h-9"
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const updated = [...plans];
                    updated[idx] = { ...plan, price: val };
                    setPlans(updated);
                  }}
                />
                <span className="text-xs text-gray-400">
                  {plan.limit === -1 ? "Unlimited" : `${plan.limit} / ${plan.period}`}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center space-x-4">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">Settings saved!</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-600" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">LLM Provider</span>
            <span className="font-medium">Abacus.ai (gpt-4.1-mini)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Database</span>
            <span className="font-medium">PostgreSQL (Neon)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">File Storage</span>
            <span className="font-medium">AWS S3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Hosting</span>
            <span className="font-medium">Vercel</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Authentication</span>
            <span className="font-medium">NextAuth.js (JWT)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
