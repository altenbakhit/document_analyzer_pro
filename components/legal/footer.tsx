"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function LegalFooter() {
  const { t, tRaw } = useLanguage();
  const servicesList: { title: string }[] = tRaw("services.list") || [];

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Alten Consulting</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">
              {t("footer.navigation")}
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/#services" className="hover:text-white transition-colors">
                  {t("footer.services")}
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white transition-colors">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  {t("footer.blog")}
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-white transition-colors">
                  {t("footer.templates")}
                </Link>
              </li>
              <li>
                <Link href="/analyzer" className="hover:text-white transition-colors">
                  {t("footer.analyzer")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">
              {t("footer.servicesTitle")}
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {servicesList.slice(0, 4).map((service, index) => (
                <li key={index}>
                  <Link href={`/service/${index}`} className="hover:text-white transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">
              {t("footer.contacts")}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-amber-400" />
                <a href="tel:+77075333733" className="hover:text-white transition-colors">
                  +7 707 533 37 33
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-amber-400" />
                <a href="mailto:ten_bakhit@mail.ru" className="hover:text-white transition-colors">
                  ten_bakhit@mail.ru
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-amber-400 mt-0.5" />
                <a
                  href="https://go.2gis.com/nsLNV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t("contact.addressLine1")}, {t("contact.addressLine2")}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-green-400" />
                <a
                  href="https://api.whatsapp.com/send?phone=77075333733"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Alten Consulting. {t("footer.rights")}</p>
          <a
            href="https://docs.google.com/document/d/e/2PACX-1vST-Re0uM-KbrfSjnzHpXDOQzGBFtvXjiiCuWlubA4WAd0sgab80tCXll_vinkC1V6e-3_3FHOH-mgk/pub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors mt-2 md:mt-0"
          >
            {t("footer.privacy")}
          </a>
        </div>
      </div>
    </footer>
  );
}
