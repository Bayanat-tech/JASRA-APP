// import { getRepository } from "../../database/connection";
// import { TmpLeaveRequestFlow } from "../entities/JS_temp_leave_flow.entity";

// export class TempLeaveFlowService {
//   private static getTempLeaveFlowRepository() {
//     return getRepository(TmpLeaveRequestFlow);
//   }

//   static async createTempLeaveRequestFlow(
//     TempLeaveFlowData: Partial<TmpLeaveRequestFlow>,
//   ): Promise<TmpLeaveRequestFlow> {
//     const repository = this.getTempLeaveFlowRepository();

//     const Templeaveflow = repository.create({
//       ...TempLeaveFlowData,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     return await repository.save(Templeaveflow);
//   }

//   static async updateTempLeaveRequestFlow(
//     requestNumber: string,
//     updateData: Partial<TmpLeaveRequestFlow>,
//   ): Promise<TmpLeaveRequestFlow | null> {
//     const repository = this.getTempLeaveFlowRepository();

//     await repository.update(
//       { request_number: requestNumber },
//       {
//         ...updateData,
//         updated_at: new Date(),
//       },
//     );

//     return await repository.findOne({
//       where: { request_number: requestNumber },
//     });
//   }
// }
