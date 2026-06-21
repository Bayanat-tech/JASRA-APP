import { getRepository } from "../../database/connection";
import { ActivityGroupMaster } from "../../entity/WMS/activitygroup.entity";

export class ActivityGroupService {
  private static getActivityGroupRepository() {
    return getRepository(ActivityGroupMaster);
  }

  // Check for duplicate activity group by code or name
  static async findDuplicate(params: {
    activity_group_code: string;
    act_group_name?: string;
  }): Promise<ActivityGroupMaster | null> {
    const repository = this.getActivityGroupRepository();
    return await repository.findOne({
      where: {
        activity_group_code: params.activity_group_code,
        act_group_name: params.act_group_name,
      },
    });
  }

  // Get all activity groups
  static async findAll(): Promise<ActivityGroupMaster[]> {
    const repository = this.getActivityGroupRepository();
    return await repository.find();
  }

  // Find activity group by code
  static async findByCode(activity_group_code: string): Promise<ActivityGroupMaster | null> {
    const repository = this.getActivityGroupRepository();
    return await repository.findOne({
      where: { activity_group_code },
    });
  }

  // Find activity groups by company
  static async findByCompany(company_code: string): Promise<ActivityGroupMaster[]> {
    const repository = this.getActivityGroupRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Create new activity group
  static async createActivityGroup(
    data: Partial<ActivityGroupMaster>
  ): Promise<ActivityGroupMaster> {
    const repository = this.getActivityGroupRepository();

    const activityGroup = repository.create({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await repository.save(activityGroup);
  }

  // Update existing activity group
  static async updateActivityGroup(
    activity_group_code: string,
    updateData: Partial<ActivityGroupMaster>
  ): Promise<boolean> {
    const repository = this.getActivityGroupRepository();

    const result = await repository.update(
      { activity_group_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete activity group
  static async deleteActivityGroup(activity_group_code: string): Promise<boolean> {
    const repository = this.getActivityGroupRepository();
    const result = await repository.delete({ activity_group_code });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if activity group exists
  static async checkActivityGroupExists(activity_group_code: string): Promise<boolean> {
    const repository = this.getActivityGroupRepository();
    const count = await repository.count({
      where: { activity_group_code },
    });
    return count > 0;
  }
}
