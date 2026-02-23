"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Save, FileText, Lock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────
interface QuestionnaireOption {
  value: string;
  label: string;
  note?: string;
}

interface QuestionnaireSection {
  id: string;
  title: string;
  type: "radio";
  options: QuestionnaireOption[];
  default: string;
}

interface Conditional {
  sectionId: string;
  values: Record<string, string>;
}

interface Questionnaire {
  sections: QuestionnaireSection[];
  conditionals: Record<string, Conditional>;
}

interface Template {
  id: string;
  titleRu: string | null;
  titleKk: string | null;
  titleEn: string | null;
  category: string | null;
  summary: string | null;
  contractHtml: string | null;
  questionnaire: Questionnaire | null;
  price: string | null;
}

interface Rekv {
  company: string;
  bin: string;
  director: string;
  position: string;
  address: string;
  bank: string;
  bik: string;
  iik: string;
  kbe: string;
}

const emptyRekv: Rekv = {
  company: "", bin: "", director: "", position: "",
  address: "", bank: "", bik: "", iik: "", kbe: "",
};

// ── Render helpers ─────────────────────────────────────────────────
function renderContract(
  html: string,
  answers: Record<string, string>,
  conditionals: Record<string, Conditional>
): string {
  let result = html.replace(/\{\{COND:([^}]+)\}\}/g, (_match, condId) => {
    const cond = conditionals[condId];
    if (!cond) return "";
    const val = answers[cond.sectionId] ?? "";
    return cond.values[val] ?? "";
  });
  result = result.replace(
    /\{\{FIELD:([^:}]+):([^}]+)\}\}/g,
    (_match, id, ph) =>
      `<span class="contract-field" contenteditable="true" data-field="${id}" data-ph="${ph}" spellcheck="false"></span>`
  );
  return result;
}

function saveFieldValues(container: HTMLDivElement): Record<string, string> {
  const store: Record<string, string> = {};
  container.querySelectorAll<HTMLElement>(".contract-field[data-field]").forEach((el) => {
    const v = el.textContent?.trim();
    if (v) store[el.dataset.field!] = v;
  });
  return store;
}

function restoreFieldValues(container: HTMLDivElement, store: Record<string, string>) {
  container.querySelectorAll<HTMLElement>(".contract-field[data-field]").forEach((el) => {
    const saved = store[el.dataset.field!];
    if (saved) el.textContent = saved;
  });
}

