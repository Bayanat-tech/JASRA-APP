import { getRepository } from "../../database/connection";
import { CostMaster } from "../../entity/PurchaseFlow/costmaster.entity";

// import { CostMaster } from "../../../src/entity/PurchaseFlow/costmaster.entity"
// import { CostMaster } from "../../entity/Purchaseflow/costmaster.entity";
// import { CostMaster } from "../../entity/PurchaseFlow/costmaster.entity";
import { CustomerMaster } from "../../entity/PurchaseFlow/customermaster.entity";
import { DdCurrency } from "../../entity/PurchaseFlow/ddcurrency_pf.entity";
import { ItemmasterPf } from "../../entity/PurchaseFlow/Itemmaster_pf.entity";
import { MaterialCategoryMaster } from "../../entity/PurchaseFlow/materialcategary.entity";
import { Divisionmaster } from "../../entity/PurchaseFlow/Pf_divisionmaster.entity";
import { SupplierMaster } from "../../entity/PurchaseFlow/suppliermaster_pf.entity";
 
export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class PurchaseFlowMasterService {
  static async getDivisionMaster(
    company_code: string,
    page = 1,
    limit = 4000
  ): Promise<Master<Divisionmaster>> {
    const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(Divisionmaster).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });

    return { fetchedData, totalCount };
  }
// Get Cost Master
  static async getCostMaster(
    company_code: string,
    page = 1,
    limit = 4000
  ): Promise<Master<CostMaster>> {
    const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(CostMaster).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });

    return { fetchedData, totalCount };
  }

  static async getMaterialCategoryMaster(
    company_code: string,
    page = 1,
    limit = 4000
  ): Promise<Master<MaterialCategoryMaster>> {
    const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(MaterialCategoryMaster).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });

    return { fetchedData, totalCount };
  }

  static async getSupplierMaster(
    company_code: string, 
    page = 1, 
    limit = 4000
  ): Promise<Master<SupplierMaster>> {
    const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(SupplierMaster).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });
    return { fetchedData, totalCount };
  }

  static async getCustomerMaster(
    company_code: string, 
    page = 1, 
    limit = 4000
  ): Promise<Master<CustomerMaster>> {
    const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(CustomerMaster).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });
    return { fetchedData, totalCount };
  }
 
   static async getddcurrency(
    company_code: string, 
    page = 1, 
    limit = 4000
  ): Promise<Master<DdCurrency>> {
    const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(DdCurrency).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });
    return { fetchedData, totalCount };
  }

   static async ddMaterialCateotry(
    company_code: string, 
    page = 1, 
    limit = 4000
  ): Promise<Master<DdCurrency>> {
    const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(DdCurrency).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });
    return { fetchedData, totalCount };
  }

  static async getItemmaster(
    company_code: string, 
    page = 1, 
    limit = 4000
  ): Promise<Master<ItemmasterPf>> {
    const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(ItemmasterPf).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });
    return { fetchedData, totalCount };
  }

  // //  Delete :

  // static async deleteRecords(
  //   entity: any,
  //    conditions: any[]
  //   ): Promise<number> {
  //   const repo = getRepository(entity);

  //   if (!conditions || conditions.length === 0) {
  //     throw new Error("Delete conditions must be a non-empty array.");
  //   }

  //   let totalDeleted = 0;

  //   for (const condition of conditions) {

  //     const existing = await repo.findOne({ where: condition });
  //     if (!existing) {
  //       console.warn(`Record not found for condition:`, condition);
  //       continue;  
  //     }

  //     const result = await repo.delete(condition);

  //     if (result.affected && result.affected > 0) {
  //       totalDeleted += result.affected;
  //     }
  //   }

  //   return totalDeleted;
  // }
}





