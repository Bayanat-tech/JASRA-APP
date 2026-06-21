import { getRepository } from "../../database/connection";
import { ProductGroup } from "../../entity/WMS/group.entity";
import { In } from "typeorm";

export class GroupService {
  private static getProductGroupRepository() {
    return getRepository(ProductGroup);
  }

  static async findByGroupCodeAndCompany(
    groupCode: string,
    prinCode: string,
    companyCode: string
  ): Promise<ProductGroup | null> {
    const repository = this.getProductGroupRepository();
    return await repository.findOne({
      where: { groupCode, prinCode, companyCode },
    });
  }

  static async findByGroupNameAndCompany(
    groupName: string,
    companyCode: string
  ): Promise<ProductGroup | null> {
    const repository = this.getProductGroupRepository();
    return await repository.findOne({
      where: { groupName, companyCode },
    });
  }

  static async createGroup(groupData: {
    companyCode: string;
    prinCode: string;
    groupName: string;
    prefSite?: string;
    prefLocFrom?: string;
    prefLocTo?: string;
    prefAisleFrom?: string;
    prefAisleTo?: string;
    prefColFrom?: number;
    prefColTo?: number;
    prefHtFrom?: number;
    prefHtTo?: number;
    expiryConsDays?: number;
    createdBy?: string;
    updatedBy?: string;
  }): Promise<ProductGroup> {
    const repository = this.getProductGroupRepository();

    const group = repository.create({
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await repository.save(group);
  }

  static async updateGroup(
    groupCode: string,
    prinCode: string,
    companyCode: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getProductGroupRepository();

    const result = await repository.update(
      { groupCode, prinCode, companyCode },
      {
        ...updateData,
        updatedAt: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteGroups(
    groupCodes: string[],
    prinCode: string,
    companyCode: string
  ): Promise<boolean> {
    const repository = this.getProductGroupRepository();

    const result = await repository.delete({
      groupCode: In(groupCodes),
      prinCode,
      companyCode,
    });

    return result.affected ? result.affected > 0 : false;
  }

  static async checkGroupExists(
    groupCode: string,
    prinCode: string,
    companyCode: string
  ): Promise<boolean> {
    const repository = this.getProductGroupRepository();
    const count = await repository.count({
      where: { groupCode, prinCode, companyCode },
    });
    return count > 0;
  }

  static async getGroups(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: ProductGroup[]; total: number }> {
    const repository = this.getProductGroupRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { groupCode: "ASC" },
    });

    return { data, total };
  }
}
 