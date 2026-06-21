import { getRepository } from "../../database/connection";
import { LineMaster } from "../../entity/WMS/line.entity";
import { In } from "typeorm";

export class LineService {
  private static getLineMasterRepository() {
    return getRepository(LineMaster);
  }

  static async findByNameAndCompany(
    line_name: string,
    company_code: string
  ): Promise<LineMaster | null> {
    const repository = this.getLineMasterRepository();
    return await repository.findOne({
      where: { line_name, company_code },
    });
  }

  static async findByLineCodeAndCompany(
    line_code: string,
    company_code: string
  ): Promise<LineMaster | null> {
    const repository = this.getLineMasterRepository();
    return await repository.findOne({
      where: { line_code, company_code },
    });
  }

  static async createLine(lineData: {
    line_name: string;
    company_code: string;
    created_by: string;
    updated_by: string;
  }): Promise<LineMaster> {
    const repository = this.getLineMasterRepository();

    // Generate line_code
    const maxLineCode = await repository
      .createQueryBuilder("lineMaster")
      .select("MAX(lineMaster.line_code)", "max")
      .getRawOne();

    let nextLineCode = "L0001";
    if (maxLineCode?.max) {
      const currentMax = parseInt(maxLineCode.max.replace("L", ""));
      nextLineCode = `L${(currentMax + 1).toString().padStart(4, "0")}`;
    }

    const line = repository.create({
      ...lineData,
      line_code: nextLineCode,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await repository.save(line);
  }

  static async updateLine(
    line_code: string,
    company_code: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getLineMasterRepository();

    const result = await repository.update(
      { line_code, company_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteLines(line_codes: string[]): Promise<boolean> {
    const repository = this.getLineMasterRepository();

    const result = await repository.delete({
      line_code: In(line_codes),
    });

    return result.affected ? result.affected > 0 : false;
  }

  static async checkLineExists(
    line_code: string,
    company_code: string
  ): Promise<boolean> {
    const repository = this.getLineMasterRepository();
    const count = await repository.count({
      where: { line_code, company_code },
    });
    return count > 0;
  }

  static async getLines(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: LineMaster[]; total: number }> {
    const repository = this.getLineMasterRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { line_code: "ASC" },
    });

    return { data, total };
  }
}
