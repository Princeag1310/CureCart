import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// The path to the downloaded CSV files
const CSV_DIR = path.resolve('/Users/prince_agrawal/Downloads/1mg web scraping/All Medicines');

// We limit the number of rows inserted across all files to avoid overloading the free database
const MAX_MEDICINES_TO_SEED = 200; 

async function seed() {
  console.log('🌱 Starting Database Seeding from 1mg CSV files...');

  try {
    const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
    let insertedCount = 0;

    for (const file of files) {
      if (insertedCount >= MAX_MEDICINES_TO_SEED) {
        break;
      }

      console.log(`Processing file: ${file}`);
      const filePath = path.join(CSV_DIR, file);

      await new Promise<void>((resolve, reject) => {
        const stream = fs.createReadStream(filePath).pipe(csv());
        
        stream.on('data', async (row) => {
          if (insertedCount >= MAX_MEDICINES_TO_SEED) {
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
                description: description,
                category: category,
                stock: 100, // Default stock
                // Image intentionally omitted to avoid copyright issues, UI will render a placeholder
              }
            });
            
            insertedCount++;
            if (insertedCount % 50 === 0) {
              console.log(`...Inserted ${insertedCount} medicines`);
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

    console.log(`✅ Seeding Complete! Successfully inserted ${insertedCount} real medicines.`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
