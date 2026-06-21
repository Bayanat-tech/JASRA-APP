import { Response } from "express";
import { Request } from "express";
import * as fastCsv from "fast-csv";
import { oracleDb } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { getSearchFilterQuery } from "../../../../helpers/functions";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { pickOrderSchema } from "../../../../validation/wms/transaction/outbound.validation";
import WmsCsvHeaders from "../../../../utils/exportCsv/WmsCsvHeaders";

// Function to get product stock details
export const getProductStockDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Parse filter from request query
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};
    
    // You'll need to adapt getSearchFilterQuery for raw SQL
    // This is a simplified version
    let whereClause = `WHERE company_code = :company_code`;
    const bindParams: any = { company_code: req.user.company_code };

    // TODO: Implement proper filtering logic from getSearchFilterQuery
    if (filter.search) {
      // Add your filtering logic here
      // For example: whereClause += " AND prod_code LIKE :prod_code"
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as count FROM VW_STKLED ${whereClause}`;
    const countResult = await oracleDb.query(countQuery, bindParams);
    const count = countResult.rows?.[0]?.COUNT || 0;

    // Main query with aggregation
    const mainQuery = `
      SELECT 
        p_uom,
        l_uom,
        prod_code,
        prod_name,
        prod_uppp,
        SUM(pqty_stock) as puomqty,
        SUM(lqty_stock) as luomqty,
        SUM(pqty_picked) as puompicked,
        SUM(lqty_picked) as luompicked,
        SUM(pqty_avl) as puomavl,
        SUM(lqty_avl) as luomavl,
        uom_count,
        site_code
      FROM VW_STKLED
      ${whereClause}
      GROUP BY 
        p_uom,
        l_uom,
        site_code,
        prod_code,
        prod_name,
        prod_uppp,
        uom_count
      ORDER BY prod_code
    `;

    const result = await oracleDb.query(mainQuery, bindParams);

    // Check if result is empty and respond accordingly
    if (!result.rows) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "No data found" });
      return;
    }

    // Send successful response with data
    res
      .status(constants.STATUS_CODES.OK)
      .json({ success: true, data: { tableData: result.rows, count } });
    return;
  } catch (error: unknown) {
    // Handle errors and send error response
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: knownError.message });
  }
};

// Function to get picking options
export const getPickingOption = async (req: RequestWithUser, res: Response) => {
  try {
    // Retrieve picking options based on company code
    const result = await oracleDb.query(
      `SELECT * FROM MS_PICKWAVE WHERE company_code = :company_code`,
      { company_code: req.user.company_code }
    );
    
    const pickingOption = result.rows || [];

    // Check if picking options are found
    if (!pickingOption.length) {
      res
        .status(constants.STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: "No picking options found" });
      return;
    }

    // Send successful response with picking options
    res
      .status(constants.STATUS_CODES.OK)
      .json({ success: true, data: pickingOption });
    return;
  } catch (error: unknown) {
    // Handle errors and send error response
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: knownError.message });
  }
};

// Function to get picking item preference details
export const getPickingItemPreferenceDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { distinct_field } = req.query;
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};
    
    // Simplified filtering - you'll need to adapt your actual filtering logic
    let whereClause = `WHERE company_code = :company_code`;
    const bindParams: any = { company_code: req.user.company_code };

    if (filter.search) {
      // Add your filtering logic here
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as count FROM VW_WM_OUB_JOB_PICK_FILTER ${whereClause}`;
    const countResult = await oracleDb.query(countQuery, bindParams);
    const resultCount = countResult.rows?.[0]?.COUNT || 0;

    // Distinct field query
    const distinctQuery = `
      SELECT DISTINCT ${distinct_field}
      FROM VW_WM_OUB_JOB_PICK_FILTER
      ${whereClause}
      ORDER BY ${distinct_field}
    `;

    const result = await oracleDb.query(distinctQuery, bindParams);

    // Check if result is empty and respond accordingly
    if (!result.rows) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "No data found" });
      return;
    }

    // Send successful response with data
    res
      .status(constants.STATUS_CODES.OK)
      .json({ 
        success: true, 
        data: { 
          tableData: result.rows.map((row:any) => ({ [distinct_field as string]: row[distinct_field as string] })), 
          count: resultCount 
        } 
      });
    return;
  } catch (error: unknown) {
    // Handle errors and send error response
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "error:" + knownError.message });
  }
};

