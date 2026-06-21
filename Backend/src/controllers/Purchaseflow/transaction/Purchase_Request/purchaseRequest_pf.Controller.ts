import { Request, Response } from "express";
import { sequelize } from "../../../../database/connection";
import { QueryTypes } from "sequelize";
import { upsertPurchaseRequest } from "./purchaseRquestdbupdate_pf.Controller";
import { createLog, notifyUser } from "../../../../helpers/functions"; // For mail notifications

import constants from "../../../../helpers/constants";
import {
  IPurchaseOrder,
  IPurchaseRequestPf,
  IItemPrRequest,
  IPrtermnscondition,
  IBasicPrRequest,
} from "../../../../interfaces/Purchaseflow/transaction/purchase_request/Purchase_request";
// Define interfaces for Purchase Request Header and Detail
import { RequestWithUser } from "../../../../interfaces/common.interface";
import { IUser } from "../../../../interfaces/user.interface";

interface VPurchaseRequestHeader {
  request_number: string;
  request_date: Date;
  description: string;
  company_code: string;
}

interface VPurchaseRequestDetail {
  item_code: string;
  item_rate: number;
  service_rm_flag: string;
  item_p_qty: number;
  supplier: string;
  p_uom: string;
  item_l_qty: number;
  allocated_approved_quantity: number;
  l_uom: string;
  amount: number;
  upp: number;
  last_action: string;
  cost_code: string;
  addl_item_desc: string;
  old_item_code: string; // Ensure this exists if you're using it in the update
}

import { number } from "joi";
import { PurchaseRequestHeader } from "../../../../models/Purchaseflow/purchaserequest_pf.model";
import { PurchaseRequestDetail } from "../../../../models/Purchaseflow/purchaserequest_pf.model";
import { DecimalDataType } from "sequelize";

