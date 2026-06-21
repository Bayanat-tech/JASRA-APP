import { Repository } from "typeorm";
import { FilesVHEntity } from "../../entities/filesVH.entity";
import { TypeORMService } from "../../database/connection";

export class JS_FilesVhService {
  private static instance: JS_FilesVhService;
  private repository: Repository<FilesVHEntity> | null = null;

  private constructor() {}

  static async getInstance(): Promise<JS_FilesVhService> {
    if (!JS_FilesVhService.instance) {
      JS_FilesVhService.instance = new JS_FilesVhService();
    }

    await JS_FilesVhService.instance.ensureRepository();
    return JS_FilesVhService.instance;
  }

  private async ensureRepository() {
    if (!this.repository) {
      try {
        await TypeORMService.initialize();
        this.repository = TypeORMService.getRepository(FilesVHEntity);
      } catch (error) {
        console.error("Failed to initialize repository:", error);
        throw error;
      }
    }
    return this.repository;
  }

  async findAll(conditions: any): Promise<FilesVHEntity[]> {
    const repo = await this.ensureRepository();

    try {
      const mappedConditions = {
        companyCode: conditions.company_code,
        requestNumber: conditions.request_number,
        modules: conditions.modules,
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

  async findOne(conditions: any): Promise<FilesVHEntity | null> {
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
