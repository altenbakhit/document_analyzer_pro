"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, CreditCard, XCircle } from "lucide-react";

interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  paymentMethod: string;
  amount: number | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function AdminPaymentsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      setSubscriptions(data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleConfirm = async (subscriptionId: string) => {
    setConfirming(subscriptionId);
    try {
      const res = await fetch("/api/payment/kaspi-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      if (res.ok) {
        fetchSubscriptions();
      }
    } catch (err) {
      console.error("Failed to confirm:", err);
    }
    setConfirming(null);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            <span>Active</span>
          </span>
        );
      case "pending_kaspi":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3" />
            <span>Pending Kaspi</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <span>{status}</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const pendingKaspi = subscriptions.filter((s) => s.status === "pending_kaspi");
  const otherSubs = subscriptions.filter((s) => s.status !== "pending_kaspi");

  return (
    <div>
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-xl">
          <CreditCard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm">Manage subscriptions and Kaspi payments</p>
        </div>
      </div>

      {/* Pending Kaspi Payments */}
      {pendingKaspi.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span>Pending Kaspi Payments ({pendingKaspi.length})</span>
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-yellow-800 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-yellow-800 uppercase">Plan</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-yellow-800 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-yellow-800 uppercase">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-yellow-800 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-100">
                {pendingKaspi.map((sub) => (
                  <tr key={sub.id} className="hover:bg-yellow-50/50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{sub.user.name || "—"}</div>
                      <div className="text-xs text-gray-500">{sub.user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-sm">{sub.plan}</span>
                    </td>
                    <td className="py-3 px-4 text-sm">{sub.amount ? `${sub.amount.toLocaleString()} ₸` : "—"}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(sub.id)}
                        disabled={confirming === sub.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {confirming === sub.id ? "..." : "Confirm"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Payments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Payments</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {subscriptions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No payments yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{sub.user.name || "—"}</div>
                      <div className="text-xs text-gray-500">{sub.user.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">{sub.plan}</td>
                    <td className="py-3 px-4 text-sm capitalize">{sub.paymentMethod || "—"}</td>
                    <td className="py-3 px-4 text-sm">{sub.amount ? `${sub.amount.toLocaleString()} ₸` : "—"}</td>
                    <td className="py-3 px-4">{statusBadge(sub.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
