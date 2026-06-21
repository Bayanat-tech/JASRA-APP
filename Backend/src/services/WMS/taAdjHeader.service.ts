import { getRepository } from "../../database/connection";
import { TaAdjHeader } from "../../entity/WMS/taAdjHeader.entity";

export class TaAdjHeaderService {
  private static getRepository() {
    return getRepository(TaAdjHeader);
  }

  static async findAll(): Promise<TaAdjHeader[]> {
    const repository = this.getRepository();
    return await repository.find();
  }

  static async findByAdjCode(ADJ_CODE: string, COMPANY_CODE: string): Promise<TaAdjHeader | null> {
    const repository = this.getRepository();
    return await repository.findOne({
      where: { ADJ_CODE, COMPANY_CODE },
    });
  }

  static async findByCompany(COMPANY_CODE: string): Promise<TaAdjHeader[]> {
    const repository = this.getRepository();
    return await repository.find({
      where: { COMPANY_CODE },
    });
  }

  static async createHeader(headerData: {
    ADJ_CODE: string;
    PRIN_CODE?: string;
    REMARKS?: string;
    CONFIRMED?: string;
    ADJ_DATE?: Date;
    CONFIRMED_DATE?: Date;
    COMPANY_CODE: string;
    CREATED_BY?: string;
    UPDATED_BY?: string;
  }): Promise<TaAdjHeader> {
    const repository = this.getRepository();

    // Generate ADJ_NO manually since trigger isn't working
    const ADJ_NO = await this.getNextAdjNo();

    const header = repository.create({
      ...headerData,
      ADJ_NO,
    });

    return await repository.save(header);
  }

  static async updateHeader(
    ADJ_CODE: string,
    COMPANY_CODE: string,
    updateData: Partial<TaAdjHeader>
  ): Promise<boolean> {
    const repository = this.getRepository();

    const result = await repository.update(
      { ADJ_CODE, COMPANY_CODE },
      updateData
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteHeader(ADJ_CODE: string, COMPANY_CODE: string): Promise<boolean> {
    const repository = this.getRepository();
    const result = await repository.delete({ ADJ_CODE, COMPANY_CODE });
    return result.affected ? result.affected > 0 : false;
  }

  static async checkExists(ADJ_CODE: string, COMPANY_CODE: string): Promise<boolean> {
    const repository = this.getRepository();
    const count = await repository.count({
      where: { ADJ_CODE, COMPANY_CODE },
    });
    return count > 0;
  }

  static async getNextAdjNo(): Promise<number> {
    const repository = this.getRepository();
    
    // Get the maximum ADJ_NO and increment by 1
    const result = await repository
      .createQueryBuilder("header")
      .select("MAX(header.ADJ_NO)", "maxAdjNo")
      .getRawOne();
    
    const maxAdjNo = result?.maxAdjNo || 0;
    const nextAdjNo = maxAdjNo + 1;
    
    // Ensure the value is an integer and within acceptable range
    return Math.floor(nextAdjNo);
  }
}
