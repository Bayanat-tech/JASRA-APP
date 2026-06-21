 import { getRepository } from "../../database/connection";
import { UomMaster } from "../../entity/PurchaseFlow/uommaster_pf.entity";

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class DduommasterService {
  static async getDdUomMaster(
    company_code: string,
    page = 1,
    limit = 4000
  ): Promise<Master<UomMaster>> {
    const skip = (page - 1) * limit;

    const [fetchedData, totalCount] = await getRepository(UomMaster).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });

    return { fetchedData, totalCount };
  }
}