// Function to confirm an order 
export const confirmorder = async (req: Request, res: Response): Promise<void> => {
  let connection: any;

  try {
    const { job_no } = req.params;
    const { prin_code, confirm_date } = req.query;

    if (!prin_code) {
      res.status(400).json({
        success: false,
        message: "Missing prin_code",
      });
      return;
    }

    const company_code = (req.user as any).company_code;

    // ---- FIX: format confirm date for Oracle ----
    const confirmDateObj = confirm_date
      ? new Date(confirm_date as string)
      : new Date();

    const formattedConfirmDate = confirmDateObj
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19); // YYYY-MM-DD HH24:MI:SS
    // --------------------------------------------

    let toggledPackets = 0;

    await oracleDb.withTransaction(async (conn: any) => {
      connection = conn;

      const updateSql = `
        UPDATE TO_BATCH
        SET selected = 'Y'
        WHERE company_code = :company_code
          AND prin_code   = :prin_code
          AND job_no      = :job_no
      `;

      const updateResult = await oracleDb.query(
        updateSql,
        {
          company_code,
          prin_code,
          job_no,
        },
        connection
      );

      toggledPackets = updateResult.rowsAffected || 0;

      if (toggledPackets > 0) {
        // ---- FIXED procedure call ----
       await oracleDb.query(
  `BEGIN
     SP_PICK_CONFIRM(
       :vs_company_code,
       :vs_principal_code,
       :vs_job_no,
       SYSDATE
     );
   END;`,
  {
    vs_company_code: company_code,
    vs_principal_code: prin_code,
    vs_job_no: job_no
  },
  connection
);

        // Unselect after procedure call
        const unselectSql = `
          UPDATE TO_BATCH
          SET selected = 'N'
          WHERE company_code = :company_code
            AND prin_code   = :prin_code
            AND job_no      = :job_no
        `;

        await oracleDb.query(
          unselectSql,
          {
            company_code,
            prin_code,
            job_no,
          },
          connection
        );
      }
    });

    res.status(200).json({
      success: true,
      message:
        toggledPackets > 0
          ? "Order confirmed successfully."
          : "No TO_BATCH records updated.",
    });

  } catch (err: any) {
    console.error("Confirm Order error:", err);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to process pick order.",
    });
  }
};



