"use client";

import { useEffect, useState } from "react";
import { templateAPI, institutionAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Palette, Check } from "lucide-react";

interface Template {
  _id: string;
  name: string;
  orientation: string;
  isDefault: boolean;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  headerText: string;
}

const sampleStudent = {
  name: "John Doe",
  className: "10th",
  section: "A",
  rollNumber: "42",
  dateOfBirth: "15 Jan 2010",
  bloodGroup: "O+",
  fatherName: "Robert Doe",
  phone: "+91 9876543210",
};

export default function InstitutionTemplatesPage() {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    templateAPI.list().then((res) => {
      setTemplates(res.data.templates);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelect = async (template: Template) => {
    if (!user?.institution) return;
    setSaving(true);
    try {
      const instId = typeof user.institution === "object" ? user.institution._id : user.institution;
      await institutionAPI.update(instId, {
        selectedTemplate: template._id,
        templateOrientation: template.orientation,
      } as Record<string, string>);
      setSelectedTemplate(template._id);
    } catch {
      alert("Failed to select template.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ID Card Templates</h1>
        <p className="text-gray-600">Select a template for your student ID cards</p>
      </div>

      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview: {previewTemplate.name}</h3>
            <div className="flex justify-center">
              <div
                className={`rounded-xl overflow-hidden shadow-lg ${
                  previewTemplate.orientation === "horizontal" ? "w-[500px] h-[300px]" : "w-[300px] h-[450px]"
                }`}
                style={{ backgroundColor: previewTemplate.backgroundColor }}
              >
                <div className="p-1" style={{ backgroundColor: previewTemplate.accentColor }}>
                  <p className="text-center text-xs font-bold" style={{ color: previewTemplate.textColor }}>
                    {previewTemplate.headerText}
                  </p>
                </div>
                <div className={`p-4 flex ${previewTemplate.orientation === "horizontal" ? "flex-row space-x-4" : "flex-col items-center space-y-3"}`}>
                  <div className={`bg-white/20 rounded-lg flex items-center justify-center ${
                    previewTemplate.orientation === "horizontal" ? "w-24 h-28" : "w-24 h-28"
                  }`}>
                    <span className="text-4xl" style={{ color: previewTemplate.textColor }}>👤</span>
                  </div>
                  <div className={`space-y-1 ${previewTemplate.orientation === "horizontal" ? "text-left flex-1" : "text-center"}`}>
                    <p className="font-bold text-sm" style={{ color: previewTemplate.textColor }}>{sampleStudent.name}</p>
                    {Object.entries(sampleStudent).filter(([k]) => k !== "name").map(([k, v]) => (
                      <p key={k} className="text-xs" style={{ color: previewTemplate.accentColor }}>
                        <span className="font-medium" style={{ color: previewTemplate.textColor }}>{k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}: </span>{v}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="p-1 mt-auto" style={{ backgroundColor: previewTemplate.accentColor }}>
                  <p className="text-center text-xs" style={{ color: previewTemplate.textColor }}>School Name Here</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setPreviewTemplate(null)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Close</button>
              <button onClick={() => { handleSelect(previewTemplate); setPreviewTemplate(null); }} disabled={saving}
                className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">
                Select This Template
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div key={t._id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition cursor-pointer ${
            selectedTemplate === t._id ? "border-blue-500" : "border-gray-100"
          }`} onClick={() => setPreviewTemplate(t)}>
            <div className={`p-6 flex items-center justify-center ${t.orientation === "horizontal" ? "aspect-video" : "aspect-[3/4]"}`}
              style={{ backgroundColor: t.backgroundColor }}>
              <div className="text-center">
                <Palette size={28} style={{ color: t.accentColor }} className="mx-auto mb-2" />
                <p className="text-xs font-bold" style={{ color: t.textColor }}>{t.headerText}</p>
                <p className="text-xs mt-1 capitalize" style={{ color: t.accentColor }}>{t.orientation}</p>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">{t.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{t.orientation} {t.isDefault && "· Default"}</p>
              </div>
              {selectedTemplate === t._id && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
