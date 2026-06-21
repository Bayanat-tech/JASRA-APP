import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { initializeAllConnections } from "./src/database/connection";
import "./src/utils/passport";
import { logError } from "./src/utils/logError";
import constants from "./src/helpers/constants";

const app = express();

const ENV = process.env.NODE_ENV || "LOCAL";

// Process-level handlers: always report; exit for uncaught exceptions
process.on("uncaughtException", async (err: any) => {
  console.error("Uncaught Exception:", err);
  await logError(err, { note: "uncaughtException" });
  process.exit(1);
});

process.on("unhandledRejection", async (reason: any) => {
  console.error("Unhandled Rejection:", reason);
  await logError(reason, { note: "unhandledRejection" });
});

// MIDDLEWARE
app.use(cors());
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ---------------- ROUTES ----------------
import accountsRoutes from "./src/routes/accounts/reports/ageing/ageing_accounts.routes";
import authRoutes from "./src/routes/auth.routes";
import fileRoutes from "./src/routes/files.routes";
import financeRoutes from "./src/routes/finance/finance.routes";
import hrRoutes from "./src/routes/hr.routes";
import logRoutes from "./src/routes/notification.routes";
import pfRoutes from "./src/routes/pf.routes";
import pfbtflowRoutes from "./src/routes/BT-FLOW.routes";
import secRoutes from "./src/routes/secuity.routes";
import editLangrouter from "./src/routes/user/user.routes";
import VendorRouter from "./src/routes/vendor.routes";
import wmsRoutes from "./src/routes/wms.routes";
import boldReportsRoutes from "./src/routes/boldreports.routes";
import cfsRoutes from "./src/routes/SMS/sms.routes";
import qrRoutes from "./src/routes/qr.routes";

// Public QR Authentication Routes
app.use("/api/qr", qrRoutes);

app.use("/api/files", fileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", boldReportsRoutes);
app.use("/api/security", secRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/pf", pfRoutes);
app.use("/api/notification", logRoutes);
app.use("/api/vendor", VendorRouter);
app.use("/api/wms", wmsRoutes);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(constants.STATUS_CODES.OK).send("Server is up and running.");
});

// 404 forwarder - ensure unknown routes are reported
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error(`Not Found: ${req.originalUrl}`);
  err.status = constants.STATUS_CODES.NOT_FOUND;
  next(err);
});

//  EXPRESS ERROR HANDLER (VERY IMPORTANT)
app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Express Error:", err);

  await logError(err, { url: req.originalUrl, method: req.method });

  const status = err?.status || constants.STATUS_CODES.INTERNAL_SERVER_ERROR;
  res.status(status).json({
    message: status === constants.STATUS_CODES.NOT_FOUND ? "Not Found" : "Internal Server Error",
  });
});

// ---------------- SERVER START ----------------

const PORT = process.env.PORT || 3500;

async function startServerWithTypeORM() {
  try {
    console.log("Initializing TypeORM and Oracle connections...");

    await initializeAllConnections();
    console.log("All database connections established");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`TypeORM is ready for model conversion`);
    });
  } catch (err: any) {
    console.error("Error in database connection:", err);
    await logError(err, { note: "DATABASE CONNECTION ERROR" });
    process.exit(1);
  }
}

startServerWithTypeORM();