// Function to pick an order
export const pickOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // DEBUG: Log incoming request data
    console.log("=== PICK ORDER DEBUG START ===");
    console.log("📥 REQUEST DATA:");
    console.log("Params:", JSON.stringify(req.params, null, 2));
    console.log("Query:", JSON.stringify(req.query, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("User:", {
      company_code: (req.user as any)?.company_code,
      loginid: (req.user as any)?.loginid
    });

    const { job_no } = req.params;
    const { prin_code } = req.query;
    let { serial_no } = req.body;

    console.log("📋 EXTRACTED PARAMETERS:");
    console.log("- job_no:", job_no);
    console.log("- prin_code:", prin_code);
    console.log("- serial_no (raw):", serial_no, "Type:", typeof serial_no);

    if (!prin_code) {
      console.log("❌ DEBUG: Missing prin_code");
      res.status(400).json({
        success: false,
        message: "Missing prin_code",
      });
      return;
    }

    if (!Array.isArray(serial_no)) {
      console.log("❌ DEBUG: serial_no is not an array. Value:", serial_no);
      res.status(400).json({
        success: false,
        message: "serial_no must be an array of numbers",
      });
      return;
    }

    console.log("✅ DEBUG: serial_no is array, length:", serial_no.length);
    console.log("🔢 DEBUG: serial_no values:", serial_no);

    const invalidEntries = serial_no.filter((item: number) => isNaN(item));
    if (invalidEntries.length > 0) {
      console.log("❌ DEBUG: Invalid serial_no entries:", invalidEntries);
      res.status(400).json({
        success: false,
        message: "All serial_no entries must be valid numbers",
      });
      return;
    }

    const company_code = (req.user as any).company_code;
    let toggledPackets = 0;

    console.log("🏢 DEBUG: Company Code:", company_code);
    console.log("🔄 DEBUG: Starting transaction...");

    await oracleDb.withTransaction(async (connection: any) => {
      // DEBUG: Log before update
      console.log("🗄️ DEBUG: Database connection established");

      // Handle array binding for IN clause
      if (serial_no.length > 0) {
        const placeholders = serial_no.map((_, i) => `:serial_no_${i}`).join(',');
        const updateSql = `
          UPDATE TO_ORDER_DET
          SET selected = 'Y', PICKED = 'N'
          WHERE company_code = :company_code
            AND prin_code = :prin_code
            AND job_no = :job_no
            AND serial_no IN (${placeholders})
        `;
        
        const bindParams: any = {
          company_code,
          prin_code,
          job_no
        };
        
        serial_no.forEach((sn, i) => {
          bindParams[`serial_no_${i}`] = sn;
        });

        console.log("📝 DEBUG: UPDATE SQL:");
        console.log(updateSql);
        console.log("🔧 DEBUG: Bind Parameters:");
        console.log(JSON.stringify(bindParams, null, 2));

        const updateResult = await oracleDb.query(updateSql, bindParams, connection);
        toggledPackets = updateResult.rowsAffected || 0;
        
        console.log("✅ DEBUG: UPDATE RESULT:");
        console.log("- Rows Affected:", toggledPackets);
        console.log("- Full Result:", JSON.stringify(updateResult, null, 2));
      } else {
        console.log("⚠️ DEBUG: serial_no array is empty, skipping update");
      }

      if (toggledPackets > 0) {
        console.log("🎯 DEBUG: Calling stored procedure...");
        console.log("🔧 DEBUG: Procedure Parameters:");
        console.log({
          vs_company_code: company_code,
          vs_principal_code: prin_code,
          vs_job_no: job_no,
          vs_sort: ""
        });

        try {
          // Call Oracle stored procedure
          const procResult = await oracleDb.query(
            `BEGIN SP_WM_OUB_PICKING(:vs_company_code, :vs_principal_code, :vs_job_no, :vs_sort); END;`,
            {
              vs_company_code: company_code,
              vs_principal_code: prin_code,
              vs_job_no: job_no,
              vs_sort: ""
            },
            connection
          );
          
          console.log("✅ DEBUG: STORED PROCEDURE EXECUTED SUCCESSFULLY");
          console.log("- Procedure Result:", JSON.stringify(procResult, null, 2));
          
        } catch (procError) {
          // Procedure failed: revert update
          console.error("❌ DEBUG: SP_WM_OUB_PICKING FAILED:");
          console.error("- Error Details:", JSON.stringify(procError, null, 2));
          console.log("↩️ DEBUG: Reverting TO_ORDER_DET changes...");

          if (serial_no.length > 0) {
            const placeholders = serial_no.map((_, i) => `:serial_no_${i}`).join(',');
            const unselectSql = `
              UPDATE TO_ORDER_DET
              SET selected = 'N'
              WHERE company_code = :company_code
                AND prin_code = :prin_code
                AND job_no = :job_no
                AND serial_no IN (${placeholders})
            `;
            
            const bindParams: any = {
              company_code,
              prin_code,
              job_no
            };
            
            serial_no.forEach((sn, i) => {
              bindParams[`serial_no_${i}`] = sn;
            });

            console.log("📝 DEBUG: REVERT SQL:");
            console.log(unselectSql);
            console.log("🔧 DEBUG: Revert Bind Parameters:");
            console.log(JSON.stringify(bindParams, null, 2));

            const revertResult = await oracleDb.query(unselectSql, bindParams, connection);
            console.log("✅ DEBUG: REVERT COMPLETE:");
            console.log("- Rows Reverted:", revertResult.rowsAffected || 0);
          }

          throw procError;
        }
      } else {
        console.log("⚠️ DEBUG: No rows updated, skipping stored procedure call");
      }
      
      console.log("🏁 DEBUG: Transaction operations completed");
    });

    console.log("✅ DEBUG: Transaction committed successfully");
    console.log("📊 DEBUG: Final toggledPackets:", toggledPackets);

    const responseMessage = toggledPackets > 0
      ? "Order picked successfully."
      : "No packet updated.";

    console.log("📤 DEBUG: Sending response to client:");
    console.log("- Success: true");
    console.log("- Message:", responseMessage);
    console.log("=== PICK ORDER DEBUG END ===\n");

    res.status(200).json({
      success: true,
      message: responseMessage,
    });

  } catch (err: any) {
    console.error("=== PICK ORDER ERROR DEBUG ===");
    console.error("❌ ERROR DETAILS:");
    console.error("- Message:", err.message);
    console.error("- Stack:", err.stack);
    
    // Log additional Oracle error details if available
    if (err.errorNum) {
      console.error("- Oracle Error Code:", err.errorNum);
    }
    if (err.message && err.message.includes("ORA-")) {
      console.error("- Oracle Error:", err.message);
    }
    
    console.error("📋 ERROR CONTEXT:");
    console.error("- Params:", req.params);
    console.error("- Query:", req.query);
    console.error("- Body:", req.body);
    console.error("=== PICK ORDER ERROR END ===\n");

    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to process pick order.",
    });
  }
};

