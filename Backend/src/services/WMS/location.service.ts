import { getRepository } from "../../database/connection";
import { LocationMaster } from "../../entity/WMS/location.entity";

export class LocationService {
  private static getLocationRepository() {
    return getRepository(LocationMaster);
  }

  // Check for duplicate location by code
  static async findDuplicate(params: {
    location_code: string;
    site_code?: string;
  }): Promise<LocationMaster | null> {
    const repository = this.getLocationRepository();
    return await repository.findOne({
      where: {
        location_code: params.location_code,
        site_code: params.site_code,
      },
    });
  }

  // Get all locations
  static async findAll(): Promise<LocationMaster[]> {
    const repository = this.getLocationRepository();
    return await repository.find();
  }

  // Find location by code
  static async findByCode(location_code: string): Promise<LocationMaster | null> {
    const repository = this.getLocationRepository();
    return await repository.findOne({
      where: { location_code },
    });
  }

  // Find locations by company or site
  static async findByCompanyOrSite(
    company_code: string,
    site_code?: string
  ): Promise<LocationMaster[]> {
    const repository = this.getLocationRepository();
    const query: any = { company_code };
    if (site_code) {
      query.site_code = site_code;
    }
    return await repository.find({ where: query });
  }

  // Create new location
  static async createLocation(locationData: Partial<LocationMaster>): Promise<LocationMaster> {
    const repository = this.getLocationRepository();

    const location = repository.create({
      ...locationData,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await repository.save(location);
  }

  // Update existing location
  static async updateLocation(
    location_code: string,
    updateData: Partial<LocationMaster>
  ): Promise<boolean> {
    const repository = this.getLocationRepository();

    const result = await repository.update(
      { location_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete location
  static async deleteLocation(location_code: string): Promise<boolean> {
    const repository = this.getLocationRepository();
    const result = await repository.delete({ location_code });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if location exists
  static async checkLocationExists(location_code: string): Promise<boolean> {
    const repository = this.getLocationRepository();
    const count = await repository.count({
      where: { location_code },
    });
    return count > 0;
  }
}
