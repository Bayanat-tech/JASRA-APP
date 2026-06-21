import { getRepository } from "../../database/connection";
import { UomMaster } from "../../entity/WMS/uom.entity";

export class UomService {
  private static getUomRepository() {
    return getRepository(UomMaster);
  }

  // Check for duplicate UOM by code or name
  static async findDuplicate(params: {
    uom_code: string;
    uom_name?: string;
  }): Promise<UomMaster | null> {
    const repository = this.getUomRepository();
    return await repository.findOne({
      where: {
        uom_code: params.uom_code,
        uom_name: params.uom_name,
      },
    });
  }

  // Get all UOMs
  static async findAll(): Promise<UomMaster[]> {
    const repository = this.getUomRepository();
    return await repository.find();
  }

  // Find UOM by code
  static async findByCode(uom_code: string): Promise<UomMaster | null> {
    const repository = this.getUomRepository();
    return await repository.findOne({
      where: { uom_code },
    });
  }

  // Find UOMs by company
  static async findByCompany(company_code: string): Promise<UomMaster[]> {
    const repository = this.getUomRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Create new UOM
  static async createUom(uomData: Partial<UomMaster>): Promise<UomMaster> {
    const repository = this.getUomRepository();

    const uom = repository.create({
      ...uomData,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await repository.save(uom);
  }

  // Update existing UOM
  static async updateUom(
    uom_code: string,
    updateData: Partial<UomMaster>
  ): Promise<boolean> {
    const repository = this.getUomRepository();

    const result = await repository.update(
      { uom_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete UOM
  static async deleteUom(uom_code: string): Promise<boolean> {
    const repository = this.getUomRepository();
    const result = await repository.delete({ uom_code });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if UOM exists
  static async checkUomExists(uom_code: string): Promise<boolean> {
    const repository = this.getUomRepository();
    const count = await repository.count({
      where: { uom_code },
    });
    return count > 0;
  }
}