export const getPurchaserequest = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    //console.log(RequestWithUser);
    console.log("inside getrequest");
    console.log("request_number");
    const { request_number } = req.params;
    console.log("request_number");
    console.log(request_number);

    if (typeof request_number === "string") {
      let ls_request_number = request_number.replace(/\$\$/g, "/");
      console.log("Replacement successful:", request_number); // Output: PR/24/0001
    } else {
      console.error("Error: request_number is not a string.", request_number);
    }
    let querycount = "";
    if (request_number.includes("PO$")) {
      querycount =
        "SELECT COUNT(*) AS count FROM PURCHASE_REQUEST_HEADER WHERE REQUEST_NUMBER = :request_number";
    } else {
      querycount =
        "SELECT COUNT(*) AS count FROM PURCHASE_REQUEST_DETAILS WHERE REF_DOC_NO = :request_number";
    }

    try {
      const [countResult] = await sequelize.query(querycount, {
        replacements: { request_number: request_number },
        type: QueryTypes.SELECT,
      });

      const count =
        Array.isArray(countResult) && countResult.length > 0
          ? countResult[0].count
          : 0;

      console.log(`Count for request_number ${request_number}:`, count);
      let count1 = 1;
      if (request_number.includes("PO$")) {
        const poquerydetail = `select * from GT_PO_PRINT_DETAILS;`;
        console.log(poquerydetail);

        const procedureQuery = `CALL PRO_PO_PRINT_DATA( :request_number, :company_code)`;
        const procedureResult = await sequelize.query(procedureQuery, {
          replacements: {
            company_code: requestUser.company_code,
            request_number: request_number,
          },
          type: QueryTypes.RAW, // For calling stored procedures
        });
        const poquery = `select * from GT_PO_PRINT_HEADER;`;
        // Execute the SQL query using Sequelize
        const [RequestheaderData] = await sequelize.query(poquery, {
          replacements: { request_number },
          type: QueryTypes.SELECT,
        });

        // Fetch RequestdetailData (multiple rows)
        const RequestdetailData = await sequelize.query(poquerydetail, {
          replacements: { request_number },
          type: QueryTypes.SELECT,
        });
        const items = RequestdetailData.map((detail) => detail);
        if (!RequestheaderData || !RequestdetailData) {
          res.status(constants.STATUS_CODES.NOT_FOUND).json({
            success: false,
            message: "Purchase Request " + constants.MESSAGES.DOES_NOT_EXISTS,
          });
          return;
        }
        res.status(constants.STATUS_CODES.OK).json({
          success: true,
          data: {
            ...RequestheaderData, // Spread the header data
            items: RequestdetailData.map((detail) => detail), // Correct assignment
          },
          console,
        });
        return;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: knownError.message });
      return;
    }

    // Continue with the rest of your logic if count is not 0
    console.log("Count is not zero, proceeding with other operations.");

    const query = `SELECT *
     FROM VW_PURCHASE_REQUEST_HEADER AS PurchaseRequestHeader WHERE PurchaseRequestHeader.request_number = :request_number    LIMIT 1;`;

    /*  const querydetail = `SELECT request_number, item_code, item_rate, amount, cost_code, service_rm_flag, item_p_qty, p_uom, item_l_qty, allocated_approved_quantity,
 l_uom, addl_item_desc, upp,discount_amount,supplier FROM PURCHASE_REQUEST_DETAILS AS PurchaseRequestDetails WHERE PurchaseRequestDetails.request_number =  :request_number ;`;*/

    const querydetail = `SELECT * FROM VW_PURCHASE_REQUEST_TRANSACTION1 AS PurchaseRequestDetails WHERE PurchaseRequestDetails.REQUEST_NUMBER = :request_number and prin_code = '10001' ORDER BY  item_sequence_no) ;`;
    console.log(querydetail);

    const termcondition = `
  SELECT request_number, supplier as tsupplier, remarks, dlvr_term, payment_terms,quatation_reference,delivery_address
  FROM PR_SUPPL_TERM_COND
  WHERE request_number = :request_number
`;

    /*const querydetail =
      'SELECT * FROM VW_PURCHASE_RQUEST_TRANSACTION AS PurchaseRequestDetails WHERE PurchaseRequestDetails.request_number =  :request_number ;`*/

    // Execute the SQL query using Sequelize
    const [RequestheaderData] = await sequelize.query(query, {
      replacements: { request_number },
      type: QueryTypes.SELECT,
    });

    // Fetch RequestdetailData (multiple rows)
    const RequestdetailData = await sequelize.query(querydetail, {
      replacements: { request_number },
      type: QueryTypes.SELECT,
    });

    const Termconditiondata = await sequelize.query(termcondition, {
      replacements: { request_number },
      type: QueryTypes.SELECT,
    });

    console.log(RequestheaderData);
    console.log(RequestdetailData);
    console.log(Termconditiondata);
    const items = Termconditiondata.map((detail) => detail);

    // const Termscondition = Termconditiondata.map((detail) => detail);

    if (!RequestheaderData || !RequestdetailData) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Purchase Request " + constants.MESSAGES.DOES_NOT_EXISTS,
      });
      return;
    }
    // Pass the array to the frontend
    // Pass the array to the frontend
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: {
        ...RequestheaderData, // Include header data
        items: RequestdetailData, // Include request details
        Termscondition: Termconditiondata, // Include the array of terms and conditions
      },
    });

    return;
  } catch (error: unknown) {
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: knownError.message });
  }
};

// Construct the purchase request object
// Assuming termconditions is passed into the function or available in the current context
// export const createOrUpdatePurchaseRequestSequential = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   console.log("Incoming request dataXXXX:", req.body);

//   // Destructure the incoming request body
//   const {
//     request_number,
//     request_date,
//     description,
//     project_code,
//     company_code,
//     created_by,
//     updated_by,
//     wo_number,
//     remarks,
//     type_of_contract,
//     type_of_material_supply,
//     contract_soft_hard,
//     amc_service_status,
//     material_mechanical,
//     material_electrical,
//     material_plumbing,
//     material_tools,
//     material_civil,
//     material_ac,
//     material_cleaning,
//     material_other,
//     services_temp_staff,
//     services_rentals,
//     services_subcon_conslt,
//     services_other,
//     other_stationery,
//     other_it,
//     other_new_uniform_ppe,
//     other_rplcmt_uniform,
//     other_other,
//     good_material_request,
//     service_request,
//     last_action,
//     created_at,
//     updated_at,
//     flow_level_running,
//     fa_uploaded,
//     final_approved,
//     items,
//     Termscondition,
//     service_type,
//     need_by_date
//   } = req.body;

//   try {
//     const purchaseRequest = mapIncomingRequestData(req.body);
//     console.log("Before upsertPurchaseRequest with data:", purchaseRequest);

//     await upsertPurchaseRequest(purchaseRequest); // Call the function with the correctly structured data
//     console.log("After upsertPurchaseRequest");

//     res.status(200).json({
//       success: true,
//       message: "Purchase request processed successfully.",
//     });
//   } catch (error) {
//     console.error("Error saving/updating purchase request:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error saving/updating purchase request.",
//       error:
//         error instanceof Error ? error.message : "An unknown error occurred",
//     });
//   }
// };

