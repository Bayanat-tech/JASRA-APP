import { getRepository } from "../../database/connection";
import { SupplierMaster } from "../../entity/WMS/suppliermaster.entity";
 
export class SupplierService {
  public static getSupplierRepository() {
    return getRepository(SupplierMaster);
  }
 
  // Check for duplicate supplier
  static async findDuplicate(params: {
    company_code: string;
    supp_code: string;
  }): Promise<SupplierMaster | null> {
    const repository = this.getSupplierRepository();
    return await repository.findOne({
      where: {
        company_code: params.company_code,
        supp_code: params.supp_code,
      },
    });
  }
 
  // Get all suppliers
  static async findAll(): Promise<SupplierMaster[]> {
    const repository = this.getSupplierRepository();
    return await repository.find();
  }
 
  // Find supplier by code
  static async findByCode(
    supp_code: string,
    company_code: string
  ): Promise<SupplierMaster | null> {
    const repository = this.getSupplierRepository();
    return await repository.findOne({ where: { supp_code, company_code } });
  }
 
  // Create new supplier
  static async createSupplier(
    data: Partial<SupplierMaster>
  ): Promise<SupplierMaster> {
    const repository = this.getSupplierRepository();
    const supplier = repository.create({ ...data });
    return await repository.save(supplier);
  }
 
  // Update supplier
  static async updateSupplier(
    supp_code: string,
    company_code: string,
    updateData: Partial<SupplierMaster>
  ): Promise<boolean> {
    const repository = this.getSupplierRepository();
    const result = await repository.update({ supp_code, company_code }, updateData);
    return result.affected ? result.affected > 0 : false;
  }
 
  // Delete supplier
  static async deleteSupplier(
    supp_code: string,
    company_code: string
  ): Promise<boolean> {
    const repository = this.getSupplierRepository();
    const result = await repository.delete({ supp_code, company_code });
    return result.affected ? result.affected > 0 : false;
  }
 
  // Check if supplier exists
  static async checkSupplierExists(
    supp_code: string,
    company_code: string
  ): Promise<boolean> {
    const repository = this.getSupplierRepository();
    const count = await repository.count({ where: { supp_code, company_code } });
    return count > 0;
  }
  
  /**
   * Find suppliers by company code
   * @param companyCode - Company code to filter by
   * @returns Array of suppliers for the specified company
   */
  static async findByCompany(companyCode: string): Promise<SupplierMaster[]> {
    const repository = this.getSupplierRepository();
    return await repository.find({ where: { company_code: companyCode } });
  }
}

