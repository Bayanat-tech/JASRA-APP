import { Response } from "express";
import { sequelize } from "../../database/connection";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import materialcategory from "../../models/Purchaseflow/materialcategory_pf.model";
import { materialcategorySchema } from "../../validation/Purchaseflow/Purchaseflow.validation";

export const creatematerialcategory = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = materialcategorySchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { mater_category_code, mater_category_desp, company_code ,  created_by,
      updated_by} = req.body;

    const materialcategoryData = await materialcategory.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { mater_category_code: mater_category_code }],
      },
    });

    if (materialcategoryData) {
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Material Category already exists')`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Material Category Already Exists',
      });
      return;
    }

    const creatematerialcategory = await materialcategory.create({
      mater_category_code,
      mater_category_desp,
      company_code,
      created_by: updated_by, // assign updated_by value to created_by
      updated_by: updated_by,
    });

    if (!creatematerialcategory) {
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"")`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while Material Category code" });
      return;
    }
     await sequelize.query(
          `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Material Category Code Added Successfully')`,
          {
            replacements: {
              screen: 'MATCATEGORYCODEADDED',
              type: 'success',
              document_number: '', // empty string as in your original call
              userId: updated_by, // pass this properly as a named replacement
            },
          }
        );
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: 'Material Category Successfully Added',
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updatematerialcategory = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = materialcategorySchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

      
    const {  mater_category_code, mater_category_desp, company_code ,  created_by,
      updated_by} = req.body;

    const materialcategoryData = await materialcategory.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { mater_category_code: mater_category_code }],
      },
    });

    if (!materialcategoryData) {
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"Transaction Fail,Customer Does not Exists")`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Material Category does not Exists',
      });
      return;
    }
    const creatematerialcategory = await materialcategory.update(
      {
        company_code,
        created_by: updated_by,
        updated_by: updated_by,

        ...req.body,
      },
      {
        where: {
          [Op.and]: [{ company_code: company_code }, { mater_category_code: mater_category_code }],
        },
      }
    );
    if (!creatematerialcategory) {
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"")`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }
    await sequelize.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Material category Code Updated Successfully')`,
      {
        replacements: {
          screen: 'MATCATCODEADDED',
          type: 'success',
          document_number: '', // empty string as in your original call
          userId: updated_by, // pass this properly as a named replacement
        },
      }
    );
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: 'Material Category Updated Successfully',
    });
    return;
  } catch (error: any) {
    const { mater_category_code, mater_category_desp, company_code ,  created_by,
      updated_by} = req.body;
    await sequelize.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"")`,
      {
        replacements: {
          screen: 'TRNFAIL',
          type: 'error',
          document_number: '', // empty string as in your original call
          userId: updated_by, // pass this properly as a named replacement
        },
      }
    );
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const deletematerialcategory = async (req: RequestWithUser, res: Response) => {
  try {

    const materialcategorycode = req.body;
    const { mater_category_code, mater_category_desp, company_code ,  created_by,
      updated_by} = req.body;
    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          "Material Category Select At least one Category",
      });
      return;
    }
    const materialcategoryDeleteResponse = await materialcategory.destroy({
      where: {
        mater_category_code: mater_category_code,
      },
    });
    if (materialcategoryDeleteResponse === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: materialcategoryDeleteResponse,
      });
      return;
    }
    await sequelize.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Material Category Code Deleted Successfully')`,
      {
        replacements: {
          screen: 'MATCATEGORYCODEDELETED',
          type: 'success',
          document_number: '', // empty string as in your original call
          userId: updated_by, // pass this properly as a named replacement
        },
      }
    );
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: 'Material Category Succssfully Deleted',
    });
    return;
  } catch (error: any) {
    const {  company_code ,  created_by,
      updated_by} = req.body;
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"")`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
