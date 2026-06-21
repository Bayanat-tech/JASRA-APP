import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import CustomerMaster from "../../models/Purchaseflow/customermaster_pf_model";
import { customerSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";
import { sequelize } from "../../database/connection";
export const createcustomer = async (req: RequestWithUser, res: Response) => {
  try {
    console.log('inside createcustomer')
    const requestUser: IUser = req.user;

    const { error } = customerSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const {
      cust_code,
      cust_name,
      cust_add1,
      cust_add2,
      cust_add3,
      pincode,
      phone_number,
      email_id,
      company_code,
      created_by,
      updated_by
    } = req.body;

    const customerData = await CustomerMaster.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { cust_code: cust_code }],
      },
    });

    if (customerData) {
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
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_ALREADY_EXISTS,
      });
      return;
    }
 
    console.log ('updated_by',updated_by)
    const createCustomerMaster = await CustomerMaster.create({
      cust_code,
      cust_name,
      cust_add1,
      cust_add2,
      cust_add3,
      pincode,
      phone_number,
      email_id,
      company_code,
      created_by: updated_by, // assign updated_by value to created_by
      updated_by
    });

    if (!createCustomerMaster) {
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
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating customer" });
      return;
    }
    await sequelize.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Customer Added Successfully')`,
      {
        replacements: {
          screen: 'CUSTOMERADDED',
          type: 'success',
          document_number: '', // empty string as in your original call
          userId: updated_by, // pass this properly as a named replacement
        },
      }
    );
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_CREATED_SUCCESSFULLY,
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

export const updatecustomer = async (req: RequestWithUser, res: Response) => {
  try {
    console.log('inside updatecustomer')
    const requestUser: IUser = req.user;

    const { error } = customerSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const {
      cust_code,
      cust_name,
      cust_add1,
      cust_add2,
      cust_add3,
      pincode,
      phone_number,
      email_id,
      company_code,
      updated_by,
      created_by

    } = req.body;
      
console.log ('updated_by',updated_by)
    const customerData = await CustomerMaster.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { cust_code: cust_code }],
      },
    });

    if (!customerData) {
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
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_DOES_NOT_EXIST,
      });
      return;
    }
    const updateCustomerMaster = await CustomerMaster.update(
      {
        cust_name,
        cust_add1,
        cust_add2,
        cust_add3,
        pincode,
        phone_number,
        email_id,
        company_code,
        updated_by,
        created_by

      },
      {
        where: {
          [Op.and]: [{ company_code: company_code }, { cust_code: cust_code }],
        },
      }
    );
    if (!updateCustomerMaster) {
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
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating customer" });
      return;
    }
    await sequelize.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Customer Updated Successfully')`,
      {
        replacements: {
          screen: 'CUSTOMERUPDATED',
          type: 'success',
          document_number: '', // empty string as in your original call
          userId: updated_by, // pass this properly as a named replacement
        },
      }
    );
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_UPDATED_SUCCESSFULLY,
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
