import { getRepository } from "../../database/connection";
import { Brand } from "../../entity/WMS/brand.entity";
import { In } from "typeorm";
import { AppDataSource, TypeORMService } from "../../../src/database/connection";
import oracledb from 'oracledb';

export class BrandService {
  private static getBrandRepository() {
    return getRepository(Brand);
  }

  static async findByNameAndCompany(
    brandName: string,
    companyCode: string
  ): Promise<Brand | null> {
    const repository = this.getBrandRepository();
    return await repository.findOne({
      where: { brandName, companyCode },
    });
  }



static async findByBrandCodeAndCompany(
  brandCode: string,
  companyCode: string,
  prinCode: string,
  groupCode: string
): Promise<Brand | null> {
  let queryRunner;

  const sql = `
    SELECT *
    FROM ms_prodgroup
    WHERE brand_code = :brandCode
      AND company_code = :companyCode
      AND prin_code = :prinCode
      AND group_code = :groupCode
  `;

  const params = [brandCode, companyCode, prinCode, groupCode];

  try {
    if (!AppDataSource.isInitialized) {
      await TypeORMService.initialize();
    }

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const results = await queryRunner.query(sql, params);

    await queryRunner.commitTransaction();

    // Return single record or null
    return results.length > 0 ? (results[0] as Brand) : null;
  } catch (error) {
    if (queryRunner) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (_) {}
    }
    console.error("Error fetching brand by code:", error);
    return null;
  } finally {
    if (queryRunner) {
      try {
        await queryRunner.release();
      } catch (_) {}
    }
  }
}


  static async createBrand(brandData: {
    companyCode: string;
    prinCode: string;
    groupCode: string;
    brandCode: string;
    brandName: string;
    prefSite?: string;
    prefLocFrom?: string;
    prefLocTo?: string;
    prefAisleFrom?: string;
    prefAisleTo?: string;
    prefColFrom?: number;
    prefColTo?: number;
    prefHtFrom?: number;
    prefHtTo?: number;
    createdBy: string;
    updatedBy: string;
  }): Promise<Brand> {
    const repository = this.getBrandRepository();

    // Create new brand instance
    const brand = repository.create({
      ...brandData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await repository.save(brand);
  }

  static async updateBrand(
    companyCode: string,
    prinCode: string,
    groupCode: string,
    brandCode: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getBrandRepository();

    // Check if primary keys (prinCode or groupCode) are being updated
    const isPrimaryKeyChange = 
      (updateData.prinCode && updateData.prinCode !== prinCode) ||
      (updateData.groupCode && updateData.groupCode !== groupCode);

    if (isPrimaryKeyChange) {
      // If primary keys are changing, we need to:
      // 1. Find the existing record
      // 2. Delete it
      // 3. Create a new record with updated values
      
      const existingBrand = await repository.findOne({
        where: { companyCode, prinCode, groupCode, brandCode },
      });

      if (!existingBrand) {
        return false;
      }

      // Delete the old record
      await repository.delete({ companyCode, prinCode, groupCode, brandCode });

      // Create new record with updated primary keys
      const newBrand = repository.create({
        ...existingBrand,
        ...updateData,
        prinCode: updateData.prinCode || prinCode,
        groupCode: updateData.groupCode || groupCode,
        updatedAt: new Date(),
      });

      await repository.save(newBrand);
      return true;
    } else {
      // Normal update if primary keys aren't changing
      const result = await repository.update(
        { companyCode, prinCode, groupCode, brandCode },
        {
          ...updateData,
          updatedAt: new Date(),
        }
      );

      return result.affected ? result.affected > 0 : false;
    }
  }

  static async deleteBrands(brandKeys: Array<{ 
    companyCode: string, 
    prinCode: string, 
    groupCode: string, 
    brandCode: string 
  }>): Promise<boolean> {
    const repository = this.getBrandRepository();
    
    // First, verify all brands exist
    const existingBrands = await repository.find({
      where: brandKeys.map(key => ({
        companyCode: key.companyCode,
        prinCode: key.prinCode,
        groupCode: key.groupCode,
        brandCode: key.brandCode,
      })),
    });

    if (existingBrands.length === 0) {
      return false;
    }

    // Delete each brand individually since TypeORM doesn't support composite key deletion with In operator
    let deleted = 0;
    for (const key of brandKeys) {
      const result = await repository.delete({
        companyCode: key.companyCode,
        prinCode: key.prinCode,
        groupCode: key.groupCode,
        brandCode: key.brandCode,
      });
      if (result.affected) {
        deleted += result.affected;
      }
    }
    
    return deleted > 0;
  }

  static async checkBrandExists(
    companyCode: string,
    prinCode: string,
    groupCode: string,
    brandCode: string
  ): Promise<boolean> {
    const repository = this.getBrandRepository();
    const count = await repository.count({
      where: { companyCode, prinCode, groupCode, brandCode },
    });
    return count > 0;
  }

  static async getBrands(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: Brand[]; total: number }> {
    const repository = this.getBrandRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { brandCode: "ASC" },
    });

    return { data, total };
  }
}
