import "reflect-metadata";
import * as oracledb from "oracledb";
import { DataSource, Repository, EntityTarget, ObjectLiteral } from "typeorm";
import constants from "../helpers/constants"; 

const useCompiledEntities = process.env.USE_COMPILED_ENTITIES === "true";

// ==================== ORACLE CLIENT INIT ====================
try {
  oracledb.initOracleClient({
    libDir:
      constants.DATABASE.ORACLE_INSTANT_CLIENT_PATH ||
      process.env.ORACLE_INSTANT_CLIENT_PATH,
  });
  console.log("Oracle thick mode initialized");
} catch (err) {
  console.error("Error initializing Oracle thick mode:", err);
  console.log("Using thin mode as fallback");
}

// ==================== RAW ORACLE CONFIG ====================
const dbConfig: oracledb.PoolAttributes = {
  user: constants.DATABASE.ORACLE_USER || process.env.ORACLE_USER,
  password:
    constants.DATABASE.ORACLE_PASSWORD ||
    process.env.ORACLE_PASSWORD,
  connectString:
    constants.DATABASE.ORACLE_CONNECTION_STRING ||
    process.env.ORACLE_CONNECTION_STRING,
  poolMin: 5,
  poolMax: 50,
  poolIncrement: 2,
  poolTimeout: 60,
};

let oraclePool: oracledb.Pool | null = null;

// ==================== TYPEORM CONFIG - FIXED ====================
export const AppDataSource = new DataSource({
  type: "oracle",
  connectString:
    constants.DATABASE.ORACLE_CONNECTION_STRING ||
    process.env.ORACLE_CONNECTION_STRING ,
  username: constants.DATABASE.ORACLE_USER || process.env.ORACLE_USER ,
  password:
    constants.DATABASE.ORACLE_PASSWORD ||
    process.env.ORACLE_PASSWORD,
  synchronize: false,
  logging: true,
  entities: [
    useCompiledEntities ? "build/src/entity/**/*.js" : "src/entity/**/*.ts",
    useCompiledEntities ? "build/src/entities/**/*.js" : "src/entities/**/*.ts",
    useCompiledEntities ? "build/src/jasra/entities/*.js" : "src/jasra/entities/*.ts",
  ],
  migrations: [useCompiledEntities ? "build/src/migration/**/*.js" : "src/migration/**/*.ts"],
  subscribers: [useCompiledEntities ? "build/src/subscriber/**/*.js" : "src/subscriber/**/*.ts"],
  extra: {
    poolMin: 5,
    poolMax: 50,
    poolIncrement: 2,
    poolTimeout: 60,
  },
});

// ==================== TYPEORM SERVICE ====================
class TypeORMService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (!AppDataSource.isInitialized) {
        console.log("Attempting TypeORM connection...");
        console.log("TypeORM Config:", {
          type: "oracle",
          connectString:
            constants.DATABASE.ORACLE_CONNECTION_STRING ||
            process.env.ORACLE_CONNECTION_STRING,
          username: process.env.ORACLE_USER,
        });

        await AppDataSource.initialize();
        console.log("TypeORM Connected to Oracle Database");

        // Set session parameters
        await AppDataSource.query(
          "ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS'"
        );

        this.initialized = true;
      }
    } catch (error) {
      console.error("TypeORM connection failed:", error);
      console.log("TypeORM failed, but raw Oracle connection may be active");
    }
  }

  static getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>
  ): Repository<T> {
    if (!AppDataSource.isInitialized) {
      throw new Error("TypeORM not initialized. Call initialize() first.");
    }
    if (!this.initialized && AppDataSource.isInitialized) {
      this.initialized = true;
    }

    return AppDataSource.getRepository(entity);
  }

  static async close(): Promise<void> {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      this.initialized = false;
      console.log("TypeORM connection closed");
    } else {
      this.initialized = false;
    }
  }

  static isConnected(): boolean {
    return AppDataSource.isInitialized || this.initialized;
  }
}

// ==================== BIND PARAMETER HELPER ====================
function processBindParameters(binds: any): any {
  if (!binds) return {};

  const processedBinds: any = {};

  for (const [key, value] of Object.entries(binds)) {
    if (value === undefined || value === null) {
      processedBinds[key] = { val: null };
    }
    else if (
      value &&
      typeof value === "object" &&
      ("val" in value ||
        "dir" in value ||
        "type" in value ||
        "maxSize" in value)
    ) {
      processedBinds[key] = value;
    }
    else if (
      value &&
      typeof value === "object" &&
      Object.keys(value).length === 0
    ) {
      processedBinds[key] = { val: null };
    } else {
      processedBinds[key] = { val: value };
    }
  }

  return processedBinds;
}

