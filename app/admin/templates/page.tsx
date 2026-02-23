"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, X, Save, FileText, Eye, Upload, ChevronDown, ChevronUp } from "lucide-react";
import mammoth from "mammoth";

// ── Types ───────────────────────────────────────────────────────────
interface Template {
  id: string;
  titleKk: string | null; titleRu: string | null; titleEn: string | null; titleZh: string | null;
  descriptionKk: string | null; descriptionRu: string | null; descriptionEn: string | null; descriptionZh: string | null;
  fileUrl: string | null; category: string | null;
  summary: string | null; keyTerms: string | null;
  contractHtml: string | null;
  questionnaire: unknown;
  price: string | null;
  createdAt: string;
}

interface BOption { value: string; label: string; note: string; }
interface BSection { id: string; title: string; defaultVal: string; options: BOption[]; }
interface BCond { condId: string; sectionId: string; values: Record<string, string>; }

const emptyTemplate = {
  titleKk: "", titleRu: "", titleEn: "", titleZh: "",
  descriptionKk: "", descriptionRu: "", descriptionEn: "", descriptionZh: "",
  fileUrl: "", category: "", summary: "", keyTerms: "",
  contractHtml: "", questionnaire: "", price: "",
};

// ── Questionnaire builder helpers ────────────────────────────────────
function detectCondIds(html: string): string[] {
  const matches = [...html.matchAll(/\{\{COND:([^}]+)\}\}/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

function builderToJson(sections: BSection[], conds: BCond[]): string {
  if (sections.length === 0 && conds.length === 0) return "";
  const q = {
    sections: sections.map((s) => ({
      id: s.id,
      title: s.title,
      type: "radio",
      default: s.defaultVal || s.options[0]?.value || "",
      options: s.options.map((o) => ({
        value: o.value,
        label: o.label,
        ...(o.note ? { note: o.note } : {}),
      })),
    })),
    conditionals: Object.fromEntries(
      conds.map((c) => [c.condId, { sectionId: c.sectionId, values: c.values }])
    ),
  };
  return JSON.stringify(q, null, 2);
}

function jsonToBuilder(json: string): { sections: BSection[]; conds: BCond[] } {
  try {
    const q = JSON.parse(json);
    const sections: BSection[] = (q.sections || []).map((s: Record<string, unknown>) => ({
      id: String(s.id || ""),
      title: String(s.title || ""),
      defaultVal: String(s.default || ""),
      options: ((s.options as Record<string, unknown>[]) || []).map((o) => ({
        value: String(o.value || ""),
        label: String(o.label || ""),
        note: String(o.note || ""),
      })),
    }));
    const conds: BCond[] = Object.entries(q.conditionals || {}).map(([condId, c]) => ({
      condId,
      sectionId: String((c as Record<string, unknown>).sectionId || ""),
      values: ((c as Record<string, unknown>).values || {}) as Record<string, string>,
    }));
    return { sections, conds };
  } catch {
    return { sections: [], conds: [] };
  }
}

// ── Docx helpers ─────────────────────────────────────────────────────
function autoMarkFields(html: string): string {
  let idx = 0;
  const next = (ph: string) => `{{FIELD:field${++idx}:${ph}}}`;
  html = html.replace(/«_{3,}»/g, () => next("введите значение"));
  html = html.replace(/\[_{3,}\]/g, () => next("введите значение"));
  html = html.replace(/\[([^\]]{2,60})\]/g, (_, ph) => next(ph.trim()));
  html = html.replace(/_{4,}/g, () => next("введите значение"));
  return html;
}

async function parseDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer }, {
    styleMap: [
      "p[style-name='Heading 1'] => p.section-title:fresh",
      "p[style-name='Heading 2'] => p.section-title:fresh",
      "b => strong",
    ],
  });
  return autoMarkFields(result.value);
}

