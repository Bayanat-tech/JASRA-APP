//import oracledb from "oracledb";
import { Request, Response } from "express";
import { oracleDb } from "../../database/connection";
import constants from "../../helpers/constants";
import { IFiles, RequestWithUser } from "../../interfaces/common.interface";

// // interface RequestWithUsercrs extends Request {
// //   body: {
// //     last_action: string;
// //     Rrequest_number: string;
// //     COcompany_code: string;
// //     loginid: string;
// //   };
// //}
// interface VPurchaseRequestHeader {
//   request_number: string;
//   request_date: Date;
//   description: string;
//   company_code: string;
// }

// interface VPurchaseRequestDetail {
//   item_code: string;
//   item_rate: number;
//   service_rm_flag: string;
//   item_p_qty: number;
//   supplier: string;
//   p_uom: string;
//   item_l_qty: number;
//   allocated_approved_quantity: number;
//   l_uom: string;
//   amount: number;
//   upp: number;
//   last_action: string;
//   cost_code: string;
//   addl_item_desc: string;
//   old_item_code: string; // Ensure this exists if you're using it in the update
// }


// interface RevisionResult {
//   REVISION_NUMBER: number;
// }


// //export const getPurchaserequest = async (req: Request & { params: { request_number: string; company_code: string } }, res: Response): Promise<void> => {
// export const getPurchaserequest = async (req: Request, res: Response): Promise<void> => {
//   let connection;

//   try {
//     const { request_number: rawRequestNumber, company_code } = req.params;
//     if (!rawRequestNumber || !company_code) {
//       res.status(400).json({ success: false, message: "Missing request_number or company_code" });
//       return;
//     }

//     // Replace $$ with /
//     const request_number = rawRequestNumber.replace(/\$\$/g, "/");

//     connection = await oracleDb.getConnection();

//     // 1️⃣ Count purchase request headers
//     const countResult = await connection.execute<{ COUNT: number }>(
//       `SELECT COUNT(*) AS COUNT
//        FROM PURCHASE_REQUEST_HEADER
//        WHERE REQUEST_NUMBER = :request_number`,
//       { request_number },
//       //{ outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     const count = countResult.rows?.[0]?.COUNT || 0;

//     if (count === 0) {
//       res.status(404).json({
//         success: false,
//         message: "Purchase Request does not exist",
//       });
//       return;
//     }

//     // 2️⃣ Fetch PRIN_CODE
//     const prinResult = await connection.execute<{ PRIN_CODE: string }>(
//       `SELECT prin_code 
//        FROM MS_PRINCIPAL 
//        WHERE PRIN_DEPT_CODE IN (
//          SELECT DISTINCT div_code 
//          FROM PURCHASE_REQUEST_DETAILS
//          WHERE REQUEST_NUMBER = :request_number
//        )`,
//       //{ outFormat: oracleDb.OUT_FORMAT_OBJECT }
//     );
//     const ls_prin_code = prinResult.rows?.[0]?.PRIN_CODE;
//     if (!ls_prin_code) {
//       res.status(404).json({
//         success: false,
//         message: "PRIN_CODE not found for the request",
//       });
//       return;
//     }

//     // 3️⃣ Fetch header data
//     const headerResult = await connection.execute(
//       `SELECT REPLACE(request_number, '$', '/') AS request_number,
//               final_approved, fa_uploaded, flow_level_running, request_date,
//               description, type_of_contract, amc_from, amc_to,
//               type_of_material_supply, wo_number, remarks, project_code,
//               contract_soft_hard, amc_service_status, material_mechanical,
//               material_electrical, material_plumbing, material_tools,
//               material_civil, material_ac, material_cleaning, material_other,
//               services_temp_staff, services_rentals, services_subcon_conslt,
//               services_other, other_stationery, other_it,
//               other_new_uniform_ppe, other_rplcmt_uniform, other_other,
//               good_material_request, service_request, last_action, need_by_date,
//               service_type, type_of_pr, covered_by_contract_yes, flag_sharing_cost,
//               budgeted_yes, checked_store_yes, project_name, div_code,
//               others, it_tech, stationary, laundry_housekeeping, accommodation,
//               catering, medical, transportation, training, recruitment_hr,
//               uniform, furniture, entertainment, barber, requestor_name
//        FROM VW_PURCHASE_REQUEST_HEADER
//        WHERE REQUEST_NUMBER = :request_number AND COMPANY_CODE = :company_code
//        AND ROWNUM = 1`,
//       { request_number, company_code },
//       //{ outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );

//     const RequestheaderData = headerResult.rows?.[0];
//     if (!RequestheaderData) {
//       res.status(404).json({
//         success: false,
//         message: "Purchase Request header not found",
//       });
//       return;
//     }

//     // 4️⃣ Fetch detail data
//     const detailResult = await connection.execute(
//       `SELECT *
//        FROM VW_PURCHASE_REQUEST_TRANSACTION1
//        WHERE REQUEST_NUMBER = :request_number AND PRIN_CODE = :ls_prin_code
//        ORDER BY ITEM_SEQUENCE_NO`,
//       { request_number, ls_prin_code },
//       //{ outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );

//     const RequestdetailData = detailResult.rows || [];

//     // 5️⃣ Fetch terms and conditions
//     const termResult = await connection.execute(
//       `SELECT request_number, supplier AS tsupplier, remarks, dlvr_term,
//               payment_terms, quatation_reference, delivery_address
//        FROM PR_SUPPL_TERM_COND
//        WHERE request_number = :request_number`,
//       { request_number },
//       //{ outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );

//     const Termconditiondata = termResult.rows || [];

//     // 6️⃣ Convert all keys to lowercase
//     const mapLowerCaseKeys = (rows: any[]) =>
//       rows.map((row) => {
//         const obj: any = {};
//         Object.keys(row).forEach((key) => {
//           obj[key.toLowerCase()] = row[key];
//         });
//         return obj;
//       });

