import { getRepository } from "../../database/connection";
import { Division } from "../../entity/WMS/division.entity";

export class DivisionService {
  private static getDivisionRepository() {
    return getRepository(Division);
  }

  static async findByCompanyAndDivisionCode(
    companyCode: string,
    divCode: string
  ): Promise<Division | null> {
    const repository = this.getDivisionRepository();
    return await repository.findOne({
      where: { companyCode, divCode },
    });
  }

  static async createDivision(divisionData: Partial<Division>): Promise<Division> {
    const repository = this.getDivisionRepository();
    
    const division = repository.create({
      ...divisionData,
      userDate: new Date(),
    });

    return await repository.save(division);
  }

  static async updateDivision(
    companyCode: string,
    divCode: string,
    updateData: Partial<Division>
  ): Promise<boolean> {
    const repository = this.getDivisionRepository();

    const result = await repository.update(
      { companyCode, divCode },
      {
        ...updateData,
        userDate: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteDivisions(
    divisionKeys: Array<{ companyCode: string; divCode: string }>
  ): Promise<boolean> {
    const repository = this.getDivisionRepository();
    
    let affected = 0;
    
    for (const key of divisionKeys) {
      const result = await repository.delete({
        companyCode: key.companyCode,
        divCode: key.divCode,
      });
      
      if (result.affected) {
        affected += result.affected;
      }
    }

    return affected > 0;
  }

  static async checkDivisionExists(
    companyCode: string,
    divCode: string
  ): Promise<boolean> {
    const repository = this.getDivisionRepository();
    const count = await repository.count({
      where: { companyCode, divCode },
    });
    return count > 0;
  }

  static async getDivisions(
    filters: Partial<Division>,
    page: number,
    limit: number
  ): Promise<{ data: Division[]; total: number }> {
    const repository = this.getDivisionRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { divName: "ASC" },
    });

    return { data, total };
  }
}
   