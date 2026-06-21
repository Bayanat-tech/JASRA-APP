import { getRepository } from "../../database/connection";
import { ActivityUOC } from "../../entity/WMS/moc2.entity";
import { In } from "typeorm";

export class ActivityUOCService {
  public static getActivityUOCRepository() {
    return getRepository(ActivityUOC);
  }

  static async findByDescriptionAndCompany(
    description: string,
    company_code: string
  ): Promise<ActivityUOC | null> {
    const repository = this.getActivityUOCRepository();
    return await repository.findOne({
      where: { description, company_code },
    });
  }

  static async findByCompositeKey(
    company_code: string,
    charge_code: string,
    charge_type: string,
    activity_group_code: string
  ): Promise<ActivityUOC | null> {
    const repository = this.getActivityUOCRepository();
    return await repository.findOne({
      where: {
        company_code,
        charge_code,
        charge_type,
        activity_group_code,
      },
    });
  }

  static async createActivityUOC(activityData: {
    company_code: string;
    charge_code: string;
    charge_type: string;
    activity_group_code: string;
    description?: string;
    created_by?: string;
    updated_by?: string;
  }): Promise<ActivityUOC> {
    const repository = this.getActivityUOCRepository();
    
    const activity = repository.create({
      ...activityData,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const saved = await repository.save(activity);
    console.log('Saved activity result:', saved);

    // Fetch the complete saved record to ensure all fields are populated
    const savedActivity = await repository.findOne({
      where: {
        company_code: activityData.company_code,
        charge_code: activityData.charge_code,
        charge_type: activityData.charge_type,
        activity_group_code: activityData.activity_group_code,
      },
    });

    console.log('Fetched saved activity:', savedActivity);

    if (!savedActivity) {
      throw new Error('Failed to retrieve created record');
    }

    return savedActivity;
  }

  static async updateActivityUOC(
    company_code: string,
    charge_code: string,
    charge_type: string,
    activity_group_code: string,
    updateData: Partial<ActivityUOC>
  ): Promise<{
    success: boolean;
    old_description: string | null;
    old_activity_group_code: string | null;
    updated_description: string | null;
    updated_activity_group_code: string | null;
  }> {
    const repository = this.getActivityUOCRepository();

    // Fetch existing record
    const existing = await repository.findOne({
      where: {
        company_code,
        charge_code,
        charge_type,
        activity_group_code,
      },
    });

    // Prepare default nulls
    const result = {
      success: false,
      old_description: null,
      old_activity_group_code: null,
      updated_description: null,
      updated_activity_group_code: null,
    };

    if (!existing) {
      // If not found, return update payload as updated_* (if provided) to help comparison
      if (updateData) {
        if ((updateData as any).description !== undefined) result.updated_description = (updateData as any).description;
        if ((updateData as any).activity_group_code !== undefined) result.updated_activity_group_code = (updateData as any).activity_group_code;
      }
      return result;
    }

    // Populate old_* from existing record
    result.old_description = (existing as any).description ?? null;
    result.old_activity_group_code = (existing as any).activity_group_code ?? null;

    // Populate updated_* only if provided in updateData (and set to null if explicitly provided as null)
    if ((updateData as any).description !== undefined) {
      result.updated_description = (updateData as any).description ?? null;
    }
    if ((updateData as any).activity_group_code !== undefined) {
      result.updated_activity_group_code = (updateData as any).activity_group_code ?? null;
    }

    // Apply update
    const dbResult = await repository.update(
      {
        company_code,
        charge_code,
        charge_type,
        activity_group_code,
      },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    result.success = dbResult.affected ? dbResult.affected > 0 : false;
    return result;
  }

  static async deleteActivityUOCs(
    conditions: Array<{
      company_code: string;
      charge_code: string;
      charge_type: string;
      activity_group_code: string;
    }>
  ): Promise<boolean> {
    const repository = this.getActivityUOCRepository();
    
    if (conditions.length === 0) {
      return false;
    }

    let deleteResult = { affected: 0 };
    
    // Delete each record individually since we have a composite primary key
    for (const condition of conditions) {
      const result = await repository.delete(condition);
      if (result.affected) {
        deleteResult.affected += result.affected;
      }
    }

    return deleteResult.affected > 0;
  }

  static async checkActivityUOCExists(
    company_code: string,
    charge_code: string,
    charge_type: string,
    activity_group_code: string
  ): Promise<boolean> {
    const repository = this.getActivityUOCRepository();
    // Only check for composite key existence
    const count = await repository.count({
      where: {
        company_code,
        charge_code,
        charge_type,
        activity_group_code,
      },
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
      order: {
        company_code: "ASC",
        charge_code: "ASC",
        charge_type: "ASC",
        activity_group_code: "ASC",
      },
    });

    return { data, total };
  }
}
 