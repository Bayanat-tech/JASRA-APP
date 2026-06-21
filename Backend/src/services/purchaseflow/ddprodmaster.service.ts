import { getRepository } from "../../database/connection";
import { ProductMaster } from "../../entity/PurchaseFlow/prodmaster.entity";


export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class DdProdmasterService {
  static async getDdProdmaster(
    company_code: string,
    code?: string, 
    page = 1,
    limit = 4000
  ): Promise<Master<ProductMaster>> {
    const skip = (page - 1) * limit;
    const repository = getRepository(ProductMaster);

    let query = repository.createQueryBuilder("prod")
      .where("prod.company_code = :company_code", { company_code });

    if (code) {
      query = query.andWhere(
        `prod.prin_code IN (
          SELECT prin_code 
          FROM MS_PRINCIPAL 
          WHERE PRIN_DEPT_CODE = :code
        )`,
        { code }
      );
    }

    const [fetchedData, totalCount] = await query.skip(skip).take(limit).getManyAndCount();

    return { fetchedData, totalCount };
  }
}
