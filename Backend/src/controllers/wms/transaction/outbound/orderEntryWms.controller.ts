import { NextFunction, Response } from "express";
import * as fastCsv from "fast-csv";
import { oracleDb } from "../../../../database/connection";
import * as oracledb from "oracledb";
import constants from "../../../../helpers/constants";
import { getSearchFilterQuery } from "../../../../helpers/functions";
import { RequestHandler } from 'express';
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { pickOrderSchema } from "../../../../validation/wms/transaction/outbound.validation";
import WmsCsvHeaders from "../../../../utils/exportCsv/WmsCsvHeaders";
import { Request } from "express";

export const createToOrder = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    function toOracleDate(dateInput?: string | Date | null): string | null {
      if (!dateInput) return null;

      try {
        let dateObj: Date;

        if (dateInput instanceof Date) {
          dateObj = dateInput;
        } else if (typeof dateInput === "string") {
          // Handle different date formats
          const cleanDate = dateInput.replace(/T.+/, "");
          const [year, month, day] = cleanDate.split("-").map(Number);

          if (!year || !month || !day) {
            console.error("Invalid date components:", { year, month, day });
            return null;
          }

          dateObj = new Date(year, month - 1, day);

          if (isNaN(dateObj.getTime())) {
            console.error("Invalid date object created from:", dateInput);
            return null;
          }
        } else {
          console.error("Unsupported date input type:", typeof dateInput);
          return null;
        }

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Error converting date:", dateInput, error);
        return null;
      }
    }

    console.log("createToOrder API called");
    console.log(" Request body:", req.body);

    // Destructure with default null values for optional fields
    const {
      prin_code,
      company_code,
      job_no,
      cust_code = null,
      order_no = null,
      order_date = null,
      order_due_date = null,
      curr_code = null,
      ex_rate = null,
      uoc = null,
      moc1 = null,
      moc2 = null,
      exp_container_no = null,
      exp_container_size = null,
      exp_container_type = null,
      exp_container_sealno = null,
      cust_reference = null,
      pack_start = null,
      pack_end = null,
      load_start = null,
      load_end = null
    } = req.body;

    // Convert ISO strings to Oracle DATE format
    const formatDateForOracle = (dateString: any) => {
      if (!dateString) return null;
      return new Date(dateString);
    };

    // Basic validation
    if (!prin_code || !company_code || !job_no) {
      throw new Error('Missing required fields: PRIN_CODE, COMPANY_CODE, and job_no are required');
    }

    // Check for duplicate order_no if it's provided
    if (order_no) {
      const checkDuplicateQuery = `
        SELECT COUNT(*) as count FROM TO_ORDER 
        WHERE order_no = :order_no
      `;

      const duplicateCheckResult = await oracleDb.query(checkDuplicateQuery, {
        order_no: order_no
      });

      if (duplicateCheckResult.rows?.[0]?.COUNT > 0) {
        throw new Error('An order with this order_no already exists');
      }
    }

    const query = `
      INSERT INTO TO_ORDER (
        PRIN_CODE, COMPANY_CODE, job_no, cust_code, order_no,
        order_date, order_due_date, curr_code, EX_RATE, UOC,
        MOC1, MOC2, EXP_CONTAINER_NO, EXP_CONTAINER_SIZE, EXP_CONTAINER_TYPE,
        EXP_CONTAINER_SEALNO, CUST_REFERENCE, PACK_START, PACK_END, LOAD_START, LOAD_END
      ) VALUES (
        :prin_code, :company_code, :job_no, :cust_code, :order_no,
        TO_DATE(:order_date, 'YYYY-MM-DD HH24:MI:SS'), 
        TO_DATE(:order_due_date, 'YYYY-MM-DD HH24:MI:SS'), 
        :curr_code, :ex_rate, :uoc,
        :moc1, :moc2, :exp_container_no, :exp_container_size, :exp_container_type,
        :exp_container_sealno, :cust_reference, 
        TO_DATE(:pack_start, 'YYYY-MM-DD HH24:MI:SS'), 
        TO_DATE(:pack_end, 'YYYY-MM-DD HH24:MI:SS'), 
        TO_DATE(:load_start, 'YYYY-MM-DD HH24:MI:SS'), 
        TO_DATE(:load_end, 'YYYY-MM-DD HH24:MI:SS')
      )
    `;

    const bindParams = {
      prin_code,
      company_code,
      job_no,
      cust_code,
      order_no,
      curr_code,
      ex_rate,
      uoc,
      moc1,
      moc2,
      exp_container_no,
      exp_container_size,
      exp_container_type,
      exp_container_sealno,
      cust_reference,
      order_date: toOracleDate(order_date),
      order_due_date: toOracleDate(order_due_date),
      pack_start: toOracleDate(pack_start),
      pack_end: toOracleDate(pack_end),
      load_start: toOracleDate(load_start),
      load_end: toOracleDate(load_end)
    };

    console.log("Executing query:", query);
    console.log("With bindParams:", bindParams);

    // Execute the insert query
    await oracleDb.query(query, bindParams);

    // For Oracle, we need to get the last inserted ID differently
    // Assuming there's a sequence or we can get the max ID
    const lastIdResult = await oracleDb.query(
      "SELECT MAX(TO_ORDER_ID) as INSERTID FROM TO_ORDER WHERE COMPANY_CODE = :company_code AND PRIN_CODE = :prin_code",
      { company_code, prin_code }
    );

    const insertId = lastIdResult.rows?.[0]?.INSERTID;

    console.log("Order created successfully with ID:", insertId);
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: insertId
    });

  } catch (error: unknown) {
    console.error("Error creating TO_ORDER:", error);

    // Determine appropriate status code
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes('Missing required fields')) {
        statusCode = 400;
      } else if (error.message.includes('already exists')) {
        statusCode = 409; // 409 Conflict is appropriate for duplicate resource
      }
    }

    res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while creating the order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Note: The following functions use Sequelize models (OrderEntry, etc.)
