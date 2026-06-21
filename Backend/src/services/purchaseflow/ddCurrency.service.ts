import { getRepository } from "../../database/connection";
import { DdCurrency } from "../../entity/PurchaseFlow/ddcurrency_pf.entity";

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class DdcurrencyService {
  static async getDdCurrency(
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
}
