import { AppDataSource, TypeORMService } from "../../database/connection";
import { PrincipalMaster } from "../../entity/WMS/principal.entity"

export class PrincipalService {
  private static async ensureDataSource() {
    if (!AppDataSource.isInitialized) {
      await TypeORMService.initialize();
    }
  }

  private static async getPrincipalRepository() {
    await this.ensureDataSource();
    return AppDataSource.getRepository(PrincipalMaster);
  }

  // Check for duplicate principal by code or name
  static async findDuplicate(params: {
    prin_code: string;
    prin_name?: string;
  }): Promise<PrincipalMaster | null> {
    const repository = await this.getPrincipalRepository();

    const whereConditions = [];
    if (params.prin_code && params.prin_code.trim() !== "") {
      whereConditions.push({ prin_code: params.prin_code });
    }
    if (params.prin_name && params.prin_name.trim() !== "") {
      whereConditions.push({ prin_name: params.prin_name });
    }

    if (whereConditions.length === 0) {
      return null;
    }

    return await repository.findOne({
      where: whereConditions,
    });
  }

  // Get all principals
  static async findAll(): Promise<PrincipalMaster[]> {
    const repository = await this.getPrincipalRepository();
    const all = await repository.find();
    console.log("PrincipalService.findAll result count:", all.length);
    return all;
  }

  // Find principal by code
  static async findByCode(prin_code: string): Promise<PrincipalMaster | null> {
    const repository = await this.getPrincipalRepository();
    return await repository.findOne({
      where: { prin_code },
    });
  }

  // Find principals by company
  static async findByCompany(company_code: string): Promise<PrincipalMaster[]> {
    const repository = await this.getPrincipalRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Create new principal
  static async createPrincipal(principalData: Partial<PrincipalMaster>): Promise<PrincipalMaster> {
    const repository = await this.getPrincipalRepository();

    const principal = repository.create({
      ...principalData,
    });

    return await repository.save(principal);
  }

  // Update existing principal
  static async updatePrincipal(prin_code: string, updateData: Partial<PrincipalMaster>): Promise<boolean> {
    const repository = await this.getPrincipalRepository();

    const result = await repository.update(
      { prin_code },
      updateData
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete principal
  static async deletePrincipal(prin_code: string): Promise<boolean> {
    const repository = await this.getPrincipalRepository();
    const result = await repository.delete({ prin_code });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if principal exists
  static async checkPrincipalExists(prin_code: string): Promise<boolean> {
    const repository = await this.getPrincipalRepository();
    const count = await repository.count({
      where: { prin_code },
    });
    return count > 0;
  }
}