// You'll need to convert these models to use TypeORM or raw Oracle queries
// For now, I'll show the pattern:

export const getAllOrderEntries = async (req: RequestWithUser, res: Response) => {
  try {
    const { prin_code, job_no, cust_code, order_no } = req.query;

    if (!job_no) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'job_no parameter is required'
      });
    }

    let query = `
      SELECT * FROM VW_TO_ORDER 
      WHERE COMPANY_CODE = :company_code
        AND JOB_NO = :job_no
    `;

    const bindParams: any = {
      company_code: req.user.company_code,
      job_no: job_no
    };

    if (prin_code) {
      query += " AND PRIN_CODE = :prin_code";
      bindParams.prin_code = prin_code;
    }
    if (cust_code) {
      query += " AND CUST_CODE = :cust_code";
      bindParams.cust_code = cust_code;
    }
    if (order_no) {
      query += " AND ORDER_NO = :order_no";
      bindParams.order_no = order_no;
    }

    const result = await oracleDb.query(query, bindParams);
    const orderEntries = result.rows || [];

    if (!orderEntries.length) {
      return res.status(constants.STATUS_CODES.NO_CONTENT).json({
        success: true,
        message: `No order entries found for job_no: ${job_no}`,
        data: [],
        count: 0
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: orderEntries,
      count: orderEntries.length
    });

  } catch (error: unknown) {
    console.error("Error in getAllOrderEntries:", error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message
    });
  }
};

export const getSingleOrderEntry = async (req: RequestWithUser, res: Response) => {
  try {
    const { cust_code } = req.query;

    if (!cust_code) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'cust_code parameter is required'
      });
    }

    const result = await oracleDb.query(
      `SELECT * FROM VW_TO_ORDER WHERE CUST_CODE = :cust_code`,
      { cust_code }
    );

    const orderEntry = result.rows?.[0];

    if (!orderEntry) {
      return res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: true,
        message: `No order entry found for cust_code: ${cust_code}`,
        data: null
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: orderEntry
    });

  } catch (error: unknown) {
    console.error("Error in getOrderEntryByCustomerCode:", error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message
    });
  }
};

export const updateSingleOrderEntry = async (req: RequestWithUser, res: Response) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID parameter is required'
      });
    }

    // Build dynamic UPDATE query
    const setClauses = [];
    const bindParams: any = { id };

    for (const [key, value] of Object.entries(updateData)) {
      setClauses.push(`${key} = :${key}`);
      bindParams[key] = value;
    }

    const query = `
      UPDATE TO_ORDER 
      SET ${setClauses.join(', ')}
      WHERE ID = :id
    `;

    await oracleDb.withTransaction(async (connection: any) => {
      const result = await oracleDb.query(query, bindParams, connection);

      // Check if row was updated (Oracle returns row count differently)
      if (result.rowsAffected === 0) {
        throw new Error(`No order entry found with id: ${id}`);
      }

      // Get the updated entry
      const updatedResult = await oracleDb.query(
        `SELECT * FROM TO_ORDER WHERE ID = :id`,
        { id },
        connection
      );

      return updatedResult.rows?.[0];
    }).then((updatedEntry) => {
      return res.json({
        success: true,
        data: updatedEntry
      });
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteOrderEntry = async (req: RequestWithUser, res: Response) => {
  try {
    const { id } = req.params;
    console.log('id', id);

    if (!id) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'id parameter is required'
      });
    }

    // First check if the order entry exists
    const checkResult = await oracleDb.query(
      `SELECT COUNT(*) as count FROM TO_ORDER WHERE ID = :id`,
      { id }
    );

    if (!checkResult.rows?.[0]?.COUNT || checkResult.rows[0].COUNT === 0) {
      return res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: `No order entry found for id: ${id}`
      });
    }

    // Perform the deletion
    const deleteResult = await oracleDb.query(
      `DELETE FROM TO_ORDER WHERE ID = :id`,
      { id }
    );

    // Check if deletion was successful
    if (deleteResult.rowsAffected === 0) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Order entry could not be deleted'
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: 'Order entry deleted successfully'
    });

  } catch (error: unknown) {
    console.error("Error in deleteOrderEntry:", error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message
    });
  }
};

