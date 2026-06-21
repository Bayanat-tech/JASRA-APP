import { getRepository } from "../../database/connection";
import { SalesmanMaster } from "../../entity/WMS/salesman.entity";

export class SalesmanService {
  private static getSalesmanRepository() {
    return getRepository(SalesmanMaster);
  }

  // Check for duplicate salesman by code or name
  static async findDuplicate(params: {
    salesman_code: string;
    salesman_name?: string;
  }): Promise<SalesmanMaster | null> {
    const repository = this.getSalesmanRepository();

    const whereConditions = [];
    if (params.salesman_code && params.salesman_code.trim() !== "") {
      whereConditions.push({ salesman_code: params.salesman_code });
    }
    if (params.salesman_name && params.salesman_name.trim() !== "") {
      whereConditions.push({ salesman_name: params.salesman_name });
    }

    if (whereConditions.length === 0) {
      return null;
    }

    return await repository.findOne({
      where: whereConditions,
    });
  }

  // Get all salesmen
  static async findAll(): Promise<SalesmanMaster[]> {
    const repository = this.getSalesmanRepository();
    // Debug log to verify DB call
    const all = await repository.find();
    console.log("SalesmanService.findAll result count:", all.length);
    return all;
  }

  // Find salesman by code
  static async findByCode(salesman_code: string): Promise<SalesmanMaster | null> {
    const repository = this.getSalesmanRepository();
    return await repository.findOne({
      where: { salesman_code },
    });
  }

  // Find salesmen by company
  static async findByCompany(company_code: string): Promise<SalesmanMaster[]> {
    const repository = this.getSalesmanRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Create new salesman
  static async createSalesman(salesmanData: Partial<SalesmanMaster>): Promise<SalesmanMaster> {
    const repository = this.getSalesmanRepository();

    const salesman = repository.create({
      ...salesmanData,
    });

    return await repository.save(salesman);
  }

  // Update existing salesman
  static async updateSalesman(
    salesman_code: string,
    updateData: Partial<SalesmanMaster>
  ): Promise<boolean> {
    const repository = this.getSalesmanRepository();

    const result = await repository.update(
      { salesman_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete salesman
  static async deleteSalesman(salesman_code: string): Promise<boolean> {
    const repository = this.getSalesmanRepository();
    const result = await repository.delete({ salesman_code });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if salesman exists
  static async checkSalesmanExists(salesman_code: string): Promise<boolean> {
    const repository = this.getSalesmanRepository();
    const count = await repository.count({
      where: { salesman_code },
    });
    return count > 0;
  }
}
 