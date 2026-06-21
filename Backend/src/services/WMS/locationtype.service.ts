import { getRepository } from "../../database/connection";
import { LocationType } from "../../entity/WMS/locationtype.entity";
import { In } from "typeorm";

export class LocationTypeService {
  private static getLocationTypeRepository() {
    return getRepository(LocationType);
  }

  static async findByLocTypeAndCompany(
    locType: string,
    companyCode: string
  ): Promise<LocationType | null> {
    const repository = this.getLocationTypeRepository();
    return await repository.findOne({
      where: { locType, companyCode },
    });
  }

  static async findByLocNameAndCompany(
    locName: string,
    companyCode: string
  ): Promise<LocationType | null> {
    const repository = this.getLocationTypeRepository();
    return await repository.findOne({
      where: { locName, companyCode },
    });
  }

  static async createLocationType(locationTypeData: {
    locName: string;
    locType: string;
    companyCode: string;
    userId: string;
    locCbm?: number;
    locWt?: number;
    pushLevel?: string;
  }): Promise<LocationType> {
    const repository = this.getLocationTypeRepository();

    // Generate locType (customize logic if needed)
    const maxLocType = await repository
      .createQueryBuilder("locationType")
      .select("MAX(locationType.locType)", "max")
      .getRawOne();

    let nextLocType = "L01";
    if (maxLocType?.max) {
      const currentMax = parseInt(maxLocType.max.replace("L", ""));
      nextLocType = `L${(currentMax + 1).toString().padStart(2, "0")}`;
    }

    const locationType = repository.create({
      ...locationTypeData,
      locType: nextLocType,
      userDt: new Date(),
    });

    return await repository.save(locationType);
  }

  static async updateLocationType(
    locType: string,
    companyCode: string,
    updateData: Partial<LocationType>
  ): Promise<boolean> {
    const repository = this.getLocationTypeRepository();

    // Debug: Log what we're trying to update
    console.log("Updating location type:", { locType, companyCode, updateData });

    const result = await repository.update(
      { locType, companyCode },
      {
        ...updateData,
        userDt: new Date(),
      }
    );

    console.log("Update result:", result);

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteLocationTypes(locTypes: string[]): Promise<boolean> {
    const repository = this.getLocationTypeRepository();

    const result = await repository.delete({
      locType: In(locTypes),
    });

    return result.affected ? result.affected > 0 : false;
  }

  static async checkLocationTypeExists(
    locType: string,
    companyCode: string
  ): Promise<boolean> {
    const repository = this.getLocationTypeRepository();
    const count = await repository.count({
      where: { locType, companyCode },
    });
    return count > 0;
  }

  static async getLocationTypes(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: LocationType[]; total: number }> {
    const repository = this.getLocationTypeRepository();

    // Debug: Log incoming filters
    console.log("LocationTypeService.getLocationTypes incoming filters:", filters);

    // Use filters directly, only add where if filters exist
    const queryOptions: any = {
      order: { locType: "ASC" },
    };
    if (filters && Object.keys(filters).length > 0) {
      queryOptions.where = filters;
    }
    // Only set pagination if limit > 0
    if (limit && limit > 0) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    // Debug: Log query options
    console.log("LocationTypeService.getLocationTypes queryOptions:", queryOptions);

    const [data, total] = await repository.findAndCount(queryOptions);

    // Debug: Log result count and data
    console.log("LocationTypeService.getLocationTypes result count:", data.length, total);
    console.log("LocationTypeService.getLocationTypes result data:", data);

    return { data, total };
  }
}
