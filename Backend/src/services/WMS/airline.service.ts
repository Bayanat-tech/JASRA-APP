import { getRepository } from "../../database/connection";
import { Airline } from "../../entity/WMS/airline.entity";

export class AirlineService {
  private static getAirlineRepository() {
    return getRepository(Airline);
  }

  static async findByCompanyAndAirlineCode(
    companyCode: string,
    airlineCode: string
  ): Promise<Airline | null> {
    const repository = this.getAirlineRepository();
    return await repository.findOne({
      where: { companyCode, airlineCode },
    });
  }

  static async createAirline(airlineData: Partial<Airline>): Promise<Airline> {
    const repository = this.getAirlineRepository();
    
    const airline = repository.create({
      ...airlineData,
      // userDate: new Date(),
    });

    return await repository.save(airline);
  }

  static async updateAirline(
    companyCode: string,
    airlineCode: string,
    updateData: Partial<Airline>
  ): Promise<boolean> {
    const repository = this.getAirlineRepository();

    const result = await repository.update(
      { companyCode, airlineCode },
      updateData
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteAirlines(
    airlineKeys: Array<{ companyCode: string; airlineCode: string }>
  ): Promise<boolean> {
    const repository = this.getAirlineRepository();
    
    let affected = 0;
    
    for (const key of airlineKeys) {
      const result = await repository.delete({
        companyCode: key.companyCode,
        airlineCode: key.airlineCode,
      });
      
      if (result.affected) {
        affected += result.affected;
      }
    }

    return affected > 0;
  }

  static async checkAirlineExists(
    companyCode: string,
    airlineCode: string
  ): Promise<boolean> {
    const repository = this.getAirlineRepository();
    const count = await repository.count({
      where: { companyCode, airlineCode },
    });
    return count > 0;
  }

  static async getAirlines(
    filters: Partial<Airline>,
    page: number,
    limit: number
  ): Promise<{ data: Airline[]; total: number }> {
    const repository = this.getAirlineRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { airlineName: "ASC" },
    });

    return { data, total };
  }
}
