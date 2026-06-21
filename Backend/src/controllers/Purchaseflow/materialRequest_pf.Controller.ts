import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection"; // your oracledb pool
import { QueryTypes } from "sequelize";
import { upsertMaterialRequest } from "./materialRquestdbupdate_pf.Controller";
import { createLog, notifyUser } from "../../helpers/functions";
import constants from "../../helpers/constants";
import { IFiles, RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { NextFunction } from "express";
import {
  IMaterialRequestPf,
  IItemMrRequest,
  IBasicMrRequest,
} from "../../interfaces/Purchaseflow/Materialflow.interface";

// GET MATERIAL REQUEST BY NUMBER

export async function getMaterialRequestNumber(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const reqWithUser = req as RequestWithUser;

  let connection: oracledb.Connection | undefined;

  try {
    const { request_number } = req.params;

    if (typeof request_number !== "string") {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid request number format.",
      });
      return;
    }

    const formattedRequestNumber = request_number.replace(/\$\$/g, "/");

    connection = await oracleDb.getConnection();

    // Fetch header (Oracle version of LIMIT 1)
    const headerResult = await connection.execute(
      `SELECT *
       FROM VW_MATERIAL_REQUEST_HEADER
       WHERE request_number = :request_number
       AND ROWNUM = 1`,
      { request_number: formattedRequestNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const header = headerResult.rows?.[0];

    // Fetch details
    const detailsResult = await connection.execute(
      `SELECT *
       FROM VW_MATERIAL_REQUEST_DETAILS
       WHERE request_number = :request_number
       ORDER BY ITEM_SRNO`,
      { request_number: formattedRequestNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const details = detailsResult.rows || [];

    if (!header || details.length === 0) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: `Material Request ${constants.MESSAGES.DOES_NOT_EXISTS}`,
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: {
        ...header,
        items: details,
      },
    });
  } catch (error) {
    console.error("Error fetching material request:", error);
    next(error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing Oracle connection:", err);
      }
    }
  }
}

// CREATE OR UPDATE MATERIAL REQUEST
export const createOrUpdateMaterialRequestSequential = async (
  req: RequestWithUser,
  res: Response
) => {
  let connection: oracledb.Connection | undefined;

  try {
    const purchaseRequest = MatmapIncomingRequestData(req.body);

    connection = await oracleDb.getConnection();

    // Assuming you have an upsert PL/SQL procedure
    await connection.execute(
      `BEGIN UPSERT_MATERIAL_REQUEST(
         :request_number,
         :request_date,
         :requestor_name,
         :description,
         :need_by_date,
         :items
       ); END;`,
      {
        request_number: purchaseRequest.request_number,
        request_date: purchaseRequest.request_date,
        requestor_name: purchaseRequest.requestor_name,
        description: purchaseRequest.description,
        need_by_date: purchaseRequest.need_by_date,
        items: JSON.stringify(purchaseRequest.items), // pass items as JSON to PL/SQL
      },
      { autoCommit: true }
    );

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Purchase request processed successfully.",
    });
  } catch (error) {
    console.error("Error saving/updating purchase request:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error saving/updating purchase request.",
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  } finally {
    if (connection) await connection.close();
  }
};

