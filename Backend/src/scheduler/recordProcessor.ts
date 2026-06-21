import cron from "node-cron";
import { processSubmittedRecords } from "../controllers/Vendor/vendorupdation.controller";

// Schedule the task to run every 2 minutes
cron.schedule("*/2 * * * *", async () => {
  console.log("Scheduler triggered: Checking for submitted records...");
  await processSubmittedRecords();
});
