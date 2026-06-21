// import cron from "node-cron";
// import { processApprovedLeaveRequests } from "../controllers/HR/hr_leave_approval";

// // Run every 5 minutes
// const SCHEDULE_INTERVAL = "*/1 * * * *";

// export function startLeaveRequestScheduler() {
//   console.log("Starting Leave Request Scheduler...");

//   cron.schedule(SCHEDULE_INTERVAL, async () => {
//     try {
//       console.log("Running scheduled leave request processing...");
//       await processApprovedLeaveRequests();
//     } catch (error) {
//       console.error("Error in leave request scheduler:", error);
//     }
//   });
// }
