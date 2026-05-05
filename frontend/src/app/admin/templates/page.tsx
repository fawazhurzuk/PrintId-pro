"use client";

import { useEffect, useState } from "react";
import { templateAPI } from "@/lib/api";
import { Palette, Plus, Trash2 } from "lucide-react";

interface Template {
  _id: string;
  name: string;
  orientation: string;
  isDefault: boolean;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  headerText: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", orientation: "horizontal", backgroundColor: "#1E3A5F", textColor: "#FFFFFF",
    accentColor: "#0F9DC8", headerText: "STUDENT IDENTITY CARD",
  });
  const [creating, setCreating] = useState(false);

  const fetchTemplates = () => {
    templateAPI.list().then((res) => {
      setTemplates(res.data.templates);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await templateAPI.create({
        ...form,
        fields: [
          { label: "Name", key: "name", visible: true, order: 1 },
          { label: "Class", key: "className", visible: true, order: 2 },
          { label: "Roll No.", key: "rollNumber", visible: true, order: 3 },
          { label: "DOB", key: "dateOfBirth", visible: true, order: 4 },
          { label: "Blood Group", key: "bloodGroup", visible: true, order: 5 },
          { label: "Father's Name", key: "fatherName", visible: true, order: 6 },
        ],
      });
      setShowCreate(false);
      fetchTemplates();
    } catch {
      alert("Failed to create template.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await templateAPI.delete(id);
    fetchTemplates();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">Manage ID card templates</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">
          <Plus size={18} />
          <span>New Template</span>
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Template</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Orientation</label>
                <select value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none">
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Header Text</label>
                <input type="text" value={form.headerText} onChange={(e) => setForm({ ...form, headerText: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Background</label>
                  <input type="color" value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                    className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Text</label>
                  <input type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                    className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Accent</label>
                  <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className={`p-6 flex items-center justify-center ${t.orientation === "horizontal" ? "aspect-video" : "aspect-[3/4]"}`}
              style={{ backgroundColor: t.backgroundColor }}>
              <div className="text-center">
                <Palette size={32} style={{ color: t.accentColor }} className="mx-auto mb-2" />
                <p className="text-sm font-bold" style={{ color: t.textColor }}>{t.headerText}</p>
                <p className="text-xs mt-1" style={{ color: t.accentColor }}>{t.orientation}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{t.orientation} {t.isDefault && "· Default"}</p>
                </div>
                {!t.isDefault && (
                  <button onClick={() => handleDelete(t._id)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
