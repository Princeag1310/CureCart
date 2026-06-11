import { prisma } from '../config/db';

export class MedicineRepository {
  /**
   * Fetches all medicines, optionally filtering by a search term using pg_trgm.
   * If search term is empty, fetches all medicines.
   */
  static async getMedicines(searchTerm?: string, page: number = 1, category?: string, sort?: string) {
    const take = 24;
    const skip = (page - 1) * take;

    const where: any = {};
    
    if (searchTerm) {
      // Split the search term by spaces or hyphens to perform tokenized searching
      const tokens = searchTerm.split(/[\s-]+/).filter(t => t.length > 0);
      
      if (tokens.length > 0) {
        where.AND = tokens.map(token => ({
          OR: [
            { name: { contains: token, mode: 'insensitive' } },
            { description: { contains: token, mode: 'insensitive' } },
            { manufacturer: { contains: token, mode: 'insensitive' } },
          ]
        }));
      }
    }
    
    if (category) {
      where.category = category;
    }

    let orderBy: any = { name: 'asc' };
    if (sort === 'name-desc') orderBy = { name: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };

    return prisma.medicine.findMany({
      where,
      take,
      skip,
      orderBy,
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
