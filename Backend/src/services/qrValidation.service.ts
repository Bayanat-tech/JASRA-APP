import * as oracledb from "oracledb";
import constants from "../helpers/constants";

interface QRValidationResult {
  isValid: boolean;
  message: string;
  qrCode?: string;
  type?: string;
  timestamp?: string;
  encryptedKey?: string;
}

// ==================== ORACLE CLIENT INIT ====================
try {
  oracledb.initOracleClient({
    libDir:
      constants.DATABASE.ORACLE_INSTANT_CLIENT_PATH ||
      process.env.ORACLE_INSTANT_CLIENT_PATH,
  });
  if (process.env.QR_LOG_VERBOSE === "true") console.log("Oracle thick mode initialized in QRValidationService");
} catch (err) {
  console.error("Error initializing Oracle thick mode in QRValidationService:", err);
  if (process.env.QR_LOG_VERBOSE === "true") console.log("Using thin mode as fallback in QRValidationService");
}

class QRValidationService {
  private qrPool: oracledb.Pool | null = null;
  async initializeQRPool(): Promise<void> {
    if (this.qrPool) {
      return; // Already initialized
    }

    try {
      if (process.env.QR_LOG_VERBOSE === "true") console.log("Initializing QR validation connection pool...");

      const qrConnectString =
        process.env.QR_ORACLE_CONNECTION_STRING ||
        (constants as any).QR_DB?.CONNECTION_STRING 

      const qrConfig: oracledb.PoolAttributes = {
        user: process.env.QR_ORACLE_USER || (constants as any).QR_DB?.USER,
        password: process.env.QR_ORACLE_PASSWORD || (constants as any).QR_DB?.PASSWORD,
        connectString: qrConnectString,
        poolMin: 2,
        poolMax: 5,
        poolIncrement: 1,
        poolTimeout: 60,
      };

      if (process.env.QR_LOG_VERBOSE === "true") {
        console.log("QR Pool Config:", {
          user: qrConfig.user,
          connectString: qrConfig.connectString || "(none)",
        });
      }

      this.qrPool = await oracledb.createPool(qrConfig);
      if (process.env.QR_LOG_VERBOSE === "true") console.log("✅ QR validation pool initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing QR pool:", error);
      throw new Error(`Failed to initialize QR validation pool: ${error}`);
    }
  }
 