// MAPPER FUNCTION: RAW REQUEST DATA -> TYPED OBJECT
export function MatmapIncomingRequestData(data: any): IMaterialRequestPf {
  const mapItems: IItemMrRequest[] = Array.isArray(data.items)
    ? data.items.map((item: any): IItemMrRequest => ({
        request_number: item.request_number?.toString() || "",
        item_code: item.item_code?.toString() || "",
        item_rate: Number(item.item_rate) || 0,
        item_p_qty: Number(item.item_qty) || 0,
        p_uom: item.p_uom?.toString() || "",
        from_cost_code: item.from_cost_code?.toString() || null,
        to_cost_code: item.to_cost_code?.toString() || null,
        from_project_code: item.from_project_code?.toString() || null,
        to_project_code: item.to_project_code?.toString() || null,
        l_uom: item.l_uom?.toString() || "",
        item_l_qty: item.item_l_qty ? Number(item.item_l_qty) : null,
        item_sequence_no: item.item_sequence_no ? Number(item.item_sequence_no) : null,
      }))
    : [];

  return {
    need_by_date: data.need_by_date ? new Date(data.need_by_date) : undefined,
    requestor_name: data.requestor_name || "",
    request_number: data.request_number?.toString() || "",
    request_date: data.request_date ? new Date(data.request_date) : undefined,
    description: data.description || "",
    remarks: data.remarks || "",
    amount: Number(data.amount) || 0,
    department_code: data.department_code || "",
    flow_code: data.flow_code || "",
    flow_level_initial: Number(data.flow_level_initial) || 0,
    flow_level_running: Number(data.flow_level_running) || 0,
    flow_level_final: Number(data.flow_level_final) || 0,
    company_code: data.company_code?.toString() || "",
    currency_rate: Number(data.currency_rate) || 0,
    user_dt: data.user_dt ? new Date(data.user_dt) : undefined,
    user_id: data.user_id?.toString() || "",
    fa_uploaded: data.fa_uploaded || "",
    final_approved: data.final_approved || "",
    remarks_histry: data.remarks_histry || "",
    curr_code: data.curr_code || "",
    create_user: data.create_user || "",
    create_date: data.create_date ? new Date(data.create_date) : undefined,
    last_updated: data.last_updated || "",
    last_action: data.last_action || "",
    history_serial: data.history_serial ? Number(data.history_serial) : 1,
    attach_file_name: data.attach_file_name || "",
    attach_file_name1: data.attach_file_name1 || "",
    attach_file_name2: data.attach_file_name2 || "",
    reject_histry: data.reject_histry || "",
    sendback_histry: data.sendback_histry || "",
    req_doc_no: data.req_doc_no ? Number(data.req_doc_no) : undefined,
    req_div_code: data.req_div_code || "",
    cost_code: data.cost_code || "",
    po_amount: data.po_amount ? Number(data.po_amount) : undefined,
    doc_date: data.doc_date ? new Date(data.doc_date) : undefined,
    projectCode: data.project_code || "",
    status: data.status || "",
    project_pr_no: data.project_pr_no ? Number(data.project_pr_no) : undefined,
    div_code: data.div_code || "",
    final_approved_date: data.final_approved_date
      ? new Date(data.final_approved_date)
      : undefined,
    created_at: data.created_at ? new Date(data.created_at) : undefined,
    created_by: data.created_by || "",
    updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    updated_by: data.updated_by || "",
    flow_type: data.flow_type || "",
    project_code_from: data.project_code_from || "",
    project_code_to: data.project_code_to || "",
    items: mapItems,
  };
}


interface MaterialRequestRow {
  REQUEST_NUMBER: string;
  REQUEST_DATE: Date;
  DESCRIPTION: string;
  REQUESTOR_NAME: string;
  NEED_BY_DATE: Date;
}

// LIST MATERIAL REQUESTS
export const MaterialRequestListing = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    connection = await oracleDb.getConnection();

    const query = `
      SELECT Request_number, Request_date, Description, requestor_name, need_by_date
      FROM MATERIAL_REQUEST_HEADER
      ORDER BY Request_date DESC
    `;

    const result = await connection.execute<MaterialRequestRow>(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    // Explicitly type rows to object array
    const rows = (result.rows || []) as MaterialRequestRow[];

    const dataWithIds = rows.map((item, index) => ({
      id: index + 1,
      ...item,
    }));

    res.status(constants.STATUS_CODES.OK).json({ success: true, data: dataWithIds });
  } catch (error) {
    console.error("Error fetching MATERIAL_REQUEST_HEADER data:", error);

    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while fetching material request data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    if (connection) await connection.close();
  }
};
