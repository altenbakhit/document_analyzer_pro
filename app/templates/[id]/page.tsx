"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Save, FileText } from "lucide-react";
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
}

// ── Render helpers ─────────────────────────────────────────────────
function renderContract(
  html: string,
  answers: Record<string, string>,
  conditionals: Record<string, Conditional>
): string {
  // 1. Replace {{COND:id}} with conditional text
  let result = html.replace(/\{\{COND:([^}]+)\}\}/g, (_match, condId) => {
    const cond = conditionals[condId];
    if (!cond) return "";
    const val = answers[cond.sectionId] ?? "";
    return cond.values[val] ?? "";
  });

  // 2. Replace {{FIELD:id:placeholder}} with contenteditable span
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
  const contractRef = useRef<HTMLDivElement>(null);
  const fieldStore = useRef<Record<string, string>>({});

  // Fetch template
  useEffect(() => {
    if (!id) return;
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then((data: Template) => {
        setTemplate(data);
        // Init answers from defaults
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

  // Re-render contract when answers change
  useEffect(() => {
    if (!contractRef.current || !template?.contractHtml) return;
    const conditionals = template.questionnaire?.conditionals ?? {};

    // Save typed values before re-render
    fieldStore.current = saveFieldValues(contractRef.current);

    // Render new HTML
    contractRef.current.innerHTML = renderContract(
      template.contractHtml,
      answers,
      conditionals
    );

    // Restore typed values
    restoreFieldValues(contractRef.current, fieldStore.current);
  }, [answers, template]);

  const handleAnswerChange = useCallback((sectionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [sectionId]: value }));
  }, []);

  const handleSave = () => {
    if (!contractRef.current) return;
    const title = template?.titleRu ?? "Договор";
    const bodyHtml = contractRef.current.innerHTML;
    const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <style>
    body { font-family: Times New Roman, serif; font-size: 12pt; margin: 2cm; }
    p { margin: 6pt 0; line-height: 1.5; }
    strong, b { font-weight: bold; }
    .contract-field { border-bottom: 1px solid #000; min-width: 60px; display: inline-block; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
    const blob = new Blob([wordHtml], { type: "application/msword;charset=utf-8" });
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
  const hasQuestionnaire = sections.length > 0;

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
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => router.push("/templates")}
          >
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="text-green-700 border-green-300 hover:bg-green-50"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Скачать .doc
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Печать
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel (questionnaire) ── */}
        {hasQuestionnaire && (
          <div className="constructor-left w-[280px] min-w-[280px] bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
            {sections.map((section) => (
              <div key={section.id} className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2.5">
                  {section.title}
                </h3>
                {section.options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-2.5 mb-2.5 cursor-pointer group"
                  >
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
          </div>
        )}

        {/* ── Right panel (contract preview) ── */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-100">
          <div className="max-w-[820px] mx-auto bg-white rounded-lg shadow border border-gray-200 px-10 py-10">
            {template.contractHtml ? (
              <div
                ref={contractRef}
                className="contract-body text-[13.5px] leading-relaxed text-gray-800"
              />
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
