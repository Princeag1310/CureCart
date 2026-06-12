import { AIService } from '../src/services/ai.service';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  try {
    const query = "Aciclovir 800 Tablet";
    console.log("Fetching details for:", query);
    const details = await AIService.generateComprehensiveMedicineDetails(query);
    console.log("Details:", details);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
