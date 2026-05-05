"use client";

import { useEffect, useState } from "react";
import { designAPI } from "@/lib/api";
import { Upload, Trash2, Eye, Image } from "lucide-react";

interface Design {
  _id: string;
  name: string;
  file: string;
  fileType: string;
  orientation: string;
  uploadedBy: { name: string };
  createdAt: string;
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [previewDesign, setPreviewDesign] = useState<Design | null>(null);
  const [uploadForm, setUploadForm] = useState({ name: "", orientation: "horizontal" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchDesigns = () => {
    designAPI.list().then((res) => {
      setDesigns(res.data.designs);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchDesigns(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("design", file);
      formData.append("name", uploadForm.name);
      formData.append("orientation", uploadForm.orientation);
      await designAPI.upload(formData);
      setShowUpload(false);
      setFile(null);
      setUploadForm({ name: "", orientation: "horizontal" });
      fetchDesigns();
    } catch {
      alert("Failed to upload design.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this design?")) return;
    await designAPI.delete(id);
    fetchDesigns();
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Manager</h1>
          <p className="text-gray-600">Upload and preview your ID card designs</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">
          <Upload size={18} />
          <span>Upload Design</span>
        </button>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Design</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Design Name *</label>
                <input type="text" value={uploadForm.name} onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Orientation</label>
                <select value={uploadForm.orientation} onChange={(e) => setUploadForm({ ...uploadForm, orientation: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Design File *</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept="image/*,.pdf,.svg,.ai,.psd,.eps"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" required />
                <p className="text-xs text-gray-500 mt-1">Supported: JPEG, PNG, WebP, PDF, SVG, AI, PSD, EPS</p>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50">
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewDesign && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewDesign(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewDesign.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{previewDesign.orientation} format</p>
              </div>
              <button onClick={() => setPreviewDesign(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className={`flex items-center justify-center bg-gray-100 rounded-lg p-4 ${
              previewDesign.orientation === "horizontal" ? "aspect-video max-h-[70vh]" : "aspect-[3/4] max-h-[70vh]"
            }`}>
              {previewDesign.fileType?.startsWith("image/") ? (
                <img src={`${baseUrl}${previewDesign.file}`} alt={previewDesign.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center text-gray-500">
                  <Image size={48} className="mx-auto mb-2" />
                  <p>Preview not available for this file type.</p>
                  <a href={`${baseUrl}${previewDesign.file}`} target="_blank" className="text-blue-600 underline text-sm mt-2 block">Download File</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Upload size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No designs uploaded yet. Upload your first ID card design.</p>
          </div>
        )}
        {designs.map((design) => (
          <div key={design._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className={`bg-gray-100 flex items-center justify-center ${
              design.orientation === "horizontal" ? "aspect-video" : "aspect-[3/4]"
            }`}>
              {design.fileType?.startsWith("image/") ? (
                <img src={`${baseUrl}${design.file}`} alt={design.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-center text-gray-400">
                  <Image size={32} className="mx-auto mb-1" />
                  <p className="text-xs">{design.fileType?.split("/")[1]?.toUpperCase()}</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{design.name}</h3>
              <p className="text-xs text-gray-500 mt-1 capitalize">{design.orientation} &middot; {new Date(design.createdAt).toLocaleDateString()}</p>
              <div className="flex space-x-2 mt-3">
                <button onClick={() => setPreviewDesign(design)} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
                <button onClick={() => handleDelete(design._id)} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
