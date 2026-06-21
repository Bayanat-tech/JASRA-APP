import { getRepository } from "../../database/connection";
import { SupplierMaster } from "../../entity/PurchaseFlow/suppliermaster_pf.entity";

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class DdSuppliermasterService {
  static async getDdSupplierMaster(
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
}
