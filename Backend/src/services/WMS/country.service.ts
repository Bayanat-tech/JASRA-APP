import { getRepository } from "../../database/connection";
import { CountryMaster } from "../../entity/WMS/country.entity"

export class CountryService {
    private static getCountryRepository() {
        return getRepository(CountryMaster);
    }

 
  static async findDuplicate(params: {
    country_code: string;
    country_name: string;
  }): Promise<CountryMaster | null> {
    const repository = this.getCountryRepository();
    return await repository.findOne({
      where: {
        country_code: params.country_code,
        country_name: params.country_name,
      },
    });
  }


  static async findAll(): Promise<CountryMaster[]> {
    const repository = this.getCountryRepository();
    return await repository.find();
  }

  static async findByCode(country_code: string): Promise<CountryMaster | null> {
    const repository = this.getCountryRepository();
    return await repository.findOne({
      where: { country_code },
    });
  }

 
  static async createCountry(countryData: {
    country_code: string;
    country_name: string;
    country_GCC: string;
    company_code: string;
    short_desc: string;
    nationality: string;
    created_by: string;
    updated_by: string;
  }): Promise<CountryMaster> {
    const repository = this.getCountryRepository();

    // Debug: Log the table name being used
    // @ts-ignore
    console.log("Inserting into table:", repository.metadata.tableName);

    const country = repository.create({
      ...countryData,
      created_at: new Date(),
      updated_at: new Date(),
    });
    

    return await repository.save(country);
  }


  static async updateCountry(
    country_code: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getCountryRepository();

    const result = await repository.update(
      { country_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }


  static async deleteCountry(country_code: string): Promise<boolean> {
    const repository = this.getCountryRepository();
    const result = await repository.delete({ country_code });
    return result.affected ? result.affected > 0 : false;
  }


  static async checkCountryExists(country_code: string): Promise<boolean> {
    const repository = this.getCountryRepository();
    const count = await repository.count({
      where: { country_code },
    });
    return count > 0;
  }
}