import { oracleDb } from "../../database/connection";
import { Request, Response } from "express";

/** Normalize body value to a string array */
function toStringArray(val: unknown): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) {
    return val.map((v) => String(v).trim()).filter(Boolean);
  }
  const s = String(val).trim();
  return s ? [s] : [];
}

/** Escape single quotes for Oracle string literals */
function escapeOracleString(s: string): string {
  return s.replace(/'/g, "''");
}

/**
 * Build WHERE from POST body.
 * Filters are arrays (or single values normalized to arrays).
 * Dates expected as MMDDYYYY.
 */
function buildFilterWhereFromBody(
  body: Record<string, unknown>,
  exclude?: "ref_doc_no" | "project_name" | "supp_name" | "status" | "div_code"
): string {
  const company_code =
    body.company_code != null ? String(body.company_code).trim() : "";
  const conditions: string[] = [];

  if (!company_code) return "1=0";
  conditions.push(`company_code = '${escapeOracleString(company_code)}'`);

  const addInClause = (column: string, values: string[]) => {
    if (!values.length) return;
    const list = values.map((v) => `'${escapeOracleString(v)}'`).join(", ");
    conditions.push(`${column} IN (${list})`);
  };

  if (exclude !== "ref_doc_no") {
    addInClause("ref_doc_no", toStringArray(body.ref_doc_no));
  }
  if (exclude !== "project_name") {
    addInClause("project_name", toStringArray(body.project_name));
  }
  if (exclude !== "supp_name") {
    addInClause("supp_name", toStringArray(body.supp_name));
  }
  if (exclude !== "status") {
    addInClause("status", toStringArray(body.status));
  }
  if (exclude !== "div_code") {
    addInClause("div_code", toStringArray(body.div_code));
  }

  // Dates: MMDDYYYY
  const dateFrom =
    body.date_from != null ? String(body.date_from).trim() : "";
  const dateTo = body.date_to != null ? String(body.date_to).trim() : "";
  if (dateFrom && /^\d{8}$/.test(dateFrom)) {
    conditions.push(`updated_at >= TO_DATE('${dateFrom}', 'MMDDYYYY')`);
  }
  if (dateTo && /^\d{8}$/.test(dateTo)) {
    conditions.push(`updated_at <= TO_DATE('${dateTo}', 'MMDDYYYY')`);
  }

  if (body.amount_from != null && body.amount_from !== "") {
    const n = Number(body.amount_from);
    if (!Number.isNaN(n)) conditions.push(`amount >= ${n}`);
  }
  if (body.amount_to != null && body.amount_to !== "") {
    const n = Number(body.amount_to);
    if (!Number.isNaN(n)) conditions.push(`amount <= ${n}`);
  }

  return conditions.join(" AND ");
}

/** Same helper for option endpoints that still use query params (comma-separated). */
function buildFilterWhereFromQuery(
  query: Request["query"],
  exclude?: "ref_doc_no" | "project_name" | "supp_name" | "status" | "div_code"
): string {
  const {
    company_code,
    ref_doc_no,
    project_name,
    supp_name,
    status,
    div_code,
    date_from,
    date_to,
    amount_from,
    amount_to,
  } = query as Record<string, string | undefined>;

  const conditions: string[] = [];
  if (!company_code) return "1=0";
  conditions.push(`company_code = '${escapeOracleString(company_code)}'`);

  const addInClause = (column: string, raw?: string) => {
    if (!raw) return;
    const values = raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (!values.length) return;
    const list = values.map((v) => `'${escapeOracleString(v)}'`).join(", ");
    conditions.push(`${column} IN (${list})`);
  };

  if (exclude !== "ref_doc_no") addInClause("ref_doc_no", ref_doc_no);
  if (exclude !== "project_name") addInClause("project_name", project_name);
  if (exclude !== "supp_name") addInClause("supp_name", supp_name);
  if (exclude !== "status") addInClause("status", status);
  if (exclude !== "div_code") addInClause("div_code", div_code);

  // Option endpoints may still send YYYY-MM-DD; support both
  if (date_from) {
    if (/^\d{8}$/.test(date_from)) {
      conditions.push(`updated_at >= TO_DATE('${date_from}', 'MMDDYYYY')`);
    } else {
      conditions.push(
        `updated_at >= TO_DATE('${escapeOracleString(date_from)}', 'YYYY-MM-DD')`
      );
    }
  }
  if (date_to) {
    if (/^\d{8}$/.test(date_to)) {
      conditions.push(`updated_at <= TO_DATE('${date_to}', 'MMDDYYYY')`);
    } else {
      conditions.push(
        `updated_at <= TO_DATE('${escapeOracleString(date_to)}', 'YYYY-MM-DD')`
      );
    }
  }
  if (amount_from) {
    const n = Number(amount_from);
    if (!Number.isNaN(n)) conditions.push(`amount >= ${n}`);
  }
  if (amount_to) {
    const n = Number(amount_to);
    if (!Number.isNaN(n)) conditions.push(`amount <= ${n}`);
  }

  return conditions.join(" AND ");
}

// ── Main report: POST body with arrays ───────────────────────
const getPoDetailRegister = async (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const company_code =
      body.company_code != null ? String(body.company_code).trim() : "";

    if (!company_code) {
      res.status(400).json({
        success: false,
        message: "Missing required body parameter: company_code",
      });
      return;
    }

    const sql = `
      SELECT
          r.ref_doc_no AS PO_NO,
          r.doc_date AS PO_DATE,
          r.supplier,
          r.service_rm_flag,
          r.supp_name,
          r.status,
          r.item_code,
          r.addl_item_desc,
          r.item_desp,
          r.p_uom,
          r.appr_item_p_qty,
          r.l_uom,
          r.appr_item_l_qty,
          r.item_rate,
          r.currency_rate,
          r.amount,
          r.project_name,
          r.div_code,
          r.project_code,
          r.description,
          r.type_of_pr,
          r.request_number AS PR_REF_NO,
          r.payment_terms,
          r.wo_number
      FROM VW_BO_PO_REGISTER_JASRA r
      WHERE COMPANY_CODE = '${escapeOracleString(company_code)}'
    `;

    console.log("Executing SQL Query:", sql);
    const result = await oracleDb.query(sql);
    console.log("Query Result rows:", result.rows?.length);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Option endpoints (still GET + query) ─────────────────────
const getDivCodes = async (req: Request, res: Response) => {
  try {
    const { company_code } = req.query;
    if (!company_code) {
      res.status(400).json({
        success: false,
        message: "Missing required query parameter: company_code",
      });
      return;
    }

    const sql = `SELECT DISTINCT div_code, div_name FROM MS_HR_DIVISION_JASRA WHERE COMPANY_CODE = '${escapeOracleString(String(company_code).trim())}' ORDER BY div_code`;

    console.log("Executing SQL Query:", sql);
    const result = await oracleDb.query(sql);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPoNo = async (req: Request, res: Response) => {
  try {
    const { company_code } = req.query;
    if (!company_code) {
      res.status(400).json({
        success: false,
        message: "Missing required query parameter: company_code",
      });
      return;
    }

    const whereSql = buildFilterWhereFromQuery(req.query, "ref_doc_no");

    const sql = `
      SELECT DISTINCT ref_doc_no as PO_NO
      FROM VW_BO_PO_REGISTER_JASRA
      WHERE ${whereSql}
    `;

    console.log("Executing SQL Query:", sql);
    const result = await oracleDb.query(sql);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjectNames = async (req: Request, res: Response) => {
  try {
    const { company_code, div_code } = req.query as {
      company_code?: string;
      div_code?: string;
    };

    if (!company_code) {
      res.status(400).json({
        success: false,
        message: "Missing required query parameter: company_code",
      });
      return;
    }

    if (!div_code) {
      res.status(400).json({
        success: false,
        message: "Missing required query parameter: div_code",
      });
      return;
    }

    const safeDiv = escapeOracleString(String(div_code).trim());

    let sql: string;

    if (div_code === "NA") {
      sql = `
        SELECT P.PROJECT_CODE, P.PROJECT_NAME
        FROM MS_PS_PROJECT_MASTER P
        WHERE P.PROJECT_CODE LIKE 'OH-%'
          AND P.PROJECT_CODE NOT LIKE '%TST%'
          AND EXISTS (
            SELECT 1
            FROM PURCHASE_REQUEST_DETAILS D
            WHERE D.PROJECT_CODE = P.PROJECT_CODE
          )
          AND P.DIV_CODE = '${safeDiv}'
      `;
    } else {
      sql = `
        SELECT P.PROJECT_CODE, P.PROJECT_NAME
        FROM MS_PS_PROJECT_MASTER P
        WHERE P.PROJECT_CODE NOT LIKE '%TST%'
          AND EXISTS (
            SELECT 1
            FROM PURCHASE_REQUEST_DETAILS D
            WHERE D.PROJECT_CODE = P.PROJECT_CODE
          )
          AND P.DIV_CODE = '${safeDiv}'
      `;
    }

    console.log("Executing SQL Query:", sql);
    const result = await oracleDb.query(sql);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSupplierNames = async (req: Request, res: Response) => {
  try {
    const { company_code } = req.query;

    if (!company_code) {
      res.status(400).json({
        success: false,
        message: "Missing required query parameter: company_code",
      });
      return;
    }

    const sql = `
      SELECT S.SUPP_CODE, S.SUPP_NAME
      FROM MS_SUPPLIER_JASRA S
      WHERE EXISTS (
        SELECT 1
        FROM PURCHASE_REQUEST_DETAILS P
        WHERE P.SUPPLIER = S.SUPP_CODE
      )
    `;

    console.log("Executing SQL Query:", sql);
    const result = await oracleDb.query(sql);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStatusOptions = async (req: Request, res: Response) => {
  try {
    const { company_code } = req.query;
    if (!company_code) {
      res.status(400).json({
        success: false,
        message: "Missing required query parameter: company_code",
      });
      return;
    }

    const sql = `
    select distinct status from vw_bo_po_register_jasra where company_code = '${escapeOracleString(String(company_code).trim())}'    
    `;

    console.log("Executing SQL Query:", sql);
    const result = await oracleDb.query(sql);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getPoDetailRegister,
  getPoNo,
  getProjectNames,
  getSupplierNames,
  getStatusOptions,
  getDivCodes,
};