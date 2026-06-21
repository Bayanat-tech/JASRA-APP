import { getRepository } from "../../database/connection";
import { ActivityKpi } from "../../entity/WMS/activitykpi.entity";

export class ActivityKpiService {
  private static getActivityKpiRepository() {
    return getRepository(ActivityKpi);
  }

  static async findByCompositeKey(
    companyCode: string, 
    prinCode: string, 
    jobType: string, 
    actCode: string
  ): Promise<ActivityKpi | null> {
    const repository = this.getActivityKpiRepository();
    return await repository.findOne({
      where: { companyCode, prinCode, jobType, actCode },
    });
  }

  static async findByActCodeAndCompany(
    actCode: string,
    companyCode: string
  ): Promise<ActivityKpi[]> {
    const repository = this.getActivityKpiRepository();
    return await repository.find({
      where: { actCode, companyCode },
    });
  }

  static async createActivityKpi(activityKpiData: {
    companyCode: string;
    prinCode: string;
    jobType: string;
    actCode: string;
    custCode?: string;
    expHours: number;
    userId?: string;
  }): Promise<ActivityKpi> {
    const repository = this.getActivityKpiRepository();

    const activityKpi = repository.create({
      ...activityKpiData,
      userDt: new Date(),
      userId: activityKpiData.userId || 'USER'
    });

    return await repository.save(activityKpi);
  }

  static async updateActivityKpi(
    companyCode: string,
    prinCode: string,
    jobType: string,
    actCode: string,
    updateData: Partial<ActivityKpi>
  ): Promise<boolean> {
    const repository = this.getActivityKpiRepository();

    const result = await repository.update(
      { companyCode, prinCode, jobType, actCode },
      updateData
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async updateOrRecreateActivityKpi(
    oldCompanyCode: string,
    oldPrinCode: string,
    oldJobType: string,
    oldActCode: string,
    newData: {
      companyCode: string;
      prinCode: string;
      jobType: string;
      actCode: string;
      custCode?: string;
      expHours: number;
      userId: string;
    }
  ): Promise<boolean> {
    const repository = this.getActivityKpiRepository();

    // Check if composite keys changed
    const keysChanged = 
      oldCompanyCode !== newData.companyCode ||
      oldPrinCode !== newData.prinCode ||
      oldJobType !== newData.jobType ||
      oldActCode !== newData.actCode;

    if (keysChanged) {
      // Delete old record and create new one
      await repository.delete({
        companyCode: oldCompanyCode,
        prinCode: oldPrinCode,
        jobType: oldJobType,
        actCode: oldActCode
      });

      await this.createActivityKpi(newData);
    } else {
      // Just update the existing record
      await repository.update(
        { companyCode: oldCompanyCode, prinCode: oldPrinCode, jobType: oldJobType, actCode: oldActCode },
        {
          custCode: newData.custCode,
          expHours: newData.expHours,
          userId: newData.userId,
          userDt: new Date()
        }
      );
    }

    return true;
  }

  static async deleteActivityKpis(filters: {
    companyCode?: string;
    prinCode?: string;
    jobType?: string;
    actCode?: string;
  }): Promise<boolean> {
    const repository = this.getActivityKpiRepository();

    const result = await repository.delete(filters);

    return result.affected ? result.affected > 0 : false;
  }

  static async checkActivityKpiExists(
    companyCode: string,
    prinCode: string,
    jobType: string,
    actCode: string
  ): Promise<boolean> {
    const repository = this.getActivityKpiRepository();
    const count = await repository.count({
      where: { companyCode, prinCode, jobType, actCode },
    });
    return count > 0;
  }

  static async getActivityKpis(
    filters: Partial<ActivityKpi>,
    page: number,
    limit: number
  ): Promise<{ data: ActivityKpi[]; total: number }> {
    const repository = this.getActivityKpiRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { companyCode: "ASC", prinCode: "ASC" },
    });

    return { data, total };
  }
}