// ── Main component ─────────────────────────────────────────────────
export default function ContractConstructorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [rekv, setRekv] = useState<Rekv>(emptyRekv);
  const [leftTab, setLeftTab] = useState<"questionnaire" | "rekv">("questionnaire");
  const contractRef = useRef<HTMLDivElement>(null);
  const fieldStore = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then((data: Template) => {
        setTemplate(data);
        if (data.questionnaire?.sections) {
          const defaults: Record<string, string> = {};
          data.questionnaire.sections.forEach((s) => {
            defaults[s.id] = s.default ?? s.options[0]?.value ?? "";
          });
          setAnswers(defaults);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!contractRef.current || !template?.contractHtml) return;
    const conditionals = template.questionnaire?.conditionals ?? {};
    fieldStore.current = saveFieldValues(contractRef.current);
    contractRef.current.innerHTML = renderContract(template.contractHtml, answers, conditionals);
    restoreFieldValues(contractRef.current, fieldStore.current);
  }, [answers, template]);

  const handleAnswerChange = useCallback((sectionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [sectionId]: value }));
  }, []);

  // Apply реквизиты to matching contract fields
  const applyRekvisity = () => {
    if (!contractRef.current) return;
    const fields = contractRef.current.querySelectorAll<HTMLElement>(".contract-field[data-ph]");
    fields.forEach((el) => {
      if (el.textContent?.trim()) return; // don't overwrite filled fields
      const ph = (el.dataset.ph ?? "").toLowerCase();
      let value = "";
      if (/организа|наимено|тоо|ао |ооо|поставщик|покупател|арендод|арендат|заказчик|исполнит|займодав|заёмщик|хранитель|перевозчик|подрядч/.test(ph)) value = rekv.company;
      else if (/\bбин\b|bin/.test(ph)) value = rekv.bin;
      else if (/директор|руковод|ф\.и\.о|фио/.test(ph)) value = rekv.director;
      else if (/должност/.test(ph)) value = rekv.position;
      else if (/основани|устав|доверен/.test(ph)) value = rekv.basis;
      else if (/адрес/.test(ph)) value = rekv.address;
      else if (/банк/.test(ph)) value = rekv.bank;
      else if (/бик|bik/.test(ph)) value = rekv.bik;
      else if (/иик|расчетный|счет/.test(ph)) value = rekv.iik;
      else if (/кбе/.test(ph)) value = rekv.kbe;
      if (value) el.textContent = value;
    });
  };

  // Download as Word .doc
  const handleSave = () => {
    if (!contractRef.current) return;
    const title = template?.titleRu ?? "Договор";
    const bodyHtml = contractRef.current.innerHTML;
    const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${title}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument>
  <w:View>Normal</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml><![endif]-->
<style>
  @page {
    size: 210mm 297mm;
    margin: 20mm 15mm 20mm 30mm;
    mso-page-orientation: portrait;
  }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 14pt;
    line-height: 1.5;
    color: #000000;
    mso-default-header-footer: 1;
  }
  p {
    margin: 0 0 6pt 0;
    text-align: justify;
    text-indent: 1.25cm;
    font-size: 14pt;
    mso-line-height-rule: exactly;
    line-height: 150%;
  }
  p.no-indent { text-indent: 0; }
  p.center { text-align: center; text-indent: 0; }
  strong, b { font-weight: bold; }
  .section-title, h1, h2, h3 {
    font-family: "Times New Roman", Times, serif;
    font-size: 14pt;
    font-weight: bold;
    text-align: left;
    text-indent: 0;
    margin: 12pt 0 6pt 0;
  }
  .contract-title {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    text-indent: 0;
    margin-bottom: 12pt;
  }
  .contract-field {
    border-bottom: 1pt solid #000000;
    display: inline;
    min-width: 40pt;
    font-style: italic;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 6pt;
  }
  td, th {
    border: 1pt solid #000000;
    padding: 4pt 6pt;
    vertical-align: top;
    font-size: 12pt;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
    const blob = new Blob(["\uFEFF" + wordHtml], { type: "application/msword;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <FileText className="h-12 w-12 mb-4 text-gray-300" />
        <p>Шаблон не найден</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/templates")}>
          ← Назад к шаблонам
        </Button>
      </div>
    );
  }

  const sections = template.questionnaire?.sections ?? [];
  const hasPrice = !!template.price;

  const rekvFields: { label: string; key: keyof Rekv; placeholder: string }[] = [
    { label: "Наименование организации", key: "company", placeholder: "ТОО «Название»" },
    { label: "БИН", key: "bin", placeholder: "000000000000" },
    { label: "Руководитель (ФИО)", key: "director", placeholder: "Иванов Иван Иванович" },
    { label: "Должность", key: "position", placeholder: "Директор" },
    { label: "Юридический адрес", key: "address", placeholder: "г. Алматы, ул. ..." },
    { label: "Банк", key: "bank", placeholder: "АО «Халык Банк»" },
    { label: "БИК", key: "bik", placeholder: "HSBKKZKX" },
    { label: "ИИК", key: "iik", placeholder: "KZ..." },
    { label: "КБЕ", key: "kbe", placeholder: "17" },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* ── Toolbar ── */}
      <div className="constructor-toolbar bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0 z-10 shadow-sm">
        <button
          onClick={() => router.push("/templates")}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>

        <div className="text-gray-300 text-sm">|</div>

        <nav className="text-sm text-gray-500 flex items-center gap-1">
          <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => router.push("/templates")}>
            Шаблоны
          </span>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[240px]">
            {template.titleRu ?? "Договор"}
          </span>
          {template.category && (
            <>
              <span className="mx-2 text-gray-300">·</span>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                {template.category}
              </span>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!hasPrice && (
          <Button variant="outline" size="sm" onClick={handleSave} className="text-green-700 border-green-300 hover:bg-green-50">
            <Save className="h-4 w-4 mr-1.5" />
            Скачать .doc
          </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Печать
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel ── */}
        <div className="constructor-left w-[280px] min-w-[280px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Tab bar */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            {sections.length > 0 && (
              <button
                onClick={() => setLeftTab("questionnaire")}
                className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  leftTab === "questionnaire"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/40"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Опросный лист
              </button>
            )}
            <button
              onClick={() => setLeftTab("rekv")}
              className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                leftTab === "rekv"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/40"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Реквизиты
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {leftTab === "questionnaire" && (
              <>
                {sections.map((section) => (
                  <div key={section.id} className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2.5">
                      {section.title}
                    </h3>
                    {section.options.map((opt) => (
                      <label key={opt.value} className="flex items-start gap-2.5 mb-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name={section.id}
                          value={opt.value}
                          checked={answers[section.id] === opt.value}
                          onChange={() => handleAnswerChange(section.id, opt.value)}
                          className="mt-0.5 accent-blue-600 flex-shrink-0"
                        />
                        <span>
                          <span className="block text-sm text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                            {opt.label}
                          </span>
                          {opt.note && (
                            <span className="block text-[10.5px] text-blue-500 mt-0.5 leading-tight">
                              {opt.note}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
                {sections.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-gray-400">
                    Опросный лист не настроен для этого шаблона
                  </div>
                )}
              </>
            )}

            {leftTab === "rekv" && (
              <div className="px-3 py-3 space-y-2.5">
                {rekvFields.map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={rekv[key]}
                      onChange={(e) => setRekv((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400 bg-gray-50"
                    />
                  </div>
                ))}
                <button
                  onClick={applyRekvisity}
                  className="w-full mt-2 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Вставить реквизиты в договор
                </button>
                <p className="text-[10px] text-gray-400 text-center">
                  Заполняет пустые поля с подходящими подсказками
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel (contract preview) ── */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-100">
          <div className="max-w-[820px] mx-auto bg-white rounded-lg shadow border border-gray-200 px-10 py-10 relative">
            {template.contractHtml ? (
              <>
                <div
                  ref={contractRef}
                  className="contract-body text-[13.5px] leading-relaxed text-gray-800"
                />

                {/* ── Blur/paywall overlay ── */}
                {hasPrice && (
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-lg overflow-hidden" style={{ height: "52%" }}>
                    {/* gradient fade */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.97) 100%)",
                        backdropFilter: "blur(3px)",
                      }}
                    />
                    {/* lock card */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 px-8 py-6 flex flex-col items-center gap-3 max-w-xs w-full">
                        <div className="p-3 bg-blue-50 rounded-full">
                          <Lock className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 text-center">
                          Полный доступ к договору
                        </p>
                        <p className="text-2xl font-bold text-blue-600">{template.price}</p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Получить полный доступ
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                        <p className="text-[10px] text-gray-400 text-center">
                          Скачивание .doc и заполнение всех полей
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Текст договора не загружен</p>
                <p className="text-sm mt-1">Добавьте HTML договора в панели администратора</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
