import { getRepository } from "../../database/connection";
import { Vessel } from "../../entity/WMS/vessel.entity";

export class VesselService {
  private static getVesselRepository() {
    return getRepository(Vessel);
  }

  static async findByVesselCodeAndCompany(
    vesselCode: string,
    companyCode: string
  ): Promise<Vessel | null> {
    const repository = this.getVesselRepository();
    return await repository.findOne({
      where: { vesselCode, companyCode },
    });
  }

  static async createVessel(vesselData: {
    companyCode: string;
    vesselCode: string;
    vesselName?: string;
    lineCode?: string;
    contactPerson?: string;
    address?: string;
    telNo?: string;
    faxNo?: string;
    email?: string;
    createdBy?: string;
    updatedBy?: string;
  }): Promise<Vessel> {
    const repository = this.getVesselRepository();

    const vessel = repository.create({
      ...vesselData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await repository.save(vessel);
  }

  static async updateVessel(
    vesselCode: string,
    companyCode: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getVesselRepository();

    const result = await repository.update(
      { vesselCode, companyCode },
      {
        ...updateData,
        updatedAt: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteVessels(
    vesselKeys: Array<{ vesselCode: string; companyCode: string }>
  ): Promise<boolean> {
    const repository = this.getVesselRepository();

    let affected = 0;

    for (const key of vesselKeys) {
      const result = await repository.delete({
        vesselCode: key.vesselCode,
        companyCode: key.companyCode
      });

      if (result.affected) {
        affected += result.affected;
      }
    }

    return affected > 0;
  }

  static async checkVesselExists(
    vesselCode: string,
    companyCode: string
  ): Promise<boolean> {
    const repository = this.getVesselRepository();
    const count = await repository.count({
      where: { vesselCode, companyCode },
    });
    return count > 0;
  }

  static async getVessels(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: Vessel[]; total: number }> {
    const repository = this.getVesselRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { vesselName: "ASC" },
    });

    return { data, total };
  }
}

