import { getRepository } from "../../database/connection";
import { Harmonize } from "../../entity/WMS/harmonize.entity";
import { In } from "typeorm";

export class HarmonizeService {
  private static getHarmonizeRepository() {
    return getRepository(Harmonize);
  }

  static async findByDescriptionAndCompany(
    harmDesc: string,
    companyCode: string
  ): Promise<Harmonize | null> {
    const repository = this.getHarmonizeRepository();
    return await repository.findOne({
      where: { harmDesc, companyCode },
    });
  }

  static async findByHarmCodeAndCompany(
    harmCode: string,
    companyCode: string
  ): Promise<Harmonize | null> {
    const repository = this.getHarmonizeRepository();
    return await repository.findOne({
      where: { harmCode, companyCode },
    });
  }

  static async createHarmonize(harmonizeData: {
    harmDesc: string;
    companyCode: string;
    createdBy?: string;
    updatedBy?: string;
    shortDesc?: string;
    uom?: string;
    permitReqd?: string;
    unit?: string;
  }): Promise<Harmonize> {
    const repository = this.getHarmonizeRepository();

    // Generate harmCode (customize logic if needed)
    const maxHarmCode = await repository
      .createQueryBuilder("harmonize")
      .select("MAX(harmonize.harmCode)", "max")
      .getRawOne();

    let nextHarmCode = "H0001";
    if (maxHarmCode?.max) {
      const currentMax = parseInt(maxHarmCode.max.replace("H", ""));
      nextHarmCode = `H${(currentMax + 1).toString().padStart(4, "0")}`;
    }

    const harmonize = repository.create({
      ...harmonizeData,
      harmCode: nextHarmCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await repository.save(harmonize);
  }

  static async updateHarmonize(
    harmCode: string,
    companyCode: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getHarmonizeRepository();

    const result = await repository.update(
      { harmCode, companyCode },
      {
        ...updateData,
        updatedAt: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteHarmonizeCodes(harmCodes: string[]): Promise<boolean> {
    const repository = this.getHarmonizeRepository();

    const result = await repository.delete({
      harmCode: In(harmCodes),
    });

    return result.affected ? result.affected > 0 : false;
  }

  static async checkHarmonizeExists(
    harmCode: string,
    companyCode: string
  ): Promise<boolean> {
    const repository = this.getHarmonizeRepository();
    const count = await repository.count({
      where: { harmCode, companyCode },
    });
    return count > 0;
  }

  static async getHarmonizeCodes(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: Harmonize[]; total: number }> {
    const repository = this.getHarmonizeRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { harmCode: "ASC" },
    });

    return { data, total };
  }
}
