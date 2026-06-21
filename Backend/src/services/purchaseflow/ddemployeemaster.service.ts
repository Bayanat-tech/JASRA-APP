 import { getRepository } from "../../database/connection";
import { EmployeeMaster } from "../../entity/PurchaseFlow/ddemployeemaster_pf_model.entity";
// import { EmployeeMaster } from "../../entity/PurchaseFlow/employeemaster_pf.entity";

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class DdEmployeeMasterService {
  static async getDdEmployeeMaster(
    company_code: string,
    page = 1,
    limit = 4000
  ): Promise<Master<EmployeeMaster>> {
   
    const skip = (page - 1) * limit;

   
    const [fetchedData, totalCount] = await getRepository(EmployeeMaster).findAndCount({
      where: { company_code }, 
      skip,                    
      take: limit,             
    });


    return { fetchedData, totalCount };
  }
}
