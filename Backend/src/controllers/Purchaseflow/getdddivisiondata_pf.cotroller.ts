import { Request, Response, NextFunction } from "express";
import { oracleDb } from "../../database/connection"; // your custom oracle file

export const getddProductMaster = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { div_code } = req.query;

    if (!div_code) {
      res.status(400).json({
        success: false,
        message: "Parameter 'div_code' is required.",
      });
      return;
    }
    const sql = `
      SELECT * FROM (
        SELECT
          prod_code,
          prod_name,
          upp,
          uppp,
          p_uom,
          l_uom,
          prin_code
        FROM MS_PRODUCT_JASRA
        WHERE PRIN_CODE IN (
          SELECT A.prin_code
          FROM MS_PRINCIPAL_JASRA A
          JOIN MS_DEPARTMENT_JASRA B ON A.PRIN_DEPT_CODE = B.DEPT_CODE
          JOIN MS_HR_DIVISION_JASRA C ON B.div_code = C.DIV_CODE
          WHERE C.DIV_CODE = :div_code
        )
        UNION ALL
        SELECT
          'NEWITEM' AS prod_code,
          'ITEM NEW' AS prod_name,
          10000 AS upp,
          1 AS uppp,
          'PCS' AS p_uom,
          'BOX' AS l_uom,
          (SELECT MIN(A.prin_code)
             FROM MS_PRINCIPAL_JASRA A
             JOIN MS_DEPARTMENT_JASRA B ON A.PRIN_DEPT_CODE = B.DEPT_CODE
             JOIN MS_HR_DIVISION_JASRA C ON B.div_code = C.DIV_CODE
            WHERE C.DIV_CODE = :div_code
          ) AS prin_code
        FROM DUAL
      ) WHERE ROWNUM <= 5000
    `;

    const result = await oracleDb.query(sql, { div_code: { val: div_code } });

    const data = result?.rows || result;

    res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error: any) {
    console.error("Error fetching product data:", error);
    next(error);
  }
};


