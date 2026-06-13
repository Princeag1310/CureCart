"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Plus, Save, X, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InventoryTable({ initialMedicines }: { initialMedicines: any[] }) {
  const router = useRouter();
  const [medicines, setMedicines] = useState(initialMedicines);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [rxFilter, setRxFilter] = useState("ALL");

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // Adding State
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ 
    name: "", price: "", stock: "", manufacturer: "", 
    category: "", packaging: "", composition: "", requiresPrescription: false 
  });

  // Derived filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        med.name.toLowerCase().includes(searchLower) ||
        (med.manufacturer?.toLowerCase() || "").includes(searchLower) ||
        (med.composition?.toLowerCase() || "").includes(searchLower);

      // Stock Filter
      let matchesStock = true;
      if (stockFilter === "IN_STOCK") matchesStock = med.stock >= 10;
      if (stockFilter === "LOW_STOCK") matchesStock = med.stock > 0 && med.stock < 10;
      if (stockFilter === "OUT_OF_STOCK") matchesStock = med.stock === 0;

      // Rx Filter
      let matchesRx = true;
      if (rxFilter === "YES") matchesRx = med.requiresPrescription === true;
      if (rxFilter === "NO") matchesRx = med.requiresPrescription === false;

      return matchesSearch && matchesStock && matchesRx;
    });
  }, [medicines, searchQuery, stockFilter, rxFilter]);

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

  const handleAddSubmit = async () => {
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
      setAddForm({ name: "", price: "", stock: "", manufacturer: "", category: "", packaging: "", composition: "", requiresPrescription: false });
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Toolbar: Search and Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, manufacturer, or composition..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={stockFilter} 
            onChange={(e) => setStockFilter(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Stock</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
          
          <select 
            value={rxFilter} 
            onChange={(e) => setRxFilter(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Rx Types</option>
            <option value="YES">Rx Required</option>
            <option value="NO">OTC (No Rx)</option>
          </select>

          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add New
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 min-w-[1000px]">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 w-[25%]">Medicine Details</th>
              <th className="px-4 py-4 w-[20%]">Composition & Packaging</th>
              <th className="px-4 py-4 w-[15%] text-center">Rx Required</th>
              <th className="px-4 py-4 w-[15%] text-right">Price (₹)</th>
              <th className="px-4 py-4 w-[10%] text-center">Stock</th>
              <th className="px-4 py-4 w-[15%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isAdding && (
              <tr className="bg-blue-50/50">
                <td className="px-4 py-4 space-y-2">
                  <input type="text" placeholder="Name*" className="w-full p-2 border border-blue-200 rounded" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                  <input type="text" placeholder="Manufacturer" className="w-full p-2 border border-blue-200 rounded text-xs" value={addForm.manufacturer} onChange={e => setAddForm({...addForm, manufacturer: e.target.value})} />
                  <input type="text" placeholder="Category" className="w-full p-2 border border-blue-200 rounded text-xs" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} />
                </td>
                <td className="px-4 py-4 space-y-2">
                  <input type="text" placeholder="Composition" className="w-full p-2 border border-blue-200 rounded" value={addForm.composition} onChange={e => setAddForm({...addForm, composition: e.target.value})} />
                  <input type="text" placeholder="Packaging (e.g. 10 tablets)" className="w-full p-2 border border-blue-200 rounded text-xs" value={addForm.packaging} onChange={e => setAddForm({...addForm, packaging: e.target.value})} />
                </td>
                <td className="px-4 py-4 text-center">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={addForm.requiresPrescription} onChange={e => setAddForm({...addForm, requiresPrescription: e.target.checked})} />
                </td>
                <td className="px-4 py-4">
                  <input type="number" placeholder="0.00*" className="w-24 p-2 border border-blue-200 rounded text-right ml-auto block" value={addForm.price} onChange={e => setAddForm({...addForm, price: e.target.value})} />
                </td>
                <td className="px-4 py-4">
                  <input type="number" placeholder="0*" className="w-20 p-2 border border-blue-200 rounded text-center mx-auto block" value={addForm.stock} onChange={e => setAddForm({...addForm, stock: e.target.value})} />
                </td>
                <td className="px-4 py-4 text-right space-x-2">
                  <button onClick={handleAddSubmit} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-md"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setIsAdding(false)} className="p-2 text-gray-500 bg-gray-200 hover:bg-gray-300 rounded-md"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}

            {filteredMedicines.length === 0 && !isAdding && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No medicines found matching your criteria.</td>
              </tr>
            )}

            {filteredMedicines.map((med) => (
              <tr key={med.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-4">
                  {editingId === med.id ? (
                    <div className="space-y-2">
                      <input type="text" placeholder="Name" className="w-full p-2 border rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      <input type="text" placeholder="Manufacturer" className="w-full p-2 border rounded text-xs" value={editForm.manufacturer || ''} onChange={e => setEditForm({...editForm, manufacturer: e.target.value})} />
                      <input type="text" placeholder="Category" className="w-full p-2 border rounded text-xs" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} />
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{med.manufacturer || "-"}</p>
                      {med.category && <p className="text-xs text-blue-600 mt-0.5">{med.category}</p>}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  {editingId === med.id ? (
                    <div className="space-y-2">
                      <input type="text" placeholder="Composition" className="w-full p-2 border rounded" value={editForm.composition || ''} onChange={e => setEditForm({...editForm, composition: e.target.value})} />
                      <input type="text" placeholder="Packaging" className="w-full p-2 border rounded text-xs" value={editForm.packaging || ''} onChange={e => setEditForm({...editForm, packaging: e.target.value})} />
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-700 line-clamp-2">{med.composition || "-"}</p>
                      <p className="text-xs text-gray-500 mt-1">{med.packaging || "-"}</p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  {editingId === med.id ? (
                    <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={editForm.requiresPrescription} onChange={e => setEditForm({...editForm, requiresPrescription: e.target.checked})} />
                  ) : (
                    med.requiresPrescription ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Yes</span> : <span className="text-xs text-gray-400">No</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right font-medium">
                  {editingId === med.id ? (
                    <input type="number" className="w-24 p-2 border rounded text-right ml-auto block" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                  ) : (
                    <span className="text-lg text-gray-900">₹{med.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  {editingId === med.id ? (
                    <input type="number" className="w-20 p-2 border rounded text-center mx-auto block" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} />
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${med.stock === 0 ? 'bg-red-100 text-red-800' : med.stock < 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                      {med.stock} left
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-right space-x-2 whitespace-nowrap">
                  {editingId === med.id ? (
                    <>
                      <button onClick={handleSaveEdit} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"><Save className="w-4 h-4" /></button>
                      <button onClick={handleCancelEdit} className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(med)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(med.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
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
