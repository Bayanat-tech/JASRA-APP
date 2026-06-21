import { oracleDb, databaseConnection } from "./src/database/connection";

async function main() {
  try {
    await databaseConnection();
    const [rows] = await oracleDb.query("SELECT * FROM SEC_LOGIN");
    console.log("SEC_LOGIN rows:", rows);
    await oracleDb.close();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
