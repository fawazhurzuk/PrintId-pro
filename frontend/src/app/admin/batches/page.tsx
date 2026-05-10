"use client";

import { useEffect, useState } from "react";
import { batchAPI } from "@/lib/api";
import { FileStack, Download, ChevronDown } from "lucide-react";

interface Batch {
  _id: string;
  institution: { _id: string; name: string; email: string };
  totalCards: number;
  status: string;
  templateOrientation: string;
  finalizedBy?: { name: string };
  finalizedAt: string;
  createdAt: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  className: string;
  section: string;
  rollNumber: string;
  photo: string;
  status: string;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    batchAPI.list().then((res) => {
      setBatches(res.data.batches);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleBatch = async (batchId: string) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      return;
    }
    setExpandedBatch(batchId);
    setLoadingStudents(true);
    try {
      const res = await batchAPI.get(batchId);
      setStudents(res.data.students);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const updateStatus = async (batchId: string, status: string) => {
    try {
      await batchAPI.updateStatus(batchId, status);
      setBatches(batches.map(b => b._id === batchId ? { ...b, status } : b));
    } catch {
      alert("Failed to update status.");
    }
  };

  const downloadCSV = async (batchId: string) => {
    try {
      const res = await batchAPI.exportCSV(batchId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch-${batchId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download CSV.");
    }
  };

  const downloadZip = async (batchId: string) => {
    try {
      const res = await batchAPI.exportZip(batchId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch-${batchId}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download ZIP.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Print Orders</h1>
        <p className="text-gray-600">Manage finalized ID card batches for printing</p>
      </div>

      <div className="space-y-4">
        {batches.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
            <FileStack size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No print orders yet. Orders will appear here when institutions finalize their ID cards.</p>
          </div>
        )}

        {batches.map((batch) => (
          <div key={batch._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => toggleBatch(batch._id)}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileStack size={20} className="text-blue-900" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{batch.institution?.name}</p>
                  <p className="text-sm text-gray-500">{batch.totalCards} ID cards &middot; {batch.templateOrientation} &middot; {new Date(batch.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  batch.status === "finalized" ? "bg-yellow-100 text-yellow-800" :
                  batch.status === "printing" ? "bg-blue-100 text-blue-800" :
                  batch.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>{batch.status}</span>
                <ChevronDown size={18} className={`text-gray-400 transition ${expandedBatch === batch._id ? "rotate-180" : ""}`} />
              </div>
            </div>

            {expandedBatch === batch._id && (
              <div className="border-t border-gray-100 p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button onClick={() => downloadCSV(batch._id)} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                    <Download size={14} />
                    <span>Download CSV</span>
                  </button>
                  <button onClick={() => downloadZip(batch._id)} className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
                    <Download size={14} />
                    <span>Download ZIP (CSV + Photos)</span>
                  </button>
                  {batch.status === "finalized" && (
                    <button onClick={() => updateStatus(batch._id, "printing")} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                      Mark as Printing
                    </button>
                  )}
                  {batch.status === "printing" && (
                    <button onClick={() => updateStatus(batch._id, "completed")} className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                      Mark as Completed
                    </button>
                  )}
                </div>

                {loadingStudents ? (
                  <div className="py-4 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mx-auto" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 text-gray-600">Sr.</th>
                          <th className="text-left px-3 py-2 text-gray-600">Name</th>
                          <th className="text-left px-3 py-2 text-gray-600">Class</th>
                          <th className="text-left px-3 py-2 text-gray-600">Roll No.</th>
                          <th className="text-left px-3 py-2 text-gray-600">Photo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((s, i) => (
                          <tr key={s._id}>
                            <td className="px-3 py-2">{i + 1}</td>
                            <td className="px-3 py-2 font-medium">{s.firstName} {s.lastName}</td>
                            <td className="px-3 py-2">{s.className} {s.section}</td>
                            <td className="px-3 py-2">{s.rollNumber}</td>
                            <td className="px-3 py-2">
                              {s.photo ? (
                                <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden">
                                  <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${s.photo}`} alt="" className="w-full h-full object-cover" />
                                </div>
                              ) : <span className="text-gray-400">-</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
