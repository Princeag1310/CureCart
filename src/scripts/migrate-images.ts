import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import ImageKit from 'imagekit';
import dotenv from 'dotenv';

// Load environment variables for local script execution
dotenv.config();

const prisma = new PrismaClient();

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
const DELAY_BETWEEN_UPLOADS_MS = 1000;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function migrateImages() {
  console.log('🚀 Starting Image Migration to ImageKit...');

  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
    console.error('❌ Missing ImageKit environment variables in .env');
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
    let totalProcessed = 0;
    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalNotFoundInDB = 0;

    for (const file of files) {
      console.log(`\n📂 Processing file: ${file}`);
      const filePath = path.join(CSV_DIR, file);

      await new Promise<void>((resolve, reject) => {
        const stream = fs.createReadStream(filePath).pipe(csv());
        let fileProcessedCount = 0;

        stream.on('data', async (row) => {
          if (fileProcessedCount >= MAX_MEDICINES_PER_FILE) {
            stream.destroy();
            return;
          }
          fileProcessedCount++;

          stream.pause(); // Pause stream to wait for async upload/db operation

          try {
            const name = row['Name'];
            let imageUrl = row['Image_URL'];

            if (!name || !imageUrl) {
              stream.resume();
              return;
            }

            // 1. Skip dummy placeholder images
            if (imageUrl.includes(PLACEHOLDER_IMG_ID)) {
              totalSkipped++;
              stream.resume();
              return;
            }

            const truncatedName = name.substring(0, 190);

            // 2. Check if medicine actually exists in our local database
            const medicine = await prisma.medicine.findUnique({
              where: { name: truncatedName }
            });

            if (!medicine) {
              totalNotFoundInDB++;
              stream.resume();
              return;
            }

            // Skip if image is already populated
            if (medicine.image && medicine.image.includes('ik.imagekit.io')) {
              stream.resume();
              return;
            }

            totalProcessed++;
            console.log(`[${totalProcessed}] Uploading image for: ${truncatedName}`);

            // 3. Upload to ImageKit (pass the 1mg URL directly)
            const sanitizedFileName = truncatedName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
            
            const uploadResponse = await imagekit.upload({
              file: imageUrl, // Can be a URL
              fileName: sanitizedFileName,
              folder: '/curecart/medicines',
            });

            // 4. Update Prisma Database
            await prisma.medicine.update({
              where: { id: medicine.id },
              data: {
                image: uploadResponse.url
              }
            });

            totalUploaded++;
            
            // Respect API rate limits
            await delay(DELAY_BETWEEN_UPLOADS_MS);
            
            stream.resume();
          } catch (e: any) {
            console.error(`❌ Failed to process ${row['Name']}:`, e.message);
            await delay(DELAY_BETWEEN_UPLOADS_MS); // Still delay on error
            stream.resume();
          }
        });

        stream.on('end', () => resolve());
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
