import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";
import { format, parse } from "date-fns";

interface BudgetRow {
  project_code: string;
  cost_code: string;
  equal_amount: number;
  total_amount: number;
  from_date: string; // "dd/MM/yyyy"
  to_date: string;   // "dd/MM/yyyy"
}

interface RequestWithBody extends Request {
  body: {
    request_number: string;
    values: BudgetRow[];
  };
}

export const budgetExcelUpload = async (req: RequestWithBody, res: Response) => {
  let connection;

  try {
    connection = await oracleDb.getConnection();
    await connection.execute("ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS'");

    const { values, request_number } = req.body;

    console.log("Uploading budget data for request_number:", request_number);

    // Call initial procedure
    await connection.execute(`BEGIN PRO_MANAGE_BUDGET_GT_TABLES(); END;`);

    // Insert each row
    for (const row of values) {
      const {
        project_code,
        cost_code,
        equal_amount,
        total_amount,
        from_date,
        to_date,
      } = row;

      const l_FROM_DATE = parse(from_date, "dd/MM/yyyy", new Date());
      const l_TO_DATE = parse(to_date, "dd/MM/yyyy", new Date());

      if (isNaN(l_FROM_DATE.getTime()) || isNaN(l_TO_DATE.getTime())) {
        throw new Error(
          `Invalid date format: from_date=${from_date}, to_date=${to_date}`
        );
      }

      const formatted_FROM_DATE = format(l_FROM_DATE, "yyyy-MM-dd");
      const formatted_TO_DATE = format(l_TO_DATE, "yyyy-MM-dd");

      await connection.execute(
        `INSERT INTO GT_LOAD_BUDGET_DATA 
          (PROJECT_CODE, COST_CODE, EQUAL_AMOUNT, TOTAL_AMOUNT, FROM_DATE, TO_DATE)
         VALUES (:project_code, :cost_code, :equal_amount, :total_amount, 
                 TO_DATE(:from_date,'YYYY-MM-DD'), TO_DATE(:to_date,'YYYY-MM-DD'))`,
        {
          project_code,
          cost_code,
          equal_amount,
          total_amount,
          from_date: formatted_FROM_DATE,
          to_date: formatted_TO_DATE,
        }
      );
    }

    // Call procedure for request_number
    await connection.execute(`BEGIN PRO_load_DATA(:request_number); END;`, {
      request_number,
    });

    await connection.commit();
    console.log("✅ Budget data uploaded successfully!");

    res.status(200).json({
      success: true,
      message: `Data uploaded successfully, and procedure executed for request_number: ${request_number}!`,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error(
      "❌ Error uploading budget data:",
      error instanceof Error ? error.message : JSON.stringify(error)
    );

    res.status(500).json({
      success: false,
      message: "Failed to upload data or execute procedure",
      error: error instanceof Error ? error.message : error,
    });
  } finally {
    if (connection) await connection.close();
  }
};
