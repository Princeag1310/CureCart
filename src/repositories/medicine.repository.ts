import { prisma } from '../config/db';

export class MedicineRepository {
  /**
   * Fetches all medicines, optionally filtering by a search term using pg_trgm.
   * If search term is empty, fetches all medicines.
   */
  static async getMedicines(searchTerm?: string) {
    if (searchTerm) {
      // Basic ilike search for now, can be optimized with Prisma full-text search or raw query for pg_trgm
      return prisma.medicine.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { manufacturer: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    }

    return prisma.medicine.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Fetches a single medicine by ID
   */
  static async getMedicineById(id: string) {
    return prisma.medicine.findUnique({
      where: { id },
    });
  }
}
