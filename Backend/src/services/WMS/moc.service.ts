import { getRepository } from "../../database/connection";
import { MocMaster } from "../../entity/WMS/moc.entity";

export class MocService {
  private static getMocRepository() {
    return getRepository(MocMaster);
  }

  // Check for duplicate MOC by code or name
  static async findDuplicate(params: {
    moc_code?: string;
    moc_name?: string;
    excludeCode?: string;
  }): Promise<MocMaster | null> {
    console.log("[MocService.findDuplicate] Input params:", params);
    
    const repository = this.getMocRepository();
    const queryBuilder = repository.createQueryBuilder("moc");
    
    const conditions: string[] = [];
    const parameters: any = {};
    
    if (params.moc_code) {
      conditions.push("moc.moc_code = :moc_code");
      parameters.moc_code = params.moc_code;
    }
    
    if (params.moc_name) {
      conditions.push("moc.moc_name = :moc_name");
      parameters.moc_name = params.moc_name;
    }
    
    if (conditions.length === 0) {
      console.log("[MocService.findDuplicate] No conditions to check, returning null");
      return null;
    }
    
    const whereClause = `(${conditions.join(" OR ")})`;
    console.log("[MocService.findDuplicate] Where clause:", whereClause);
    console.log("[MocService.findDuplicate] Parameters:", parameters);
    
    queryBuilder.where(whereClause, parameters);
    
    // Exclude current record when updating
    if (params.excludeCode) {
      console.log("[MocService.findDuplicate] Excluding code:", params.excludeCode);
      queryBuilder.andWhere("moc.moc_code != :excludeCode", { excludeCode: params.excludeCode });
    }
    
    const sql = queryBuilder.getSql();
    console.log("[MocService.findDuplicate] Final SQL:", sql);
    
    const result = await queryBuilder.getOne();
    console.log("[MocService.findDuplicate] Result:", result ? JSON.stringify(result, null, 2) : "NULL");
    
    return result;
  }

  // Get all MOCs
  static async findAll(): Promise<MocMaster[]> {
    const repository = this.getMocRepository();
    return await repository.find();
  }

  // Find MOC by code
  static async findByCode(moc_code: string): Promise<MocMaster | null> {
    console.log("[MocService.findByCode] Searching for code:", moc_code);
    
    // Prevent searching with undefined/null/empty values
    if (!moc_code) {
      console.log("[MocService.findByCode] Invalid moc_code (undefined/null/empty), returning null");
      return null;
    }
    
    const repository = this.getMocRepository();
    const result = await repository.findOne({
      where: { moc_code },
    });
    
    console.log("[MocService.findByCode] Result:", result ? "FOUND" : "NOT FOUND");
    if (result) {
      console.log("[MocService.findByCode] Details:", JSON.stringify(result, null, 2));
    }
    
    return result;
  }

  // Find MOCs by company
  static async findByCompany(company_code: string): Promise<MocMaster[]> {
    const repository = this.getMocRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Create new MOC
  static async createMoc(mocData: Partial<MocMaster>): Promise<MocMaster> {
    console.log("[MocService.createMoc] Creating MOC with data:", JSON.stringify(mocData, null, 2));
    
    const repository = this.getMocRepository();

    const moc = repository.create({
      ...mocData,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    console.log("[MocService.createMoc] Entity created, about to save:", JSON.stringify(moc, null, 2));

    const savedMoc = await repository.save(moc);
    
    console.log("[MocService.createMoc] MOC saved successfully:", JSON.stringify(savedMoc, null, 2));
    
    return savedMoc;
  }

  // Update existing MOC
  static async updateMoc(
    moc_code: string,
    updateData: Partial<MocMaster>
  ): Promise<boolean> {
    const repository = this.getMocRepository();

    const result = await repository.update(
      { moc_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete MOC
  static async deleteMoc(moc_code: string): Promise<boolean> {
    const repository = this.getMocRepository();
    const result = await repository.delete({ moc_code });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if MOC exists
  static async checkMocExists(moc_code: string): Promise<boolean> {
    const repository = this.getMocRepository();
    const count = await repository.count({
      where: { moc_code },
    });
    return count > 0;
  }
}
