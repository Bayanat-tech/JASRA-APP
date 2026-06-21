import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";
import { TBasicBrequest } from "../../interfaces/Purchaseflow/Budgetflow.interface";

/**
 * Convert undefined → null (Oracle does NOT accept undefined bind values)
 */
const safe = (val: any) => (val === undefined ? null : val);

/**
 * Upsert Budget Request using existing connection from oracleDb
 */
export async function upsertBudgetRequest(data: TBasicBrequest) {
  let connection: oracledb.Connection | undefined;

  try {
    connection = await oracleDb.getConnection();

    console.log("Starting upsertBudgetRequest...");
    console.log("Request Number:", data.request_number);

    const isInsert = !data.request_number || data.request_number === "";
    console.log("isInsert:", isInsert);

    // ===================================================================
    // UPDATE LOGIC
    // ===================================================================
    if (data.last_action === "SUBMITTED" || !isInsert) {
      console.log(">>> Running UPDATE block");

      await connection.execute(
        `
        UPDATE PURCHASE_REQUEST_HEADER
        SET 
          LAST_ACTION = :lastAction,
          DESCRIPTION = :description,
          REMARKS = :remarks,
          UPDATED_BY = :updatedBy,
          LAST_UPDATED = SYSDATE,
          HISTORY_SERIAL = 1
        WHERE request_number = :requestNumber
          AND company_code = :companyCode
        `,
        {
          lastAction: safe(data.last_action),
          description: safe(data.description),
          remarks: safe(data.remarks),
          updatedBy: safe(data.updated_by),
          requestNumber: safe(data.request_number),
          companyCode: safe(data.company_code),
        },
        { autoCommit: false }
      );

      await connection.execute(
        `BEGIN 
            PROC_LOADMESSAGEBOX(:screen, :msgType, :doc, :usr, :message); 
         END;`,
        {
          screen: "BUDGETSUBMIT",
          msgType: "success",
          doc: safe(data.request_number),
          usr: safe(data.updated_by),
          message: "Transaction Updated Successfully",
        }
      );

      await connection.commit();
      console.log(">>> UPDATE committed successfully");

      return { requestNumber: data.request_number };
    }

    // ===================================================================
    // INSERT LOGIC
    // ===================================================================
    console.log(">>> Running INSERT block");

    const requestDate =
      data.request_date && !isNaN(new Date(data.request_date).getTime())
        ? new Date(data.request_date)
        : new Date();

    await connection.execute(
      `
      INSERT INTO PURCHASE_REQUEST_HEADER (
        company_code,
        request_date,
        description,
        remarks,
        last_action,
        project_code,
        updated_by,
        created_by,
        flow_type,
        flow_code,
        flow_level_running,
        flow_level_initial,
        flow_level_final
      )
      VALUES (
        :company,
        :reqDate,
        :description,
        :remarks,
        :lastAction,
        :project,
        :updatedBy,
        :createdBy,
        'BUDGET',
        '003',
        1,
        1,
        3
      )
      `,
      {
        company: safe(data.company_code),
        reqDate: requestDate,
        description: safe(data.description),
        remarks: safe(data.remarks),
        lastAction: safe(data.last_action),
        project: safe(data.project_code),
        updatedBy: safe(data.updated_by),
        createdBy: safe(data.created_by),
      },
      { autoCommit: false }
    );

    console.log("1");

    // ===================================================================
    // GET GENERATED REQUEST NUMBER
    // ===================================================================

   const result = await connection.execute<{ CODE: string }>(
  `
  SELECT CODE 
  FROM GT_SESSION_INFO_JASRA
  FETCH FIRST 1 ROW ONLY
  `,
  {}, // No bind variables needed
  { outFormat: oracledb.OUT_FORMAT_OBJECT }
);
    const generatedRequestNumber = result.rows?.[0]?.CODE;

    console.log("Generated Request Number:", generatedRequestNumber);
    console.log("2");

    await connection.execute(
      `BEGIN 
         PROC_LOADMESSAGEBOX(:screen, :msgType, :doc, :usr, :message); 
       END;`,
      {
        screen: "BUDGETSUBMIT",
        msgType: "success",
        doc: generatedRequestNumber,
        usr: safe(data.updated_by),
        message: `Generated Request Number: ${generatedRequestNumber}`,
      }
    );

    await connection.commit();
    console.log("3");

    return { requestNumber: generatedRequestNumber };
  } catch (error) {
    console.error("Error in upsertBudgetRequest:", error);

    if (connection) {
      await connection.execute(
        `BEGIN 
           PROC_LOADMESSAGEBOX('TRNFAIL', 'error', :doc, :usr, ''); 
         END;`,
        {
          doc: safe(data.request_number),
          usr: safe(data.updated_by),
        }
      );

      await connection.rollback();
    }
    console.log("4");

    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("❌ Error closing Oracle connection:", closeError);
      }
    }
  }
}
