import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// The path to the downloaded CSV files
const CSV_DIR = path.resolve('/Users/prince_agrawal/Downloads/1mg web scraping/All Medicines');

// We limit the number of rows inserted PER FILE to avoid overloading the free database
const MAX_MEDICINES_PER_FILE = 500; 

async function seed() {
  console.log('🌱 Starting Database Seeding from 1mg CSV files...');

  try {
    if (!fs.existsSync(CSV_DIR)) {
      console.log(`⚠️ CSV directory not found at ${CSV_DIR}. Seeding with dummy data instead...`);
      await seedDummyData();
      return;
    }

    const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
    let totalInsertedCount = 0;

    for (const file of files) {
      let fileInsertedCount = 0;
      console.log(`Processing file: ${file}`);
      const filePath = path.join(CSV_DIR, file);

      await new Promise<void>((resolve, reject) => {
        const stream = fs.createReadStream(filePath).pipe(csv());
        
        stream.on('data', async (row) => {
          if (fileInsertedCount >= MAX_MEDICINES_PER_FILE) {
            stream.destroy();
            return;
          }

          try {
            // Mapping CSV headers to Prisma Schema
            // Headers: Name,Price,Prescription,Packaging,Company,Salt_Composition,Status,Image_URL
            const name = row['Name'];
            const price = parseFloat(row['Price'] || '0');
            const requiresPrescription = row['Prescription'] === 'Prescription Required';
            const company = row['Company'];
            const packaging = row['Packaging'];
            const salt = row['Salt_Composition'];

            if (!name || isNaN(price)) return; // Skip invalid rows

            // Constructing a detailed description from the raw data
            const description = `Manufactured by ${company}. Packaging: ${packaging}. Salt Composition: ${salt}`;

            // Determine category based on prescription requirement (basic heuristic)
            const category = requiresPrescription ? "Prescription Drugs" : "OTC Products";

            // Pause stream while we await DB insert to avoid overwhelming Prisma connection pool
            stream.pause();
            
            // Use upsert to avoid duplicate name errors
            await prisma.medicine.upsert({
              where: { name: name.substring(0, 190) }, // Prevent overly long names
              update: {},
              create: {
                name: name.substring(0, 190),
                price: price,
                requiresPrescription,
                manufacturer: company,
                category: category,
                stock: 100, // Default stock
                // Image intentionally omitted to avoid copyright issues, UI will render a placeholder
              }
            });
            
            fileInsertedCount++;
            totalInsertedCount++;
            if (fileInsertedCount % 100 === 0) {
              console.log(`...Inserted ${fileInsertedCount} medicines from ${file}`);
            }
            
            stream.resume();
          } catch (e) {
            // Ignore duplicate constraint or minor errors
            stream.resume();
          }
        });

        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
        stream.on('close', () => resolve());
      });
    }

    console.log(`✅ Seeding Complete! Successfully inserted ${totalInsertedCount} real medicines.`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedDummyData() {
  const dummyMedicines = [
    { name: "Paracetamol 500mg", price: 30, requiresPrescription: false, manufacturer: "Generic", category: "OTC Products", stock: 100 },
    { name: "Amoxicillin 250mg", price: 120, requiresPrescription: true, manufacturer: "PharmaCorp", category: "Prescription Drugs", stock: 50 },
    { name: "Cetirizine 10mg", price: 45, requiresPrescription: false, manufacturer: "AllergyMeds", category: "OTC Products", stock: 200 }
  ];

  for (const med of dummyMedicines) {
    await prisma.medicine.upsert({
      where: { name: med.name },
      update: {},
      create: med
    });
  }
  console.log(`✅ Inserted ${dummyMedicines.length} dummy medicines.`);
  await prisma.$disconnect();
}

seed();