export const updatePurchaseOrder = async (
  req: RequestWithUser,
  res: Response
) => {
  const requestUser: IUser = req.user;
  const {
    companyCode,
    doc_no,
    doc_date,
    ref_doc_no,
    supplier,
    request_number,
    div_code,
    po_confirm,
    po_cancel,
    cancel_type,
    supp_name,
    dlvr_term,
    supp_addr1,
    supp_addr2,
    supp_addr3,
    supp_addr4,
    supp_telno1,
    supp_faxno1,
    supp_email1,
    project_code,
    project_name,
    wo_number,
    remarks,
    payment_terms,
    last_action,
    items,
  } = req.body;

  console.log("Incoming request data:", req.body);

  const purchaseRequest: IPurchaseOrder = {
    companyCode,
    doc_no,
    doc_date,
    ref_doc_no,
    supplier,
    request_number,
    div_code,
    po_confirm,
    po_cancel,
    cancel_type,
    supp_name,
    delvr_term: dlvr_term,
    supp_addr1,
    supp_addr2,
    supp_addr3,
    supp_addr4,
    supp_telno1,
    supp_faxno1,
    supp_email1,
    project_code,
    project_name,
    wo_number,
    remarks,
    payment_terms,
    last_action,
    items: Array.isArray(items)
      ? items.map((item) => ({
          request_number,
          cost_code: item.cost_code,
          item_code: item.item_code,
          final_rate: item.final_rate,
          allocated_approved_quantity: item.allocated_approved_quantity,
          item_p_qty: item.item_p_qty,
          item_l_qty: item.item_l_qty,
          p_uom: item.puom,
          upp: item.upp,
          appr_item_l_qty: item.appr_item_l_qty,
          appr_item_p_qty: item.appr_item_p_qty,
          currency_rate: item.currency_rate,
          amount: item.amount,
          company_code: item.company_code,
          curr_code: item.curr_code,
          lcurr_amt: item.lcurr_amt,
          item_cancel: item.item_cancel,
          supplier: item.supplier,
          service_rm_flag: item.service_rm_flag,
          addl_item_desc: item.addl_item_desc,
          div_code: item.div_code,
          ref_doc_no: item.ref_doc_no,
          sr_no: item.sr_no,
          po_mod_appr_qty: item.po_mod_appr_qty,
          po_mod_final_rate: item.po_mod_final_rate,
          po_confirm: item.po_confirm,
          po_cancel: item.po_cancel,
          po_mod_amount: item.po_mod_amount,
        }))
      : [],
  };

  const transaction = await sequelize.transaction();
  try {
    // Handle PO Modification
    if (purchaseRequest.last_action === "Pomodify") {
      for (const item of purchaseRequest.items) {
        await sequelize.query(
          `UPDATE PURCHASE_REQUEST_DETAILS 
           SET po_mod_final_rate = ?, po_mod_amount = ?, po_confirm = 'N', po_cancel = 'N' 
           WHERE company_code = ? AND ref_doc_no = ? AND item_code = ?`,
          {
            replacements: [
              item.po_mod_final_rate,
              item.po_mod_amount,
              requestUser.company_code,
              item.ref_doc_no,
              item.item_code,
            ],
            transaction,
          }
        );
      }
      await transaction.commit();

      if (supp_email1) {
        await notifyUser({
          event: "PO_MODIFIED",
          subject: `Modified PO: ${purchaseRequest.ref_doc_no}`,
          message: `Dear Sir,
          Please find attached here with our revised LPO for your information and further action.
          Kindly confirm the receipt of this LPO within 48 hours by sending us an Acknowledgement signed and stamped (on both the side) copy of the LPO. Please refer to the terms & conditions as stated in the LPO.
          Note1: Our order number is to be quoted on all relevant Invoices & Delivery Notes. Your Original Invoice to be submitted to our Lusail Head Office within seven days from the date of invoice supported with relevant Delivery Note or Job Completion Report or Service Report or attendance sheet whichever is applicable.
          INVOICE SUBMISSION AND PAYMENT COLLECTION TIMING- SUNDAY TO THURSDAY 2.00 PM TO 3.00 PM
          Thank you.`,
          request_users: supp_email1,
        });
      }
    }

    if (purchaseRequest.last_action === "Confirm") {
      const poCountResult = await sequelize.query(
        "SELECT COUNT(*) AS count FROM PO_DETAILS WHERE REF_DOC_NO = ?",
        { replacements: [purchaseRequest.ref_doc_no], type: QueryTypes.SELECT }
      );
      const count = (poCountResult as { count: number }[])[0]?.count || 0;

      const emailMessage =
        count > 0
          ? `Dear Sir,\n\nPlease find attached our revised LPO for your reference.\n\nBest regards.`
          : `Dear Sir,\n\nPlease find attached herein our LPO for your reference.\n\nBest regards.`;

      const supplierResult = await sequelize.query(
        "SELECT SUPPLIER FROM PURCHASE_REQUEST_DETAILS WHERE REF_DOC_NO = ?",
        { replacements: [purchaseRequest.ref_doc_no], type: QueryTypes.SELECT }
      );
      const supplier =
        (supplierResult as { SUPPLIER: string }[])[0]?.SUPPLIER || "";

      if (supplier) {
        const emailResult = await sequelize.query(
          "SELECT SUPP_EMAIL1 FROM MS_SUPPLIER WHERE SUPP_CODE = ?",
          { replacements: [supplier], type: QueryTypes.SELECT }
        );
        const supplierEmail =
          (emailResult as { SUPP_EMAIL1: string }[])[0]?.SUPP_EMAIL1 || "";

        if (supplierEmail) {
          await notifyUser({
            event: "PO_CONFIRMED",
            subject: `Confirmed PO: ${purchaseRequest.ref_doc_no}`,
            message: `Dear Sir,

Please find attached herein our LPO for your information and further action.

Kindly confirm the receipt of this LPO within 48 hours by sending us an Acknowledgement signed and stamped (on both the side) copy of the LPO. Please refer to the terms & conditions as stated in the LPO.

Note1: Our order number is to be quoted on all relevant Invoices & Delivery Notes. Your Original Invoice to be submitted to our Lusail Head Office within seven days from the date of invoice supported with relevant Delivery Note or Job Completion Report or Service Report or attendance sheet whichever is applicable.

INVOICE SUBMISSION AND PAYMENT COLLECTION TIMING- SUNDAY TO THURSDAY 2.00 PM TO 3.00 PM

Note2: Kindly send your company documents (CR, CC, TL Tax Card, Authorized QID, and Bank Certified Letter for Account details) along with Order Acknowledgements for our Vendor registration.

If you require any further information, please do not hesitate to contact us at procurement@the-maintainers.com

Thank you.`,
            request_users: supplierEmail,
          });
        }
      }

      await sequelize.query(
        "UPDATE PURCHASE_REQUEST_DETAILS SET HISTORY_SERIAL = 0, PO_CONFIRM = 'Y', PO_CANCEL = 'N', PO_DATE = NOW() WHERE REF_DOC_NO = ? AND COMPANY_CODE = ?",
        {
          replacements: [purchaseRequest.ref_doc_no, requestUser.company_code],
          transaction,
        }
      );

      await transaction.commit();
    }

    // Handle PO Cancellation
    if (purchaseRequest.last_action === "Cancel") {
      const supplierResult = await sequelize.query(
        "SELECT SUPPLIER FROM PURCHASE_REQUEST_DETAILS WHERE REF_DOC_NO = ?",
        { replacements: [purchaseRequest.ref_doc_no], type: QueryTypes.SELECT }
      );
      const supplier =
        (supplierResult as { SUPPLIER: string }[])[0]?.SUPPLIER || "";

      if (supplier) {
        const emailResult = await sequelize.query(
          "SELECT SUPP_EMAIL1 FROM MS_SUPPLIER_JASRA WHERE SUPP_CODE = ?",
          { replacements: [supplier], type: QueryTypes.SELECT }
        );
        const supplierEmail =
          (emailResult as { SUPP_EMAIL1: string }[])[0]?.SUPP_EMAIL1 || "";

        if (supplierEmail) {
          await notifyUser({
            event: "PO_CANCELLED",
            subject: `Cancelled PO: ${purchaseRequest.ref_doc_no}`,
            message: `Dear Sir,

Please find attached herewith our cancelled LPO for your information and further action. Please refer to the terms & conditions as stated in the LPO.

If you require any further information, please do not hesitate to contact us at procurement@the-maintainers.com.

Thank you.`,
            request_users: supplierEmail,
          });
        }
      }

      await sequelize.query(
        "UPDATE PURCHASE_REQUEST_DETAILS SET PO_CANCEL = 'Y' WHERE REF_DOC_NO = ? AND COMPANY_CODE = ?",
        {
          replacements: [purchaseRequest.ref_doc_no, requestUser.company_code],
          transaction,
        }
      );

      await transaction.commit();
    }

    res.status(200).json({ message: "Purchase order processed successfully." });
  } catch (error) {
    await transaction.rollback();
    console.error("Transaction rolled back due to error:", error);
    res.status(500).json({ error: "Failed to process purchase order." });
  }
};

