import { MedicineRepository } from '../repositories/medicine.repository';
import { AIService } from './ai.service';
import { prisma } from '../config/db';
import Fuse from 'fuse.js';

export class MedicineService {
  /**
   * Search for medicines by a query string with pagination and letter filtering
   */
  static async searchMedicines(query?: string, page: number = 1, category?: string, sort?: string, letter?: string) {
    // Delegate to Prisma database ILIKE search directly
    const results = await MedicineRepository.getMedicines(query, page, category, sort, letter);
    
    // Note: We removed the synchronous AI scraping fallback here because calling Gemini during 
    // a Server-Side Render holds the PostgreSQL connection open for 3-4 seconds. In a Serverless 
    // environment like Vercel, this causes rapid connection exhaustion (Too many connections error).
    
    return results;
  }

  /**
   * Get details of a single medicine
   */
  static async getMedicineDetails(id: string) {
    const medicine = await MedicineRepository.getMedicineById(id);
    if (!medicine) {
      throw new Error("Medicine not found");
    }
    return medicine;
  }
}
