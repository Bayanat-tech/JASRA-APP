import { Request, Response } from "express";
import oracledb from "oracledb";
import { format } from "date-fns";
import { upsertPurchaseRequest } from "./purchaseRquestdbupdate_pf.Controller";
import { createLog, notifyUser } from "../../helpers/functions";
import constants from "../../helpers/constants";
import { IFiles, RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { setUserLevel } from "../../helpers/globalVariables";
import { BoldReportsController } from "../BoldReportsController";
import {
  IPurchaseOrder,
  IPurchaseRequestPf,
  IItemPrRequest,
  IPrtermnscondition,
  IBasicPrRequest,
} from "../../interfaces/Purchaseflow/Purucahseflow.interface";

interface RequestWithUsercrs extends Request {
  body: {
    LAST_ACTION: string;
    REQUEST_NUMBER: string;
    COMPANY_CODE: string;
    loginid: string;
  };
}

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
  old_item_code: string;
}

interface RevisionResult {
  REVISION_NUMBER: number;
}

export const updatePurchaseOrder = async (req: RequestWithUser, res: Response) => {
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
          po_mod_amount: item.po_mod_amount,
          po_confirm: item.po_confirm,
          po_cancel: item.po_cancel,
        }))
      : [],
  };

  let connection: oracledb.Connection | undefined;

  try {

    // ✅ FIX: Removed manual credentials → use pooled connection
    connection = await oracledb.getConnection();

    // Start transaction
    await connection.execute("SAVEPOINT start_transaction");

    // Handle PO Modification
    if (purchaseRequest.last_action === "Pomodify") {
      for (const item of purchaseRequest.items) {
        await connection.execute(
          `UPDATE PURCHASE_REQUEST_DETAILS
           SET po_mod_final_rate = :po_mod_final_rate,
               po_mod_amount = :po_mod_amount,
               po_confirm = 'N',
               po_cancel = 'N'
           WHERE company_code = :company_code
             AND ref_doc_no = :ref_doc_no
             AND item_code = :item_code
             AND final_rate = :final_rate
             AND allocated_approved_quantity = :allocated_approved_quantity
             AND item_p_qty = :item_p_qty
             AND item_l_qty = :item_l_qty
             AND addl_item_desc = :addl_item_desc`,
          {
            po_mod_final_rate: item.po_mod_final_rate,
            po_mod_amount: item.po_mod_amount,
            company_code: requestUser.company_code,
            ref_doc_no: item.ref_doc_no,
            item_code: item.item_code,
            final_rate: item.final_rate,
            allocated_approved_quantity: item.allocated_approved_quantity,
            item_p_qty: item.item_p_qty,
            item_l_qty: item.item_l_qty,
            addl_item_desc: item.addl_item_desc,
          },
          { autoCommit: false }
        );
      }
      await connection.commit();
      res.status(200).json({ message: "PO modification successful." });
      return;
    }

    // Handle PO Confirmation
    if (purchaseRequest.last_action === "Confirm") {
      await connection.execute(
        `UPDATE PURCHASE_REQUEST_DETAILS
         SET HISTORY_SERIAL = 0, PO_CONFIRM = 'Y', PO_CANCEL = 'N', PO_DATE = SYSDATE
         WHERE REF_DOC_NO = :ref_doc_no AND COMPANY_CODE = :company_code`,
        {
          ref_doc_no: purchaseRequest.ref_doc_no,
          company_code: requestUser.company_code,
        },
        { autoCommit: false }
      );

      await connection.execute(
        `UPDATE PO_DETAILS
         SET REVISION_NUMBER = DUMM_REVISION_NUMBER
         WHERE ref_doc_no = :ref_doc_no AND company_code = :company_code AND REVISION_NUMBER IS NULL`,
        {
          ref_doc_no: purchaseRequest.ref_doc_no,
          company_code: requestUser.company_code,
        },
        { autoCommit: false }
      );

      await connection.commit();

      res.status(200).json({ message: "Purchase order processed successfully." });
    }
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error during transaction rollback:", rollbackError);
      }
    }
    console.error("Transaction failed:", error);
    res.status(500).json({ error: "Failed to process purchase order." });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
};
