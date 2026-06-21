import { getRepository } from "../../database/connection";
import { PrincipalContactDetl } from "../../entity/WMS/principalcontactdetl.entity";

export class PrincipalContactDetlService {
  private static getRepository() {
    return getRepository(PrincipalContactDetl);
  }

  // Check for duplicate by primary keys
  static async findDuplicate(params: {
    prin_code: string;
    company_code: string;
  }): Promise<PrincipalContactDetl | null> {
    const repository = this.getRepository();
    return await repository.findOne({
      where: {
        prin_code: params.prin_code,
        company_code: params.company_code,
      },
    });
  }

  // Fetch all records
  static async findAll(): Promise<PrincipalContactDetl[]> {
    const repository = this.getRepository();
    return await repository.find();
  }

  // Fetch by primary keys
  static async findByCode(
    prin_code: string,
    company_code: string
  ): Promise<PrincipalContactDetl | null> {
    const repository = await this.getRepository();
    return await repository.findOne({
      where: { prin_code, company_code },
    });
  }

  // Create a new record
  static async createPrincipalContact(data: {
    prin_code: string;
    company_code: string;
    prin_cont1?: string;
    prin_cont2?: string;
    prin_cont3?: string;
    prin_cont_telno1?: string;
    prin_cont_telno2?: string;
    prin_cont_telno3?: string;
    prin_cont_email1?: string;
    prin_cont_email2?: string;
    prin_cont_email3?: string;
    prin_cont_faxno1?: string;
    prin_cont_faxno2?: string;
    prin_cont_faxno3?: string;
    prin_cont_ref1?: string;
    created_by: string;
    updated_by: string;
  }): Promise<PrincipalContactDetl> {
    const repository = this.getRepository();
    const record = repository.create(data);
    return await repository.save(record);
  }

  // Update a record
  static async updatePrincipalContact(
    prin_code: string,
    company_code: string,
    updateData: Partial<PrincipalContactDetl>
  ): Promise<boolean> {
    const repository = this.getRepository();

    const result = await repository.update(
      { prin_code, company_code },
      updateData
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete a record
  static async deletePrincipalContact(prin_code: string): Promise<boolean> {
    const repository = this.getRepository();
    const result = await repository.delete({ prin_code });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if record exists
  static async checkExists(prin_code: string, company_code: string): Promise<boolean> {
    const repository = this.getRepository();
    const count = await repository.count({ where: { prin_code, company_code } });
    return count > 0;
  }
}
