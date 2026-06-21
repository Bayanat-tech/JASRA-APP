// import { getRepository } from "../../database/connection";
// import { ItemmasterPf } from "../../entity/Purchaseflow/itemmaster.entity";

// export class ItemMasterService {
//   static getMyItemMaster(company_code: string, page: number, limit: number): { fetchedData: any[]; totalCount: number; } | PromiseLike<{ fetchedData: any[]; totalCount: number; }> {
//     throw new Error("Method not implemented.");
//   }
//   private static getRepository() {
//     return getRepository(ItemmasterPf);
//   }

//   // Duplicate Check
//   static async findDuplicate(
//     item_code: string,
//     item_desp: string,
//     company_code: string
//   ): Promise<ItemmasterPf | null> {
//     const repo = this.getRepository();

//     return await repo.findOne({
//       where: { item_code, item_desp, company_code }
//     });
//   }

//   static async findOne(item_code: string, company_code: string): Promise<ItemmasterPf | null> {
//     const repo = this.getRepository();

//     return await repo.findOne({
//       where: { item_code, company_code }
//     });
//   }

//   // Create
//   static async createItem(data: any): Promise<ItemmasterPf> {
//     const repo = this.getRepository();

//     const item = repo.create({
//       ...data,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     return await repo.save(item);
//   }

//   // Update
//   static async updateItem(
//     item_code: string,
//     company_code: string,
//     updateData: any
//   ): Promise<boolean> {
//     const repo = this.getRepository();

//     const result = await repo.update(
//       { item_code, company_code },
//       {
//         ...updateData,
//         updated_at: new Date()
//       }
//     );

//     return result.affected ? result.affected > 0 : false;
//   }

//   // Delete 
//   static async deleteItems(
//     itemCodes: string[]
//   ): Promise<number> {
//     const repo = this.getRepository();

//     const result = await repo.delete(itemCodes);

//     return result.affected ?? 0;
//   }
// }