// ==================== RAW ORACLE FUNCTIONS ====================
export const oracleDb = {
  authenticate: async (): Promise<void> => {
    try {
      oraclePool = await oracledb.createPool(dbConfig);
      console.log(" Oracle Database Connected (Thick Mode)");
    } catch (error: unknown) {
      console.error(
        "Oracle connection failed:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

  getConnection: async (): Promise<oracledb.Connection> => {
    if (!oraclePool)
      throw new Error("Database not connected. Call authenticate() first.");
    return await oraclePool.getConnection();
  },

  withTransaction: async <T>(
    fn: (conn: oracledb.Connection) => Promise<T>
  ): Promise<T> => {
    const conn = await oracleDb.getConnection();
    try {
      await conn.execute("BEGIN NULL; END;");
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      await conn.close();
    }
  },

  query: async (
    sql: string,
    binds?: any,
    conn?: oracledb.Connection
  ): Promise<any> => {
    const useExternalConn = Boolean(conn);
    let connection: oracledb.Connection | undefined;

    try {
      connection = conn ?? (await oracleDb.getConnection());
      const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: !useExternalConn,
      };

      // Process bind parameters to ensure proper format
      const processedBinds = processBindParameters(binds || {});
      const result = await connection.execute(sql, processedBinds, options);
      return result;
    } catch (error: unknown) {
      console.error(
        "Query failed:",
        error instanceof Error ? error.message : String(error)
      );
      console.error("SQL that failed:", sql);
      console.error("Bind parameters:", binds);
      throw error;
    } finally {
      if (connection && !useExternalConn) {
        try {
          await connection.close();
        } catch (err) {
          console.error("Error closing connection:", err);
        }
      }
    }
  },

  close: async (): Promise<void> => {
    if (oraclePool) {
      await oraclePool.close();
      oraclePool = null;
    }
  },

  processBindParameters,
};

// ==================== CONNECTION INITIALIZATION ====================
export const initializeAllConnections = async (): Promise<void> => {
  // Validate config early so we can show a helpful message
  const cfgUser =
    constants.DATABASE.ORACLE_USER || process.env.ORACLE_USER || "";
  const cfgPass =
    constants.DATABASE.ORACLE_PASSWORD || process.env.ORACLE_PASSWORD || "";
  const cfgConn =
    constants.DATABASE.ORACLE_CONNECTION_STRING ||
    process.env.ORACLE_CONNECTION_STRING ||
    "";

  if (!cfgUser || !cfgPass || !cfgConn) {
    console.warn(
      "Oracle DB credentials appear to be missing. Skipping DB initialization.\n" +
        "Set ORACLE_USER, ORACLE_PASSWORD and ORACLE_CONNECTION_STRING (or update constants) to enable DB connections."
    );
    return;
  }

  try {
    await oracleDb.authenticate();
    await oracleDb.query("SELECT 1 FROM DUAL");
    await oracleDb.query(
      "ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS'"
    );

    console.log("Raw Oracle connection established and session configured");
  } catch (error) {
    console.error(
      "Raw Oracle initialization failed. Application will continue but DB features may be unavailable.",
      error
    );
    console.warn(
      "If this is unexpected, verify ORACLE_USER/ORACLE_PASSWORD/ORACLE_CONNECTION_STRING are correct."
    );
  }

  try {
    await TypeORMService.initialize();
    console.log(" TypeORM connection established");
  } catch (typeormError) {
    console.warn(
      "TypeORM connection failed, but raw Oracle (if initialized) may still be working:",
      typeormError
    );
  }

  console.log(
    " Database connections initialization complete (some connections may be unavailable)"
  );
};

export const closeAllConnections = async (): Promise<void> => {
  await oracleDb.close();
  await TypeORMService.close();
  console.log("All database connections closed");
};

// ==================== BACKWARD COMPATIBILITY ====================
export const databaseConnection = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      await oracleDb.authenticate();
      await oracleDb.query(
        "ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS'"
      );
      console.log("Oracle Database Connected and Session Set");
      resolve(true);
    } catch (error: unknown) {
      console.error(
        "Oracle authentication failed in databaseConnection check:",
        error
      );
      resolve(false);
    }
  });
};

// ==================== EXPORTS ====================
export { TypeORMService };
export const getRepository = TypeORMService.getRepository.bind(TypeORMService);
export const isTypeOrmConnected = TypeORMService.isConnected;
export const closeTypeOrmConnection = TypeORMService.close;

// ==================== BIND PARAMETER UTILITY (for external use) ====================
export const createBindObject = (value: any): any => {
  return { val: value };
};

export const createBindObjects = (
  params: Record<string, any>
): Record<string, any> => {
  return processBindParameters(params);
};
