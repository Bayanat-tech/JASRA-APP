
import { getRepository } from "../../database/connection";
import { DivisionMaster } from "../../entity/PurchaseFlow/divisionmaster_pf.entity";

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class DddivisionmasterService {
    static async getDdDivision(
        company_code: string,
        page = 1,
        limit = 4000
    ):Promise<Master<DivisionMaster>> {
        const skip = (page - 1) * limit;
    const [fetchedData, totalCount] = await getRepository(DivisionMaster).findAndCount({
      where: { company_code },
      skip,
      take: limit,
    });           

    return { fetchedData, totalCount };
    }

}