// Function to export picking details to CSV
export const exportPickingDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    console.log('inside exportPickingDetails');
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    // Simplified filtering
    let whereClause = `WHERE company_code = :company_code`;
    const bindParams: any = { company_code: req.user.company_code };

    if (filter.search) {
      // Add your filtering logic here
    }

    // Fetch data for CSV export
    const result = await oracleDb.query(
      `SELECT * FROM PICKING_DETAILS_OUTBOUND_WMS_VIEW ${whereClause}`,
      bindParams
    );
    
    const fetchedData = result.rows || [];

    // Initialize CSV formatter with headers
    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.TANSACTION.OUTOUND.PICKING_DETAILS,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="picking_details.csv"`
    );

    // Write data to the CSV stream
    fetchedData.forEach((plainData:any) => {
      csvTransform.write(plainData);
    });

    // End the CSV stream and pipe it to the response
    csvTransform.end();
    csvTransform.pipe(res);
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Function to export picking stock details to CSV
export const exportPickingStockDeatils = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    console.log('inside exportPickingStockDeatils');
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    // Simplified filtering
    let whereClause = `WHERE company_code = :company_code`;
    const bindParams: any = { company_code: req.user.company_code };

    if (filter.search) {
      // Add your filtering logic here
    }

    // Fetch data for CSV export
    const result = await oracleDb.query(
      `SELECT * FROM VW_STKLED ${whereClause}`,
      bindParams
    );
    
    const fetchedData = result.rows || [];

    // Initialize CSV formatter with headers
    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.TANSACTION.OUTOUND.PICKING_STOCK_DETAILS,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="stock_detail.csv"`
    );

    // Write data to the CSV stream
    fetchedData.forEach((plainData:any) => {
      csvTransform.write(plainData);
    });

    console.log("\n\n\n\n\nfetchedData", fetchedData);

    // End the CSV stream and pipe it to the response
    csvTransform.end();
    csvTransform.pipe(res);
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: "Error:" + error.message });
  }
};

export const oubcancelPick = async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_no } = req.params;
    const { prin_code, freeze } = req.query;
    let { serial_no } = req.body;

    if (!prin_code) {
      res.status(400).json({
        success: false,
        message: "Missing prin_code",
      });
      return;
    }

    if (!Array.isArray(serial_no)) {
      res.status(400).json({
        success: false,
        message: "serial_no must be an array of numbers",
      });
      return;
    }

    const company_code = (req.user as any).company_code;
    let toggledPackets = 0;

    await oracleDb.withTransaction(async (connection: any) => {
      // Handle array binding for IN clause
      if (serial_no.length > 0) {
        const placeholders = serial_no.map((_, i) => `:serial_no_${i}`).join(',');
        const updateSql = `
          UPDATE TO_BATCH SET selected = 'Y'
          WHERE company_code = :company_code
            AND prin_code = :prin_code
            AND job_no = :job_no
            AND key_number IN (${placeholders})
        `;
        
        const bindParams: any = {
          company_code,
          prin_code,
          job_no
        };
        
        serial_no.forEach((sn, i) => {
          bindParams[`serial_no_${i}`] = sn;
        });

        const updateResult = await oracleDb.query(updateSql, bindParams, connection);
        toggledPackets = updateResult.rowsAffected || 0;
      }

      if (toggledPackets > 0) {
        // Call Oracle stored procedure
        await oracleDb.query(
          `BEGIN sp_pick_cancel(:vs_company_code, :vs_prin_code, :vs_job_no, :vs_freeze); END;`,
          {
            vs_company_code: company_code,
            vs_prin_code: prin_code,
            vs_job_no: job_no,
            vs_freeze: freeze || 'N',
          },
          connection
        );

        // Optional: Update again after procedure call
        if (toggledPackets > 0 && serial_no.length > 0) {
          const placeholders = serial_no.map((_, i) => `:serial_no_${i}`).join(',');
          const unselectSql = `
            UPDATE TO_BATCH SET selected = 'Y'
            WHERE company_code = :company_code
              AND prin_code = :prin_code
              AND job_no = :job_no
              AND key_number IN (${placeholders})
          `;
          
          const bindParams: any = {
            company_code,
            prin_code,
            job_no
          };
          
          serial_no.forEach((sn, i) => {
            bindParams[`serial_no_${i}`] = sn;
          });

          await oracleDb.query(unselectSql, bindParams, connection);
        }
      }
    });

    res.status(200).json({
      success: true,
      message:
        toggledPackets > 0
          ? "Pick Cancel successfully."
          : "No TO_BATCH updated.",
    });
  } catch (err: any) {
    console.error("Pick Cancel error:", err);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to process pick cancel.",
    });
  }
};