import { getRepository } from "../../database/connection";
import { CostMaster } from "../../entity/PurchaseFlow/costmaster.entity";

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class DdcostmasterService {
  static async getDdCostMaster(
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
}
