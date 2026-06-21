import { getRepository } from "../../database/connection";
import { Manufacturer } from "../../entity/WMS/manufacturer.entity";
import { In } from "typeorm";

export class ManufacturerService {
  private static getManufacturerRepository() {
    return getRepository(Manufacturer);
  }

  static async findByNameAndCompany(
    manuName: string,
    companyCode: string
  ): Promise<Manufacturer | null> {
    const repository = this.getManufacturerRepository();
    return await repository.findOne({
      where: { manuName, companyCode },
    });
  }

  static async createManufacturer(manufacturerData: {
    prinCode: string;
    manuCode: string;
    manuName: string;
    companyCode: string;
    createdBy: string;
    updatedBy: string;
    countryCode?: string;
    manuAddr1?: string;
    manuAddr2?: string;
    manuAddr3?: string;
    manuAddr4?: string;
    manuCity?: string;
    manuContact?: string;
    manuTelno1?: string;
    manuFaxno1?: string;
    manuEmail1?: string;
  }): Promise<Manufacturer> {
    const repository = this.getManufacturerRepository();

    const manufacturer = repository.create({
      ...manufacturerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await repository.save(manufacturer);
  }

  static async updateManufacturer(
    prinCode: string,
    manuCode: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getManufacturerRepository();

    const result = await repository.update(
      { prinCode, manuCode },
      {
        ...updateData,
        updatedAt: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteManufacturers(manufacturerKeys: Array<{prinCode: string, manuCode: string}>): Promise<boolean> {
    const repository = this.getManufacturerRepository();
    
    const result = await repository.delete(manufacturerKeys);

    return result.affected ? result.affected > 0 : false;
  }

  static async checkManufacturerExists(
    prinCode: string,
    manuCode: string
  ): Promise<boolean> {
    const repository = this.getManufacturerRepository();
    
    const manufacturer = await repository.findOne({
      where: { prinCode, manuCode },
    });
    
    return !!manufacturer;
  }

  static async getManufacturers(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: Manufacturer[]; total: number }> {
    const repository = this.getManufacturerRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { 
        prinCode: "ASC",
        manuCode: "ASC" 
      },
    });

    return { data, total };
  }
}
 