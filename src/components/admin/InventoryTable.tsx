"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InventoryTable({ initialMedicines }: { initialMedicines: any[] }) {
  const router = useRouter();
  const [medicines, setMedicines] = useState(initialMedicines);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", price: "", stock: "", manufacturer: "" });

  const handleEditClick = (med: any) => {
    setEditingId(med.id);
    setEditForm({ ...med });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      
      setMedicines(medicines.map(m => m.id === updated.id ? updated : m));
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const res = await fetch(`/api/admin/inventory?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      setMedicines(medicines.filter(m => m.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      if (!res.ok) throw new Error("Failed to add medicine");
      const newMed = await res.json();
      
      setMedicines([newMed, ...medicines]);
      setIsAdding(false);
      setAddForm({ name: "", price: "", stock: "", manufacturer: "" });
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900">Medicine Database</h2>
        <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Medicine
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Manufacturer</th>
              <th className="px-6 py-4 text-right">Price (₹)</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-blue-50/50">
                <td className="px-6 py-4">
                  <input type="text" placeholder="Medicine Name" className="w-full p-2 border rounded" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                </td>
                <td className="px-6 py-4">
                  <input type="text" placeholder="Manufacturer" className="w-full p-2 border rounded" value={addForm.manufacturer} onChange={e => setAddForm({...addForm, manufacturer: e.target.value})} />
                </td>
                <td className="px-6 py-4">
                  <input type="number" placeholder="0.00" className="w-24 p-2 border rounded text-right ml-auto block" value={addForm.price} onChange={e => setAddForm({...addForm, price: e.target.value})} />
                </td>
                <td className="px-6 py-4">
                  <input type="number" placeholder="0" className="w-20 p-2 border rounded text-center mx-auto block" value={addForm.stock} onChange={e => setAddForm({...addForm, stock: e.target.value})} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={handleAddSubmit} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-md"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setIsAdding(false)} className="p-2 text-gray-500 bg-gray-200 hover:bg-gray-300 rounded-md"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}

            {medicines.map((med) => (
              <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {editingId === med.id ? (
                    <input type="text" className="w-full p-1 border rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  ) : (
                    med.name
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === med.id ? (
                    <input type="text" className="w-full p-1 border rounded" value={editForm.manufacturer || ''} onChange={e => setEditForm({...editForm, manufacturer: e.target.value})} />
                  ) : (
                    med.manufacturer || "-"
                  )}
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {editingId === med.id ? (
                    <input type="number" className="w-20 p-1 border rounded text-right ml-auto block" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                  ) : (
                    `₹${med.price.toFixed(2)}`
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {editingId === med.id ? (
                    <input type="number" className="w-16 p-1 border rounded text-center mx-auto block" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} />
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${med.stock === 0 ? 'bg-red-100 text-red-800' : med.stock < 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                      {med.stock}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  {editingId === med.id ? (
                    <>
                      <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"><Save className="w-4 h-4" /></button>
                      <button onClick={handleCancelEdit} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(med)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(med.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
