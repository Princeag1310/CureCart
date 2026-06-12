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
    
    if (category) {
      where.category = category;
    }

    if (!searchTerm) {
      // Standard database pagination when no search term
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

    // --- HYBRID SEARCH LOGIC ---
    // 1. Database Pre-filtering (Substring Matching)
    const tokens = searchTerm.split(/[\s-]+/).filter(t => t.length > 0);
    const variations = [
      searchTerm,
      searchTerm.replace(/[\s-]+/g, '-'),
      searchTerm.replace(/[\s-]+/g, '')
    ];

    where.OR = [
      ...variations.map(v => ({ name: { contains: v, mode: 'insensitive' } })),
      {
        AND: tokens.map(token => {
          const conditions: any[] = [{ name: { contains: token, mode: 'insensitive' } }];
          if (token.length > 1) {
            conditions.push({ description: { contains: token, mode: 'insensitive' } });
            conditions.push({ manufacturer: { contains: token, mode: 'insensitive' } });
          }
          return { OR: conditions };
        })
      }
    ];

    // Fetch up to 300 candidates from DB
    const candidates = await prisma.medicine.findMany({
      where,
      take: 300,
    });

    // 2. In-Memory Fuzzy Ranking using Fuse.js
    const Fuse = require('fuse.js');
    const fuse = new Fuse(candidates, {
      keys: [
        { name: 'name', weight: 3 }, // Prioritize name matches heavily
        { name: 'manufacturer', weight: 1 },
        { name: 'description', weight: 0.5 }
      ],
      threshold: 0.4, // Allow slight typos
      ignoreLocation: true,
      useExtendedSearch: true
    });

    // We use a slight hack to force exact phrase matching to float to top in Fuse
    const searchResults = fuse.search(`'${searchTerm} | ${searchTerm.replace(/\s+/g, '-')}`);
    
    let sortedMedicines = searchResults.map((result: any) => result.item);

    // If Fuse returned nothing (e.g. no fuzzy match met threshold), fallback to raw candidates
    if (sortedMedicines.length === 0 && candidates.length > 0) {
      sortedMedicines = candidates;
    }

    // Apply explicit sorting if user requested it, overriding relevance
    if (sort) {
      sortedMedicines.sort((a: any, b: any) => {
        if (sort === 'name-asc') return a.name.localeCompare(b.name);
        if (sort === 'name-desc') return b.name.localeCompare(a.name);
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        return 0;
      });
    }

    // 3. Manual Pagination
    return sortedMedicines.slice(skip, skip + take);
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