// Updated function
export function mapIncomingRequestData(data: any): IPurchaseRequestPf {
  // Map Items
  const mapItems = Array.isArray(data.items)
    ? data.items.map(
        (item: any): IItemPrRequest => ({
          item_code: item.item_code || "",
          item_desp: item.item_desp || "",
          item_group_code: item.item_group_code || "",
          item_rate: parseFloat(item.item_rate) || 0,
          p_uom: item.p_uom || "",
          l_uom: item.l_uom || "",
          upp: parseFloat(item.upp) || 0,
          item_l_qty: parseFloat(item.item_l_qty) || 0,
          item_p_qty: parseFloat(item.item_p_qty) || 0,
          appr_upp: item.appr_upp ? parseFloat(item.appr_upp) : 0,
          appr_item_l_qty: item.appr_item_l_qty
            ? parseFloat(item.appr_item_l_qty)
            : 0,
          appr_item_p_qty: item.appr_item_p_qty
            ? parseFloat(item.appr_item_p_qty)
            : 0,
          currency_rate: item.currency_rate
            ? parseFloat(item.currency_rate)
            : 0,
          amount: parseFloat(item.amount) || 0,
          company_code: item.company_code || "",
          updated_at: new Date(item.updated_at || Date.now()),
          updated_by: item.updated_by || "",
          request_number: item.request_number || "",
          curr_code: item.curr_code || "",
          lcurr_amt: item.lcurr_amt ? parseFloat(item.lcurr_amt) : 0,
          allocated_approved_quantity:
            parseFloat(item.allocated_approved_quantity) || 0,
          supplier: item.supplier || "",
          service_rm_flag: item.service_rm_flag || "",
          addl_item_desc: item.addl_item_desc || "",
          flow_level_running: parseInt(item.flow_level_running, 10) || 0,
          pr_amount: item.pr_amount ? parseFloat(item.pr_amount) : 0,
          po_amount: item.po_amount ? parseFloat(item.po_amount) : 0,
          month_budget: item.month_budget ? parseFloat(item.month_budget) : 0,
          cost_code: item.cost_code || "",
          cost_name: item.cost_name || "",
        })
      )
    : [];

  // Debug Logging for Items
  if (!Array.isArray(data.items)) {
    console.warn("Items is not an array or does not exist:", data.items);
  }

  // Map Terms Conditions
  const mapTermsConditions = Array.isArray(data.Termscondition)
    ? data.Termscondition.map(
        (term: any): IPrtermnscondition => ({
          tsupplier: term.tsupplier || "",
          remarks: term.remarks || "",
          dlvr_term: term.dlvr_term || "",
          payment_terms: term.payment_terms || "",
          quotation_reference: term.quatation_reference || "", // Corrected key name
          delivery_address: term.delivery_address || "", // <-- Add this line
        })
      )
    : [];

  // Debug Logging for TermsCondition
  if (!Array.isArray(data.Termscondition)) {
    console.warn(
      "Termscondition is not an array or does not exist:",
      data.Termscondition
    );
  }

  // Map Basic Request Data
  const basicPrRequest: IBasicPrRequest = {
    requestNumber: data.request_number || "",
    requestDate: new Date(data.request_date || Date.now()),
    description: data.description || "",
    projectCode: data.project_code || "",
    wo_number: data.wo_number || "",
    remarks: data.remarks || "",
    type_of_contract: data.type_of_contract || "",
    type_of_material_supply: data.type_of_material_supply || "",
    contract_soft_hard: data.contract_soft_hard || "",
    amc_service_status: data.amc_service_status || "",
    material_mechanical: data.material_mechanical || "",
    material_electrical: data.material_electrical || "",
    material_plumbing: data.material_plumbing || "",
    material_tools: data.material_tools || "",
    material_civil: data.material_civil || "",
    material_ac: data.material_ac || "",
    material_cleaning: data.material_cleaning || "",
    material_other: data.material_other || "",
    services_temp_staff: data.services_temp_staff || "",
    services_rentals: data.services_rentals || "",
    services_subcon_conslt: data.services_subcon_conslt || "",
    services_other: data.services_other || "",
    other_stationery: data.other_stationery || "",
    other_it: data.other_it || "",
    other_new_uniform_ppe: data.other_new_uniform_ppe || "",
    other_rplcmt_uniform: data.other_rplcmt_uniform || "",
    other_other: data.other_other || "",
    good_material_request: data.good_material_request || "",
    service_request: data.service_request || "",
    last_action: data.last_action || "",
    created_by: data.created_by || "",
    updated_by: data.updated_by || "",
    created_at: new Date(data.created_at || Date.now()),
    updated_at: new Date(data.updated_at || Date.now()),
    flow_level_running: parseInt(data.flow_level_running, 10) || 0,
    final_approved: data.final_approved || "",
    fa_uploaded: data.fa_uploaded || "",
    type_of_pr: data.type_of_pr,
    covered_by_contract_yes: data.covered_by_contract_yes,
    flag_sharing_cost: data.flag_sharing_cost,
    budgeted_yes: data.budgeted_yes,
    checked_store_yes: data.checked_store_yes,
    amount: data.amount,
  };

  // Combine Data into Final Purchase Request Object
  const purchaseRequest: IPurchaseRequestPf = {
    ...basicPrRequest,
    companyCode: data.company_code || "",
    items: mapItems,
    termconditions: mapTermsConditions,
  };

  // Final Debug Logging
  console.log("Mapped Purchase Request:", purchaseRequest);

  return purchaseRequest;
}

