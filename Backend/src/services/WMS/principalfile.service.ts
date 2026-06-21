import { getRepository } from "../../database/connection";
import { UploadedFilesDlts } from "../../entity/WMS/principalfile.entity";

export class UploadedFilesDltsService {
  private static getRepository() {
    return getRepository(UploadedFilesDlts);
  }

  // Check for duplicate based on company_code, request_number, and file_name
  static async findDuplicate(params: {
    company_code: string;
    request_number: string;
    file_name: string;
  }): Promise<UploadedFilesDlts | null> {
    const repository = this.getRepository();
    return await repository.findOne({
      where: {
        company_code: params.company_code,
        request_number: params.request_number,
        file_name: params.file_name,
      },
    });
  }

  // Fetch all records
  static async findAll(): Promise<UploadedFilesDlts[]> {
    const repository = this.getRepository();
    return await repository.find();
  }

  // Fetch by primary key (sr_no)
  static async findById(sr_no: number): Promise<UploadedFilesDlts | null> {
    const repository = this.getRepository();
    return await repository.findOne({
      where: { sr_no },
    });
  }

  // Create a new record
  static async createFile(data: {
    company_code: string;
    request_number: string;
    file_name: string;
    org_file_name: string;
    aws_file_locn: string;
    flow_level?: number;
    modules?: string;
    updated_by?: string;
    created_by: string;
    extensions?: string;
    user_file_name?: string;
    type?: string;
  }): Promise<UploadedFilesDlts> {
    const repository = this.getRepository();
    const record = repository.create({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await repository.save(record);
  }

  // Update a record
  static async updateFile(sr_no: number, updateData: Partial<UploadedFilesDlts>): Promise<boolean> {
    const repository = this.getRepository();
    const result = await repository.update(
      { sr_no },
      { ...updateData, updated_at: new Date() }
    );
    return result.affected ? result.affected > 0 : false;
  }

  // Delete a record
  static async deleteFile(sr_no: number): Promise<boolean> {
    const repository = this.getRepository();
    const result = await repository.delete({ sr_no });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if record exists
  static async checkExists(sr_no: number): Promise<boolean> {
    const repository = this.getRepository();
    const count = await repository.count({ where: { sr_no } });
    return count > 0;
  }
}
