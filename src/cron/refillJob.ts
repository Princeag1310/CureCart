import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { MarketingService } from "../services/marketing.service";

const prisma = new PrismaClient();

console.log("🚀 Starting CureCart Refill Cron Service...");

// Schedule a job to run every day at midnight (0 0 * * *)
cron.schedule("0 0 * * *", async () => {
  console.log("🕒 Running daily refill check at", new Date().toISOString());

  try {
    // We want to find orders that were created EXACTLY 25 days ago.
    // Why 25? Because medicines usually last 30 days. Reminding them on day 25 gives them 5 days to reorder.
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
    
    // We create a start and end of that specific day to query the DB
    const startOfDay = new Date(twentyFiveDaysAgo.setHours(0, 0, 0, 0));
    const endOfDay = new Date(twentyFiveDaysAgo.setHours(23, 59, 59, 999));

    const pastOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "COMPLETED" // Or whichever status means it was delivered
      },
      include: {
        user: true,
      }
    });

    console.log(`Found ${pastOrders.length} orders from 25 days ago.`);

    for (const order of pastOrders) {
      if (order.user.email) {
        // Tag them as "Refill Needed" in MailerPro so the marketing system automatically sends them an email campaign!
        await MarketingService.syncUserToMailerPro(
          order.user.email, 
          order.user.name || "Customer", 
          ["Refill Needed", "CureCart"]
        );
      }
    }

  } catch (error) {
    console.error("❌ Cron job failed:", error);
  }
});

// Keep process alive if running standalone
setInterval(() => {}, 1000 * 60 * 60); 