export const saveFile = async (
  req: RequestWithUser,
  res: Response
): Promise<Response | void> => {
  const { request_number, files } = req.body;

  // Validate required fields
  if (
    !request_number ||
    !files ||
    !Array.isArray(files) ||
    files.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "request_number and files are required.",
    });
  }

  const duplicateRecords: string[] = [];
  const successfulRecords: { org_file_name: string; sr_no: number }[] = [];

  try {
    for (const file of files) {
      const { org_file_name } = file;

      // Check for duplicate entry
      const duplicateCheckQuery = `
        SELECT COUNT(*) AS count
        FROM UPLOADED_FILES_DLTS
        WHERE request_number = :request_number AND org_file_name = :org_file_name
      `;

      const [duplicateCheckResult]: any = await sequelize.query(
        duplicateCheckQuery,
        {
          replacements: { request_number, org_file_name },
          type: QueryTypes.SELECT,
        }
      );

      if (duplicateCheckResult.count > 0) {
        // Log duplicate record and skip insertion
        duplicateRecords.push(org_file_name);
        continue;
      }

      // Insert new file record
      const query = `
        INSERT INTO UPLOADED_FILES_DLTS (
          company_code, request_number, file_name, extensions, org_file_name, 
          aws_file_locn, flow_level, modules, updated_by, created_by, user_file_name, created_at, updated_at
        ) VALUES (
          :company_code, :request_number, :file_name, :extensions, :org_file_name, 
          :aws_file_locn, :flow_level, :modules, :updated_by, :created_by, :user_file_name, NOW(), NOW()
        )
      `;

      const {
        company_code,
        file_name,
        extensions,
        aws_file_locn,
        flow_level,
        modules,
        updated_by,
        created_by,
        user_file_name,
      } = file;

      await sequelize.query(query, {
        replacements: {
          company_code: company_code || null,
          request_number,
          file_name: file_name || null,
          extensions: extensions || null,
          org_file_name: org_file_name || null,
          aws_file_locn: aws_file_locn || null,
          flow_level: flow_level || null,
          modules: modules || null,
          updated_by: updated_by || null,
          created_by: created_by || null,
          user_file_name: user_file_name || null,
        },
        type: QueryTypes.INSERT,
      });

      // Fetch the SR_NO generated by the trigger
      const fetchSrNoQuery = `
        SELECT SR_NO 
        FROM UPLOADED_FILES_DLTS
        WHERE request_number = :request_number AND org_file_name = :org_file_name
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const [srNoResult]: any = await sequelize.query(fetchSrNoQuery, {
        replacements: { request_number, org_file_name },
        type: QueryTypes.SELECT,
      });

      if (srNoResult?.SR_NO) {
        successfulRecords.push({ org_file_name, sr_no: srNoResult.SR_NO });
      }
    }

    return res.status(200).json({
      success: true,
      message: "File data processed successfully.",
      data: {
        successfulRecords,
        duplicateRecords,
      },
    });
  } catch (error) {
    console.error("Error storing file data:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while storing file data.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
