"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, X, Save, FileText, Eye, Upload } from "lucide-react";
import mammoth from "mammoth";

interface Template {
  id: string;
  titleKk: string | null;
  titleRu: string | null;
  titleEn: string | null;
  titleZh: string | null;
  descriptionKk: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;
  descriptionZh: string | null;
  fileUrl: string | null;
  category: string | null;
  summary: string | null;
  keyTerms: string | null;
  contractHtml: string | null;
  questionnaire: unknown;
  createdAt: string;
}

const emptyTemplate = {
  titleKk: "", titleRu: "", titleEn: "", titleZh: "",
  descriptionKk: "", descriptionRu: "", descriptionEn: "", descriptionZh: "",
  fileUrl: "", category: "",
  summary: "", keyTerms: "",
  contractHtml: "",
  questionnaire: "",
};

// ── Docx helpers ───────────────────────────────────────────────────
function autoMarkFields(html: string): string {
  let idx = 0;
  const next = (ph: string) => `{{FIELD:field${++idx}:${ph}}}`;

  // «__________» — ёлочки с подчёркиваниями
  html = html.replace(/«_{3,}»/g, () => next("введите значение"));
  // [____________] — скобки с подчёркиваниями
  html = html.replace(/\[_{3,}\]/g, () => next("введите значение"));
  // [наименование организации] — именованный плейсхолдер в скобках
  html = html.replace(/\[([^\]]{2,60})\]/g, (_, ph) => next(ph.trim()));
  // _____________ — просто подчёркивания (4+)
  html = html.replace(/_{4,}/g, () => next("введите значение"));

  return html;
}

async function parseDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => p.section-title:fresh",
        "p[style-name='Heading 2'] => p.section-title:fresh",
        "b => strong",
      ],
    }
  );
  return autoMarkFields(result.value);
}

