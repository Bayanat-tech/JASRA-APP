// import { QueryTypes, Transaction } from "sequelize";
// import { Request, Response } from "express";
// import { sequelize } from "../../database/connection";
// import {
//   IStnRequest,
//   IStnDetailRequest,
// } from "./stocktransfer.interface";
 
// // Upsert TS_STN (Header)
// async function upsertTSSTN(
//   data: IStnRequest,
//   transaction: Transaction
// ): Promise<number> {
//   if (!transaction) throw new Error('Transaction is required');
 
//   const isUpdate = !!data.stn_no;
 
//   if (!isUpdate) {
//     const insertQuery = `
//       INSERT INTO TS_STN (
//         PRIN_CODE, DESCRIPTION, STN_DATE,
//         ALLOCATED, ALLOCATED_DATE, CONFIRMED, CONFIRMED_DATE,
//         USER_ID, USER_DT, COMPANY_CODE, REPLENISH_NO, REPLENISH_DATE,
//         REMARKS, OUT_JOB_NO, COUNT_NO, CANCEL
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?)
//     `;
 
//     const replacements = [
//       data.prin_code ?? '',
//       data.description ?? '',
//       data.stn_date ?? null,
//       data.allocated ?? 'N',
//       data.allocated_date ?? null,
//       data.confirmed ?? 'N',
//       data.confirmed_date ?? null,
//       data.updated_by ?? 'system',
//       data.company_code ?? '',
//       data.replenish_no ?? null,
//       data.replenish_date ?? null,
//       data.remarks ?? '',
//       data.out_job_no ?? '',
//       data.count_no ?? '',
//       data.cancel ?? 'N',
//     ];
 
//     if (replacements.some((r) => r === undefined)) {
//       throw new Error('Insert Replacements contains undefined value');
//     }
 
//     await sequelize.query(insertQuery, {
//       replacements,
//       transaction,
//     });
 
//     const [result]: any = await sequelize.query(
//       `
//         SELECT STN_NO FROM TS_STN
//         WHERE COMPANY_CODE = ? AND PRIN_CODE = ?
//         ORDER BY USER_DT DESC LIMIT 1
//       `,
//       {
//         replacements: [data.company_code ?? '', data.prin_code ?? ''],
//         transaction,
//       }
//     );
 
//     if (!result?.length) {
//       throw new Error("Failed to fetch generated STN_NO");
//     }
 
//     return result[0].STN_NO;
//   } else {
//     const updateQuery = `
//       UPDATE TS_STN SET
//         DESCRIPTION = ?, STN_DATE = ?,
//         ALLOCATED = ?, ALLOCATED_DATE = ?,
//         CONFIRMED = ?, CONFIRMED_DATE = ?,
//         USER_ID = ?, USER_DT = CURRENT_TIMESTAMP,
//         REPLENISH_NO = ?, REPLENISH_DATE = ?,
//         REMARKS = ?, OUT_JOB_NO = ?, COUNT_NO = ?, CANCEL = ?
//       WHERE STN_NO = ? AND COMPANY_CODE = ?
//     `;
 
//     const updateReplacements = [
//       data.description ?? '',
//       data.stn_date ?? null,
//       data.allocated ?? 'N',
//       data.allocated_date ?? null,
//       data.confirmed ?? 'N',
//       data.confirmed_date ?? null,
//       data.updated_by ?? 'system',
//       data.replenish_no ?? null,
//       data.replenish_date ?? null,
//       data.remarks ?? '',
//       data.out_job_no ?? '',
//       data.count_no ?? '',
//       data.cancel ?? 'N',
//       data.stn_no ?? 0,
//       data.company_code ?? '',
//     ];
 
//     if (updateReplacements.some((r) => r === undefined)) {
//       throw new Error('Update Replacements contains undefined value');
//     }
 
//     await sequelize.query(updateQuery, {
//       replacements: updateReplacements,
//       transaction,
//     });
 
//     return data.stn_no!;
//   }
// }
 
 
// // Upsert TS_STNDETAIL (Details)
// async function upsertTSSTNDetails(
//   items: IStnDetailRequest[],
//   companyCode: string,
//   stnNumber: number,
//   transaction: Transaction
// ) {
//   if (!Array.isArray(items)) return;
 
//   // Delete old details
//   await sequelize.query(
//     `DELETE FROM TS_STNDETAIL WHERE STN_NO = ? AND COMPANY_CODE = ?`,
//     {
//       replacements: [stnNumber, companyCode],
//       transaction,
//     }
//   );
 
//   // Insert new details
//   for (const item of items) {
//     const insertQuery = `
//       INSERT INTO TS_STNDETAIL (
//         STN_NO, PRIN_CODE, SEQ_NUMBER, PROD_CODE, JOB_NO,
//         CONTAINER_NO, DOC_REF, FROM_SITE, TO_SITE,
//         FROM_LOC_START, FROM_LOC_END, TO_LOC_START, TO_LOC_END,
//         QTY_PUOM, QTY_LUOM, P_UOM, L_UOM,
//         COMPANY_CODE
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
 
//     const replacements = [
//       stnNumber,
//       item.prin_code,
//       item.seq_number,
//       item.prod_code,
//       item.job_no,
//       item.container_no,
//       item.doc_ref,
//       item.from_site,
//       item.to_site,
//       item.from_loc_start,
//       item.from_loc_end,
//       item.to_loc_start,
//       item.to_loc_end,
//       item.qty_puom,
//       item.qty_luom,
//       item.p_uom,
//       item.l_uom,
//       companyCode,
//     ];
 
//     await sequelize.query(insertQuery, {
//       replacements,
//       transaction,
//     });
//   }
// }
 
// // Controller
// export const createOrUpdateTSSTNSequential = async (
//   req: Request,
//   res: Response
// ) => {
//   const data: IStnRequest = req.body;
//   let transaction: Transaction | undefined;
 
//   try {
//     transaction = await sequelize.transaction();
 
//     const stnNumber = await upsertTSSTN(data, transaction);
 
//     await upsertTSSTNDetails(
//       data.items,
//       data.company_code,
//       stnNumber,
//       transaction
//     );
 
//     await transaction.commit();
 
//     res.status(200).json({
//       success: true,
//       message: "TS_STN and TS_STNDETAIL successfully upserted",
//       stnNumber,
//     });
//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error("TS_STN upsert error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to upsert TS_STN data",
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };
 
 