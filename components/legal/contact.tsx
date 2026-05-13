"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { toast } from "sonner";

export function LegalContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { t } = useLanguage();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length <= 1) return `+${digits}`;
    if (digits.length <= 4) return `+${digits[0]} (${digits.slice(1)}`;
    if (digits.length <= 7) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setPhone(formatPhone(e.target.value));
  const isValidPhone = (v: string) => v.replace(/\D/g, "").length === 11;
  const isValidEmail = (v: string) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) { toast.error(t("contact.errorTitle")); return; }
    if (!isValidPhone(phone)) { toast.error(t("contact.phoneInvalidFormat")); return; }
    if (!isValidEmail(email)) { toast.error(t("contact.invalidEmail")); return; }
    if (!privacy) { toast.error(t("contact.privacyRequired")); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message, privacy_agreement: privacy }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("contact.successTitle"), { description: t("contact.successDescription") });
      setName(""); setPhone(""); setEmail(""); setMessage(""); setPrivacy(false);
    } catch {
      toast.error(t("contact.errorTitle"), { description: t("contact.errorDescription") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: Phone,
      title: t("contact.phone"),
      lines: ["+7 707 533 37 33 (K.Bakhytzhan)", "+7 701 527 6066 (K.Nurlan)"],
      href: "tel:+77075333733",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Mail,
      title: t("contact.emailLabel"),
      lines: ["ten_bakhit@mail.ru"],
      href: "mailto:ten_bakhit@mail.ru",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: MapPin,
      title: t("contact.address"),
      lines: [t("contact.addressLine1"), t("contact.addressLine2")],
      href: "https://go.2gis.com/nsLNV",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Clock,
      title: t("contact.hours"),
      lines: [t("contact.hoursWeekday"), t("contact.hoursSaturday")],
      href: null,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  const inputClass =
    "bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 focus:border-amber-400/50 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 rounded-xl text-sm transition-colors";

  return (
    <section id="contact" className="py-28 bg-[#07091A] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 w-[700px] h-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,_rgba(37,99,235,0.07)_0%,_transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400/80 text-xs font-semibold uppercase tracking-[0.12em]">
              {t("contact.title")}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-[-0.025em] mb-4">
            {t("contact.titleAccent")}
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-[15px]">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — contact info + quick CTA */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {contactItems.map((item, i) => {
              const Icon = item.icon;
              const inner = (
                <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${item.bg}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/35 uppercase tracking-wider font-semibold mb-1">{item.title}</p>
                    {item.lines.map((line, j) => (
                      <p key={j} className="text-[13.5px] text-white/70">{line}</p>
                    ))}
                  </div>
                </div>
              );
              return item.href ? (
                <a key={i} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}

            {/* Quick action buttons */}
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={() => window.open("tel:+77075333733")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]"
              >
                <Phone className="w-4 h-4" />
                {t("contact.callNow")}
              </button>
              <button
                onClick={() => window.open("https://api.whatsapp.com/send?phone=77075333733", "_blank", "noopener,noreferrer")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.07] text-white font-semibold text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                {t("contact.whatsapp")}
              </button>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3 p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6">{t("contact.formTitle")}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">
                    {t("contact.name")} *
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("contact.name")} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-[12px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">
                    {t("contact.phone")} *
                  </label>
                  <Input value={phone} onChange={handlePhoneChange} placeholder="+7 (___) ___-__-__" required className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">
                  {t("contact.emailLabel")}
                </label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" className={inputClass} />
              </div>

              <div>
                <label className="block text-[12px] text-white/40 uppercase tracking-wider font-semibold mb-1.5">
                  {t("contact.message")} *
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  rows={4}
                  required
                  className={`${inputClass} h-auto resize-none`}
                />
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="privacy"
                  checked={privacy}
                  onCheckedChange={(v) => setPrivacy(v as boolean)}
                  className="mt-0.5 border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <label htmlFor="privacy" className="text-[12.5px] text-white/40 cursor-pointer leading-relaxed">
                  {t("contact.privacyAgreement")}{" "}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                  >
                    {t("contact.privacyLink")}
                  </button>{" "}*
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(37,99,235,0.25)]"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? t("contact.submitting") : t("contact.submit")}
              </button>
            </form>

            <div className="mt-5 px-4 py-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
              <p className="text-[12px] text-amber-400/70">
                <strong className="text-amber-400">{t("contact.confidentiality")}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-[#0F1629] border border-white/[0.08] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{t("contact.privacyTitle")}</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-[13px] text-white/50 leading-relaxed whitespace-pre-line">{t("contact.privacyText")}</p>
            </div>
            <div className="p-4 border-t border-white/[0.07]">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-2.5 rounded-xl border border-white/[0.10] text-white/60 hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-all"
              >
                {t("contact.privacyClose")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
