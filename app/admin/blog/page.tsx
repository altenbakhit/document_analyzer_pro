"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, X, Save } from "lucide-react";

interface BlogPost {
  id: string;
  titleKk: string | null;
  titleRu: string | null;
  titleEn: string | null;
  titleZh: string | null;
  contentKk: string | null;
  contentRu: string | null;
  contentEn: string | null;
  contentZh: string | null;
  author: string | null;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

const emptyPost = {
  titleKk: "",
  titleRu: "",
  titleEn: "",
  titleZh: "",
  contentKk: "",
  contentRu: "",
  contentEn: "",
  contentZh: "",
  author: "",
  imageUrl: "",
  published: true,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog");
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const url = editingId ? `/api/blog/${editingId}` : "/api/blog";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyPost);
        await fetchPosts();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
    setSaving(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      titleKk: post.titleKk || "",
      titleRu: post.titleRu || "",
      titleEn: post.titleEn || "",
      titleZh: post.titleZh || "",
      contentKk: post.contentKk || "",
      contentRu: post.contentRu || "",
      contentEn: post.contentEn || "",
      contentZh: post.contentZh || "",
      author: post.author || "",
      imageUrl: post.imageUrl || "",
      published: post.published,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(`/api/blog/${id}`, { method: "DELETE" });
      await fetchPosts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyPost);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{posts.length} posts total</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyPost); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Post" : "New Post"}
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
              <Label>Content (RU)</Label>
              <Textarea rows={5} value={form.contentRu} onChange={(e) => setForm({ ...form, contentRu: e.target.value })} />
            </div>
            <div>
              <Label>Content (KK)</Label>
              <Textarea rows={5} value={form.contentKk} onChange={(e) => setForm({ ...form, contentKk: e.target.value })} />
            </div>
            <div>
              <Label>Content (EN)</Label>
              <Textarea rows={5} value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} />
            </div>
            <div>
              <Label>Content (ZH)</Label>
              <Textarea rows={5} value={form.contentZh} onChange={(e) => setForm({ ...form, contentZh: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label>Author</Label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Published</span>
              </label>
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
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No blog posts yet. Create your first post!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {post.titleRu || post.titleEn || "Untitled"}
                    </h3>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {post.author && `${post.author} · `}
                    {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
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
