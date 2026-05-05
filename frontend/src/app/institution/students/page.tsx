"use client";

import { useEffect, useState, useCallback } from "react";
import { studentAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import {
  Plus, Search, Send, CheckCircle, ClipboardCheck, Trash2,
  ChevronLeft, ChevronRight, Camera, X
} from "lucide-react";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  className: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  address: string;
  phone: string;
  emergencyContact: string;
  photo: string;
  status: string;
}

const emptyForm = {
  firstName: "", lastName: "", fatherName: "", motherName: "",
  dateOfBirth: "", gender: "male", bloodGroup: "", className: "",
  section: "", rollNumber: "", admissionNumber: "", address: "",
  phone: "", emergencyContact: "",
};

export default function StudentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "institutionAdmin";
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const fetchStudents = useCallback(() => {
    const params: Record<string, string> = { page: String(page), limit: "20" };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    studentAPI.list(params).then((res) => {
      setStudents(res.data.students);
      setTotal(res.data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let student;
      if (editId) {
        const res = await studentAPI.update(editId, form);
        student = res.data.student;
      } else {
        const res = await studentAPI.create(form);
        student = res.data.student;
      }

      if (photoFile && student._id) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        await studentAPI.uploadPhoto(student._id, fd);
      }

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      setPhotoFile(null);
      fetchStudents();
    } catch {
      alert("Failed to save student.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (s: Student) => {
    setForm({
      firstName: s.firstName, lastName: s.lastName, fatherName: s.fatherName,
      motherName: s.motherName, dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split("T")[0] : "",
      gender: s.gender, bloodGroup: s.bloodGroup, className: s.className,
      section: s.section, rollNumber: s.rollNumber, admissionNumber: s.admissionNumber,
      address: s.address, phone: s.phone, emergencyContact: s.emergencyContact,
    });
    setEditId(s._id);
    setShowForm(true);
  };

  const handleBulkSubmit = async () => {
    if (selected.length === 0) return;
    await studentAPI.bulkSubmit(selected);
    setSelected([]);
    fetchStudents();
  };

  const handleBulkReview = async () => {
    if (selected.length === 0) return;
    await studentAPI.bulkReview(selected);
    setSelected([]);
    fetchStudents();
  };

  const handleFinalize = async () => {
    const reviewedIds = students.filter(s => s.status === "reviewed" && selected.includes(s._id)).map(s => s._id);
    if (reviewedIds.length === 0) { alert("Select reviewed students to finalize."); return; }
    if (!confirm(`Finalize ${reviewedIds.length} students for printing?`)) return;
    await studentAPI.finalize(reviewedIds);
    setSelected([]);
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    await studentAPI.delete(id);
    fetchStudents();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === students.length) setSelected([]);
    else setSelected(students.map(s => s._id));
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student records for ID cards</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search students..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="finalized">Finalized</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center space-x-3 mb-4 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-900">{selected.length} selected</span>
          <button onClick={handleBulkSubmit} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition">
            <Send size={14} /><span>Submit for Review</span>
          </button>
          {isAdmin && (
            <>
              <button onClick={handleBulkReview} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                <CheckCircle size={14} /><span>Mark Reviewed</span>
              </button>
              <button onClick={handleFinalize} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                <ClipboardCheck size={14} /><span>Finalize for Print</span>
              </button>
            </>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editId ? "Edit Student" : "Add New Student"}</h3>
              <button onClick={() => { setShowForm(false); setPhotoFile(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={24} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer transition">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP up to 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium text-gray-700">First Name *</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required /></div>
                <div><label className="text-sm font-medium text-gray-700">Last Name *</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required /></div>
                <div><label className="text-sm font-medium text-gray-700">Father&apos;s Name</label>
                  <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="text-sm font-medium text-gray-700">Mother&apos;s Name</label>
                  <input type="text" name="motherName" value={form.motherName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="text-sm font-medium text-gray-700">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none">
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select></div>
                <div><label className="text-sm font-medium text-gray-700">Class *</label>
                  <input type="text" name="className" value={form.className} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required /></div>
                <div><label className="text-sm font-medium text-gray-700">Section</label>
                  <input type="text" name="section" value={form.section} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="text-sm font-medium text-gray-700">Roll Number *</label>
                  <input type="text" name="rollNumber" value={form.rollNumber} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required /></div>
                <div><label className="text-sm font-medium text-gray-700">Admission No.</label>
                  <input type="text" name="admissionNumber" value={form.admissionNumber} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="text-sm font-medium text-gray-700">Blood Group</label>
                  <input type="text" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="col-span-2"><label className="text-sm font-medium text-gray-700">Address</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="col-span-2"><label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                  <input type="tel" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button type="button" onClick={() => { setShowForm(false); setPhotoFile(null); }} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Update Student" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left"><input type="checkbox" checked={selected.length === students.length && students.length > 0} onChange={toggleAll} /></th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Photo</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Class</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Roll No.</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No students found. Add your first student.</td></tr>
              )}
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)} /></td>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                      {s.photo ? <img src={`${baseUrl}${s.photo}`} alt="" className="w-full h-full object-cover" /> : <Camera size={16} className="m-auto mt-2.5 text-gray-400" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-gray-500">{s.fatherName && `F: ${s.fatherName}`}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{s.className} {s.section}</td>
                  <td className="px-4 py-3 text-sm">{s.rollNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === "draft" ? "bg-gray-100 text-gray-700" :
                      s.status === "submitted" ? "bg-orange-100 text-orange-700" :
                      s.status === "reviewed" ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {s.status !== "finalized" && (
                        <button onClick={() => openEdit(s)} className="text-sm text-blue-600 hover:underline">Edit</button>
                      )}
                      {isAdmin && s.status !== "finalized" && (
                        <button onClick={() => handleDelete(s._id)} className="text-sm text-red-600 hover:underline">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex space-x-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
            <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