  async validateQRCode(qrCode: string, type: string): Promise<QRValidationResult> {
    let connection: oracledb.Connection | null = null;

    try {
      // Ensure pool is initialized
      if (!this.qrPool) {
        await this.initializeQRPool();
      }

      connection = await this.qrPool!.getConnection();

      if (process.env.QR_LOG_VERBOSE === "true") console.log(`🔍 Validating QR Code: ${qrCode}, Type: ${type}`);

      const query = `
        SELECT 
          remarks,
          UTL_RAW.CAST_TO_VARCHAR2(
            HEXTORAW(TO_CHAR(remarks_encrypt))
          ) AS plain_text,
          type,
          created_date
        FROM TT_QR_CODE_loG
        WHERE type = :type
          AND remarks_encrypt IS NOT NULL
        ORDER BY created_date DESC
        FETCH FIRST 100 ROWS ONLY
      `;

      const result = await connection.execute(query, [type], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      if (process.env.QR_LOG_VERBOSE === "true") console.log(`📊 Query result rows: ${result.rows?.length || 0}`);

      if (!result.rows || result.rows.length === 0) {
        console.log("❌ No QR records found for type:", type);
        return {
          isValid: false,
          message: "QR is NOT VALID",
          type,
          qrCode,
        };
      }

      const rows = result.rows as any[];
      let isValidFound = false;

      for (const row of rows) {
        const decryptedValue = row.PLAIN_TEXT || row.plain_text;
        if (process.env.QR_LOG_VERBOSE === "true") console.log(`  - Comparing: "${qrCode}" === "${decryptedValue}"`);

        if (decryptedValue && decryptedValue.trim() === qrCode.trim()) {
          console.log("✅ QR Code matched!");
          isValidFound = true;
          break;
        }
      }

      if (isValidFound) {
        if (process.env.QR_LOG_VERBOSE === "true") console.log("✅ QR validation successful");
        return {
          isValid: true,
          message: "QR is VALID",
          qrCode,
          type,
          timestamp: new Date().toISOString(),
        };
      } else {
        if (process.env.QR_LOG_VERBOSE === "true") console.log("❌ QR Code did not match any encrypted values");
        return {
          isValid: false,
          message: "QR is NOT VALID",
          qrCode,
          type,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("❌ Error validating QR code:", error);
      return {
        isValid: false,
        message: `Generic Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        qrCode,
        type,
      };
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }

  /**
   * Close the connection pool
   */
  async closeQRPool(): Promise<void> {
    if (this.qrPool) {
      try {
        await this.qrPool.close(0);
        this.qrPool = null;
        console.log("QR pool closed");
      } catch (error) {
        console.error("Error closing QR pool:", error);
      }
    }
  }

  /**
   * Test connection to QR database
   */
  async testQRConnection(): Promise<{ success: boolean; message: string }> {
    let connection: oracledb.Connection | null = null;

    try {
      // Ensure pool is initialized
      if (!this.qrPool) {
        await this.initializeQRPool();
      }

      connection = await this.qrPool!.getConnection();
      
      // Test query
      const result = await connection.execute("SELECT 1 FROM DUAL", [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (process.env.QR_LOG_VERBOSE === "true") console.log("✅ QR Database connection test successful");
      return {
        success: true,
        message: "QR Database connection is healthy",
      };
    } catch (error) {
      console.error("❌ QR Database connection test failed:", error);
      return {
        success: false,
        message: `QR Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }

  async validateQRByEncryptedKey(encryptedKey: string): Promise<QRValidationResult & { invoiceAmount?: string }> {
    let connection: oracledb.Connection | null = null;

    try {
      // Ensure pool is initialized
      if (!this.qrPool) {
        await this.initializeQRPool();
      }

      connection = await this.qrPool!.getConnection();

      if (process.env.QR_LOG_VERBOSE === "true") console.log(`🔍 Validating QR Code with encrypted key: ${encryptedKey.substring(0, 20)}...`);

      const query = `
        SELECT 
          INVOICE_TOTAL,
          remarks,
          remarks_encrypt,
          UTL_RAW.CAST_TO_VARCHAR2(
            HEXTORAW(TO_CHAR(remarks_encrypt))
          ) AS plain_text
        FROM TT_QR_CODE_loG
        WHERE remarks_encrypt = :encryptedKey
      `;

      const result = await connection.execute(query, [encryptedKey], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      if (process.env.QR_LOG_VERBOSE === "true") console.log(`Query result rows: ${result.rows?.length || 0}`);

      if (!result.rows || result.rows.length === 0) {
        console.log("No QR record found with encrypted key");
        return {
          isValid: false,
          message: "QR is NOT VALID",
          encryptedKey,
        };
      }

      const row = (result.rows as any[])[0];
      const invoiceAmountDb = row.INVOICE_TOTAL || row.invoice_total;
      const decryptedValue = row.PLAIN_TEXT || row.plain_text;

      // Try to extract invoice amount from decrypted plaintext if present
      let invoiceAmount: string | undefined = invoiceAmountDb ? invoiceAmountDb.toString() : undefined;
      if (decryptedValue && typeof decryptedValue === "string") {
        // Match patterns like 'Invoice Total: 25.83' or 'Invoice Total:25.83 OMR'
        const m = decryptedValue.match(/Invoice\s*Total\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/i);
        if (m && m[1]) {
          invoiceAmount = m[1].replace(",", ".");
        }
      }

      if (process.env.QR_LOG_VERBOSE === "true") console.log(`QR Code found! Decrypted value: "${decryptedValue}", Invoice Amount (chosen): ${invoiceAmount} (db:${invoiceAmountDb})`);

      return {
        isValid: true,
        message: "QR is VALID",
        qrCode: decryptedValue,
        type: row.TYPE || row.type,
        timestamp: new Date().toISOString(),
        invoiceAmount: invoiceAmount,
      };
    } catch (error) {
      console.error("❌ Error validating QR code with encrypted key:", error);
      return {
        isValid: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        encryptedKey,
      };
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.qrPool !== null;
  }
}

export default new QRValidationService();
