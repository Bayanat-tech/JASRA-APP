import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";
import { TBasicBrequest } from "../../interfaces/Purchaseflow/Budgetflow.interface";

export async function upsertBudgetRequest(data: TBasicBrequest) {
  let connection;

  try {
    connection = await oracleDb.getConnection();
    await connection.execute("ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS'");

    let ls_insert = "NO";
    if (!data.request_number) ls_insert = "YES";
    console.log('ls_insert', ls_insert);

    if (data.last_action === "SUBMITTED" || ls_insert === "NO") {
      // UPDATE existing record
      await connection.execute(
        `UPDATE PURCHASE_REQUEST_HEADER
         SET LAST_ACTION = :lastAction,
             DESCRIPTION = :description,
             REMARKS = :remarks,
             UPDATED_BY = :updatedBy,
             LAST_UPDATED = SYSDATE,
             HISTORY_SERIAL = 1
         WHERE REQUEST_NUMBER = :requestNumber
           AND COMPANY_CODE = :companyCode`,
        {
          lastAction: data.last_action,
          description: data.description,
          remarks: data.remarks,
          updatedBy: data.updated_by,
          requestNumber: data.request_number,
          companyCode: data.company_code,
        }
      );

      // Call message procedure
      await connection.execute(
        `BEGIN PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, 'Transaction Updated Successfully'); END;`,
        {
          screen: "BUDGETSUBMIT",
          type: "success",
          document_number: data.request_number,
          userId: data.updated_by,
        }
      );

      await connection.commit();
      return { requestNumber: data.request_number };
    }

    // INSERT new record
    const requestDate = data.request_date || new Date();
    await connection.execute(
      `INSERT INTO PURCHASE_REQUEST_HEADER (
         COMPANY_CODE, REQUEST_DATE, DESCRIPTION, REMARKS, LAST_ACTION,
         PROJECT_CODE, UPDATED_BY, CREATED_BY, FLOW_TYPE, FLOW_CODE,
         FLOW_LEVEL_RUNNING, FLOW_LEVEL_INITIAL, FLOW_LEVEL_FINAL
       ) VALUES (
         :companyCode, :requestDate, :description, :remarks, :lastAction,
         :projectCode, :updatedBy, :createdBy, :flowType, '003', 1, 1, 3
       )`,
      {
        companyCode: data.company_code,
        requestDate,
        description: data.description,
        remarks: data.remarks || null,
        lastAction: data.last_action,
        projectCode: data.project_code,
        updatedBy: data.updated_by || null,
        createdBy: data.created_by,
        flowType: "BUDGET",
      }
    );

    // Generate new request number
    const result = await connection.execute(
      `SELECT 'BUDGET$' || LPAD(TO_CHAR(NVL(MAX(TO_NUMBER(SUBSTR(REQUEST_NUMBER, INSTR(REQUEST_NUMBER,'$',-1)+1))),0)+1),5,'0') AS REQUEST_NUMBER
       FROM PURCHASE_REQUEST_HEADER
       WHERE COMPANY_CODE = :companyCode
         AND REQUEST_NUMBER LIKE 'BUDGET%'`,
      { companyCode: data.company_code },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const requestNumber = result.rows?.[0]?.REQUEST_NUMBER;
    console.log("Generated Request Number:", requestNumber);

    await connection.execute(
      `BEGIN PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, :message); END;`,
      {
        screen: "BUDGETSUBMIT",
        type: "success",
        document_number: requestNumber,
        userId: data.updated_by,
        message: `Generated Request Number: ${requestNumber.replace(/\$/g, '/')}`,
      }
    );

    await connection.commit();
    return { requestNumber };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in upsertBudgetRequestOracle:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}


export const insertBudgetCost = async (
  value: TCostbudget,
  transaction: any
): Promise<void> => {
  try {
    if (value.requested_amt === 0) {
      return;
    }
    const sql = `
      INSERT INTO MS_PROJ_COST_MONTHWISE_BUDGET (
        PROJECT_CODE, COST_CODE, COMPANY_CODE, USER_DT, USER_ID,
        MONTH_BUDGET, BUDGET_YEAR, REQUEST_NUMBER, REQUESTED_AMT,
        APPROVED_AMT, FINAL_APPROVED, REQUESTED_DATE
      ) VALUES (
        ?, ?, ?, CURDATE(), ?,
        ?, ?, ?, ?, ?, NULL, CURDATE()
      );
    `;

    const params = [
      value.project_code,
      value.cost_code,
      value.company_code,
      null, // Adjusted user ID retrieval
      value.month_budget,
      value.budget_year ?? "", // Ensure budget_year exists
      value.request_number,
      value.requested_amt,
      value.approved_amt,
    ];

    await sequelize.query(sql, {
      replacements: params,
      transaction,
    });

    console.log("after insert Budget cost inserted successfully:", value);
  } catch (error: any) {
    console.error(
      "Error inserting budget cost, transaction rolled back:",
      error.message
    );
    throw new Error("Failed to insert budget cost");
  }
};
