// import { Response } from "express";
// import { Model, Op } from "sequelize";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import { RequestWithUser } from "../../interfaces/common.interface";
// import { IUser } from "../../interfaces/user.interface";
// import Suppliermaster from "../../models/Purchaseflow/suppliermaster_pf.model";
// import { supplierSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";

// export const createSupplier = async (req: RequestWithUser, res: Response) => {
//   try {
//     const requestUser: IUser = req.user;
//     console.log("requestuser", requestUser);
//     // Validate request body
//     const { error } = supplierSchema(req.body);
//     if (error) {
//       res
//         .status(constants.STATUS_CODES.BAD_REQUEST)
//         .json({ success: false, message: error.message });
//       return;
//     }
//     const { supp_code, supp_name, company_code } = req.body;

//     // Check if the supplier already exists
//     const supplierData = await Suppliermaster.findOne({
//       where: {
//         [Op.and]: [{ supp_code }, { company_code }],
//       },
//     });

//     if (supplierData) {
//       res.status(constants.STATUS_CODES.BAD_REQUEST).json({
//         success: false,
//         message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_ALREADY_EXISTS,
//       });
//       return;
//     }

//     // Create the new supplier
//     const createdSupplier = await Suppliermaster.create({
//       supp_code,
//       supp_name,
//       company_code,
//       created_by: requestUser.loginid,
//       updated_by: requestUser.loginid,
//       ...req.body, // Additional fields in the request body
//     });

//     if (!createdSupplier) {
//       res
//         .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: "Error while creating supplier" });
//       return;
//     }

//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_CREATED_SUCCESSFULLY,
//     });
//     return;
//   } catch (error: any) {
//     res
//       .status(constants.STATUS_CODES.BAD_REQUEST)
//       .json({ success: false, message: error.message });
//     return;
//   }
// };

// export const updateSupplier = async (req: RequestWithUser, res: Response) => {
//   try {
//     console.log("inside Supplier update1");
//     const requestUser: IUser = req.user;
//     console.log("requestuser", requestUser);
//     // Validate request body
//     const { error } = supplierSchema(req.body);
//     if (error) {
//       res
//         .status(constants.STATUS_CODES.BAD_REQUEST)
//         .json({ success: false, message: error.message });
//       return;
//     }

//     const {
//       company_code,
//   supp_code,
//   curr_code,
//   country_code,
//   supp_name,
//   supp_addr1,
//   supp_addr2,
//   supp_addr3,
//   supp_addr4,
//   supp_city,
//   supp_contact1,
//   supp_telno1,
//   supp_faxno1,
//   supp_email1,
//   supp_contact2,
//   supp_telno2,
//   supp_faxno2,
//   supp_email2,
//   supp_contact3,
//   supp_telno3,
//   supp_faxno3,
//   supp_email3,
//   supp_ref1,
//   supp_ref2,
//   supp_ref3,
//   service_date,
//   supp_acref,
//   supp_credit,
//   supp_stat,
//   supp_imp_code,
//   supp_lic_no,
//   supp_lic_type,
//   price_check,
//   importer_code,
//   old_supplier_code,
//   mobile,
//   address,
//   cr_number,
//   created_at,
//   updated_at,
//   created_by,
//   updated_by,
//   prin_code,
//   payment_terms,
//   mater_category_code
//     } = req.body;
//     console.log("inside Supplier update2");

//     // Check if the supplier exists
//     const supplierData = await Suppliermaster.findOne({
//       where: {
//         [Op.and]: [{ company_code }, { supp_code }],
//       },
//     });
//     console.log("inside Supplier update3");
//     if (!supplierData) {
//       res.status(constants.STATUS_CODES.BAD_REQUEST).json({
//         success: false,
//         message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_DOES_NOT_EXIST,
//       });
//       return;
//     }
//     console.log("inside Supplier update4");
//     // Update the supplier
//     const updatedSupplier = await Suppliermaster.update(
//       {
//         ...req.body, // Updated fields from request body
//         updated_by: requestUser.loginid,
//       },
//       {
//         where: {
//           [Op.and]: [{ company_code }, { supp_code }],
//         },
//       }
//     );
//     console.log("inside Supplier update5");
//     if (!updatedSupplier) {
//       res
//         .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: "Error while updating supplier" });
//       return;
//     }
//     console.log("requestuser", requestUser);
//     console.log("updated_by", updated_by);
//     await sequelize.query(
//       `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"Supplier updated successfully.")`,
//       {
//         replacements: {
//           screen: "UPDATESUPPLIER",
//           type: "success",
//           document_number: "", // empty string as in your original call
//           userId: requestUser.loginid, // pass this properly as a named replacement
//         },
//       }
//     );

//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_UPDATED_SUCCESSFULLY,
//     });
//     return;
//   } catch (error: any) {
//     const { updated_by } = req.body;
//     console.log("zzvv", updated_by);
//     await sequelize.query(
//       `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'')`,
//       {
//         replacements: {
//           screen: "TRNFAIL",
//           type: "error",
//           document_number: "", // empty string as in your original call
//           userId: updated_by, // pass this properly as a named replacement
//         },
//       }
//     );

//     res
//       .status(constants.STATUS_CODES.BAD_REQUEST)
//       .json({ success: false, message: error.message });
//     return;
//   }
// };