// Note: The following functions use Sequelize models and complex query building
// You'll need to convert them based on your actual View/Model implementations
// Here's a pattern for converting View queries:

export const getPickingItemPreferenceDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { distinct_field } = req.query;
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    // You'll need to adapt getSearchFilterQuery for raw SQL
    // This is a placeholder - you'll need to implement proper filtering
    let whereClause = `WHERE company_code = :company_code`;
    const bindParams: any = { company_code: req.user.company_code };

    // Add filter conditions based on your logic
    if (filter.search) {
      // Implement your filtering logic here
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as count FROM VW_WM_OUB_JOB_PICK_FILTER ${whereClause}`;
    const countResult = await oracleDb.query(countQuery, bindParams);
    const resultCount = countResult.rows?.[0]?.COUNT || 0;

    // Main query
    const resultQuery = `
      SELECT DISTINCT ${distinct_field}
      FROM VW_WM_OUB_JOB_PICK_FILTER 
      ${whereClause}
    `;

    const result = await oracleDb.query(resultQuery, bindParams);

    if (!result.rows) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'No data found'
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: { tableData: result.rows, count: resultCount }
    });

  } catch (error: unknown) {
    const knownError = error as { message: string };
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "error:" + knownError.message
    });
  }
};

export const pickOrder = async (req: RequestWithUser, res: Response) => {
  try {
    const { error } = pickOrderSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }

    const { job_no } = req.params;
    const { prin_code, preference, pick, min_qty, exp_period } = req.query;
    const { serial_no } = req.body;

    // const updateSelectedSql = `
    //   UPDATE TO_ORDER_DET
    //   SET selected = 'Y'
    //   WHERE company_code = :company_code 
    //     AND prin_code = :prin_code 
    //     AND job_no = :job_no 
    //     AND serial_no = :serial_no
    // `;
 

    const updateSelectedSql = `
      UPDATE TO_ORDER_DET 
      SET PICKED = 'N', selected = 'Y'
      WHERE company_code = :company_code 
        AND prin_code = :prin_code 
        AND job_no = :job_no 
    `;

    const bindParams = {
      company_code: req.user.company_code,
      prin_code,
      job_no,
      serial_no
    };

    let toggledPackets = 0;

    await oracleDb.withTransaction(async (connection: any) => {
      // Set selected = 'Y'
      const updateResult = await oracleDb.query(
        updateSelectedSql,
        bindParams,
        connection
      );
      toggledPackets = updateResult.rowsAffected || 0;

      if (toggledPackets > 0) {
        // Call stored procedure
        await oracleDb.query(
          `BEGIN SP_WM_OUB_PICKING_V3(:vs_company_code, :principal_code, :VS_job_no, ''); END;`,
          {
            vs_company_code: req.user.company_code,
            principal_code: prin_code,
            VS_job_no: job_no,
            VS_USER: req.user.loginid,
            VS_PREFERENCE: preference,
            VS_PICK: pick,
            VS_MIN_QTY: min_qty,
            VS_EXP_PERIOD: exp_period,
          },
          connection
        );

        // Set selected = 'N'
        const unselectSql = `
          UPDATE TO_ORDER_DET
          SET selected = 'N'
          WHERE company_code = :company_code 
            AND prin_code = :prin_code 
            AND job_no = :job_no 
            AND serial_no = :serial_no
        `;

        await oracleDb.query(unselectSql, bindParams, connection);
      }
    });

    res.status(200).json({
      success: true,
      message: toggledPackets > 0 ? "Order picked successfully." : "No packet updated.",
    });
  } catch (err) {
    console.error("pickOrder error:", err);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to process pick order.",
    });
  }
};

