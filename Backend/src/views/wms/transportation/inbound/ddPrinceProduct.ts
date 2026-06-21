import { Request, Response, NextFunction } from "express";
import { oracleDb } from "../../../../database/connection";

export const getddPrinceProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Temporary hardcoded values
    const { company_code, prin_code } = req.query;
    //const company_code = "BSG";
   // const prin_code = "10006";

    const sql = `
      SELECT
        COMPANY_CODE,
        PRIN_CODE,
        PROD_CODE,
        PROD_NAME,
        P_UOM,
        L_UOM,
        UPPP,
        UPP,
        QTY_AVL
      FROM VW_PRODUCT_AVL_QTY
      WHERE COMPANY_CODE = :company_code
        AND PRIN_CODE = :prin_code
        AND ROWNUM <= 5000
    `;

    const binds = { company_code, prin_code };

    const result = await oracleDb.query(sql, binds);

    const rows = result.rows ?? [];

    // ✅ Required response format
    res.status(200).json({
      success: true,
      data: rows,
      totalCount: rows.length
    });

  } catch (error) {
    console.error("Error fetching product data:", error);
    next(error);
  }
};
