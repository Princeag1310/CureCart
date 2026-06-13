import { prisma } from "@/config/db";
import { InventoryTable } from "@/components/admin/InventoryTable";

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const medicines = await prisma.medicine.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory Management</h1>
        <p className="text-gray-500 mt-1">Add, update, or remove medicines from the storefront catalog.</p>
      </div>

      <InventoryTable initialMedicines={medicines} />
    </div>
  );
}
