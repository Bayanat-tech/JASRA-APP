// import { Request, Response, RequestHandler } from "express";
// import oracledb from "oracledb";
// import constants from "../../helpers/constants";
// import { IUser } from "../../interfaces/user.interface";
// import { RequestWithUser } from "../../interfaces/common.interface";

// type OracleRow = Record<string, any>;
// type OracleRows = OracleRow[] | null;

// // Lowercase helper
// function toLowerKeys(obj: any) {
//   return Object.fromEntries(
//     Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])
//   );
// }

// export const getPurchaserequest: RequestHandler = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   let connection: oracledb.Connection | null = null;

//   try {
//     const requestUser: IUser = req.user;
//     console.log("inside getrequest");
//     const { request_number, company_code } = req.params;

//     console.log("request_number:", request_number);

//     let ls_request_number: string;
//     if (typeof request_number === "string") {
//       ls_request_number = request_number.replace(/\$\$/g, "/");
//       console.log("Replacement successful:", ls_request_number);
//     } else {
//       console.error("Error: request_number is not a string.", request_number);
//       ls_request_number = String(request_number);
//     }

//     connection = await oracledb.getConnection();

//     // -----------------------
//     // 1. CHECK IF REQUEST EXISTS
//     // -----------------------
//     const querycount = `
//       SELECT COUNT(*) AS COUNT 
//       FROM PURCHASE_REQUEST_HEADER 
//       WHERE REQUEST_NUMBER = :REQ
//     `;
//     const countResult = await connection.execute(
//       querycount,
//       { REQ: ls_request_number },
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     const count = (countResult.rows?.[0] as OracleRow)?.COUNT || 0;
//     console.log(`Count for request_number ${ls_request_number}:`, count);

//     // -----------------------
//     // 2. PO PRINT LOGIC
//     // -----------------------
//     if (ls_request_number.includes("PO$")) {
//       const poquerydetail = `SELECT * FROM GT_PO_PRINT_DETAILS ORDER BY ITEM_SEQUENCE_NO`;
//       const procedureQuery = `BEGIN PRO_PO_PRINT_DATA(:REQ_NUM, :COMP_CODE); END;`;
      
//       await connection.execute(procedureQuery, {
//         REQ_NUM: ls_request_number,
//         COMP_CODE: requestUser.company_code,
//       });

//       const headerPO = await connection.execute(
//         `SELECT * FROM GT_PO_PRINT_HEADER`,
//         {},
//         { outFormat: oracledb.OUT_FORMAT_OBJECT }
//       );
//       let headerRow = (headerPO.rows?.[0] as OracleRow) || {};
//       headerRow = toLowerKeys(headerRow); // 🔥 lowercase applied

//       const detailPO = await connection.execute(
//         poquerydetail,
//         {},
//         { outFormat: oracledb.OUT_FORMAT_OBJECT }
//       );
//       let detailRows = (detailPO.rows as OracleRows) || [];
//       detailRows = detailRows.map((r) => toLowerKeys(r)); // 🔥 lowercase applied

//       if (!headerRow || !detailRows) {
//         res.status(constants.STATUS_CODES.NOT_FOUND).json({
//           success: false,
//           message: "Purchase Request " + constants.MESSAGES.DOES_NOT_EXISTS,
//         });
//         return;
//       }

//       res.status(constants.STATUS_CODES.OK).json({
//         success: true,
//         data: {
//           ...headerRow,
//           items: detailRows,
//         },
//       });
//       return;
//     }

//     console.log("company_code:", company_code);
//     console.log("Count is not zero, proceeding with other operations.");