export const exportPickingDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    // Simple query - you'll need to adapt your filtering logic
    let query = `SELECT * FROM PICKING_DETAILS_OUTBOUND_WMS_VIEW WHERE company_code = :company_code`;
    const bindParams = { company_code: req.user.company_code };

    // Add filtering logic here based on your filter object
    if (filter.search) {
      // Implement your filtering
    }

    const result = await oracleDb.query(query, bindParams);
    const fetchedData = result.rows || [];

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
    fetchedData.forEach((plainData: any) => {
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

export const exportPickingStockDeatils = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    // Simple query - adapt your filtering
    let query = `SELECT * FROM VW_STKLED WHERE company_code = :company_code`;
    const bindParams = { company_code: req.user.company_code };

    // Add filtering logic
    if (filter.search) {
      // Implement filtering
    }

    const result = await oracleDb.query(query, bindParams);
    const fetchedData = result.rows || [];

    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.TANSACTION.OUTOUND.PICKING_STOCK_DETAILS,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="stock_detail.csv"`
    );

    fetchedData.forEach((plainData: any) => {
      csvTransform.write(plainData);
    });

    console.log("\n\n\n\n\nfetchedData", fetchedData);
    csvTransform.end();
    csvTransform.pipe(res);
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: "Error:" + error.message });
  }
};

export const deleteToOrderDetHandler = async (
  req: Request<{ company_code: string; prin_code: string; job_no: string; serial_no: number }>,
  res: Response
): Promise<void> => {
  const { company_code, prin_code, job_no, serial_no } = req.query;
  console.log('deleteToOrderDetHandler called with params:', req.query);

  if (!company_code || !prin_code || !job_no || !serial_no) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }

  try {
    await oracleDb.withTransaction(async (connection: any) => {
      const result = await oracleDb.query(
        `DELETE FROM TO_ORDER_DET WHERE company_code = :company_code AND prin_code = :prin_code AND job_no = :job_no AND serial_no = :serial_no`,
        {
          company_code,
          prin_code,
          job_no,
          serial_no: Number(serial_no)
        },
        connection
      );

      const affectedRows = result.rowsAffected || 0;

      if (affectedRows === 0) {
        res.status(404).json({ success: false, message: "Record not found" });
      } else {
        res.status(200).json({ success: true, message: "Record deleted successfully" });
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getddSiteCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await oracleDb.query(
      `SELECT DISTINCT SITE_CODE FROM VW_PRODUCT_SITE_AVL_QTY`,
      {}
    );

    const locationData = result.rows || [];

    if (!locationData.length) {
      res.status(404).json({
        success: false,
        message: 'No availability data found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: locationData,
    });
  } catch (error: any) {
    console.error("Error fetching location data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getddLocationCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await oracleDb.query(
      `SELECT DISTINCT LOCATION_CODE FROM VW_PRODUCT_LOCATION_AVL_QTY`,
      {}
    );

    const locationData = result.rows || [];

    if (!locationData.length) {
      res.status(404).json({
        success: false,
        message: 'No availability data found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: locationData,
    });
  } catch (error: any) {
    console.error("Error fetching location data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTotalAvailableQty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const params = {
      company_code: req.body.company_code,
      prin_code: req.body.prin_code,
      prod_code: req.body.prod_code,
      site_code: req.body.site_code,
      location_from: req.body.location_from,
      location_to: req.body.location_to,
      batch: req.body.batch,
      lot_no: req.body.lot_no,
      mfg_date_from: req.body.production_from,
      mfg_date_to: req.body.production_to,
      exp_date_from: req.body.exp_date_from,
      exp_date_to: req.body.exp_date_to,
    };

    console.log("PROC_GET_TOTAL_QTY_AVL SQL Params:", params);

    // For Oracle, use OUT parameter binding
    const result = await oracleDb.query(
      `DECLARE
         v_total_qty NUMBER;
       BEGIN
         PROC_GET_TOTAL_QTY_AVL(
           :company_code,
           :prin_code,
           :prod_code,
           :site_code,
           :location_from,
           :location_to,
           :batch,
           :lot_no,
           :mfg_date_from,
           :mfg_date_to,
           :exp_date_from,
           :exp_date_to,
           v_total_qty
         );
         :out_total_qty := v_total_qty;
       END;`,
      {
        ...params,
        out_total_qty: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const totalQty = result.outBinds?.out_total_qty;

    if (totalQty === null || totalQty === undefined) {
      res.status(404).json({
        success: false,
        message: "No availability data found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      TOT_AVL_QTY: totalQty,
    });
  } catch (error: any) {
    console.error("Error fetching total available qty:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getddLotNum = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await oracleDb.query(
      `SELECT * FROM VW_PRODUCT_LOT_AVL_QTY`,
      {}
    );

    const locationData = result.rows || [];

    if (!locationData.length) {
      res.status(404).json({
        success: false,
        message: 'No availability data found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: locationData,
    });
  } catch (error: any) {
    console.error("Error fetching location data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


