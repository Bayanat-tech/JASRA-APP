// import constants from "../../helpers/constants";
// import { RequestWithUser } from "../../interfaces/common.interface";
// import SmsFiles from "../../models/SMS/sms_files_model";
// import { Response } from "express";

// // export const getSmsFiles = async (
// //     req: RequestWithUser, res: Response) => {
// //         try {
// //             const { sr_no } = req.params;

// //             //
// //             if ( !sr_no ) {
// //                 res.status(constants.STATUS_CODES.BAD_REQUEST).json({
// //                     success: true,
// //                     message: constants.MESSAGES.BAD_REQUEST,
// //                     });
// //                 return;
// //             }

// export const deleteSmsFiles = async (req: RequestWithUser, res: Response) => {
//   try {
//     const {  sr_no,company_code } = req.params;

//     if (!sr_no)  {
//       res.status(constants.STATUS_CODES.BAD_REQUEST).json({
//         success: false,
//         message: constants.MESSAGES.BAD_REQUEST,
//       });
//       return;
//     }

//     const deleteResponse = await SmsFiles.destroy({
//       where: {
//          company_code,
//          sr_no},
//     });

//     if (deleteResponse == 0) {
//       res.status(constants.STATUS_CODES.BAD_REQUEST).json({
//         success: false,
//         message: "No record to delete",
//       });
//       return;
//     }

//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       message: constants.MESSAGES.DELETED_SUCCESSFULLY,
//     });
//     return;
//   }
//   catch
// };
