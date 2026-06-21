import { getRepository } from "../../database/connection";
import { ActivityUOC } from "../../entity/WMS/uoc.entity";
import { In } from "typeorm";

export class ActivityUOCService {
  private static getActivityUOCRepository() {
    return getRepository(ActivityUOC);
  }

  static async findByDescriptionAndCompany(
    description: string,
    companyCode: string
  ): Promise<ActivityUOC | null> {
    const repository = this.getActivityUOCRepository();
    return await repository.findOne({
      where: { description, companyCode },
    });
  }

  static async findByChargeCodesAndCompany(
    chargeType: string,
    chargeCode: string,
    companyCode: string
  ): Promise<ActivityUOC | null> {
    const repository = this.getActivityUOCRepository();
    return await repository.findOne({
      where: { chargeType, chargeCode, companyCode },
    });
  }

  static async createActivityUOC(activityData: {
    companyCode: string;
    chargeType: string;
    chargeCode: string;
    description?: string;
    activityGroupCode?: string;
    createdBy: string;
    updatedBy: string;
  }): Promise<ActivityUOC> {
    const repository = this.getActivityUOCRepository();
    
    const activity = repository.create({
      ...activityData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await repository.save(activity);
  }

  static async updateActivityUOC(
    companyCode: string,
    oldChargeType: string,
    oldChargeCode: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getActivityUOCRepository();

    const result = await repository.update(
      { companyCode, chargeType: oldChargeType, chargeCode: oldChargeCode },
      {
        ...updateData,
        updatedAt: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteActivityUOCs(
    activityIdentifiers: { companyCode: string; chargeType: string; chargeCode: string }[]
  ): Promise<boolean> {
    const repository = this.getActivityUOCRepository();
    let deleted = 0;

    for (const identifier of activityIdentifiers) {
      const result = await repository.delete({
        companyCode: identifier.companyCode,
        chargeType: identifier.chargeType,
        chargeCode: identifier.chargeCode,
      });
      
      if (result.affected) {
        deleted += result.affected;
      }
    }

    return deleted > 0;
  }

  static async checkActivityUOCExists(
    companyCode: string,
    chargeType: string,
    chargeCode: string
  ): Promise<boolean> {
    const repository = this.getActivityUOCRepository();
    const count = await repository.count({
      where: { companyCode, chargeType, chargeCode },
    });
    return count > 0;
  }

  static async getActivityUOCs(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: ActivityUOC[]; total: number }> {
    const repository = this.getActivityUOCRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { companyCode: "ASC", chargeType: "ASC", chargeCode: "ASC" },
    });

    return { data, total };
  }
}
