import { getRepository } from "../../database/connection";
import { CurrencyMaster } from "../../entity/WMS/currency.entity";
import { In } from "typeorm";

export class CurrencyService {
  private static getCurrencyMasterRepository() {
    return getRepository(CurrencyMaster);
  }

  static async findByNameAndCompany(
    curr_name: string,
    company_code: string
  ): Promise<CurrencyMaster | null> {
    const repository = this.getCurrencyMasterRepository();
    return await repository.findOne({
      where: { curr_name, company_code },
    });
  }

  static async findByCodeAndCompany(
    curr_code: string,
    company_code: string
  ): Promise<CurrencyMaster | null> {
    const repository = this.getCurrencyMasterRepository();
    return await repository.findOne({
      where: { curr_code, company_code },
    });
  }

  static async createCurrency(currencyData: {
    curr_name: string;
    curr_code: string;
    company_code: string;
    created_by: string;
    updated_by: string;
    ex_rate?: number;
    division?: string;
    subdivision?: number;
    curr_sign?: string;
  }): Promise<CurrencyMaster> {
    const repository = this.getCurrencyMasterRepository();
    
    const currency = repository.create({
      ...currencyData,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await repository.save(currency);
  }

  static async updateCurrency(
    curr_code: string,
    company_code: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getCurrencyMasterRepository();

    const result = await repository.update(
      { curr_code, company_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteCurrencies(curr_codes: string[]): Promise<boolean> {
    const repository = this.getCurrencyMasterRepository();

    const result = await repository.delete({
      curr_code: In(curr_codes),
    });

    return result.affected ? result.affected > 0 : false;
  }

  static async checkCurrencyExists(
    curr_code: string,
    company_code: string
  ): Promise<boolean> {
    const repository = this.getCurrencyMasterRepository();
    const count = await repository.count({
      where: { curr_code, company_code },
    });
    return count > 0;
  }

  static async getCurrencies(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: CurrencyMaster[]; total: number }> {
    const repository = this.getCurrencyMasterRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { curr_code: "DESC" },
    });

    return { data, total };
  }
    static async findAll(): Promise<CurrencyMaster[]> {
      const repository = this.getCurrencyMasterRepository();
      return await repository.find();
    }
  
}
