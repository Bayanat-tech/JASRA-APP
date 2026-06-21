import { Request, Response, NextFunction } from "express";
import { sequelize } from "../../../../database/connection";

import { QueryTypes } from "sequelize";
import constants from "../../../../helpers/constants";
import { IUser } from "../../../../interfaces/user.interface"
import { ISearch, RequestWithUser } from "../../../../interfaces/common.interface";

export const getddSiteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
   

    const locationData = await sequelize.query(
      // `
      // SELECT
      //   SITE_CODE,
      //   LOCATION_CODE,
      //   LOC_DESC,
      //   LOC_TYPE,
      //   LOC_STAT
      // FROM MS_LOCATION
      // WHERE company_code = :company_code AND site_code = :site_code
      // LIMIT 0, 5000
      // `
      `SELECT * FROM VW_PRODUCT_LOCATION_AVL_QTY`
      ,
      {
        replacements: {  },
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      success: true,
      data: locationData,
    });
  } catch (error: any) {
    console.error("Error fetching location data:", error);
    next(error);
  }
};



