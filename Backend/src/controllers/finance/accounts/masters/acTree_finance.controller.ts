// Import required dependencies and interfaces
import { Response } from "express";
import constants from "../../../../helpers/constants";
import {
  IFiles,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { IUser } from "../../../../interfaces/user.interface";

// Import database models
import Account from "../../../../models/finance/accounts/masters/account_finance.model";
import AccountLevelFour from "../../../../models/finance/accounts/masters/account_level_four.model";
import AccountLevelThree from "../../../../models/finance/accounts/masters/account_level_three.model";

// Import validation schemas
import {
  accountFinanceSchema,
  accountLevelFourFinanceSchema,
  accountLevelThreeFinanceSchema,
} from "../../../../validation/finance/accounts/masters.validation";
import AccountLevelTwo from "../../../../models/finance/accounts/masters/account_level_two.model";
import VwAcMaster from "../../../../views/finance/accounts/masters/acTree.view";
import { buildHierarchy } from "../../../../helpers/functions";
import { sequelize } from "../../../../database/connection";
import Files from "../../../../models/files.model";

// Get account tree structure
export const getAcTree = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    // Get account tree data ordered by level codes
    const acTreeData = await VwAcMaster.findAll({
      where: { company_code: requestUser.company_code },
      order: [
        ["l2_code", "ASC"],
        ["l3_code", "ASC"],
        ["l4_code", "ASC"],
        ["ac_code", "ASC"],
      ],
    });
    if (!acTreeData) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({ success: false });
      return;
    }
    const temp = acTreeData.map((eachData) => eachData.dataValues);

    // Build hierarchical structure from flat data
    const response = buildHierarchy(temp);
    res
      .status(constants.STATUS_CODES.OK)
      .json({ success: true, data: response });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Level 3 Account Operations
//---------level3-----------

// Get Level 3 account node details
export const getLevel3AcTreeNode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { ac_code } = req.params;
    // Find Level 3 account by code
    const level3Data = await AccountLevelThree.findOne({
      where: { company_code: requestUser.company_code, l3_code: ac_code },
    });
    if (!level3Data) {
      res
        .status(constants.STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: constants.MESSAGES.NOT_FOUND });
      return;
    }
    res
      .status(constants.STATUS_CODES.OK)
      .json({ success: true, data: level3Data });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Create new Level 3 account node
export const createLevel3AcTreeNode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { company_code, loginid } = requestUser;
    const { l2_code } = req.body;

    // Validate request body
    const { error } = accountLevelThreeFinanceSchema(req.body);

    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Check if parent Level 2 exists
    const isLevelTwoExists = await AccountLevelTwo.findOne({
      where: {
        l2_code,
        company_code,
      },
    });
    if (!isLevelTwoExists) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Level2 " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }

    // Create Level 3 account
    const response = await AccountLevelThree.create({
      l3_code: "",
      company_code,
      updated_by: loginid,
      created_by: loginid,
      ...req.body,
    });

    // Get session code for response message
    const getSessionCode: { code: string }[][] = (await sequelize.query(
      `SELECT code from GT_SESSION_INFO WHERE USERID='${req.user.loginid}'`
    )) as { code: string }[][];

    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        getSessionCode[0][0].code +
        " " +
        constants.MESSAGES.CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Update Level 3 account node
export const updateLevel3AcTreeNode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { ac_code } = req.params;

    // Validate request body
    const { error } = accountLevelThreeFinanceSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Check if account exists
    const accountData = await AccountLevelThree.findOne({
      where: { l3_code: ac_code, company_code: requestUser.company_code },
    });
    if (!accountData) {
      res
        .status(constants.STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: constants.MESSAGES.NOT_FOUND });
      return;
    }

    // Check if parent Level 2 exists
    const isLevelTwoExists = await AccountLevelTwo.findOne({
      where: { l2_code: req.body.l2_code },
    });
    if (!isLevelTwoExists) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Level2 " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }

    // Update Level 3 account
    const response = await AccountLevelThree.update(
      {
        l3_code: ac_code,
        ...req.body,
        updated_by: requestUser.loginid,
      },
      { where: { l3_code: ac_code, company_code: requestUser.company_code } }
    );
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Level 4 Account Operations
//---------level4-----------

// Get Level 4 account node details
export const getLevel4AcTreeNode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { ac_code } = req.params;
    const level4Data = await AccountLevelFour.findOne({
      where: { company_code: requestUser.company_code, l4_code: ac_code },
    });
    if (!level4Data) {
      res
        .status(constants.STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: constants.MESSAGES.NOT_FOUND });
      return;
    }
    res
      .status(constants.STATUS_CODES.OK)
      .json({ success: true, data: level4Data });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Create new Level 4 account node
export const createLevel4AcTreeNode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { company_code } = requestUser;

    // Validate request body
    const { error } = accountLevelFourFinanceSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Check if parent Level 3 exists
    const isLevelThreeExists = await AccountLevelThree.findOne({
      where: { l3_code: req.body.l3_code },
    });
    if (!isLevelThreeExists) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Level3 " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }

    // Create Level 4 account
    const response = await AccountLevelFour.create({
      l4_code: "",
      company_code,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
      ...req.body,
    });

    // Get session code for response message
    // const getSessionCode: { code: string }[][] = (await sequelize.query(
    //   `SELECT code from GT_SESSION_INFO WHERE USERID='${req.user.loginid}'`
    // )) as { code: string }[][];

    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        // getSessionCode[0][0].code +
        // " " +
        constants.MESSAGES.CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Update Level 4 account node
