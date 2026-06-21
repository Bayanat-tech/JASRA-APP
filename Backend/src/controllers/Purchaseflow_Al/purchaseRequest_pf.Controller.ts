import { Request, Response } from "express";
import { sequelize } from "../../database/connection";
import { QueryTypes } from "sequelize";
import { upsertPurchaseRequest } from "./purchaseRquestdbupdate_pf.Controller";

import constants from "../../helpers/constants";
import {
  IPurchaseOrder,
  IPurchaseRequestPf,
  IItemPrRequest,
  IPrtermnscondition,
  IBasicPrRequest,
} from "./Purucahseflow.interface";
// Define interfaces for Purchase Request Header and Detail
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";

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
import { PurchaseRequestHeader } from "../../models/Purchaseflow/purchaserequest_pf.model";
import { PurchaseRequestDetail } from "../../models/Purchaseflow/purchaserequest_pf.model";
import { DecimalDataType } from "sequelize";
// THIS FUNCTION TO GET DATA FOR DATA ENTRY OF HEADER,DETAIL AND TERMS AND CONDITION
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
    const querycount =
      "SELECT COUNT(*) AS count FROM PURCHASE_REQUEST_HEADER WHERE REQUEST_NUMBER = :request_number";

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
     FROM VW_PURCHASE_REQUEST_ENTRY_HEADER_AL AS PurchaseRequestHeader WHERE PurchaseRequestHeader.request_number = :request_number    LIMIT 1;`;

     console.log(query)
    const querydetail = `SELECT * FROM VW_PURCHASE_REQUEST_ENTRY_DETAIL_AL AS PurchaseRequestDetails WHERE PurchaseRequestDetails.REQUEST_NUMBER = :request_number ORDER BY  ITEM_SRNO 
   ;`;
   console.log(querydetail)

    const termcondition = `
  SELECT request_number, supplier as tsupplier, remarks, dlvr_term, payment_terms,quatation_reference,delivery_address
  FROM PR_SUPPL_TERM_COND_AL
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
export const createOrUpdatePurchaseRequestSequential = async (
  req: RequestWithUser,
  res: Response
) => {
  console.log("Incoming request dataXXXX:", req.body);

  // Destructure the incoming request body
  const {
    request_number,
    request_date,
    description,
    project_code,
    company_code,
    created_by,
    updated_by,
    wo_number,
    remarks,
    type_of_contract,
    type_of_material_supply,
    contract_soft_hard,
    amc_service_status,
    material_mechanical,
    material_electrical,
    material_plumbing,
    material_tools,
    material_civil,
    material_ac,
    material_cleaning,
    material_other,
    services_temp_staff,
    services_rentals,
    services_subcon_conslt,
    services_other,
    other_stationery,
    other_it,
    other_new_uniform_ppe,
    other_rplcmt_uniform,
    other_other,
    good_material_request,
    service_request,
    last_action,
    created_at,
    updated_at,
    flow_level_running,
    fa_uploaded,
    final_approved,
    items,
    Termscondition,
    service_type,
    need_by_date
  } = req.body;

  
  try {
    const purchaseRequest = mapIncomingRequestData(req.body);
    console.log("Before upsertPurchaseRequest with data:", purchaseRequest);

    await upsertPurchaseRequest(purchaseRequest); // Call the function with the correctly structured data
    console.log("After upsertPurchaseRequest");

    res.status(200).json({
      success: true,
      message: "Purchase request processed successfully.",
    });
  } catch (error) {
    console.error("Error saving/updating purchase request:", error);
    res.status(500).json({
      success: false,
      message: "Error saving/updating purchase request.",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

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

  // Construct the purchase request object
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
      : [], // Default to empty array if not an array
  };
  const transaction = await sequelize.transaction();
  try {
    console.log("Before if");
    if (purchaseRequest.last_action === "Pomodify") {
      console.log("inside POmodify if");
      try {
        for (const item of purchaseRequest.items) {
          console.log("po_mod_final_rate", item.po_mod_final_rate);
          console.log("po_mod_amount", item.po_mod_amount);
          console.log("companyCode", requestUser.company_code);
          console.log("ref_doc_no", item.ref_doc_no);
          console.log("item_code", item.item_code);

          const updateQuery = `
            UPDATE PURCHASE_REQUEST_DETAILS 
            SET 
              po_mod_final_rate = ?, 
              po_mod_amount = ?, 
              po_confirm = 'N', 
              po_cancel = 'N' 
            WHERE 
              company_code = ? 
              AND ref_doc_no = ? 
              AND item_code = ?;
          `;
          const params = [
            item.po_mod_final_rate,
            item.po_mod_amount,
            requestUser.company_code,
            item.ref_doc_no,
            item.item_code,
          ];

          await sequelize.query(updateQuery, {
            replacements: params,
            transaction,
          });

          console.log(
            `Updated po_mod_final_rate, po_mod_amount, PO_CONFIRM, and PO_CANCEL for item: ${item.item_code}`
          );
        }
        // Commit the transaction after all updates are successful
        await transaction.commit();
        console.log("Transaction committed successfully.");
      } catch (error) {
        // Rollback transaction in case of any error
        await transaction.rollback();
        console.error("Transaction rolled back due to error:", error);
      }
    }

    if (
      purchaseRequest.last_action === "Confirm" ||
      purchaseRequest.last_action === "Cancel"
    ) {
      const requestUser: IUser = req.user; // Ensure req.user is properly defined
      let updateQuery = "";
      if (purchaseRequest.last_action === "Confirm") {
        updateQuery =
          "UPDATE PURCHASE_REQUEST_DETAILS SET HISTORY_SERIAL = 0,PO_CONFIRM = 'Y', PO_CANCEL = 'N',PO_DATE = NOW() WHERE REF_DOC_NO = ? AND COMPANY_CODE = ?;";
        // Execute the query with appropriate parameters
      } else if (purchaseRequest.last_action === "Cancel") {
        updateQuery =
          "UPDATE PURCHASE_REQUEST_DETAILS SET PO_CANCEL = 'Y' WHERE REF_DOC_NO = ? AND COMPANY_CODE = ?;";
        // Execute the query with appropriate parameters
      }

      // Start a transaction if needed
      const transaction = await sequelize.transaction();
      try {
        await sequelize.query(updateQuery, {
          replacements: [ref_doc_no, requestUser.company_code],
          transaction,
        });
        await transaction.commit();

        console.log(`Confirmed Purchase Order: ${request_number}`);
      } catch (error) {
        await transaction.rollback();
        console.error("Error in updating purchase request details:", error);
        throw error; // Re-throw for outer error handling
      }
    } else {
      console.log("No confirmation action taken. `last_action` is not 'Y'.");
    }
    res.status(200).json({ message: "Purchase order processed successfully." });
  } catch (error) {
    console.error("Error processing purchase order:", error);
    res.status(500).json({ error: "Failed to process purchase order." });
  }
};

// Updated function
export function mapIncomingRequestData(data: any): IPurchaseRequestPf {
  // Map Items
  const mapItems: IItemPrRequest[] = Array.isArray(data.items)
    ? data.items.map(
        (item: any): IItemPrRequest => ({
          item_code: item.item_code?.toString() || "",
          item_desp: item.item_desp?.toString() || "",
          item_group_desc: item.item_group_desc?.toString() || "",
          item_group_code: item.item_group_code?.toString() || "",
          item_rate: Number(item.item_rate) || 0,
          item_qty: Number(item.item_qty) || 0,
          currency_rate: Number(item.currency_rate) || 0,
          amount: Number(item.amount) || 0,
          company_code: item.company_code?.toString() || "",
          user_dt: item.user_dt ? new Date(item.user_dt).toISOString() : "", // Ensure valid date format
          user_id: item.user_id?.toString() || "",
          request_number: item.request_number?.toString() || "",
          curr_code: item.curr_code?.toString() || "",
          tx_cat_code: item.tx_cat_code?.toString() || "",
          tx_compntcat_code_1: item.tx_compntcat_code_1?.toString() || "",
          tx_compnt_perc_1: Number(item.tx_compnt_perc_1) || 0,
          tx_compnt_amt_1: Number(item.tx_compnt_amt_1) || 0,
          tx_compnt_lcuramt_1: Number(item.tx_compnt_lcuramt_1) || 0,
          tx_compnt_1_expmt: item.tx_compnt_1_expmt?.toString() || "",
          lcurr_amt: Number(item.lcurr_amt) || 0,
          allocated_approved_quantity:
            Number(item.allocated_approved_quantity) || 0,
          selected_item: Boolean(item.selected_item),
          last_action: item.last_action?.toString() || "",
          history_serial: parseInt(item.history_serial, 10) || 0,
          curr_name: item.curr_name?.toString() || "",
          item_srno: item.item_srno?.toString() || "",
          supplier_part_code: item.supplier_part_code?.toString() || "",
          rate_methode: item.rate_methode?.toString() || "",
          item_canel: Boolean(item.item_canel),
          tax_name: item.tax_name?.toString() || "",
          cost_code: item.cost_code?.toString() || "",
          capex: Boolean(item.capex),
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
     delivery_address: term.delivery_address || "",        // Ensures required field is present
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
    create_date: new Date(data.create_date || Date.now()),
    last_updated: data.last_upadated || "",
    request_date: new Date(data.request_date || Date.now()), // Date of request
    ac_name: data.ac_name, // Account name of supplier
    supplier: data.supplier || "", // Supplier code
    description: data.description || "", // Description of request
    remarks: data.remarks || "", // Additional remarks
    amount: data.amount || 0, // Total amount
    department_code: data.department_code || "", // Department code
    flow_code: data.flow_code || "", // Flow code
    flow_level_initial: parseInt(data.flow_level_initial, 10) || 0, // Initial flow level
    flow_level_running: parseInt(data.flow_level_running, 10) || 0, // Running flow level
    flow_level_final: parseInt(data.flow_level_final, 10) || 0, // Final flow level
    company_code: data.company_code || "", // Company identifier
    user_dt: data.user_dt || new Date().toISOString(), // User date
    user_id: data.user_id || "", // User identifier
    currency_rate: data.currency_rate || 1, // Currency exchange rate
    fa_uploaded: data.fa_uploaded || false, // FA uploaded flag
    final_approved: data.final_approved || false, // Final approval flag
    remarks_histry: data.remarks_histry || "", // Remarks history
    cancel_flag: data.cancel_flag || false, // Cancellation flag
    tx_cat_code: data.tx_cat_code || "", // Tax category code
    tx_compntcat_code_1: data.tx_compntcat_code_1 || "", // Tax component category code 1
    tx_compntcat_code_2: data.tx_compntcat_code_2 || "", // Tax component category code 2
    tx_compntcat_code_3: data.tx_compntcat_code_3 || "", // Tax component category code 3
    tx_compntcat_code_4: data.tx_compntcat_code_4 || "", // Tax component category code 4
    tx_compnt_1_expmnt: data.tx_compnt_1_expmnt || "", // Tax component 1 experiment data
    create_user: data.create_user || "", // User who created request

    tx_cat_name: data.tx_cat_name || "", // Tax category name
    tx_compntcat_name: data.tx_compntcat_name || "", // Tax component category name
    curr_code: data.curr_code || "", // Currency code
    po_amount: data.po_amount || 0, // Purchase order amount
    curr_name: data.curr_name || "", // Currency name
    flow_description: data.flow_description || "", // Flow description

    last_action: data.last_action || "", // Last action performed
    history_serial: parseInt(data.history_serial, 10) || 0, // History serial number
    cost_code: data.cost_code || "", // Cost code
    request_hod_user: data.request_hod_user || "", // HOD user handling request
  };
  // Combine Data into Final Purchase Request Object
  const purchaseRequest: IPurchaseRequestPf = {
    ...basicPrRequest,
    request_number: data.request_number || "", // Ensure request_number is provided
    companyCode: data.company_code || "",
    items: mapItems,
    termconditions: mapTermsConditions,
  };

  // Final Debug Logging
  console.log("Mapped Purchase Request:", purchaseRequest);

  return purchaseRequest;
}
