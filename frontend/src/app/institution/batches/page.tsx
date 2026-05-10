"use client";

import { useEffect, useState } from "react";
import { batchAPI } from "@/lib/api";
import { ClipboardCheck, ChevronDown } from "lucide-react";

interface Batch {
  _id: string;
  totalCards: number;
  status: string;
  templateOrientation: string;
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
  status: string;
}

export default function InstitutionBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    batchAPI.list().then((res) => {
      setBatches(res.data.batches);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const res = await batchAPI.get(id);
    setStudents(res.data.students);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Print Batches</h1>
        <p className="text-gray-600">Track the status of your finalized ID card batches</p>
      </div>

      <div className="space-y-4">
        {batches.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">
            <ClipboardCheck size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No batches yet. Finalize reviewed students to create a print batch.</p>
          </div>
        )}
        {batches.map((batch) => (
          <div key={batch._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(batch._id)}>
              <div>
                <p className="font-semibold text-gray-900">{batch.totalCards} ID Cards</p>
                <p className="text-sm text-gray-500 capitalize">{batch.templateOrientation} format &middot; {new Date(batch.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  batch.status === "finalized" ? "bg-yellow-100 text-yellow-800" :
                  batch.status === "printing" ? "bg-blue-100 text-blue-800" :
                  batch.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>{batch.status}</span>
                <ChevronDown size={18} className={`text-gray-400 transition ${expanded === batch._id ? "rotate-180" : ""}`} />
              </div>
            </div>
            {expanded === batch._id && (
              <div className="border-t p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2">Sr.</th>
                      <th className="text-left px-3 py-2">Name</th>
                      <th className="text-left px-3 py-2">Class</th>
                      <th className="text-left px-3 py-2">Roll No.</th>
                      <th className="text-left px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((s, i) => (
                      <tr key={s._id}>
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="px-3 py-2">{s.className} {s.section}</td>
                        <td className="px-3 py-2">{s.rollNumber}</td>
                        <td className="px-3 py-2 capitalize">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
