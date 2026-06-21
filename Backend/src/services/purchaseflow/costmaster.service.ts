import { getRepository, oracleDb } from "../../database/connection";
import { CostMaster } from "../../entity/PurchaseFlow/costmaster.entity";
import constants from "../../helpers/constants";

export class CostmasterService {
  private static getCostRepository() {
    return getRepository(CostMaster);
  }

  static async callMessageBox(
    screen: string,
    type: string,
    document_number: string | null,
    userId: string,
    message: string
  ) {
    await oracleDb.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, :message)`,
      {
        replacements: { screen, type, document_number, userId, message },
      }
    );
  }

  static async createCostmaster(Costdata: any) {
    const repository = this.getCostRepository();

    const exists = await repository.findOne({
      where: {
        company_code: Costdata.company_code,
        cost_code: Costdata.cost_code,
      },
    });

    if (exists) {
      await this.callMessageBox(
        "TRNFAIL",
        "error",
        null,
        Costdata.created_by,
        "Cost Code Already Exists"
      );
      return {
        success: false,
        message: "Cost Code Already Exists",
      };
    }

    const newData = repository.create({
      ...Costdata,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const saved = await repository.save(newData);

    await this.callMessageBox(
      "COSTCODEADDED",
      "success",
      null,
      Costdata.created_by,
      "Cost details added successfully"
    );

    return {
      success: true,
      message: "Cost details added successfully",
      data: saved,
    };
  }

  static async updateCostmaster(
    company_code: string,
    cost_code: string,
    updateData: any
  ) {
    const repository = this.getCostRepository();

    const existing = await repository.findOne({
      where: { company_code, cost_code },
    });

    if (!existing) {
      await this.callMessageBox(
        "TRNFAIL",
        "error",
        null,
        updateData.updated_by,
        "Cost Code Does Not Exist"
      );
      return {
        success: false,
        message: "Cost Code Does Not Exist",
      };
    }

    await repository.update(
      {
        cost_code,
        company_code,
      },
      { ...updateData, updated_at: new Date() }
    );

    await this.callMessageBox(
      "COSTCODEADDED",
      "success",
      null,
      updateData.updated_by,
      "Cost Code Updated Successfully"
    );

    return {
      success: true,
      message: "Cost Code Updated Successfully",
    };
  }

  static async deleteCostmaster(
    company_code: string,
    cost_code: string,
    deleted_by: string
  ) {
    const repo = this.getCostRepository();

    const exists = await repo.findOne({
      where: { company_code, cost_code },
    });

    if (!exists) {
      await this.callMessageBox(
        "TRNFAIL",
        "error",
        null,
        deleted_by,
        "Cost Code Does Not Exist"
      );
      return {
        success: false,
        message: "Cost Code Does Not Exist",
      };
    }

    await repo.delete({ company_code, cost_code });

    await this.callMessageBox(
      "COSTCODEDELETED",
      "success",
      null,
      deleted_by,
      "Cost Code Deleted Successfully"
    );

    return {
      success: true,
      message: "Cost Code Deleted Successfully",
    };
  }

  static async getCostmaster(company_code: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM (
        SELECT "CostMaster".*, ROWNUM AS rnum
        FROM "MS_COST" "CostMaster"
        WHERE "CostMaster"."COMPANY_CODE" = :company_code
          AND ROWNUM <= :max_row
      )
      WHERE rnum > :min_row
    `;

    const params = {
      company_code,
      max_row: offset + limit,
      min_row: offset,
    };

    const result = await oracleDb.query(query, params);
    const data = result.rows || result;

    const countQuery = `
      SELECT COUNT(1) AS cnt
      FROM "MS_COST" "CostMaster"
      WHERE "CostMaster"."COMPANY_CODE" = :company_code
    `;

    const countResult = await oracleDb.query(countQuery, { company_code });
    const totalCount = countResult.rows?.[0]?.CNT || 0;

    return { fetchedData: data, totalCount };
  }
}
