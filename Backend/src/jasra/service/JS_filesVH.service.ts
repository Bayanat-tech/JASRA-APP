import { Repository } from "typeorm";
import { JSUploadfilesdltslms } from "../entities/JS_Uploaded_files_dlts.entity";
import { TypeORMService } from "../../database/connection";

export class JS_Uploadfilesdltslms {
  private static instance: JS_Uploadfilesdltslms;
  private repository: Repository<JSUploadfilesdltslms> | null = null;

  private constructor() {}

  static async getInstance(): Promise<JS_Uploadfilesdltslms> {
    if (!JS_Uploadfilesdltslms.instance) {
      JS_Uploadfilesdltslms.instance = new JS_Uploadfilesdltslms();
    }

    await JS_Uploadfilesdltslms.instance.ensureRepository();
    return JS_Uploadfilesdltslms.instance;
  }

  private async ensureRepository() {
    if (!this.repository) {
      try {
        await TypeORMService.initialize();
        this.repository = TypeORMService.getRepository(JSUploadfilesdltslms);
      } catch (error) {
        console.error("Failed to initialize repository:", error);
        throw error;
      }
    }
    return this.repository;
  }

  async findAll(conditions: any): Promise<JSUploadfilesdltslms[]> {
    const repo = await this.ensureRepository();

    try {
      const mappedConditions = {
        REQUEST_NUMBER: conditions.request_number,
      };

      console.log("Finding files with conditions:", mappedConditions);

      const results = await repo.find({
        where: mappedConditions,
        order: { SR_NO: "DESC" },
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

  async findOne(conditions: any): Promise<JSUploadfilesdltslms | null> {
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
