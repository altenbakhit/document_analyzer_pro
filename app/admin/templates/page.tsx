"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, X, Save, FileText } from "lucide-react";

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
  createdAt: string;
}

const emptyTemplate = {
  titleKk: "",
  titleRu: "",
  titleEn: "",
  titleZh: "",
  descriptionKk: "",
  descriptionRu: "",
  descriptionEn: "",
  descriptionZh: "",
  fileUrl: "",
  category: "",
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTemplate);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const url = editingId ? `/api/templates/${editingId}` : "/api/templates";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyTemplate);
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
      titleKk: tpl.titleKk || "",
      titleRu: tpl.titleRu || "",
      titleEn: tpl.titleEn || "",
      titleZh: tpl.titleZh || "",
      descriptionKk: tpl.descriptionKk || "",
      descriptionRu: tpl.descriptionRu || "",
      descriptionEn: tpl.descriptionEn || "",
      descriptionZh: tpl.descriptionZh || "",
      fileUrl: tpl.fileUrl || "",
      category: tpl.category || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
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
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
          <p className="text-gray-500 text-sm mt-1">{templates.length} templates total</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyTemplate); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Template" : "New Template"}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title (RU)</Label>
              <Input value={form.titleRu} onChange={(e) => setForm({ ...form, titleRu: e.target.value })} />
            </div>
            <div>
              <Label>Title (KK)</Label>
              <Input value={form.titleKk} onChange={(e) => setForm({ ...form, titleKk: e.target.value })} />
            </div>
            <div>
              <Label>Title (EN)</Label>
              <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
            </div>
            <div>
              <Label>Title (ZH)</Label>
              <Input value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Description (RU)</Label>
              <Textarea rows={3} value={form.descriptionRu} onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })} />
            </div>
            <div>
              <Label>Description (KK)</Label>
              <Textarea rows={3} value={form.descriptionKk} onChange={(e) => setForm({ ...form, descriptionKk: e.target.value })} />
            </div>
            <div>
              <Label>Description (EN)</Label>
              <Textarea rows={3} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
            </div>
            <div>
              <Label>Description (ZH)</Label>
              <Textarea rows={3} value={form.descriptionZh} onChange={(e) => setForm({ ...form, descriptionZh: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>File URL</Label>
              <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Contracts, Agreements" />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
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
          <p className="text-gray-500">No templates yet. Add your first template!</p>
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
                      {tpl.titleRu || tpl.titleEn || "Untitled"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {tpl.category && `${tpl.category} · `}
                      {new Date(tpl.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
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
