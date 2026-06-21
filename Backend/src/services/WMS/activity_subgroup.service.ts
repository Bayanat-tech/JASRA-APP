import { getRepository } from "../../database/connection";
import { ActivitySubgroup } from "../../entity/WMS/activity_subgroup.entity";
import { In } from "typeorm";

export class ActivitySubgroupService {
  private static getActivitySubgroupRepository() {
    return getRepository(ActivitySubgroup);
  }

  static async findByNameAndCompany(
    actSubgroupName: string,
    companyCode: string
  ): Promise<ActivitySubgroup | null> {
    const repository = this.getActivitySubgroupRepository();
    return await repository.findOne({
      where: { actSubgroupName, companyCode },
    });
  }

  static async findByCodeAndCompany(
    activitySubgroupCode: string,
    companyCode: string
  ): Promise<ActivitySubgroup | null> {
    const repository = this.getActivitySubgroupRepository();
    return await repository.findOne({
      where: { activitySubgroupCode, companyCode },
    });
  }

  static async createActivitySubgroup(subgroupData: {
    actSubgroupName: string;
    companyCode: string;
    createdBy: string;
    updatedBy: string;
    actGroupCode?: string;
    accountCode?: string;
    mandatoryFlag?: string;
    validateFlag?: string;
  }): Promise<ActivitySubgroup> {
    const repository = this.getActivitySubgroupRepository();

    // Generate activitySubgroupCode (customize logic if needed)
    const maxCode = await repository
      .createQueryBuilder("activitySubgroup")
      .select("MAX(activitySubgroup.activitySubgroupCode)", "max")
      .getRawOne();

    let nextCode = "A0001";
    if (maxCode?.max) {
      const currentMax = parseInt(maxCode.max.replace("A", ""));
      nextCode = `A${(currentMax + 1).toString().padStart(4, "0")}`;
    }

    const subgroup = repository.create({
      ...subgroupData,
      activitySubgroupCode: nextCode,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "USER",
      userDt: new Date(),
    });

    return await repository.save(subgroup);
  }

  static async updateActivitySubgroup(
    activitySubgroupCode: string,
    companyCode: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getActivitySubgroupRepository();

    const result = await repository.update(
      { activitySubgroupCode, companyCode },
      {
        ...updateData,
        updatedAt: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteActivitySubgroups(activitySubgroupCodes: string[]): Promise<boolean> {
    const repository = this.getActivitySubgroupRepository();

    const result = await repository.delete({
      activitySubgroupCode: In(activitySubgroupCodes),
    });

    return result.affected ? result.affected > 0 : false;
  }

  static async checkActivitySubgroupExists(
    activitySubgroupCode: string,
    companyCode: string
  ): Promise<boolean> {
    const repository = this.getActivitySubgroupRepository();
    const count = await repository.count({
      where: { activitySubgroupCode, companyCode },
    });
    return count > 0;
  }

  static async getActivitySubgroups(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: ActivitySubgroup[]; total: number }> {
    const repository = this.getActivitySubgroupRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { activitySubgroupCode: "ASC" },
    });

    return { data, total };
  }
}
