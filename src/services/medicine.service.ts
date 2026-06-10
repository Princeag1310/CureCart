import { MedicineRepository } from '../repositories/medicine.repository';

export class MedicineService {
  /**
   * Search for medicines by a query string
   */
  static async searchMedicines(query?: string) {
    // We could add business logic here (e.g. logging the search, rate limiting)
    return MedicineRepository.getMedicines(query);
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
