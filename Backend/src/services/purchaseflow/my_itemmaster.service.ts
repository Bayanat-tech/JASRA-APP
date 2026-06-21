import { getRepository } from "../../database/connection";
import { ItemmasterPf } from "../../entity/PurchaseFlow/Itemmaster_pf.entity";
import { IItemtmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class ItemMasterService {
  static async getMyItemMaster(
    company_code: string,
    page = 1,
    limit = 10
  ): Promise<Master<IItemtmaster>> {
    const skip = (page - 1) * limit;

    const repo = getRepository(ItemmasterPf);

    // Count total records
    const totalCount = await repo.count({
      where: { company_code },
    });

    // Fetch paginated data
    const fetchedData = await repo.find({
      where: { company_code },
      skip,
      take: limit,
    });

    return { fetchedData, totalCount };
  }
}
