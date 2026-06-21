import { Repository } from "typeorm";
import { TypeORMService } from "../database/connection";
import { FilesPFEntity } from "../entities/files_PF.entity";

export class FilesPFService {
  private static instance: FilesPFService;
  private repository: Repository<FilesPFEntity> | null = null;

  private constructor() {}

  static async getInstance(): Promise<FilesPFService> {
    if (!FilesPFService.instance) {
      FilesPFService.instance = new FilesPFService();
    }

    await FilesPFService.instance.ensureRepository();
    return FilesPFService.instance;
  }

  private async ensureRepository() {
    if (!this.repository) {
      try {
        await TypeORMService.initialize();
        this.repository = TypeORMService.getRepository(FilesPFEntity);
      } catch (error) {
        console.error("Failed to initialize repository:", error);
        throw error;
      }
    }
    return this.repository;
  }

  private mapConditionsToEntity(conditions: any): any {
    if (!conditions || typeof conditions !== "object") return {};
    const mapping: Record<string, string> = {
      request_number: "requestNumber",
      requestnumber: "requestNumber",
      request_no: "requestNumber",

      company_code: "companyCode",
      companycode: "companyCode",

      sr_no: "srNo",
      srno: "srNo",

      aws_file_locn: "awsFileLocn",
      awsfilelocn: "awsFileLocn",

      user_file_name: "userFileName",
      userfilename: "userFileName",

      modules: "modules",
    };

    const mapped: any = {};
    for (const key of Object.keys(conditions)) {
      const normalizedKey = key.toString().toLowerCase();
      const targetKey = mapping[normalizedKey] || key;
      mapped[targetKey] = (conditions as any)[key];
    }
    return mapped;
  }

  async findAll(conditions: any): Promise<FilesPFEntity[]> {
    const repo = await this.ensureRepository();

    try {
      // map incoming condition keys to entity property names
      const mappedConditions = this.mapConditionsToEntity(conditions);

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

  async findOne(conditions: any): Promise<FilesPFEntity | null> {
    const repo = await this.ensureRepository();
    const mapped = this.mapConditionsToEntity(conditions);
    return await repo.findOne({ where: mapped });
  }

  async update(conditions: any, updateData: any) {
    const repo = await this.ensureRepository();
    const mapped = this.mapConditionsToEntity(conditions);
    return await repo.update(mapped, updateData);
  }

  async delete(conditions: any) {
    const repo = await this.ensureRepository();
    const mapped = this.mapConditionsToEntity(conditions);
    return await repo.delete(mapped);
  }
}
