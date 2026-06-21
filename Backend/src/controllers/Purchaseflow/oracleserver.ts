import express, { Request, Response } from "express";
import cors from "cors";
import oracledb from "oracledb";

const app = express();
const PORT = 5000;

// Enable CORS to allow frontend requests
app.use(cors());

// Set global fetch format to return objects
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Function to run a query in OracleDB
async function runQuery(query: string): Promise<unknown[]> {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: "QAJAS",
      password: "QAJAS123",
      connectString:
        "(DESCRIPTION=(CONNECT_TIMEOUT=5)(TRANSPORT_CONNECT_TIMEOUT=3)(RETRY_COUNT=3)(ADDRESS_LIST=(LOAD_BALANCE=on)(ADDRESS=(PROTOCOL=TCP)(HOST=10.10.2.56)(PORT=1521)))(CONNECT_DATA=(SERVICE_NAME=BayanDB_dxb1c4.jumpsn.prodvcn.oraclevcn.com)))",
    });

    const result = await connection.execute(query);
    console.log("result", result);
    // Ensure result.rows is always an array (Fixes TypeScript warning)
    return result.rows ?? [];
  } catch (err) {
    console.error("Database error:", err);
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// API endpoint to get system date from OracleDB
app.get("/getSysDate", async (_req: Request, res: Response) => {
  try {
    const rows = await runQuery("SELECT SYSDATE AS SYSDATE FROM DUAL");

    if (rows.length > 0) {
      res.json({ sysdate: (rows[0] as { SYSDATE: Date }).SYSDATE });
    } else {
      res.status(404).json({ error: "No data found" });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Start the Express server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