//     // -----------------------
//     // 3. GET PRINCIPAL CODE
//     // -----------------------
//     const prinQuery = `
//       SELECT prin_code 
//       FROM MS_PRINCIPAL 
//       WHERE PRIN_DEPT_CODE IN (
//         SELECT DISTINCT div_code 
//         FROM PURCHASE_REQUEST_DETAILS
//         WHERE REQUEST_NUMBER = :REQ
//       )
//     `;
//     const prinRes = await connection.execute(
//       prinQuery,
//       { REQ: ls_request_number },
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     const prinCode = (prinRes.rows?.[0] as OracleRow)?.PRIN_CODE;

//     if (!prinCode) {
//       console.log("No PRIN_CODE found, exiting.");
//       return;
//     }

//     // -----------------------
//     // 4. HEADER QUERY
//     // -----------------------
//     const headerQuery = `
//       SELECT REPLACE(request_number, '$', '/') AS request_number, final_approved, fa_uploaded, flow_level_running,
//         request_date, description, type_of_contract, amc_from, amc_to, type_of_material_supply, wo_number, remarks,
//         project_code, contract_soft_hard, amc_service_status, material_mechanical, material_electrical, material_plumbing,
//         material_tools, material_civil, material_ac, material_cleaning, material_other, services_temp_staff, services_rentals,
//         services_subcon_conslt, services_other, other_stationery, other_it, other_new_uniform_ppe, other_rplcmt_uniform, other_other,
//         good_material_request, service_request, last_action, need_by_date, service_type, type_of_pr, covered_by_contract_yes,
//         flag_sharing_cost, budgeted_yes, checked_store_yes, project_name, div_code, others, it_tech, stationary, laundry_housekeeping,
//         accommodation, catering, medical, transportation, training, recruitment_hr, uniform, furniture, entertainment, barber, requestor_name
//       FROM VW_PURCHASE_REQUEST_HEADER
//       WHERE request_number = :REQ
//       FETCH FIRST 1 ROWS ONLY
//     `;

//     const detailQuery = `
//       SELECT *
//       FROM VW_PURCHASE_REQUEST_TRANSACTION1
//       WHERE REQUEST_NUMBER = :REQ
//       AND PRIN_CODE = :PRIN
//       ORDER BY ITEM_SEQUENCE_NO
//     `;

//     const termconditionQuery = `
//       SELECT request_number, supplier AS tsupplier, remarks, dlvr_term, payment_terms, quatation_reference, delivery_address
//       FROM PR_SUPPL_TERM_COND
//       WHERE request_number = :REQ
//     `;

//     const headerRes = await connection.execute(
//       headerQuery,
//       { REQ: ls_request_number },
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     let headerRow = (headerRes.rows?.[0] as OracleRow) || {};
//     headerRow = toLowerKeys(headerRow); // 🔥 lowercase

//     const detailRes = await connection.execute(
//       detailQuery,
//       { REQ: ls_request_number, PRIN: prinCode },
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     let detailRows = (detailRes.rows as OracleRows) || [];
//     detailRows = detailRows.map((r) => toLowerKeys(r)); // 🔥 lowercase

//     const tcRes = await connection.execute(
//       termconditionQuery,
//       { REQ: ls_request_number },
//       { outFormat: oracledb.OUT_FORMAT_OBJECT }
//     );
//     let tcRows = (tcRes.rows as OracleRows) || [];
//     tcRows = tcRows.map((r) => toLowerKeys(r)); // 🔥 lowercase

//     console.log(headerRow);
//     console.log(detailRows);
//     console.log(tcRows);

//     if (!headerRow || !detailRows) {
//       res.status(constants.STATUS_CODES.NOT_FOUND).json({
//         success: false,
//         message: "Purchase Request " + constants.MESSAGES.DOES_NOT_EXISTS,
//       });
//       return;
//     }

//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       data: {
//         ...headerRow,
//         items: detailRows,
//         Termscondition: tcRows,
//       },
//     });

//   } catch (error: any) {
//     console.error("Error in getPurchaserequest:", error);
//     res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: error.message,
//     });
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch {
//         console.error("Failed to close Oracle connection");
//       }
//     }
//   }
// };