const QUESTIONNAIRE_PLACEHOLDER = `{
  "sections": [
    {
      "id": "party_type",
      "title": "Тип стороны",
      "type": "radio",
      "default": "ul",
      "options": [
        { "value": "ul", "label": "Юридическое лицо", "note": "ст. 33 ГК РК" },
        { "value": "ip", "label": "ИП", "note": "ст. 30 ПК РК" },
        { "value": "fl", "label": "Физическое лицо" }
      ]
    }
  ],
  "conditionals": {
    "party_clause": {
      "sectionId": "party_type",
      "values": {
        "ul": "{{FIELD:org:Наименование ТОО}}, БИН {{FIELD:bin:000000000000}}",
        "ip": "ИП {{FIELD:fio:ФИО}}, ИИН {{FIELD:iin:000000000000}}",
        "fl": "Гражданин(ка) {{FIELD:fio:ФИО}}, ИИН {{FIELD:iin:000000000000}}"
      }
    }
  }
}`;

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTemplate);
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState("");
  const [docxLoading, setDocxLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "constructor">("basic");

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (Array.isArray(data)) setTemplates(data);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSubmit = async () => {
    // Validate JSON if provided
    if (form.questionnaire) {
      try {
        JSON.parse(form.questionnaire);
        setJsonError("");
      } catch {
        setJsonError("Ошибка в JSON опросника. Проверьте синтаксис.");
        return;
      }
    }
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
        setShowForm(false);
        setEditingId(null);
        setForm(emptyTemplate);
        setJsonError("");
        setActiveTab("basic");
        await fetchTemplates();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
    setSaving(false);
  };

  const handleEdit = (tpl: Template) => {
    setEditingId(tpl.id);
    setForm({
      titleKk: tpl.titleKk || "", titleRu: tpl.titleRu || "",
      titleEn: tpl.titleEn || "", titleZh: tpl.titleZh || "",
      descriptionKk: tpl.descriptionKk || "", descriptionRu: tpl.descriptionRu || "",
      descriptionEn: tpl.descriptionEn || "", descriptionZh: tpl.descriptionZh || "",
      fileUrl: tpl.fileUrl || "", category: tpl.category || "",
      summary: tpl.summary || "", keyTerms: tpl.keyTerms || "",
      contractHtml: tpl.contractHtml || "",
      questionnaire: tpl.questionnaire ? JSON.stringify(tpl.questionnaire, null, 2) : "",
    });
    setShowForm(true);
    setActiveTab("basic");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить шаблон?")) return;
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      await fetchTemplates();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyTemplate);
    setJsonError("");
    setActiveTab("basic");
  };

  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocxLoading(true);
    try {
      const html = await parseDocxFile(file);
      setForm((prev) => ({ ...prev, contractHtml: html }));
    } catch {
      alert("Ошибка чтения файла. Убедитесь что файл в формате .docx");
    }
    setDocxLoading(false);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Шаблоны документов</h1>
          <p className="text-gray-500 text-sm mt-1">{templates.length} шаблонов</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyTemplate); }}>
          <Plus className="h-4 w-4 mr-2" />
          Новый шаблон
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Редактировать шаблон" : "Новый шаблон"}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${
                activeTab === "basic"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Основное
            </button>
            <button
              onClick={() => setActiveTab("constructor")}
              className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${
                activeTab === "constructor"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Конструктор договора
            </button>
          </div>

          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Название (RU)</Label>
                  <Input value={form.titleRu} onChange={(e) => setForm({ ...form, titleRu: e.target.value })} /></div>
                <div><Label>Название (KK)</Label>
                  <Input value={form.titleKk} onChange={(e) => setForm({ ...form, titleKk: e.target.value })} /></div>
                <div><Label>Название (EN)</Label>
                  <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></div>
                <div><Label>Название (ZH)</Label>
                  <Input value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Описание (RU)</Label>
                  <Textarea rows={3} value={form.descriptionRu} onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })} /></div>
                <div><Label>Описание (KK)</Label>
                  <Textarea rows={3} value={form.descriptionKk} onChange={(e) => setForm({ ...form, descriptionKk: e.target.value })} /></div>
                <div><Label>Описание (EN)</Label>
                  <Textarea rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></div>
                <div><Label>Описание (ZH)</Label>
                  <Textarea rows={3} value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>URL файла (для скачивания)</Label>
                  <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." /></div>
                <div><Label>Категория</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Гражданское право, Трудовое..." /></div>
              </div>

              <div><Label>Краткое описание (показывается при наведении)</Label>
                <Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Краткое описание договора. Отображается в popup при наведении на карточку." /></div>

              <div><Label>Ключевые условия (через запятую)</Label>
                <Input value={form.keyTerms} onChange={(e) => setForm({ ...form, keyTerms: e.target.value })}
                  placeholder="Предмет договора, Срок действия, Вознаграждение, Ответственность сторон" /></div>
            </div>
          )}

          {activeTab === "constructor" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">Маркеры в тексте договора:</p>
                <p><code className="bg-blue-100 px-1 rounded">{"{{FIELD:id:placeholder}}"}</code> — синее заполняемое поле</p>
                <p className="mt-1"><code className="bg-blue-100 px-1 rounded">{"{{COND:id}}"}</code> — блок, меняющийся по опроснику</p>
                <p className="mt-1 text-blue-600">Пример: <code>Договор № {"{{FIELD:num:______}}"}</code></p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Загрузить Word документ (.docx)</p>
                  <p className="text-xs text-gray-500">Поля-подчёркивания автоматически станут {`{{FIELD:...}}`}</p>
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept=".docx" className="hidden" onChange={handleDocxUpload} disabled={docxLoading} />
                  <Button variant="outline" size="sm" asChild disabled={docxLoading}>
                    <span>
                      {docxLoading ? (
                        <><div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 inline-block" />Обработка...</>
                      ) : (
                        <><Upload className="h-3 w-3 mr-2" />Выбрать файл</>
                      )}
                    </span>
                  </Button>
                </label>
              </div>

              <div>
                <Label>HTML текст договора</Label>
                <Textarea
                  rows={14}
                  value={form.contractHtml}
                  onChange={(e) => setForm({ ...form, contractHtml: e.target.value })}
                  placeholder={`<p class="contract-title">Договор оказания услуг № {{FIELD:num:______}}</p>\n<p>г. {{FIELD:place:город}}, {{FIELD:date:дд.мм.гггг}} года</p>\n<p>{{COND:party_clause}}, именуемый далее «Исполнитель»...</p>\n<p class="section-title">1. Предмет договора</p>\n<p>1.1. Исполнитель обязуется оказать {{FIELD:subject:описание услуг}}.</p>`}
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>JSON конфигурация опросника</Label>
                  {jsonError && <span className="text-xs text-red-500">{jsonError}</span>}
                </div>
                <Textarea
                  rows={16}
                  value={form.questionnaire}
                  onChange={(e) => { setForm({ ...form, questionnaire: e.target.value }); setJsonError(""); }}
                  placeholder={QUESTIONNAIRE_PLACEHOLDER}
                  className={`font-mono text-xs ${jsonError ? "border-red-400" : ""}`}
                />
              </div>

              {editingId && form.contractHtml && (
                <div className="flex justify-end">
                  <Link href={`/templates/${editingId}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Предпросмотр конструктора
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
                      {tpl.contractHtml ? (
                        <span className="text-green-600">Конструктор настроен</span>
                      ) : (
                        <span className="text-gray-400">Только скачивание</span>
                      )}
                      {" · "}
                      {new Date(tpl.createdAt).toLocaleDateString("ru-RU")}
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
