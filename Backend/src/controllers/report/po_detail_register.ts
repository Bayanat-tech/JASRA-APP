import { oracleDb } from "../../database/connection";
import { Request, Response } from 'express'

function buildFilterWhere(
  query: Request['query'],
  exclude?: 'ref_doc_no' | 'project_name' | 'supp_name' | 'status' | 'div_code',
) {
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

  const conditions: string[] = ['company_code = :company_code'];
  const binds: Record<string, any> = { company_code };

  const addInClause = (column: string, bindPrefix: string, raw?: string) => {
    if (!raw) return;
    const values = raw.split(',').map(v => v.trim()).filter(Boolean);
    if (values.length === 0) return;
    const placeholders = values.map((v, i) => {
      const key = `${bindPrefix}${i}`;
      binds[key] = v;
      return `:${key}`;
    });
    conditions.push(`${column} IN (${placeholders.join(', ')})`);
  };

  if (exclude !== 'ref_doc_no')   addInClause('ref_doc_no', 'ref', ref_doc_no);
  if (exclude !== 'project_name') addInClause('project_name', 'proj', project_name);
  if (exclude !== 'supp_name')    addInClause('supp_name', 'supp', supp_name);
  if (exclude !== 'status')       addInClause('status', 'stat', status);
  if (exclude !== 'div_code')     addInClause('div_code', 'div', div_code);

  if (date_from) {
    conditions.push(`updated_at >= TO_DATE(:date_from, 'YYYY-MM-DD')`);
    binds.date_from = date_from;
  }
  if (date_to) {
    conditions.push(`updated_at <= TO_DATE(:date_to, 'YYYY-MM-DD')`);
    binds.date_to = date_to;
  }
  if (amount_from) {
    conditions.push(`po_amount >= :amount_from`);
    binds.amount_from = Number(amount_from);
  }
  if (amount_to) {
    conditions.push(`po_amount <= :amount_to`);
    binds.amount_to = Number(amount_to);
  }

  return { whereSql: conditions.join(' AND '), binds };
}

const getPoDetailRegister = async (req: Request, res: Response) => {
    try {
        const { company_code } = req.query;
        if (!company_code) {
            res.status(400).json({ success: false, message: "Missing required query parameter: company_code" });
            return;
        }

        // No `exclude` passed here -> every selected filter is included.
        // If the user picked nothing, whereSql collapses to just `company_code = :company_code`.
        const { whereSql, binds } = buildFilterWhere(req.query);

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
        WHERE ${whereSql}
        `;
        console.log("Executing SQL Query:", sql, "with binds:", binds);

        const result = await oracleDb.query(sql, binds);
        console.log("Query Result:", result.rows);
        res.status(200).json(result.rows);
    }
    catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getDivCodes = async (req: Request, res: Response) => {
    try {
        const { company_code } = req.query;
        if (!company_code) {
            res.status(400).json({ success: false, message: "Missing required query parameter: company_code" });
            return;
        }
        const { whereSql, binds } = buildFilterWhere(req.query, 'div_code');

        const sql = `SELECT DISTINCT div_code FROM VW_BO_PO_REGISTER_JASRA WHERE ${whereSql}`;
        console.log("Executing SQL Query:", sql, "with binds:", binds);
        const result = await oracleDb.query(sql, binds);
        console.log("Query Result:", result.rows);
        res.status(200).json(result.rows);
    }
    catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}


const getPoNo = async (req: Request, res: Response) => {
    try {
        const { company_code } = req.query;
        if (!company_code) {
            res.status(400).json({ success: false, message: "Missing required query parameter: company_code" });
            return;
        }

        const { whereSql, binds } = buildFilterWhere(req.query, 'ref_doc_no');

        const sql = `
            SELECT DISTINCT ref_doc_no as PO_NO
            FROM VW_BO_PO_REGISTER_JASRA
            WHERE ${whereSql}
        `;
        console.log("Executing SQL Query:", sql, "with binds:", binds);
        const result = await oracleDb.query(sql, binds);
        console.log("Query Result:", result.rows);
        res.status(200).json(result.rows);
    }
    catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getProjectNames = async (req: Request, res: Response) => {
    try {
        const { company_code } = req.query;
        if (!company_code) {
            res.status(400).json({ success: false, message: "Missing required query parameter: company_code" });
            return;
        }

        const { whereSql, binds } = buildFilterWhere(req.query, 'project_name');

        const sql = `
            SELECT DISTINCT project_name
            FROM VW_BO_PO_REGISTER_JASRA
            WHERE ${whereSql}
        `;
        console.log("Executing SQL Query:", sql, "with binds:", binds);
        const result = await oracleDb.query(sql, binds);
        console.log("Query Result:", result.rows);
        res.status(200).json(result.rows);
    }
    catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getSupplierNames = async (req: Request, res: Response) => {
    try {
        const { company_code } = req.query;
        if (!company_code) {
            res.status(400).json({ success: false, message: "Missing required query parameter: company_code" });
            return;
        }
        const { whereSql, binds } = buildFilterWhere(req.query, 'supp_name');

        const sql = `SELECT DISTINCT supp_name FROM VW_BO_PO_REGISTER_JASRA WHERE ${whereSql}`;
        console.log("Executing SQL Query:", sql, "with binds:", binds);
        const result = await oracleDb.query(sql, binds);
        console.log("Query Result:", result.rows);
        res.status(200).json(result.rows);
    }
    catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getStatusOptions = async (req: Request, res: Response) => {
    try {
        const { company_code } = req.query;
        if (!company_code) {
            res.status(400).json({ success: false, message: "Missing required query parameter: company_code" });
            return;
        }
        const { whereSql, binds } = buildFilterWhere(req.query, 'status');

        const sql = `SELECT DISTINCT status FROM VW_BO_PO_REGISTER_JASRA WHERE ${whereSql}`;
        console.log("Executing SQL Query:", sql, "with binds:", binds);
        const result = await oracleDb.query(sql, binds);
        console.log("Query Result:", result.rows);
        res.status(200).json(result.rows);
    }
    catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export { getPoDetailRegister, getPoNo, getProjectNames, getSupplierNames, getStatusOptions, getDivCodes };


