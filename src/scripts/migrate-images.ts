import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import ImageKit from 'imagekit';
import dotenv from 'dotenv';

// Load environment variables for local script execution
dotenv.config();

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connection_limit')) {
  dbUrl = dbUrl.includes('?') ? `${dbUrl}&connection_limit=3` : `${dbUrl}?connection_limit=3`;
}

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

// The path to the downloaded CSV files
const CSV_DIR = path.resolve('/Users/prince_agrawal/Downloads/1mg web scraping/All Medicines');

// The dummy image used by 1mg for "No preview available"
const PLACEHOLDER_IMG_ID = 'hx2gxivwmeoxxxsc1hix.png';

const MAX_MEDICINES_PER_FILE = 500;
const BATCH_SIZE = 5; // Reduced to 5 to prevent Prisma Aiven DB pool exhaustion

async function processBatch(rows: any[]) {
  let uploaded = 0;
  let skipped = 0;
  let notFound = 0;

  const promises = rows.map(async (row) => {
    try {
      const name = row['Name'];
      let imageUrl = row['Image_URL'];

      if (!name || !imageUrl) return;

      if (imageUrl.includes(PLACEHOLDER_IMG_ID)) {
        skipped++;
        return;
      }

      const truncatedName = name.substring(0, 190);

      const medicine = await prisma.medicine.findUnique({
        where: { name: truncatedName }
      });

      if (!medicine) {
        notFound++;
        return;
      }

      if (medicine.image && medicine.image.includes('ik.imagekit.io')) {
        return;
      }

      const sanitizedFileName = truncatedName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
      
      const uploadResponse = await imagekit.upload({
        file: imageUrl, 
        fileName: sanitizedFileName,
        folder: '/curecart/medicines',
      });

      await prisma.medicine.update({
        where: { id: medicine.id },
        data: { image: uploadResponse.url }
      });

      uploaded++;
      console.log(`[Batch] Uploaded: ${truncatedName}`);
    } catch (e: any) {
      console.error(`❌ Failed to process ${row['Name']}:`, e.message);
    }
  });

  await Promise.all(promises);
  return { uploaded, skipped, notFound };
}

async function migrateImages() {
  console.log('🚀 Starting Concurrent Image Migration to ImageKit...');

  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
    console.error('❌ Missing ImageKit environment variables in .env');
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalNotFoundInDB = 0;

    for (const file of files) {
      console.log(`\n📂 Processing file: ${file}`);
      const filePath = path.join(CSV_DIR, file);

      await new Promise<void>((resolve, reject) => {
        const stream = fs.createReadStream(filePath).pipe(csv());
        let fileProcessedCount = 0;
        let batch: any[] = [];

        stream.on('data', async (row) => {
          if (fileProcessedCount >= MAX_MEDICINES_PER_FILE) {
            stream.destroy();
            return;
          }
          fileProcessedCount++;
          batch.push(row);

          if (batch.length >= BATCH_SIZE) {
            stream.pause();
            const currentBatch = [...batch];
            batch = [];
            
            processBatch(currentBatch).then((results) => {
              totalUploaded += results.uploaded;
              totalSkipped += results.skipped;
              totalNotFoundInDB += results.notFound;
              stream.resume();
            });
          }
        });

        stream.on('end', async () => {
          if (batch.length > 0) {
            const results = await processBatch(batch);
            totalUploaded += results.uploaded;
            totalSkipped += results.skipped;
            totalNotFoundInDB += results.notFound;
          }
          resolve();
        });
        stream.on('error', (err) => reject(err));
        stream.on('close', () => resolve());
      });
    }

    console.log(`\n✅ Image Migration Complete!`);
    console.log(`📊 Total Uploaded: ${totalUploaded}`);
    console.log(`⏭️ Total Skipped (Placeholders): ${totalSkipped}`);
    console.log(`⚠️ Not Found in DB: ${totalNotFoundInDB}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();
