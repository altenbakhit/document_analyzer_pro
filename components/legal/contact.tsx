"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { toast } from "sonner";

export function LegalContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error(t("contact.errorTitle"));
      return;
    }
    if (!privacy) {
      toast.error(t("contact.privacyRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message, privacy_agreement: privacy }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(t("contact.successTitle"), {
        description: t("contact.successDescription"),
      });
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setPrivacy(false);
    } catch {
      toast.error(t("contact.errorTitle"), {
        description: t("contact.errorDescription"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5" />,
      title: t("contact.phone"),
      details: ["+7 707 533 37 33 (K.Bakhytzhan)", "+7 701 527 6066 (K.Nurlan)"],
      isAddress: false,
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: t("contact.emailLabel"),
      details: ["ten_bakhit@mail.ru"],
      isAddress: false,
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: t("contact.address"),
      details: [t("contact.addressLine1"), t("contact.addressLine2")],
      isAddress: true,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: t("contact.hours"),
      details: [t("contact.hoursWeekday"), t("contact.hoursSaturday")],
      isAddress: false,
    },
  ];

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("contact.title")}{" "}
            <span className="text-blue-600">{t("contact.titleAccent")}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((item, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    {item.details.map((detail, idx) =>
                      item.isAddress ? (
                        <a
                          key={idx}
                          href="https://go.2gis.com/nsLNV"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 text-sm hover:text-blue-600 transition-colors block"
                        >
                          {detail}
                        </a>
                      ) : (
                        <p key={idx} className="text-gray-600 text-sm">
                          {detail}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Quick Contact */}
            <div className="space-y-4">
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
                size="lg"
                onClick={() => {
                  window.open("tel:+77075333733");
                }}
              >
                <Phone className="mr-2 h-5 w-5" />
                {t("contact.callNow")}
              </Button>

              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                size="lg"
                onClick={() => {
                  window.open("https://api.whatsapp.com/send?phone=77075333733", "_blank", "noopener,noreferrer");
                }}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {t("contact.whatsapp")}
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              {t("contact.formTitle")}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t("contact.name")} *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("contact.name")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t("contact.phone")} *
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t("contact.emailLabel")}
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t("contact.message")} *
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  rows={5}
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={privacy}
                  onCheckedChange={(checked) => setPrivacy(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600 cursor-pointer">
                  {t("contact.privacyAgreement")}{" "}
                  <a
                    href="https://docs.google.com/document/d/e/2PACX-1vST-Re0uM-KbrfSjnzHpXDOQzGBFtvXjiiCuWlubA4WAd0sgab80tCXll_vinkC1V6e-3_3FHOH-mgk/pub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {t("contact.privacyLink")}
                  </a>{" "}
                  *
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? t("contact.submitting") : t("contact.submit")}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-800">
                <strong>{t("contact.confidentiality")}</strong>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
