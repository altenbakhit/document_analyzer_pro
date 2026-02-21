"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const statIcons = [
  <TrendingUp key={0} className="h-5 w-5" />,
  <Award key={1} className="h-5 w-5" />,
  <Star key={2} className="h-5 w-5" />,
  <Users key={3} className="h-5 w-5" />,
];

export function LegalAbout() {
  const { t, tRaw } = useLanguage();

  const stats: { value: string; label: string }[] = tRaw("about.stats") || [];
  const achievements: string[] = tRaw("about.achievements") || [];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="mb-8">
              <Badge className="mb-4 bg-blue-50 text-blue-600 hover:bg-blue-100">
                {t("about.badge")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t("about.title")}{" "}
                <span className="text-blue-600">{t("about.titleAccent")}</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t("about.description")}
              </p>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{achievement}</span>
                </div>
              ))}
            </div>

            {/* Education */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-amber-50 border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("about.educationTitle")}
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {t("about.educationText")}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="p-6 text-center bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-full">
                      {statIcons[index]}
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>

            {/* Professional Approach */}
            <Card className="mt-8 p-6 bg-slate-800 text-white">
              <h3 className="font-semibold mb-4 text-xl">
                {t("about.approachTitle")}
              </h3>
              <p className="leading-relaxed text-white/90">
                {t("about.approachText")}
              </p>
              <div className="mt-4 text-amber-400 font-medium">
                {t("about.approachAuthor")}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
