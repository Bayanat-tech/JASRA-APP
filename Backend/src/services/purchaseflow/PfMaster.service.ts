import { In } from "typeorm";
import { AppDataSource, getRepository } from "../../database/connection";
import { CostMaster } from "../../entity/PurchaseFlow/costmaster.entity";
import { CustomerMaster } from "../../entity/PurchaseFlow/customermaster.entity";
import { DdCurrency } from "../../entity/PurchaseFlow/ddcurrency_pf.entity";
import { ItemmasterPf } from "../../entity/PurchaseFlow/Itemmaster_pf.entity";
import { MaterialCategoryMaster } from "../../entity/PurchaseFlow/materialcategary.entity";
import { Divisionmaster } from "../../entity/PurchaseFlow/Pf_divisionmaster.entity";
import { VProjectMaster } from "../../entity/PurchaseFlow/projectmaster_pf_view.entity";
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

  //-------------------------delete Master ---------------------

static async deleteMasterRecords(
  master: string,
  company_code: string,
  ids: (string | number)[]
): Promise<boolean> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    let result: any;

    switch (master) {
      case "cost_master":
        result = await queryRunner.manager.delete(CostMaster, {
          company_code,
          cost_code: In(ids as string[]),
        });
        break;

      case "project_master":
        result = await queryRunner.manager.delete(VProjectMaster, {
          company_code,
          project_code: In(ids as string[]),
        });
        break;

      case "supplier_master":
        result = await queryRunner.manager.delete(SupplierMaster, {
          company_code,
          supp_code: In(ids as string[]),
        });
        break;

      case "customer_master":
        result = await queryRunner.manager.delete(CustomerMaster, {
          company_code,
          cust_code: In(ids as string[]),
        });
        break;

      default:
        throw new Error(`Unknown master type: ${master}`);
    }

    await queryRunner.commitTransaction();

    return result?.affected && result.affected > 0;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
}