export const updateLevel4AcTreeNode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { ac_code } = req.params;

    // Validate request body
    const { error } = accountLevelFourFinanceSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Check if account exists
    const accountData = await AccountLevelFour.findOne({
      where: { l4_code: ac_code, company_code: requestUser.company_code },
    });
    if (!accountData) {
      res
        .status(constants.STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: constants.MESSAGES.NOT_FOUND });
      return;
    }

    // Check if parent Level 3 exists
    const isLevelThreeExists = await AccountLevelThree.findOne({
      where: { l3_code: req.body.l3_code },
    });
    if (!isLevelThreeExists) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Level3 " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }

    // Update Level 4 account
    const response = await AccountLevelFour.update(
      {
        l4_code: ac_code,
        ...req.body,
        updated_by: requestUser.loginid,
      },
      { where: { l4_code: ac_code, company_code: requestUser.company_code } }
    );
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Level 5 Account Operations (Account Children)
//---------level5-----------

// Get account children node details
export const getAccountChildrenAcTreeNode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { ac_code } = req.params;
    const accountData = await Account.findOne({
      where: { company_code: requestUser.company_code, ac_code },
    });
    if (!accountData) {
      res
        .status(constants.STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: constants.MESSAGES.NOT_FOUND });
      return;
    }
    res
      .status(constants.STATUS_CODES.OK)
      .json({ success: true, data: accountData });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Create new account children node
export const createAccountChildrenAcTreeNode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { company_code } = requestUser;

    // Validate request body
    const { error } = accountFinanceSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Check if parent Level 4 exists
    const isLevelFourExists = await AccountLevelFour.findOne({
      where: { l4_code: req.body.l4_code },
    });
    if (!isLevelFourExists) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Level4 " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }

    // Separate files from request body
    const { files, ...data } = req.body;

    // Create account
    const response = await Account.create({
      ac_code: "",
      company_code,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
      ...data,
    });

    // Get session code and handle file uploads
    const getSessionCode: { code: string }[][] = (await sequelize.query(
      `SELECT code from GT_SESSION_INFO WHERE USERID='${req.user.loginid}'`
    )) as { code: string }[][];
    files.forEach((item: any) => {
      item.request_number = "ACCT" + getSessionCode[0][0].code;
    });
    if (!!files && files.length) {
      await Files.bulkCreate(
        (files as IFiles[]).map((eachFile) => {
          return {
            ...eachFile,
            request_number: "ACCT" + getSessionCode[0][0].code,
          };
        })
      );
    }
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        getSessionCode[0][0].code +
        " " +
        constants.MESSAGES.CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updateAccountChildrenAcTreeNode = async (
  // Update account children node
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { ac_code } = req.params;
    const { error } = accountFinanceSchema(req.body);

    // Validate request body
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const accountData = await Account.findOne({
      // Check if account exists
      where: { ac_code, company_code: requestUser.company_code },
    });
    if (!accountData) {
      res
        .status(constants.STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: constants.MESSAGES.NOT_FOUND });
      return;
    }
    const isLevelFourExists = await AccountLevelFour.findOne({
      // Check if parent Level 4 exists
      where: { l4_code: req.body.l4_code },
    });
    if (!isLevelFourExists) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Level4 " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }

    const { files, ...data } = req.body;
    // Handle file uploads
    files.forEach((item: any) => {
      item.request_number = "ACCT" + ac_code;
    });
    if (!!files && files.length) {
      await Files.bulkCreate(
        (files as IFiles[]).map((eachFile) => {
          return {
            ...eachFile,
            request_number: "ACCT" + ac_code,
          };
        })
      );
    }
    const response = await Account.update(
      // Update account
      {
        ac_code,
        ...data,
        updated_by: requestUser.loginid,
      },
      { where: { ac_code, company_code: requestUser.company_code } }
    );
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
//----------------delete----------

// Delete Operations
export const deleteAccountItem = async (
  // Delete account item based on level
  req: RequestWithUser,
  res: Response
) => {
  try {
    const level = req.params.level,
      ac_code = req.query.ac_code;
    const requestUser = req.user;
    let response;
    await sequelize.transaction(async (t) => {
      // Use transaction for delete operations
      switch (Number(level)) {
        case 3:
          // Delete Level 3 account
          await AccountLevelThree.update(
            {
              updated_by: requestUser.loginid,
            },
            {
              where: {
                l3_code: ac_code,
                company_code: requestUser.company_code,
              },
              transaction: t,
            }
          );
          response = await AccountLevelThree.destroy({
            where: { l3_code: ac_code, company_code: requestUser.company_code },
            transaction: t,
          });
          break;
        case 4:
          // Delete Level 4 account
          response = await AccountLevelFour.destroy({
            where: { l4_code: ac_code, company_code: requestUser.company_code },
          });
          break;
        case 5:
          // Delete Level 5 account (Account)
          await Account.update(
            {
              updated_by: requestUser.loginid,
            },
            {
              where: {
                ac_code,
                company_code: requestUser.company_code,
              },
              transaction: t,
            }
          );
          response = await Account.destroy({
            where: { ac_code, company_code: requestUser.company_code },
            transaction: t,
          });
          break;
      }
    });
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
    }
    res.status(constants.STATUS_CODES.OK).json({
      message: constants.MESSAGES.DELETED_SUCCESSFULLY,
      success: true,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
