import { Request, Response, NextFunction } from "express";
import { oracleDb } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IUser } from "../../../../interfaces/user.interface"
import { ISearch, RequestWithUser } from "../../../../interfaces/common.interface";

export const getddPrinceCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { company_code, prin_code } = req.query;

    if (!company_code || !prin_code) {
      res.status(400).json({
        success: false,
        message: "Parameters 'company_code' and 'prin_code' are required.",
      });
      return;
    }

    const result = await oracleDb.query(
      `
      SELECT
        *
      FROM VW_MS_CUSTOMER
      WHERE company_code = :company_code 
        AND prin_code = :prin_code
        AND ROWNUM <= 5000
      `,
      {
        company_code,
        prin_code
      }
    );

    const locationData = result.rows || [];

    res.status(200).json({
      success: true,
      data: locationData,
    });
  } catch (error: any) {
    console.error("Error fetching location data:", error);
    next(error);
  }
};