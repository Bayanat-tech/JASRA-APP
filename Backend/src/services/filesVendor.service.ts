import { Repository } from "typeorm";
import { FilesVendorEntity } from "../entities/files_Vendor.entity";
import { TypeORMService } from "../database/connection";

export class FilesVendorService {
  private static instance: FilesVendorService;
  private repository: Repository<FilesVendorEntity> | null = null;

  private constructor() {}

  static async getInstance(): Promise<FilesVendorService> {
    if (!FilesVendorService.instance) {
      FilesVendorService.instance = new FilesVendorService();
    }

    await FilesVendorService.instance.ensureRepository();
    return FilesVendorService.instance;
  }

  private async ensureRepository() {
    if (!this.repository) {
      try {
        await TypeORMService.initialize();
        this.repository = TypeORMService.getRepository(FilesVendorEntity);
      } catch (error) {
        console.error("Failed to initialize repository:", error);
        throw error;
      }
    }
    return this.repository;
  }

  async findAll(conditions: any): Promise<FilesVendorEntity[]> {
    const repo = await this.ensureRepository();

    try {
      const mappedConditions = {
        companyCode: conditions.company_code,
        requestNumber: conditions.request_number,
        srNo: conditions.sr_no,
      };

      console.log("Finding files with conditions:", mappedConditions);

      const results = await repo.find({
        where: mappedConditions,
        order: { srNo: "DESC" },
      });

      if (results.length === 0) {
        console.log("No records found for the given conditions");
        return [];
      }

      return results;
    } catch (error) {
      console.error("Error in findAll:", error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch files: ${message}`);
    }
  }

  async findOne(conditions: any): Promise<FilesVendorEntity | null> {
    const repo = await this.ensureRepository();
    return await repo.findOne({ where: conditions });
  }

  async update(conditions: any, updateData: any) {
    const repo = await this.ensureRepository();
    return await repo.update(conditions, updateData);
  }

  async delete(conditions: any) {
    const repo = await this.ensureRepository();
    return await repo.delete(conditions);
  }
}
