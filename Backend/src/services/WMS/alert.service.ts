import { getRepository } from "../../database/connection";
import { Alert } from "../../entity/WMS/alert.entity";
import { In } from "typeorm";

export class AlertService {
  private static getAlertRepository() {
    return getRepository(Alert);
  }

  static async findByOpCodeTypeAndCompany(
    opCode: number,
    opType: string,
    companyCode: string
  ): Promise<Alert | null> {
    const repository = this.getAlertRepository();
    console.log("Service findByOpCodeTypeAndCompany called with:", {
      opCode,
      opType,
      companyCode,
      types: {
        opCode: typeof opCode,
        opType: typeof opType,
        companyCode: typeof companyCode
      }
    });
    
    // Debug: Check all records for this company and type
    const allRecords = await repository
      .createQueryBuilder("alert")
      .where("alert.opType = :opType", { opType: String(opType).trim() })
      .andWhere("alert.companyCode = :companyCode", { companyCode: String(companyCode).trim() })
      .getMany();
    
    console.log("All alerts for company/type:", allRecords.map(a => ({
      opCode: a.opCode,
      opCodeType: typeof a.opCode,
      opType: a.opType,
      companyCode: a.companyCode
    })));
    
    // Try with string comparison too
    const resultWithString = await repository
      .createQueryBuilder("alert")
      .where("CAST(alert.opCode AS CHAR) = :opCode", { opCode: String(opCode) })
      .andWhere("alert.opType = :opType", { opType: String(opType).trim() })
      .andWhere("alert.companyCode = :companyCode", { companyCode: String(companyCode).trim() })
      .getOne();
    
    console.log("Query with string cast result:", resultWithString ? "Found" : "Not found");
    
    const result = await repository
      .createQueryBuilder("alert")
      .where("alert.opCode = :opCode", { opCode: Number(opCode) })
      .andWhere("alert.opType = :opType", { opType: String(opType).trim() })
      .andWhere("alert.companyCode = :companyCode", { companyCode: String(companyCode).trim() })
      .getOne();
    
    console.log("Query result:", result ? "Found" : "Not found");
    return result || resultWithString;
  }

  static async findByDescriptionAndCompany(
    opDesc: string,
    companyCode: string
  ): Promise<Alert | null> {
    const repository = this.getAlertRepository();
    return await repository.findOne({
      where: { opDesc, companyCode },
    });
  }

  static async createAlert(alertData: {
    companyCode: string;
    opCode: number;
    opType: string;
    opDesc: string;
    opSequence: number;
    instruction?: string;
    opMode?: string;
    opModule?: string;
  }): Promise<Alert> {
    const repository = this.getAlertRepository();
    
    // Check for the next opCode if not provided
    if (!alertData.opCode) {
      const maxOpCode = await repository
        .createQueryBuilder("alert")
        .select("MAX(alert.opCode)", "max")
        .where("alert.companyCode = :companyCode", { companyCode: alertData.companyCode })
        .andWhere("alert.opType = :opType", { opType: alertData.opType })
        .getRawOne();

      alertData.opCode = maxOpCode?.max ? maxOpCode.max + 1 : 1;
    }

    const alert = repository.create(alertData);
    return await repository.save(alert);
  }

  static async updateAlert(
    companyCode: string,
    opType: string,
    opCode: number,
    updateData: Partial<Alert>
  ): Promise<boolean> {
    const repository = this.getAlertRepository();

    console.log("Service updateAlert called with:", {
      companyCode,
      opType,
      opCode,
      updateData,
      types: {
        companyCode: typeof companyCode,
        opType: typeof opType,
        opCode: typeof opCode
      }
    });

    // Find the alert using the ORIGINAL identifiers with proper type handling
    const alert = await repository
      .createQueryBuilder("alert")
      .where("alert.opCode = :opCode", { opCode: Number(opCode) })
      .andWhere("alert.opType = :opType", { opType: String(opType).trim() })
      .andWhere("alert.companyCode = :companyCode", { companyCode: String(companyCode).trim() })
      .getOne();

    if (!alert) {
      console.log("Alert not found in updateAlert");
      return false;
    }

    console.log("Alert found:", alert);

    // If op_code or op_type is being changed, we need to delete the old record and create a new one
    // because they are part of the composite primary key
    const isChangingPrimaryKey = 
      (updateData.opCode && Number(updateData.opCode) !== Number(opCode)) ||
      (updateData.opType && String(updateData.opType).trim() !== String(opType).trim());

    if (isChangingPrimaryKey) {
      // Create new alert with updated primary key values
      const newAlert = repository.create({
        ...alert,
        ...updateData,
        companyCode: String(companyCode).trim(), // Keep the same company code
      });

      // Delete the old record
      await repository.delete({
        companyCode: String(companyCode).trim(),
        opType: String(opType).trim(),
        opCode: Number(opCode)
      });

      // Save the new record
      await repository.save(newAlert);
    } else {
      // Just update the non-primary key fields
      Object.assign(alert, updateData);
      await repository.save(alert);
    }
    
    return true;
  }

  static async deleteAlerts(
    criteria: Array<{ companyCode: string; opType: string; opCode: number }>
  ): Promise<boolean> {
    const repository = this.getAlertRepository();
    
    // Delete each alert individually since we have a composite primary key
    const deletePromises = criteria.map(c => 
      repository.delete({
        companyCode: c.companyCode,
        opType: c.opType,
        opCode: c.opCode
      })
    );
    
    const results = await Promise.all(deletePromises);
    return results.some(result => result.affected && result.affected > 0);
  }

  static async checkAlertExists(
    companyCode: string,
    opType: string,
    opCode: number
  ): Promise<boolean> {
    const repository = this.getAlertRepository();
    const count = await repository.count({
      where: { companyCode, opType, opCode },
    });
    return count > 0;
  }

  static async getAlerts(
    filters: Partial<Alert>,
    page: number,
    limit: number
  ): Promise<{ data: Alert[]; total: number }> {
    const repository = this.getAlertRepository();

    // Remove any keys with value null from filters
    const sanitizedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== null)
    );

    const [data, total] = await repository.findAndCount({
      where: sanitizedFilters,
      skip: (page - 1) * limit,
      take: limit,
      order: { companyCode: "ASC", opType: "ASC", opCode: "ASC" },
    });

    return { data, total };
  }
}
