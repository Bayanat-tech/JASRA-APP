import { getRepository } from "../../database/connection";
import { Warehouse } from "../../entity/WMS/Warehouse.entity";

export class WarehouseService {
  private static getWarehouseRepository() {
    return getRepository(Warehouse);
  }

  // Find warehouse by country code
  static async findByCountryCode(params: {
    country_code: string;
    company_code: string;
  }): Promise<Warehouse | null> {
    const repository = this.getWarehouseRepository();
    return await repository.findOne({
      where: {
        country_code: params.country_code,
        company_code: params.company_code,
      },
    });
  }

  // Find all warehouses by company
  static async findByCompanyCode(company_code: string): Promise<Warehouse[]> {
    const repository = this.getWarehouseRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Check if warehouse exists
  static async exists(params: {
    country_code: string;
    company_code: string;
  }): Promise<boolean> {
    const repository = this.getWarehouseRepository();
    const count = await repository.count({
      where: {
        country_code: params.country_code,
        company_code: params.company_code,
      },
    });
    return count > 0;
  }
}