// ── Main page ────────────────────────────────────────────────────────
export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTemplate);
  const [saving, setSaving] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "constructor">("basic");

  // Builder state
  const [bSections, setBSections] = useState<BSection[]>([]);
  const [bConds, setBConds] = useState<BCond[]>([]);
  const [showRawJson, setShowRawJson] = useState(false);

  // Sync builder → form.questionnaire whenever builder changes
  const syncBuilderToForm = useCallback((sections: BSection[], conds: BCond[]) => {
    const json = builderToJson(sections, conds);
    setForm((prev) => ({ ...prev, questionnaire: json }));
  }, []);

  const updateSections = (sections: BSection[]) => {
    setBSections(sections);
    syncBuilderToForm(sections, bConds);
  };

  const updateConds = (conds: BCond[]) => {
    setBConds(conds);
    syncBuilderToForm(bSections, conds);
  };

  // When contractHtml changes, auto-add missing COND entries
  useEffect(() => {
    if (!form.contractHtml) return;
    const ids = detectCondIds(form.contractHtml);
    if (ids.length === 0) return;
    setBConds((prev) => {
      const existing = new Set(prev.map((c) => c.condId));
      const newConds = ids.filter((id) => !existing.has(id)).map((id) => ({
        condId: id,
        sectionId: bSections[0]?.id || "",
        values: Object.fromEntries(
          (bSections[0]?.options || []).map((o) => [o.value, ""])
        ),
      }));
      if (newConds.length === 0) return prev;
      const merged = [...prev, ...newConds];
      syncBuilderToForm(bSections, merged);
      return merged;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.contractHtml]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (Array.isArray(data)) setTemplates(data);
    } catch (err) { console.error("Failed to fetch templates:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const url = editingId ? `/api/templates/${editingId}` : "/api/templates";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          questionnaire: form.questionnaire ? JSON.parse(form.questionnaire) : null,
        }),
      });
      if (res.ok) {
        setShowForm(false); setEditingId(null); setForm(emptyTemplate);
        setBSections([]); setBConds([]); setActiveTab("basic");
        await fetchTemplates();
      }
    } catch (err) { console.error("Save error:", err); }
    setSaving(false);
  };

  const handleEdit = (tpl: Template) => {
    setEditingId(tpl.id);
    const qJson = tpl.questionnaire ? JSON.stringify(tpl.questionnaire, null, 2) : "";
    setForm({
      titleKk: tpl.titleKk || "", titleRu: tpl.titleRu || "",
      titleEn: tpl.titleEn || "", titleZh: tpl.titleZh || "",
      descriptionKk: tpl.descriptionKk || "", descriptionRu: tpl.descriptionRu || "",
      descriptionEn: tpl.descriptionEn || "", descriptionZh: tpl.descriptionZh || "",
      fileUrl: tpl.fileUrl || "", category: tpl.category || "",
      summary: tpl.summary || "", keyTerms: tpl.keyTerms || "",
      contractHtml: tpl.contractHtml || "",
      questionnaire: qJson,
      price: tpl.price || "",
    });
    const { sections, conds } = jsonToBuilder(qJson);
    setBSections(sections);
    setBConds(conds);
    setShowForm(true); setActiveTab("basic");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить шаблон?")) return;
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      await fetchTemplates();
    } catch (err) { console.error("Delete error:", err); }
  };

  const handleCancel = () => {
    setShowForm(false); setEditingId(null); setForm(emptyTemplate);
    setBSections([]); setBConds([]); setActiveTab("basic");
  };

  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocxLoading(true);
    try {
      const html = await parseDocxFile(file);
      setForm((prev) => ({ ...prev, contractHtml: html }));
    } catch { alert("Ошибка чтения файла. Убедитесь что файл в формате .docx"); }
    setDocxLoading(false);
    e.target.value = "";
  };

  // ── Builder actions ──────────────────────────────────────────────
  const addSection = () => {
    const s: BSection = {
      id: `section${bSections.length + 1}`,
      title: "Новая группа",
      defaultVal: "ul",
      options: [
        { value: "ul", label: "Юридическое лицо", note: "ст. 33 ГК РК" },
        { value: "ip", label: "ИП", note: "ст. 30 ПК РК" },
        { value: "fl", label: "Физическое лицо", note: "" },
      ],
    };
    updateSections([...bSections, s]);
  };

  const removeSection = (idx: number) => {
    updateSections(bSections.filter((_, i) => i !== idx));
  };

  const updateSection = (idx: number, patch: Partial<BSection>) => {
    const updated = bSections.map((s, i) => i === idx ? { ...s, ...patch } : s);
    updateSections(updated);
  };

  const addOption = (sIdx: number) => {
    const updated = bSections.map((s, i) => i === sIdx
      ? { ...s, options: [...s.options, { value: `opt${s.options.length + 1}`, label: "", note: "" }] }
      : s
    );
    updateSections(updated);
  };

  const removeOption = (sIdx: number, oIdx: number) => {
    const updated = bSections.map((s, i) => i === sIdx
      ? { ...s, options: s.options.filter((_, j) => j !== oIdx) }
      : s
    );
    updateSections(updated);
  };

  const updateOption = (sIdx: number, oIdx: number, patch: Partial<BOption>) => {
    const updated = bSections.map((s, i) => i === sIdx
      ? { ...s, options: s.options.map((o, j) => j === oIdx ? { ...o, ...patch } : o) }
      : s
    );
    updateSections(updated);
  };

  const updateCond = (idx: number, patch: Partial<BCond>) => {
    const updated = bConds.map((c, i) => {
      if (i !== idx) return c;
      const merged = { ...c, ...patch };
      // If sectionId changed, rebuild values from new section's options
      if (patch.sectionId && patch.sectionId !== c.sectionId) {
        const sec = bSections.find((s) => s.id === patch.sectionId);
        if (sec) {
          merged.values = Object.fromEntries(
            sec.options.map((o) => [o.value, c.values[o.value] ?? ""])
          );
        }
      }
      return merged;
    });
    updateConds(updated);
  };

  const updateCondValue = (condIdx: number, optVal: string, text: string) => {
    const updated = bConds.map((c, i) => i === condIdx
      ? { ...c, values: { ...c.values, [optVal]: text } }
      : c
    );
    updateConds(updated);
  };

  const addCondManual = () => {
    const newCond: BCond = {
      condId: `cond${bConds.length + 1}`,
      sectionId: bSections[0]?.id || "",
      values: Object.fromEntries((bSections[0]?.options || []).map((o) => [o.value, ""])),
    };
    updateConds([...bConds, newCond]);
  };

  const removeCond = (idx: number) => updateConds(bConds.filter((_, i) => i !== idx));

  const detectedCondIds = detectCondIds(form.contractHtml);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Шаблоны документов</h1>
          <p className="text-gray-500 text-sm mt-1">{templates.length} шаблонов</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyTemplate); setBSections([]); setBConds([]); }}>
          <Plus className="h-4 w-4 mr-2" />Новый шаблон
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Редактировать шаблон" : "Новый шаблон"}</h2>
            <Button variant="ghost" size="sm" onClick={handleCancel}><X className="h-4 w-4" /></Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 border-b border-gray-200">
            {(["basic", "constructor"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                {tab === "basic" ? "Основное" : "Конструктор договора"}
              </button>
            ))}
          </div>

          {/* ── BASIC TAB ── */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Название (RU)</Label><Input value={form.titleRu} onChange={(e) => setForm({ ...form, titleRu: e.target.value })} /></div>
                <div><Label>Название (KK)</Label><Input value={form.titleKk} onChange={(e) => setForm({ ...form, titleKk: e.target.value })} /></div>
                <div><Label>Название (EN)</Label><Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></div>
                <div><Label>Название (ZH)</Label><Input value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Описание (RU)</Label><Textarea rows={3} value={form.descriptionRu} onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })} /></div>
                <div><Label>Описание (KK)</Label><Textarea rows={3} value={form.descriptionKk} onChange={(e) => setForm({ ...form, descriptionKk: e.target.value })} /></div>
                <div><Label>Описание (EN)</Label><Textarea rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></div>
                <div><Label>Описание (ZH)</Label><Textarea rows={3} value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>URL файла (для скачивания)</Label><Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." /></div>
                <div><Label>Категория</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Гражданское право, Трудовое..." /></div>
              </div>
              <div><Label>Краткое описание</Label>
                <Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Отображается в popup при нажатии на карточку." /></div>
              <div><Label>Ключевые условия (через запятую)</Label>
                <Input value={form.keyTerms} onChange={(e) => setForm({ ...form, keyTerms: e.target.value })} placeholder="Предмет договора, Срок действия, Вознаграждение" /></div>
              <div><Label>Цена (если заполнена — договор частично закрывается)</Label>
                <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2 000 тг" /></div>
            </div>
          )}

          {/* ── CONSTRUCTOR TAB ── */}
          {activeTab === "constructor" && (
            <div className="space-y-5">
              {/* Hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">Маркеры в тексте договора:</p>
                <p><code className="bg-blue-100 px-1 rounded">{"{{FIELD:id:подсказка}}"}</code> — заполняемое поле (синее)</p>
                <p className="mt-0.5"><code className="bg-blue-100 px-1 rounded">{"{{COND:id}}"}</code> — блок, меняющийся по опроснику слева</p>
              </div>

              {/* Upload docx */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Загрузить Word документ (.docx)</p>
                  <p className="text-xs text-gray-500">Подчёркивания и [скобки] автоматически станут {`{{FIELD:...}}`}</p>
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept=".docx" className="hidden" onChange={handleDocxUpload} disabled={docxLoading} />
                  <Button variant="outline" size="sm" asChild disabled={docxLoading}>
                    <span>{docxLoading
                      ? <><div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 inline-block" />Обработка...</>
                      : <><Upload className="h-3 w-3 mr-2" />Выбрать файл</>
                    }</span>
                  </Button>
                </label>
              </div>

              {/* Contract HTML */}
              <div>
                <Label>HTML текст договора</Label>
                <Textarea rows={12} value={form.contractHtml}
                  onChange={(e) => setForm({ ...form, contractHtml: e.target.value })}
                  placeholder={`<p class="contract-title">Договор № {{FIELD:num:______}}</p>\n<p>г. {{FIELD:city:город}}, {{FIELD:date:дата}}</p>\n<p>{{COND:party_clause}}, именуемый далее «Исполнитель»...</p>`}
                  className="font-mono text-xs" />
              </div>

              {/* ══ QUESTIONNAIRE BUILDER ══ */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Опросный лист (визуальный редактор)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Группы вопросов → управляют {"{{COND:...}}"} блоками в договоре</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addSection}>
                    <Plus className="h-3.5 w-3.5 mr-1" />Добавить группу
                  </Button>
                </div>

                <div className="divide-y divide-gray-100">
                  {bSections.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-5">Нет групп вопросов. Нажмите «Добавить группу».</p>
                  )}

                  {bSections.map((sec, si) => (
                    <div key={si} className="p-4 bg-white">
                      {/* Section header */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase">Заголовок</label>
                          <Input className="text-xs h-7 mt-0.5" value={sec.title}
                            onChange={(e) => updateSection(si, { title: e.target.value })}
                            placeholder="АРЕНДОДАТЕЛЬ:" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase">ID секции</label>
                          <Input className="text-xs h-7 mt-0.5 font-mono" value={sec.id}
                            onChange={(e) => updateSection(si, { id: e.target.value })}
                            placeholder="lessor" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase">По умолчанию</label>
                          <select value={sec.defaultVal}
                            onChange={(e) => updateSection(si, { defaultVal: e.target.value })}
                            className="w-full text-xs h-7 mt-0.5 border border-gray-200 rounded px-1.5 bg-white">
                            {sec.options.map((o) => (
                              <option key={o.value} value={o.value}>{o.label || o.value}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 mb-2">
                        {sec.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-1.5">
                            <span className="text-gray-300 text-xs">●</span>
                            <Input className="text-xs h-7 w-16 font-mono flex-shrink-0" value={opt.value}
                              onChange={(e) => updateOption(si, oi, { value: e.target.value })}
                              placeholder="ul" title="Код" />
                            <Input className="text-xs h-7 flex-1" value={opt.label}
                              onChange={(e) => updateOption(si, oi, { label: e.target.value })}
                              placeholder="Юридическое лицо" />
                            <Input className="text-xs h-7 w-32 flex-shrink-0" value={opt.note}
                              onChange={(e) => updateOption(si, oi, { note: e.target.value })}
                              placeholder="ст. 33 ГК РК" />
                            <button onClick={() => removeOption(si, oi)}
                              className="text-red-400 hover:text-red-600 flex-shrink-0">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => addOption(si)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Plus className="h-3 w-3" />Добавить вариант
                        </button>
                        <button onClick={() => removeSection(si)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                          <Trash2 className="h-3 w-3" />Удалить группу
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conditionals */}
                <div className="border-t border-gray-200 bg-amber-50">
                  <div className="px-4 py-2.5 flex items-center justify-between border-b border-amber-100">
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Условные блоки {"{{COND:...}}"}</h4>
                      {detectedCondIds.length > 0 && (
                        <p className="text-[10px] text-amber-700 mt-0.5">
                          Найдено в HTML: <code>{detectedCondIds.join(", ")}</code>
                        </p>
                      )}
                    </div>
                    <button onClick={addCondManual}
                      className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 border border-amber-300 px-2 py-0.5 rounded">
                      <Plus className="h-3 w-3" />Добавить блок
                    </button>
                  </div>

                  <div className="divide-y divide-amber-100">
                    {bConds.length === 0 && (
                      <p className="text-center text-xs text-amber-500 py-4">
                        {detectedCondIds.length > 0
                          ? "Кликните «Добавить блок» или переключитесь на HTML вкладку — блоки обнаружены автоматически"
                          : "Добавьте {{COND:id}} в HTML договора и создайте блок здесь"}
                      </p>
                    )}

                    {bConds.map((cond, ci) => {
                      const controlSection = bSections.find((s) => s.id === cond.sectionId);
                      return (
                        <div key={ci} className="p-4 bg-white/70">
                          <div className="flex items-center gap-2 mb-2.5">
                            <code className="text-xs bg-amber-100 px-2 py-0.5 rounded font-mono text-amber-800">
                              {`{{COND:${cond.condId}}}`}
                            </code>
                            <Input className="text-xs h-6 w-32 font-mono" value={cond.condId}
                              onChange={(e) => updateCond(ci, { condId: e.target.value })}
                              placeholder="party_clause" title="ID блока" />
                            <span className="text-xs text-gray-500">управляется:</span>
                            <select value={cond.sectionId}
                              onChange={(e) => updateCond(ci, { sectionId: e.target.value })}
                              className="text-xs border border-gray-200 rounded px-1.5 h-6 bg-white">
                              <option value="">— выберите секцию —</option>
                              {bSections.map((s) => (
                                <option key={s.id} value={s.id}>{s.title || s.id}</option>
                              ))}
                            </select>
                            <button onClick={() => removeCond(ci)} className="ml-auto text-red-400 hover:text-red-600">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {controlSection && (
                            <div className="space-y-1.5">
                              {controlSection.options.map((opt) => (
                                <div key={opt.value} className="flex items-start gap-2">
                                  <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-1 rounded flex-shrink-0 mt-0.5 min-w-[40px] text-center">
                                    {opt.value}
                                  </span>
                                  <Textarea rows={2}
                                    className="text-xs flex-1 font-mono resize-none"
                                    value={cond.values[opt.value] ?? ""}
                                    onChange={(e) => updateCondValue(ci, opt.value, e.target.value)}
                                    placeholder={`Текст когда выбран "${opt.label}" — можно использовать {{FIELD:org:наименование}}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Raw JSON toggle */}
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
                  <button onClick={() => setShowRawJson(!showRawJson)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
                    {showRawJson ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {showRawJson ? "Скрыть" : "Показать"} сгенерированный JSON
                  </button>
                  {showRawJson && (
                    <pre className="mt-2 text-[10px] font-mono bg-white border border-gray-200 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto text-gray-600">
                      {form.questionnaire || "(пусто)"}
                    </pre>
                  )}
                </div>
              </div>

              {/* Preview link */}
              {editingId && form.contractHtml && (
                <div className="flex justify-end">
                  <Link href={`/templates/${editingId}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />Предпросмотр конструктора
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
            <Button onClick={handleSubmit} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </Card>
      )}

      {/* Templates list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Шаблонов нет. Создайте первый!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {tpl.titleRu || tpl.titleEn || "Без названия"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {tpl.category && `${tpl.category} · `}
                      {tpl.contractHtml
                        ? <span className="text-green-600">Конструктор настроен</span>
                        : <span className="text-gray-400">Только скачивание</span>
                      }
                      {" · "}{new Date(tpl.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {tpl.contractHtml && (
                    <Link href={`/templates/${tpl.id}`} target="_blank">
                      <Button variant="ghost" size="sm" title="Открыть конструктор">
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(tpl)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tpl.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