//     res.status(200).json({
//       success: true,
//       data: {
//         header: mapLowerCaseKeys([RequestheaderData])[0],
//         items: mapLowerCaseKeys(RequestdetailData),
//         termscondition: mapLowerCaseKeys(Termconditiondata),
//       },
//     });
//   } catch (error) {
//     console.error("Error in getPurchaserequest:", error);
//     res.status(500).json({
//       success: false,
//       message: error instanceof Error ? error.message : "Internal server error",
//     });
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (err) {
//         console.error("Failed to close Oracle connection:", err);
//       }
//     }
//   }
// };



// export const updatePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
//   const requestUser = req.user as any; // Adjust your IUser type
//   const {
//     companyCode,
//     doc_no,
//     doc_date,
//     ref_doc_no,
//     supplier,
//     request_number,
//     div_code,
//     po_confirm,
//     po_cancel,
//     cancel_type,
//     supp_name,
//     dlvr_term,
//     supp_addr1,
//     supp_addr2,
//     supp_addr3,
//     supp_addr4,
//     supp_telno1,
//     supp_faxno1,
//     supp_email1,
//     project_code,
//     project_name,
//     wo_number,
//     remarks,
//     payment_terms,
//     last_action,
//     items,
//   } = req.body;

//   let connection;

//   try {
//     connection = await oracleDb.getConnection();

//     // Start transaction
//     await connection.execute("BEGIN NULL; END;"); // Ensure session for transaction
//     await connection.execute("SAVEPOINT start_transaction");

//     // -----------------------
//     // PO Modification
//     // -----------------------
//     if (last_action === "Pomodify" && Array.isArray(items)) {
//       for (const item of items) {
//         await connection.execute(
//           `UPDATE PURCHASE_REQUEST_DETAILS
//            SET po_mod_final_rate = :po_mod_final_rate,
//                po_mod_amount = :po_mod_amount,
//                po_confirm = 'N',
//                po_cancel = 'N'
//            WHERE company_code = :company_code
//              AND ref_doc_no = :ref_doc_no
//              AND item_code = :item_code
//              AND final_rate = :final_rate
//              AND allocated_approved_quantity = :allocated_approved_quantity
//              AND item_p_qty = :item_p_qty
//              AND item_l_qty = :item_l_qty
//              AND addl_item_desc = :addl_item_desc`,
//           {
//             po_mod_final_rate: item.po_mod_final_rate,
//             po_mod_amount: item.po_mod_amount,
//             company_code: requestUser.company_code,
//             ref_doc_no: item.ref_doc_no,
//             item_code: item.item_code,
//             final_rate: item.final_rate,
//             allocated_approved_quantity: item.allocated_approved_quantity,
//             item_p_qty: item.item_p_qty,
//             item_l_qty: item.item_l_qty,
//             addl_item_desc: item.addl_item_desc,
//           }
//         );
//       }

//       await connection.commit();
//       res.status(200).json({ message: "PO modification successful." });
//       return;
//     }

//     // PO Confirmation
//     // -----------------------
//     if (last_action === "Confirm") {
//       // Update PURCHASE_REQUEST_DETAILS
//       await connection.execute(
//         `UPDATE PURCHASE_REQUEST_DETAILS
//          SET history_serial = 0,
//              po_confirm = 'Y',
//              po_cancel = 'N',
//              po_date = SYSDATE
//          WHERE ref_doc_no = :ref_doc_no
//            AND company_code = :company_code`,
//         { ref_doc_no, company_code: requestUser.company_code }
//       );

//       // Update PO_DETAILS for revision number
//       await connection.execute(
//         `UPDATE PO_DETAILS
//          SET revision_number = dumm_revision_number
//          WHERE ref_doc_no = :ref_doc_no
//            AND company_code = :company_code
//            AND revision_number IS NULL`,
//         { ref_doc_no, company_code: requestUser.company_code }
//       );

//       await connection.commit();

//       // Optional: PDF/email notifications can be handled here

//       res.status(200).json({ message: "Purchase order confirmed successfully." });
//       return;
//     }

//     // If last_action is neither Pomodify nor Confirm
//     res.status(400).json({ message: "Invalid last_action value." });
//   } catch (error) {
//     console.error("Error updating purchase order:", error);
//     if (connection) {
//       try {
//         await connection.rollback();
//       } catch (rollbackErr) {
//         console.error("Error rolling back transaction:", rollbackErr);
//       }
//     }
//     res.status(500).json({ message: "Failed to process purchase order.", error });
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (closeErr) {
//         console.error("Error closing Oracle connection:", closeErr);
//       }
//     }
//   }
// };

// export function mapIncomingRequestDataOracle(data: any): IPurchaseRequestPf {
//   // Map Items
//   const mapItems: IItemPrRequest[] = Array.isArray(data.items)
//     ? data.items.map((item: any) => ({
//         item_code: item.item_code || "",
//         item_desp: item.item_desp || "",
//         item_group_code: item.item_group_code || "",
//         item_rate: Number(item.item_rate) || 0,
//         p_uom: item.p_uom || "",
//         l_uom: item.l_uom || "",
//         upp: Number(item.upp) || 0,
//         item_l_qty: Number(item.item_l_qty) || 0,
//         item_p_qty: Number(item.item_p_qty) || 0,
//         appr_upp: item.appr_upp ? Number(item.appr_upp) : 0,
//         appr_item_l_qty: item.appr_item_l_qty ? Number(item.appr_item_l_qty) : 0,
//         appr_item_p_qty: item.appr_item_p_qty ? Number(item.appr_item_p_qty) : 0,
//         currency_rate: item.currency_rate ? Number(item.currency_rate) : 0,
//         amount: Number(item.amount) || 0,
//         discount_amount: Number(item.discount_amount) || 0,
//         final_rate: Number(item.final_rate) || 0,
//         company_code: item.company_code || "",
//         updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
//         updated_by: item.updated_by || "",
//         request_number: item.request_number || "",
//         curr_code: item.curr_code || "",
//         lcurr_amt: item.lcurr_amt ? Number(item.lcurr_amt) : 0,
//         allocated_approved_quantity: Number(item.allocated_approved_quantity) || 0,
//         supplier: item.supplier || "",
//         service_rm_flag: item.service_rm_flag || "",
//         addl_item_desc: item.addl_item_desc || "",
//         flow_level_running: Number(item.flow_level_running) || 0,
//         pr_amount: item.pr_amount ? Number(item.pr_amount) : 0,
//         po_amount: item.po_amount ? Number(item.po_amount) : 0,
//         month_budget: item.month_budget ? Number(item.month_budget) : 0,
//         cost_code: item.cost_code || "",
//         cost_name: item.cost_name || "",
//         item_sequence_no: Number(item.item_sequence_no) || 0,
//       }))
//     : [];

//   // Map Terms Conditions
//   const mapTermsConditions: IPrtermnscondition[] = Array.isArray(data.Termscondition)
//     ? data.Termscondition.map((term: any) => ({
//         tsupplier: term.tsupplier || "",
//         remarks: term.remarks || "",
//         dlvr_term: term.dlvr_term || "",
//         payment_terms: term.payment_terms || "",
//         quotation_reference: term.quatation_reference || "",
//         delivery_address: term.delivery_address || "",
//       }))
//     : [];

//   // Map Basic Purchase Request Data
//   const basicPrRequest: IBasicPrRequest = {
//     requestNumber: data.request_number || "",
//     requestDate: data.request_date ? new Date(data.request_date) : new Date(),
//     description: data.description || "",
//     projectCode: data.project_code || "",
//     wo_number: data.wo_number || "",
//     remarks: data.remarks || "",
//     type_of_contract: data.type_of_contract || "",
//     amc_from: data.amc_from ? new Date(data.amc_from) : new Date(),
//     amc_to: data.amc_to ? new Date(data.amc_to) : new Date(),
//     type_of_material_supply: data.type_of_material_supply || "",
//     contract_soft_hard: data.contract_soft_hard || "",
//     amc_service_status: data.amc_service_status || "",
//     material_mechanical: data.material_mechanical || "",
//     material_electrical: data.material_electrical || "",
//     material_plumbing: data.material_plumbing || "",
//     material_tools: data.material_tools || "",
//     material_civil: data.material_civil || "",
//     material_ac: data.material_ac || "",
//     material_cleaning: data.material_cleaning || "",
//     material_other: data.material_other || "",
//     services_temp_staff: data.services_temp_staff || "",
//     services_rentals: data.services_rentals || "",
//     services_subcon_conslt: data.services_subcon_conslt || "",
//     services_other: data.services_other || "",
//     other_stationery: data.other_stationery || "",
//     other_it: data.other_it || "",
//     other_new_uniform_ppe: data.other_new_uniform_ppe || "",
//     other_rplcmt_uniform: data.other_rplcmt_uniform || "",
//     other_other: data.other_other || "",
//     good_material_request: data.good_material_request || "",
//     service_request: data.service_request || "",
//     last_action: data.last_action || "",
//     created_by: data.created_by || "",
//     updated_by: data.updated_by || "",
//     created_at: data.created_at ? new Date(data.created_at) : new Date(),
//     updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
//     flow_level_running: Number(data.flow_level_running) || 0,
//     final_approved: data.final_approved || "",
//     fa_uploaded: data.fa_uploaded || "",
//     type_of_pr: data.type_of_pr,
//     covered_by_contract_yes: data.covered_by_contract_yes,
//     flag_sharing_cost: data.flag_sharing_cost,
//     budgeted_yes: data.budgeted_yes,
//     checked_store_yes: data.checked_store_yes,
//     amount: data.amount ? String(data.amount) : "0",
//     need_by_date: data.need_by_date ? new Date(data.need_by_date) : new Date(),
//     service_type: data.service_type,
//     accommodation: data.accommodation,
//     div_code: data.div_code,
//     catering: data.catering || "N",
//     laundry_housekeeping: data.laundry_housekeeping || "N",
//     medical: data.medical || "N",
//     transportation: data.transportation || "N",
//     training: data.training || "N",
//     recruitment_hr: data.recruitment_hr || "N",
//     uniform: data.uniform || "N",
//     stationary: data.stationary || "N",
//     it_tech: data.it_tech || "N",
//     furniture: data.furniture || "N",
//     entertainment: data.entertainment || "N",
//     barber: data.barber || "N",
//     others: data.others || "N",
//     requestor_name: data.requestor_name || "",
//     flow_type: data.flow_type || "",
//     last_updated: data.last_updated || "",
//   };

//   // Combine into final Oracle-ready object
//   const purchaseRequest: IPurchaseRequestPf = {
//     ...basicPrRequest,
//     companyCode: data.company_code || "",
//     items: mapItems,
//     termconditions: mapTermsConditions,
//   };

//   return purchaseRequest;
// }



// export const getPurchaseRequestLog = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let connection: any;

//   try {
//     console.log("getPurchaseRequestLog called");

//     const { requestNumber } = req.params;

//     if (!requestNumber) {
//       res
//         .status(400)
//         .json({ success: false, message: "requestNumber is required" });
//       return;
//     }

//     connection = await oracleDb.getConnection();

//     const query = `
//       SELECT * 
//       FROM VW_JASRA_PURCHASE_REQUEST_LOGTREE
//       WHERE REQUEST_NUMBER = :requestNumber
//     `;

//     const result = await connection.execute(query, { requestNumber }, 
//     );

//     // Convert column names to lowercase
//     const data = result.rows?.map((row: any) => {
//       const obj: any = {};
//       if (row) {
//         Object.keys(row).forEach((key) => {
//           obj[key.toLowerCase()] = row[key];
//         });
//       }
//       return obj;
//     }) || [];

//     console.log(
//       "Query executed successfully. Retrieved",
//       data.length,
//       "records"
//     );

//     res.status(200).json({ success: true, data });
//   } catch (error: unknown) {
//     console.error("Error fetching PR log:", error);

//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching PR log",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (closeErr) {
//         console.error("Failed to close Oracle connection:", closeErr);
//       }
//     }
//   }
// };

// // Convert Oracle DATE or TIMESTAMP to 'YYYY-MM-DD' string
// export const formatOracleDate = (dateValue: Date | string | null | undefined): string => {
//   if (!dateValue) return ""; // Handle null/undefined

//   const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);

//   const year = dateObj.getFullYear();
//   const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
//   const day = dateObj.getDate().toString().padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };


// export const fetchPRregisterdata = async (req: Request, res: Response): Promise<void> => {
//   let connection: any;

//   try {
//     console.log("✅ fetchPRregisterdata called");
//     console.log("✅ Query Params:", req.query);

//     const fromDate = String(req.query.fromDate || "").trim();
//     const toDate = String(req.query.toDate || "").trim();
//     const selectedProjectCode = String(req.query.selectedProjectCode || "").trim();
//     const requestStatus = String(req.query.requestStatus || "").trim();
//     const prType = String(req.query.prType || "").trim();
//     const serviceRmFlag = String(req.query.serviceRmFlag || "").trim();
//     const reportType = String(req.query.reportType || "").trim();

//     // Base query
//     let query =
//       reportType === "Summary"
//         ? `SELECT DISTINCT request_number, header_amount, project_name, request_date, status, type_of_pr, div_code FROM VW_PR_REGISTER`
//         : `SELECT * FROM VW_PR_REGISTER`;

//     const conditions: string[] = [];
//     const binds: Record<string, any> = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       conditions.push("REQUEST_DATE BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')");
//       binds.fromDate = fromDate;
//       binds.toDate = toDate;
//     }

//     if (selectedProjectCode) {
//       conditions.push("PROJECT_CODE = :selectedProjectCode");
//       binds.selectedProjectCode = selectedProjectCode;
//     }

//     if (requestStatus && requestStatus !== "All") {
//       conditions.push("LAST_ACTION = :requestStatus");
//       binds.requestStatus = requestStatus;
//     }

//     if (prType && prType !== "All") {
//       conditions.push("TYPE_OF_PR = :prType");
//       binds.prType = prType;
//     }

//     if (serviceRmFlag && serviceRmFlag !== "All") {
//       conditions.push("SERVICE_RM_FLAG = :serviceRmFlag");
//       binds.serviceRmFlag = serviceRmFlag;
//     }

//     if (conditions.length > 0) {
//       query += " WHERE " + conditions.join(" AND ");
//     }

//     console.log("✅ Final Query:", query);
//     console.log("✅ Bind Parameters:", binds);

//     connection = await oracleDb.getConnection();

//     const result = await connection.execute(query, binds
//    );

//     const rows = result.rows || [];

//     console.log(`✅ Query executed successfully. Retrieved ${rows.length} records.`);

//     res.status(200).json({
//       success: true,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("Error fetching PR register data:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching PR register data.",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (closeErr) {
//         console.error("Failed to close Oracle connection:", closeErr);
//       }
//     }
//   }
// };


// export const fetchPOregisterdata = async (req: Request, res: Response): Promise<void> => {
//   let connection:any;

//   try {
//     console.log("✅ fetchPOregisterdata called");
//     console.log("✅ Query Params:", req.query);

//     const fromDate = String(req.query.fromDate || "").trim();
//     const toDate = String(req.query.toDate || "").trim();
//     const selectedProjectCode = String(req.query.selectedProjectCode || "").trim();
//     const requestStatus = String(req.query.requestStatus || "").trim();
//     const prType = String(req.query.prType || "").trim();
//     const serviceRmFlag = String(req.query.serviceRmFlag || "").trim();
//     const reportType = String(req.query.reportType || "").trim();

//     // Base query
//     let query =
//       reportType === "Summary"
//         ? `SELECT * FROM VW_PO_REGISTER_JASRA`
//         : `SELECT * FROM VW_PO_REGISTER_JASRA`;

//     const conditions: string[] = [];
//     const binds: Record<string, any> = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       conditions.push("REQUEST_DATE BETWEEN TO_DATE(:fromDate, 'YYYY-MM-DD') AND TO_DATE(:toDate, 'YYYY-MM-DD')");
//       binds.fromDate = fromDate;
//       binds.toDate = toDate;
//     }

//     if (selectedProjectCode) {
//       conditions.push("PROJECT_CODE = :selectedProjectCode");
//       binds.selectedProjectCode = selectedProjectCode;
//     }

//     if (requestStatus && requestStatus !== "All") {
//       conditions.push("LAST_ACTION = :requestStatus");
//       binds.requestStatus = requestStatus;
//     }

//     if (prType && prType !== "All") {
//       conditions.push("TYPE_OF_PR = :prType");
//       binds.prType = prType;
//     }

//     if (serviceRmFlag && serviceRmFlag !== "All") {
//       conditions.push("SERVICE_RM_FLAG = :serviceRmFlag");
//       binds.serviceRmFlag = serviceRmFlag;
//     }

//     // Append conditions if any
//     if (conditions.length > 0) {
//       query += " WHERE " + conditions.join(" AND ");
//     }

//     console.log("✅ Final Query:", query);
//     console.log("✅ Bind Parameters:", binds);

//     connection = await oracleDb.getConnection();

//     const result = await connection.execute(query, binds);

//     const rows = result.rows || [];

//     console.log(` Query executed successfully. Retrieved ${rows.length} records.`);

//     res.status(200).json({
//       success: true,
//       data: rows,
//     });

//   } catch (error) {
//     console.error(" Error fetching PO register data:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching PO register data.",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (closeErr) {
//         console.error("Failed to close Oracle connection:", closeErr);
//       }
//     }
//   }
// };

// // Fetch request number from GT_SESSION_INFO
// export const fetchRequestNoFromGTSession = async (req: Request, res: Response): Promise<void> => {
//   let connection: any;

//   try {
//     connection = await oracleDb.getConnection();

//     // Oracle equivalent of MySQL CONNECTION_ID() is SYS_CONTEXT('USERENV', 'SID') or SYS_CONTEXT('USERENV', 'SESSIONID')
//     const result = await connection.execute(
//       `SELECT code 
//        FROM GT_SESSION_INFO 
//        WHERE session_id = SYS_CONTEXT('USERENV', 'SID') AND ROWNUM = 1`,
//       [],
//     );

//     const sessionData = result.rows?.[0];

//     if (sessionData?.CODE) {
//       console.log(`Generated request number from session: ${sessionData.CODE}`);
//       res.status(200).json({ success: true, data: sessionData.CODE });
//     } else {
//       console.log("No session code found.");
//       res.status(404).json({
//         success: false,
//         message: "Request number not found in session.",
//       });
//     }
//   } catch (error) {
//     console.error("Error querying GT_SESSION_INFO table:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   } finally {
//     if (connection) await connection.close();
//   }
// };

// // Fetch user level from V_USER_FLOW_DETAILS
// export const fetchUserlevel = async (req: Request, res: Response): Promise<void> => {
//   let connection: any;

//   try {
//     const { userId, companyCode, flow_code } = req.query;

//     if (!userId || !companyCode || !flow_code) {
//       res.status(400).json({ success: false, message: "Missing userId, companyCode or flow_code" });
//       return;
//     }

//     connection = await oracleDb.getConnection();

//     const result = await connection.execute(
//       `SELECT MIN(FLOW_LEVEL) AS flowLevel
//        FROM V_USER_FLOW_DETAILS
//        WHERE USER_CODE = :userId
//          AND COMPANY_CODE = :companyCode
//          AND FLOW_CODE = :flowCode`,
//       {
//         userId,
//         companyCode,
//         flowCode: flow_code,
//       },
//     );

//     const userLevel = result.rows?.[0];

//     if (userLevel?.FLOWLEVEL !== null && userLevel?.FLOWLEVEL !== undefined) {
//       // setUserLevel(userLevel.FLOWLEVEL); // Optional: your existing function
//       res.status(200).json({ success: true, data: userLevel.FLOWLEVEL });
//     } else {
//       res.status(404).json({
//         success: false,
//         message: "No flow level found for the given user and company.",
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching user level:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error" });
//   } finally {
//     if (connection) await connection.close();
//   }
// };


// // Check if the user has cost controller role
// export const CheckCostcontroller = async (req: Request, res: Response): Promise<void> => {
//   let connection: any;

//   try {
//     const userId = String(req.query.userId || "").trim();
//     const companyCode = String(req.query.companyCode || "").trim();

//     if (!userId || !companyCode) {
//       console.error(" Missing userId or companyCode:", { userId, companyCode });
//       res.status(400).json({ 
//         success: false, 
//         message: "Missing userId or companyCode" 
//       });
//       return;
//     }

//     console.log("✅ Inside backend CheckCostcontroller", { userId, companyCode });

//     connection = await oracleDb.getConnection();

//     const result = await connection.execute(
//       `SELECT CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END AS COSTCONTROLLER
//        FROM V_USER_FLOW_DETAILS
//        WHERE (FLOW_ROLE = '009' OR FLOW_ROLE = '010')
//          AND USER_CODE = :userId
//          AND COMPANY_CODE = :companyCode`,
//       { userId, companyCode },
//     );

//     const costControllerValue = result.rows?.[0]?.COSTCONTROLLER || "NO";
//     console.log("✅ Query result:", costControllerValue);

//     res.status(200).json({ success: true, data: costControllerValue });
//   } catch (error) {
//     console.error(" Error fetching Costcontroller:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   } finally {
//     if (connection) await connection.close();
//   }
// };

// // Fetch user message box
// export const Fetchmessagebox = async (req: Request, res: Response): Promise<void> => {
//   let connection: any;

//   try {
//     const userId = String(req.query.userId || "").trim();
//     const companyCode = String(req.query.companyCode || "").trim();

//     if (!userId || !companyCode) {
//       res.status(400).json({ success: false, message: "Missing userId or companyCode" });
//       return;
//     }

//     console.log("✅ Inside backend Fetchmessagebox");

//     connection = await oracleDb.getConnection();

//     const result = await connection.execute(
//       `SELECT MESSAGE_BOX, MESSAGE_TYPE 
//        FROM GT_SESSION_MESSAGEBOX 
//        WHERE USER_ID = :userId`,
//       { userId },
//     );

//     console.log("✅ Messages fetched:", result.rows);

//     res.status(200).json({ success: true, data: result.rows || [] });
//   } catch (error) {
//     console.error("❌ Error fetching Fetchmessagebox:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   } finally {
//     if (connection) await connection.close();
//   }
// };


// export const bugetcurstatusprojectwiseconsolidated = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let connection: any;

//   try {
//     console.log("✅ bugetcurstatusprojectwiseconsolidated called");
//     console.log("✅ Query Params:", req.query);

//     const fromDate = String(req.query.fromDate || "").trim();
//     const toDate = String(req.query.toDate || "").trim();
//     const selectedProjectCode = String(req.query.selectedProjectCode || "").trim();
//     const requestStatus = String(req.query.requestStatus || "").trim();
//     const prType = String(req.query.prType || "").trim();
//     const serviceRmFlag = String(req.query.serviceRmFlag || "").trim();

//     if (!fromDate || !toDate) {
//       res.status(400).json({
//         success: false,
//         message: "fromDate and toDate are required.",
//       });
//       return;
//     }

//     connection = await oracleDb.getConnection();

//     let query = `
//       SELECT * 
//       FROM VW_BUDGET_CURR_STAT_PROJECTWISE_CONSOLIDATED
//       WHERE REQUEST_DATE BETWEEN TO_DATE(:fromDate,'YYYY-MM-DD') AND TO_DATE(:toDate,'YYYY-MM-DD')
//     `;

//     const binds: Record<string, string> = { fromDate, toDate };

//     if (selectedProjectCode) {
//       query += " AND PROJECT_CODE = :selectedProjectCode";
//       binds.selectedProjectCode = selectedProjectCode;
//     }
//     if (requestStatus) {
//       query += " AND LAST_ACTION = :requestStatus";
//       binds.requestStatus = requestStatus;
//     }
//     if (prType) {
//       query += " AND TYPE_OF_PR = :prType";
//       binds.prType = prType;
//     }
//     if (serviceRmFlag) {
//       query += " AND SERVICE_RM_FLAG = :serviceRmFlag";
//       binds.serviceRmFlag = serviceRmFlag;
//     }

//     console.log("✅ Final Query:", query);
//     console.log("✅ Query Binds:", binds);

//     const result = await connection.execute(query, binds);

//     console.log(`Query executed successfully. Retrieved ${result.rows?.length || 0} records.`);

//     res.status(200).json({
//       success: true,
//       data: result.rows || [],
//     });
//   } catch (error) {
//     console.error(" Error fetching bugetcurstatusprojectwiseconsolidated data:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching budget consolidated data.",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) await connection.close();
//   }
// };

// export const fetchProjectwisebudgetAllocation = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let connection:any;

//   try {
//     console.log("✅ fetchProjectwisebudgetAllocation called");
//     console.log("✅ Query Params:", req.query);

//     const fromDate = String(req.query.fromDate || "").trim();
//     const toDate = String(req.query.toDate || "").trim();
//     const selectedProjectCode = String(req.query.selectedProjectCode || "").trim();
//     const requestStatus = String(req.query.requestStatus || "").trim();
//     const prType = String(req.query.prType || "").trim();
//     const serviceRmFlag = String(req.query.serviceRmFlag || "").trim();

//     if (!fromDate || !toDate) {
//       res.status(400).json({
//         success: false,
//         message: "fromDate and toDate are required.",
//       });
//       return;
//     }

//     connection = await oracleDb.getConnection();

//     let query = `
//       SELECT * 
//       FROM VW_PROJECTWISE_BUDGET_ALLOCATION
//       WHERE REQUEST_DATE BETWEEN TO_DATE(:fromDate,'YYYY-MM-DD') AND 
//       TO_DATE(:toDate,'YYYY-MM-DD')
//     `;

//     const binds: Record<string, string> = { fromDate, toDate };

//     if (selectedProjectCode) {
//       query += " AND PROJECT_CODE = :selectedProjectCode";
//       binds.selectedProjectCode = selectedProjectCode;
//     }
//     if (requestStatus) {
//       query += " AND LAST_ACTION = :requestStatus";
//       binds.requestStatus = requestStatus;
//     }
//     if (prType) {
//       query += " AND TYPE_OF_PR = :prType";
//       binds.prType = prType;
//     }
//     if (serviceRmFlag) {
//       query += " AND SERVICE_RM_FLAG = :serviceRmFlag";
//       binds.serviceRmFlag = serviceRmFlag;
//     }

//     console.log("✅ Final Query:", query);
//     console.log("✅ Query Binds:", binds);

//     const result = await connection.execute(query, binds);

//     console.log(`✅ Query executed successfully. Retrieved ${result.rows?.length || 0} records.`);

//     res.status(200).json({
//       success: true,
//       data: result.rows || [],
//     });
//   } catch (error) {
//     console.error(" Error fetching project-wise budget allocation data:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching project-wise budget allocation data.",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) await connection.close();
//   }
// };



// export const fetchCostwisebudgetAllocation = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let connection: any;

//   try {
//     console.log("✅ fetchCostwisebudgetAllocation called");
//     console.log("✅ Query Params:", req.query);

//     const fromDate = String(req.query.fromDate || "").trim();
//     const toDate = String(req.query.toDate || "").trim();
//     const selectedProjectCode = String(req.query.selectedProjectCode || "").trim();
//     const requestStatus = String(req.query.requestStatus || "").trim();
//     const prType = String(req.query.prType || "").trim();
//     const serviceRmFlag = String(req.query.serviceRmFlag || "").trim();

//     if (!fromDate || !toDate) {
//       res.status(400).json({
//         success: false,
//         message: "fromDate and toDate are required.",
//       });
//       return;
//     }

//     connection = await oracleDb.getConnection();

//     let query = `
//       SELECT * 
//       FROM VW_COSTWISE_BUDGET_ALLOCATION
//       WHERE REQUEST_DATE BETWEEN TO_DATE(:fromDate,'YYYY-MM-DD') 
//                              AND TO_DATE(:toDate,'YYYY-MM-DD')
//     `;

//     const binds: Record<string, string> = { fromDate, toDate };

//     if (selectedProjectCode) {
//       query += " AND PROJECT_CODE = :selectedProjectCode";
//       binds.selectedProjectCode = selectedProjectCode;
//     }
//     if (requestStatus) {
//       query += " AND LAST_ACTION = :requestStatus";
//       binds.requestStatus = requestStatus;
//     }
//     if (prType) {
//       query += " AND TYPE_OF_PR = :prType";
//       binds.prType = prType;
//     }
//     if (serviceRmFlag) {
//       query += " AND SERVICE_RM_FLAG = :serviceRmFlag";
//       binds.serviceRmFlag = serviceRmFlag;
//     }

//     console.log("✅ Final Query:", query);
//     console.log("✅ Query Binds:", binds);

//     const result = await connection.execute(query, binds);

//     console.log(`✅ Query executed successfully. Retrieved ${result.rows?.length || 0} records.`);

//     res.status(200).json({
//       success: true,
//       data: result.rows || [],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching cost-wise budget allocation data:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching cost-wise budget allocation data.",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) await connection.close();
//   }
// };

export const saveFile = async (
  req: RequestWithUser,
  res: Response
): Promise<Response | void> => {
  const { request_number, files } = req.body;

  // Validate required fields
  if (!request_number || !files || !Array.isArray(files) || files.length === 0) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST)
    .json({
      success: false,
      message: "request_number and files are required.",
    });
  }

  const duplicateRecords: string[] = [];
  const successfulRecords: { org_file_name: string; sr_no: number }[] = [];
  let connection: any;

  try {
    connection = await oracleDb.getConnection();

    for (const file of files) {
      const { org_file_name } = file;

      // Check for duplicate entry
      const duplicateCheckQuery = `
        SELECT COUNT(*) AS COUNT
        FROM UPLOADED_FILES_DLTS
        WHERE request_number = :request_number AND org_file_name = :org_file_name
      `;

      const duplicateCheckResult = await connection.execute(
        duplicateCheckQuery,
        { request_number, org_file_name },
        {}
      //  { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (duplicateCheckResult.rows?.[0]?.COUNT > 0) {
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
          :aws_file_locn, :flow_level, :modules, :updated_by, :created_by, :user_file_name, SYSDATE, SYSDATE
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

      await connection.execute(
        query,
        {
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
        { autoCommit: true }
      );

      // Fetch the SR_NO generated by the sequence
      const fetchSrNoQuery = `
        SELECT SR_NO
        FROM (
          SELECT SR_NO
          FROM UPLOADED_FILES_DLTS
          WHERE request_number = :request_number AND org_file_name = :org_file_name
          ORDER BY created_at DESC
        )
        WHERE ROWNUM = 1
      `;

      const srNoResult = await connection.execute(
        fetchSrNoQuery,
        { request_number, org_file_name },
        {}
      );

      if (srNoResult.rows?.[0]?.SR_NO) {
        successfulRecords.push({ 
          org_file_name, 
          sr_no: srNoResult.rows[0].SR_NO 
        });
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
    res.status(500).json({
      success: false,
      message: "An error occurred while storing file data.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    if (connection) await connection.close();
  }
};

// export const fetchPurchaseRecovery = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let connection: any;

//   try {
//     console.log("✅ PurchaseRecovery API called");

//     const { type_of_pr } = req.params;

//     if (!type_of_pr) {
//       res
//         .status(400)
//         .json({ 
//           success: false, 
//           message: "type_of_pr is required" 
//         });
//       return;
//     }

//     console.log("🔍 Received type_of_pr:", type_of_pr);

//     connection = await oracleDb.getConnection();

//     const query = `
//       SELECT * 
//       FROM VW_PURCHASE_RECOVERY
//       WHERE type_of_pr = :type_of_pr
//         AND (RECOVERY_CONFIRM = 'NO' OR RECOVERY_CONFIRM IS NULL)
//     `;

//     const result = await connection.execute(query, { type_of_pr });

//     console.log(
//       "✅ Query executed successfully. Retrieved",
//       result.rows?.length || 0,
//       "records"
//     );

//     res.status(200).json({ success: true, data: result.rows });
//   } catch (error) {
//     console.error("❌ Error fetching PurchaseRecovery data:", error);

//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching PurchaseRecovery data",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) await connection.close();
//   }
// };


// export const updatecancelrejectsentBack = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   //let connection: any;
//  const t = await oracleDb.getConnection();
//   try {
//     console.log("Incoming request data:", req.body);

//     const {
//       LAST_ACTION,
//       REQUEST_NUMBER,
//       COMPANY_CODE,
//       loginid,
//       REMARKS,
//       CREATEPR,
//       LEVEL,
//     } = req.body;

//     if (
//       !LAST_ACTION ||
//       !REQUEST_NUMBER ||
//       !COMPANY_CODE ||
//       !loginid ||
//       !REMARKS
//     ) {
//       res.status(400).json({
//         success: false,
//         message: "Invalid request data",
//       });
//       return;
//     }

//     console.log("Before executing update statement with data:", req.body);
//     console.log("CREATEPR:", CREATEPR);

//     let generatedRequestNumber: string | null = null;

//     // Check if it's a PO cancellation request
//     if (REQUEST_NUMBER.includes("PO$")) {
//       const todaydate: Date = new Date();
//       const formattedDate = todaydate.toISOString().split("T")[0];
//       // Update PO details
//       await oracleDb.query(
//         `UPDATE PURCHASE_REQUEST_DETAILS 
//          SET PO_CANCEL = 'Y', 
//              REASON_FOR_PO_CANCEL = ?, 
//              CANCEL_PO_BY = ?, 
//              PO_CANCEL_DATE = ?,
//              UPDATED_AT = NOW() 
//          WHERE REF_DOC_NO = ? AND COMPANY_CODE = ?`,
//         {
//           replacements: [
//             REMARKS,
//             loginid,
//             formattedDate,
//             REQUEST_NUMBER,
//             COMPANY_CODE,
//           ],
//           transaction: t,
//         }
//       );

//       if (CREATEPR === "Y") {
//         console.log("Calling stored procedure PRO_GEN_PR_FOR_CANCEL_PO...");
//         await oracleDb.query(
//           `CALL PRO_GEN_PR_FOR_CANCEL_PO(?, ?, 'BUYER', 'FULL', @code)`,
//           {
//             replacements: [COMPANY_CODE, REQUEST_NUMBER],
//             transaction: t,
//           }
//         );

//         console.log("Fetching generated request number...");
//         const [[result]]: any = await oracleDb.query(
//           `SELECT @code AS code`, {
//           transaction: t,
//         });

//         if (result && result.code) {
//           generatedRequestNumber = result.code;
//           console.log(`Generated request number: ${generatedRequestNumber}`);
//         } else {
//           console.log("No new PR generated.");
//         }
//       }

//       await oracleDb.query(
//         `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'')`,
//         {
//           replacements: {
//             screen: "POCANCEL",
//             type: "success",
//             document_number: "",
//             userId: loginid,
//           },
//         }
//       );

     
//       // Using static test emails
//       const supplierEmail = "Sandeep.dandekar@bayanattechnology.com";

//       if (supplierEmail) {
//         try {
//           console.log(
//             "Starting PDF generation for cancelled PO:",
//             REQUEST_NUMBER
//           );

//           await new Promise((resolve) => setTimeout(resolve, 500));
//           const pdfBase64 = await BoldReportsController.exportPOCANCELAsBase64(
//             REQUEST_NUMBER,
//             COMPANY_CODE
//           );

//           console.log(
//             "PDF generated successfully for cancelled PO, sending email..."
//           );

//           await notifyUser({
//             event: "PO_CANCELLED",
//             subject: `Cancelled PO: ${REQUEST_NUMBER.replace(/\$/g, "/")}`,
//             message: `Dear Sir,

// Please find attached herewith our cancelled LPO for your information and further action. Please refer to the terms & conditions as stated in the LPO.

// If you require any further information, please do not hesitate to contact us at procurement@the-maintainers.com.

// Thank you.`,
//             request_users: supplierEmail,
//             attachments: [
//               {
//                 filename: `PO_${REQUEST_NUMBER.replace(
//                   /\$/g,
//                   "/"
//                 )}_CANCELLED.pdf`,
//                 content: pdfBase64,
//                 encoding: "base64",
//                 contentType: "application/pdf",
//               },
//             ],
//           });
//         } catch (error) {
//           console.error(
//             "Failed to generate/attach PDF for cancelled PO:",
//             error
//           );
//           console.log("Continuing with transaction despite PDF error");
//         }
//       }

//       // Commit transaction for PO cancellation and return early
//       await t.commit();
//       console.log("Transaction committed successfully for PO cancellation!");

//       res.status(200).json({
//         success: true,
//         message: generatedRequestNumber
//           ? `New PR Generated: ${generatedRequestNumber}`
//           : "PO Cancelled Successfully",
//         generatedRequestNumber: generatedRequestNumber || null,
//       });
//       return; // Exit the function
//     }

//     // The following code will only execute for PR requests (not PO cancellations)
//     console.log("Updating PURCHASE_REQUEST_HEADER/MATERIAL REQUEST HEADER...");
//     if (LAST_ACTION === "SENTBACK" && REQUEST_NUMBER.includes("MAT$")) {
//       await oracleDb.query(
//         `UPDATE MATERIAL_REQUEST_HEADER 
//          SET LAST_ACTION = ?, UPDATED_AT = NOW(), UPDATED_BY = ?, FLOW_LEVEL_RUNNING = ?,
//      SENDBACK_HISTRY = CONCAT(IFNULL(SENDBACK_HISTRY, ''), '; ', ?)
//          WHERE REQUEST_NUMBER = ? AND COMPANY_CODE = ?`,
//         {
//           replacements: [
//             LAST_ACTION,
//             loginid,
//             LEVEL,
//             REMARKS,
//             REQUEST_NUMBER.replace(/\//g, "$"),
//             COMPANY_CODE,
//           ],
//           transaction: t,
//         }
//       );
//       await t.commit();
//       res.status(200).json({
//         success: true,
//         message: "Updated Successfully",
//       });
//       return;
//     }

//     if (LAST_ACTION === "SENTBACK") {
//       console.log("Updating with SENTBACK action...");
//       await oracleDb.query(
//         `UPDATE PURCHASE_REQUEST_HEADER 
//          SET LAST_ACTION = ?, UPDATED_AT = NOW(), UPDATED_BY = ?, FLOW_LEVEL_RUNNING = ?,
//          SENDBACK_HISTRY = CONCAT(IFNULL(SENDBACK_HISTRY, ''), '; ', ?)
//          WHERE REQUEST_NUMBER = ? AND COMPANY_CODE = ?`,
//         {
//           replacements: [
//             LAST_ACTION,
//             loginid,
//             LEVEL,
//             REMARKS,
//             REQUEST_NUMBER.replace(/\//g, "$"),
//             COMPANY_CODE,
//           ],
//           transaction: t,
//         }
//       );
//       await oracleDb.query(
//         `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'')`,
//         {
//           replacements: {
//             screen: "PRSENTBACK",
//             type: "success",
//             document_number: "",
//             userId: loginid,
//           },
//         }
//       );
//     } else {
//       console.log("Updating without SENTBACK action...");
//       await oracleDb.query(
//         `UPDATE PURCHASE_REQUEST_HEADER 
//          SET LAST_ACTION = ?, UPDATED_AT = NOW(), UPDATED_BY = ?
//          WHERE REQUEST_NUMBER = ? AND COMPANY_CODE = ?`,
//         {
//           replacements: [
//             LAST_ACTION,
//             loginid,
//             REQUEST_NUMBER.replace(/\//g, "$"),
//             COMPANY_CODE,
//           ],
//           transaction: t,
//         }
//       );
//     }

//     console.log("Committing transaction...");
//     await t.commit();
//     console.log("Transaction committed successfully!");

//     // Get CC email from PURCHASE_REQUEST_HEADER joined with SEC_LOGIN
//     const [ccResultRows] = await oracleDb.query(
//       `SELECT prh.CREATED_BY, sl.email_id
//        FROM PURCHASE_REQUEST_HEADER prh
//        LEFT JOIN SEC_LOGIN sl ON prh.CREATED_BY = sl.user_id
//        WHERE prh.REQUEST_NUMBER = :requestNumber 
//        LIMIT 1`,
//       {
//         replacements: { requestNumber: REQUEST_NUMBER.replace(/\//g, "$") },
//         type: QueryTypes.SELECT,
//       }
//     );
//     console.log("CC Result Rows:", ccResultRows);

//     const ccEmail = Array.isArray(ccResultRows)
//       ? ccResultRows.length > 0
//         ? (ccResultRows[0] as { email_id: string }).email_id
//         : ""
//       : (ccResultRows as { email_id: string }).email_id || "";

//     console.log("CC Email found:", ccEmail);

//     // Format request number for display (replace $ with /)
//     const displayRequestNumber = REQUEST_NUMBER.replace(/\$/g, "/");

//     // Fetch email address of the last updater - modified to handle array result
//     const [emailResultRows] = await oracleDb.query(
//       `SELECT email_id FROM SEC_LOGIN 
//        WHERE LOGINID IN (
//          SELECT DISTINCT LAST_UPDATED 
//          FROM PURCHASE_REQUST_RUNING_STATS 
//          WHERE REQUEST_NUMBER = ?
//        )`,
//       {
//         replacements: [REQUEST_NUMBER.replace(/\//g, "$")],
//         type: QueryTypes.SELECT,
//       }
//     );

//     const userEmails = Array.isArray(emailResultRows)
//       ? emailResultRows.length > 0
//         ? LAST_ACTION === "SENTBACK"
//           ? `${
//               (emailResultRows[0] as { email_id: string }).email_id
//             },admin1@the-maintainers.com`
//           : (emailResultRows[0] as { email_id: string }).email_id
//         : LAST_ACTION === "SENTBACK"
//         ? "admin1@the-maintainers.com"
//         : ""
//       : LAST_ACTION === "SENTBACK"
//       ? "admin1@the-maintainers.com"
//       : (emailResultRows as { email_id: string }).email_id || "";

//     console.log("CC Email found:", userEmails);

//     if (userEmails.length > 0) {
//       let emailSubject = "";
//       let emailMessage = "";
//       let eventType = "";

//       switch (LAST_ACTION.toUpperCase()) {
//         case "CANCELLED":
//           eventType = "CANCEL";
//           emailSubject = `Purchase Request ${displayRequestNumber} Cancelled`;
//           emailMessage = `<!DOCTYPE html>
//             <html>
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <style>
//               /* Reset styles */
//               * { 
//                   margin: 0;
//                   padding: 0;
//                   box-sizing: border-box;
//               }
              
//               body { 
//                   font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif; 
//                   line-height: 1.6; 
//                   color: #333;
//                   -webkit-text-size-adjust: 100%;
//                   margin: 0;
//                   padding: 10px;
//                   background-color: #f5f5f5;
//               }
              
//               .container { 
//                   max-width: 600px; 
//                   width: 100%;
//                   margin: 0 auto; 
//                   background-color: #ffffff; 
//                   border-radius: 8px; 
//                   border: 1px solid #2c3e50;
//                   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//               }
              
//               @media screen and (max-width: 480px) {
//                   body {
//                       padding: 5px;
//                   }
                  
//                   .container {
//                       margin: 0;
//                       border-radius: 0;
//                       border-left: none;
//                       border-right: none;
//                   }
                  
//                   .content {
//                       padding: 10px !important;
//                   }
                  
//                   .detail-row {
//                       padding: 8px 5px !important;
//                   }
                  
//                   .detail-label, .detail-value {
//                       font-size: 13px !important;
//                   }
                  
//                   .header h1 {
//                       font-size: 16px !important;
//                   }
                  
//                   .notification-header {
//                       font-size: 14px !important;
//                       padding: 8px 5px !important;
//                   }
                  
//                   .footer {
//                       font-size: 11px !important;
//                       padding: 10px 5px !important;
//                   }
//               }
              
//               .header { 
//                   background-color: #2c3e50; 
//                   color: white; 
//                   padding: 15px 10px;
//                   text-align: center;
//               }
              
//               .header h1 { 
//                   margin: 0;
//                   font-size: clamp(16px, 4vw, 20px);
//                   word-spacing: 4px;
//               }
              
//               .notification-header { 
//                   background-color: #ecf0f1; 
//                   padding: 12px 10px;
//                   text-align: center; 
//                   font-weight: bold;
//                   font-size: clamp(14px, 3.5vw, 16px);
//                   color: #666;
//               }
              
//               .content { 
//                   padding: 15px;
//               }
              
//               .detail-row { 
//                   margin-bottom: 8px; 
//                   display: flex; 
//                   flex-direction: column;
//                   padding: 8px;
//                   border-bottom: 1px solid #eee;
//               }
              
//               @media screen and (max-width: 480px) {
//                 .no-border-mobile {
//                     border-bottom: none !important;
//                 }
//               }
              
//               @media screen and (min-width: 481px) {
//                   .detail-row {
//                       flex-direction: row;
//                       align-items: flex-start;
//                   }
                  
//                   .detail-label {
//                       width: 150px;
//                       padding-right: 15px;
//                       text-align: right;
//                   }
                  
//                   .detail-value {
//                       flex: 1;
//                   }
//               }
              
//               .detail-label { 
//                   font-weight: bold; 
//                   color: #7f8c8d;
//                   margin-bottom: 4px;
//                   font-size: clamp(13px, 3.2vw, 15px);
//               }
              
//               .detail-value { 
//                   padding-left: 8px;
//                   font-size: clamp(13px, 3.2vw, 15px);
//                   word-break: break-word;
//               }
              
//               .footer { 
//                   padding: 15px 10px;
//                   text-align: center;
//                   font-size: clamp(11px, 2.8vw, 13px);
//                   color: #000000;
//                   border-top: 1px solid #2c3e50;
//                   background-color: transparent;
//               }
              
//               .link { 
//                   color: #3498db; 
//                   text-decoration: none;
//                   word-break: break-all;
//                   display: inline-block;
//                   padding: 4px 0;
//               }
              
//               .link:hover {
//                   text-decoration: underline;
//               }

//               /* Tablet Styles */
//               @media screen and (min-width: 768px) {
//                   .detail-row {
//                       flex-direction: row;
//                       align-items: center;
//                   }
                  
//                   .detail-label {
//                       width: 150px;
//                       margin-bottom: 0;
//                       padding-right: 15px;
//                   }
                  
//                   .footer {
//                       text-align: right;
//                   }
//               }
//           </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header">
//                         <h1>N O T I F I C A T I O N</h1>
//                     </div>
//                     <div class="notification-header">
//                         Purchase Request Cancelled
//                     </div>
//                     <div class="content">
//                         <div class="detail-row no-border-mobile">
//                             <span class="detail-label">Request Number:</span>
//                             <span class="detail-value">${REQUEST_NUMBER}</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Status:</span>
//                             <span class="detail-value">Cancelled</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Remarks:</span>
//                             <span class="detail-value">${REMARKS}</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Action By:</span>
//                             <span class="detail-value">${loginid}</span>
//                         </div>
//                         <div class="detail-row no-border-mobile">
//                             <span class="detail-label">Action Date:</span>
//                             <span class="detail-value">${new Date().toLocaleDateString()}</span>
//                         </div>
//                     </div>
//                     <div class="footer">
//                         Powered by Bayanat Technology – Procurement Management System (PMS)
//                     </div>
//                 </div>
//             </body>
//             </html>`;
//           break;
//         case "SENTBACK":
//           eventType = "SENTBACK";
//           emailSubject = `Purchase Request ${displayRequestNumber} Sent Back`;
//           emailMessage = `<!DOCTYPE html>
//             <html>
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <style>
//               /* Reset styles */
//               * { 
//                   margin: 0;
//                   padding: 0;
//                   box-sizing: border-box;
//               }
              
//               body { 
//                   font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif; 
//                   line-height: 1.6; 
//                   color: #333;
//                   -webkit-text-size-adjust: 100%;
//                   margin: 0;
//                   padding: 10px;
//                   background-color: #f5f5f5;
//               }
              
//               .container { 
//                   max-width: 600px; 
//                   width: 100%;
//                   margin: 0 auto; 
//                   background-color: #ffffff; 
//                   border-radius: 8px; 
//                   border: 1px solid #2c3e50;
//                   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//               }
              
//               @media screen and (max-width: 480px) {
//                   body {
//                       padding: 5px;
//                   }
                  
//                   .container {
//                       margin: 0;
//                       border-radius: 0;
//                       border-left: none;
//                       border-right: none;
//                   }
                  
//                   .content {
//                       padding: 10px !important;
//                   }
                  
//                   .detail-row {
//                       padding: 8px 5px !important;
//                   }
                  
//                   .detail-label, .detail-value {
//                       font-size: 13px !important;
//                   }
                  
//                   .header h1 {
//                       font-size: 16px !important;
//                   }
                  
//                   .notification-header {
//                       font-size: 14px !important;
//                       padding:  8px 5px !important;
//                   }
                  
//                   .footer {
//                       font-size: 11px !important;
//                       padding: 10px 5px !important;
//                   }
//               }
              
//               .header { 
//                   background-color: #2c3e50; 
//                   color: white; 
//                   padding: 15px 10px;
//                   text-align: center;
//               }
              
//               .header h1 { 
//                   margin: 0;
//                   font-size: clamp(16px, 4vw, 20px);
//                   word-spacing: 4px;
//               }
              
//               .notification-header { 
//                   background-color: #ecf0f1; 
//                   padding: 12px 10px;
//                   text-align: center; 
//                   font-weight: bold;
//                   font-size: clamp(14px, 3.5vw, 16px);
//                   color: #666;
//               }
              
//               .content { 
//                   padding: 15px;
//               }
              
//               .detail-row { 
//                   margin-bottom: 8px; 
//                   display: flex; 
//                   flex-direction: column;
//                   padding: 8px;
//                   border-bottom: 1px solid #eee;
//               }
              
//               @media screen and (max-width: 480px) {
//                 .no-border-mobile {
//                     border-bottom: none !important;
//                 }
//               }
              
//               @media screen and (min-width: 481px) {
//                   .detail-row {
//                       flex-direction: row;
//                       align-items: flex-start;
//                   }
                  
//                   .detail-label {
//                       width: 150px;
//                       padding-right: 15px;
//                       text-align: right;
//                   }
                  
//                   .detail-value {
//                       flex: 1;
//                   }
//               }
              
//               .detail-label { 
//                   font-weight: bold; 
//                   color: #7f8c8d;
//                   margin-bottom: 4px;
//                   font-size: clamp(13px, 3.2vw, 15px);
//               }
              
//               .detail-value { 
//                   padding-left: 8px;
//                   font-size: clamp(13px, 3.2vw, 15px);
//                   word-break: break-word;
//               }
              
//               .footer { 
//                   padding: 15px 10px;
//                   text-align: center;
//                   font-size: clamp(11px, 2.8vw, 13px);
//                   color: #000000;
//                   border-top: 1px solid #2c3e50;
//                   background-color: transparent;
//               }
              
//               .link { 
//                   color: #3498db; 
//                   text-decoration: none;
//                   word-break: break-all;
//                   display: inline-block;
//                   padding: 4px 0;
//               }
              
                           
//               .link:hover {
//                   text-decoration: underline;
//               }

//               /* Tablet Styles */
//               @media screen and (min-width: 768px) {
//                   .detail-row {
//                       flex-direction: row;
//                       align-items: center;
//                   }
                  
//                   .detail-label {
//                       width: 150px;
//                       margin-bottom: 0;
//                       padding-right: 15px;
//                   }
                  
//                   .footer {
//                       text-align: right;
//                   }
//               }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header">
//                         <h1>N O T I F I C A T I O N</h1>
//                     </div>
//                     <div class="notification-header">
//                         Purchase Request Sent Back
//                     </div>
//                     <div class="content">
//                         <div class="detail-row no-border-mobile">
//                             <span class="detail-label">Request Number:</span>
//                             <span class="detail-value">${REQUEST_NUMBER}</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Status:</span>
//                             <span class="detail-value">Sent Back</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Remarks:</span>
//                             <span class="detail-value">${REMARKS}</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Action By:</span>
//                             <span class="detail-value">${loginid}</span>
//                         </div>
//                         <div class="detail-row no-border-mobile">
//                             <span class="detail-label">Action Date:</span>
//                             <span class="detail-value">${new Date().toLocaleDateString()}</span>
//                         </div>
//                     </div>
//                     <div class="footer">
//                         Powered by Bayanat Technology – Procurement Management System (PMS)
//                     </div>
//                 </div>
//             </body>
//             </html>`;
//           break;
//         case "REJECTED":
//           eventType = "REJECT";
//           emailSubject = `Purchase Request ${displayRequestNumber} Rejected`;
//           emailMessage = `<!DOCTYPE html>
//             <html>
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <style>
//               /* Reset styles */
//               * { 
//                   margin: 0;
//                   padding: 0;
//                   box-sizing: border-box;
//               }
              
//               body { 
//                   font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif; 
//                   line-height: 1.6; 
//                   color: #333;
//                   -webkit-text-size-adjust: 100%;
//                   margin: 0;
//                   padding: 10px;
//                   background-color: #f5f5f5;
//               }
              
//               .container { 
//                   max-width: 600px; 
//                   width: 100%;
//                   margin: 0 auto; 
//                   background-color: #ffffff; 
//                   border-radius: 8px; 
//                   border: 1px solid #2c3e50;
//                   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//               }
              
//               @media screen and (max-width: 480px) {
//                   body {
//                       padding: 5px;
//                   }
                  
//                   .container {
//                       margin: 0;
//                       border-radius: 0;
//                       border-left: none;
//                       border-right: none;
//                   }
                  
//                   .content {
//                       padding: 10px !important;
//                   }
                  
//                   .detail-row {
//                       padding: 8px 5px !important;
//                   }
                  
//                   .detail-label, .detail-value {
//                       font-size: 13px !important;
//                   }
                  
//                   .header h1 {
//                       font-size: 16px !important;
//                   }
                  
//                   .notification-header {
//                       font-size: 14px !important;
//                       padding:  8px 5px !important;
//                   }
                  
//                   .footer {
//                       font-size: 11px !important;
//                       padding: 10px 5px !important;
//                   }
//               }
              
//               .header { 
//                   background-color: #2c3e50; 
//                   color: white; 
//                   padding: 15px 10px;
//                   text-align: center;
//               }
              
//               .header h1 { 
//                   margin: 0;
//                   font-size: clamp(16px, 4vw, 20px);
//                   word-spacing: 4px;
//               }
              
//               .notification-header { 
//                   background-color: #ecf0f1; 
//                   padding: 12px 10px;
//                   text-align: center; 
//                   font-weight: bold;
//                   font-size: clamp(14px, 3.5vw, 16px);
//                   color: #666;
//               }
              
//               .content { 
//                   padding: 15px;
//               }
              
//               .detail-row { 
//                   margin-bottom: 8px; 
//                   display: flex; 
//                   flex-direction: column;
//                   padding: 8px;
//                   border-bottom: 1px solid #eee;
//               }
              
//               @media screen and (max-width: 480px) {
//                 .no-border-mobile {
//                     border-bottom: none !important;
//                 }
//               }
              
//               @media screen and (min-width: 481px) {
//                   .detail-row {
//                       flex-direction: row;
//                       align-items: flex-start;
//                   }
                  
//                   .detail-label {
//                       width: 150px;
//                       padding-right: 15px;
//                       text-align: right;
//                   }
                  
//                   .detail-value {
//                       flex: 1;
//                   }
//               }
              
//               .detail-label { 
//                   font-weight: bold; 
//                   color: #7f8c8d;
//                   margin-bottom: 4px;
//                   font-size: clamp(13px, 3.2vw, 15px);
//               }
              
//               .detail-value { 
//                   padding-left: 8px;
//                   font-size: clamp(13px, 3.2vw, 15px);
//                   word-break: break-word;
//               }
              
//               .footer { 
//                   padding: 15px 10px;
//                   text-align: center;
//                   font-size: clamp(11px, 2.8vw, 13px);
//                   color: #000000;
//                   border-top: 1px solid #2c3e50;
//                   background-color: transparent;
//               }
              
//               .link { 
//                   color: #3498db; 
//                   text-decoration: none;
//                   word-break: break-all;
//                   display: inline-block;
//                   padding: 4px 0;
//               }
              
//               .link:hover {
//                   text-decoration: underline;
//               }

//               /* Tablet Styles */
//               @media screen and (min-width: 768px) {
//                   .detail-row {
//                       flex-direction: row;
//                       align-items: center;
//                   }
                  
//                   .detail-label {
//                       width: 150px;
//                       margin-bottom: 0;
//                       padding-right: 15px;
//                   }
                  
//                   .footer {
//                       text-align: right;
//                   }
//               }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <div class="header">
//                         <h1>N O T I F I C A T I O N</h1>
//                     </div>
//                     <div class="notification-header">
//                         Purchase Request Rejected
//                     </div>
//                     <div class="content">
//                         <div class="detail-row no-border-mobile">
//                             <span class="detail-label">Request Number:</span>
//                             <span class="detail-value">${REQUEST_NUMBER}</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Status:</span>
//                             <span class="detail-value">Rejected</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Remarks:</span>
//                             <span class="detail-value">${REMARKS}</span>
//                         </div>
//                         <div class="detail-row">
//                             <span class="detail-label">Action By:</span>
//                             <span class="detail-value">${loginid}</span>
//                         </div>
//                         <div class="detail-row no-border-mobile">
//                             <span class="detail-label">Action Date:</span>
//                             <span class="detail-value">${new Date().toLocaleDateString()}</span>
//                         </div>
//                     </div>
//                     <div class="footer">
//                         Powered by Bayanat Technology – Procurement Management System (PMS)
//                     </div>
//                 </div>
//             </body>
//             </html>`;
//           break;
//       }

//       console.log(`Sending email notification for event: ${eventType}`);
//       console.log("Email subject:", emailSubject);
//       console.log("Email message:", emailMessage);

//       if (emailSubject && emailMessage && eventType) {
//         try {
//           await notifyUser({
//             event: eventType,
//             subject: emailSubject,
//             message: emailMessage,
//             request_users: userEmails,
//             cc: ccEmail,
//             htmlMessage: emailMessage,
//           });
//           console.log("Email notification sent successfully");
//         } catch (error) {
//           console.error("Failed to send email notification:", error);
//         }
//       }
//     } else {
//       console.log("No email addresses found for notification");
//     }

//     res.status(200).json({
//       success: true,
//       message: "Updated Successfully",
//     });
//   } catch (error) {
//     console.error("Error occurred, rolling back transaction:", error);
//     await t.rollback();

//     res.status(500).json({
//       success: false,
//       message: "Update Unsuccessful",
//     });
//   }
// };


// // Fetch GEN_PO_NUMBER from GT_SESSION_INFO
// export const FetchGenPOString = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let connection: any;
//   try {
//     console.log("✅ Fetching GEN_PO_NUMBER from GT_SESSION_INFO");
//     let connection = await oracleDb.getConnection();

//     const query = `
//       SELECT GEN_PO_NUMBER
//       FROM GT_SESSION_INFO
//       WHERE ROWNUM = 1
//     `;

//     const result = await connection.execute(query, {}) as any;

//     const genPoNumber = result?.rows?.[0] && result.rows[0].GEN_PO_NUMBER
//       ? String(result.rows[0].GEN_PO_NUMBER)
//       : "NO";

//     console.log("✅ GEN_PO_NUMBER fetched:", genPoNumber);
//     res.status(200).json({ success: true, data: genPoNumber });
//   } catch (error) {
//     console.error("❌ Error fetching GEN_PO_NUMBER:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   } finally {
//     if (connection) await connection.close();
//   }
// };

// // Cancel final approval using stored procedure
// export const cancelFinalApproval = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let connection: any;
//   try {
//     console.log("✅ cancelFinalApproval API called");
//     const { company_code, request_number, user_id } = req.body;

//     if (!company_code || !request_number || !user_id) {
//       res.status(400).json({
//         success: false,
//         message: "company_code, request_number, and user_id are required",
//       });
//       return;
//     }

//     connection = await oracleDb.getConnection();

//     console.log("📞 Calling stored procedure PRO_CANCEL_FINAL_APPROVAL_PR...");
//     await connection.execute(
//       `BEGIN PRO_CANCEL_FINAL_APPROVAL_PR(:company_code, :request_number, :user_id); END;`,
//       { company_code, request_number, user_id }
//     );

//     await connection.commit();
//     console.log("✅ Stored procedure executed and transaction committed.");

//     res.status(200).json({
//       success: true,
//       message: "Final approval cancelled successfully.",
//     });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error in cancelFinalApproval:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while cancelling final approval.",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) await connection.close();
//   }
// };

// // Fetch PO listing using stored procedure and view
// export const fetchPOlisting = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   let connection: any;
//   try {
//     console.log("✅ fetchPOlisting API called");
//     const { request_number } = req.params;

//     if (!request_number) {
//       res.status(400).json({ success: false, message: "❌ request_number is required" });
//       return;
//     }

//     connection = await oracleDb.getConnection();

//     console.log("📞 Calling stored procedure PRO_CALL_GEN_JESRA_PO_NO_DRAFT...");
//     await connection.execute(
//       `BEGIN PRO_CALL_GEN_JESRA_PO_NO_DRAFT(:request_number); END;`,
//       { request_number }
//     );

//     await connection.commit();
//     console.log("✅ Stored procedure executed and transaction committed.");

//     const query = `
//       SELECT * 
//       FROM VW_PO_LISTING
//       WHERE REQUEST_NUMBER = :request_number
//     `;

//     const result = await connection.execute(query, { request_number });

//     console.log(
//       "✅ Query executed successfully. Retrieved",
//       result.rows?.length || 0,
//       "records"
//     );

//     res.status(200).json({ success: true, data: result.rows });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error("❌ Error in fetchPOlisting:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching PO listing",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   } finally {
//     if (connection) await connection.close();
//   }
// };
