import { getRepository, oracleDb } from "../../database/connection";
import { DivisionMaster } from "../../entity/PurchaseFlow/divisionmaster_pf.entity";
// import { DivisionMaster } from "../../entity/Purchaseflow/divisionmaster_pf.entity";
import constants from "../../helpers/constants";

export class DivisionMasterService {
  private static getRepository() {
    return getRepository(DivisionMaster);
  }

  // --- CALL MESSAGE BOX ---
  static async callMessageBox(params: {
    screen: string;
    type: string;
    document_number?: string;
    userId: string;
    message: string;
  }) {
    await oracleDb.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, :message)`,
      [
        params.screen,
        params.type,
        params.document_number ?? "",
        params.userId,
        params.message,
      ]
    );
  }

  // --- CHECK DUPLICATE ---
  static async findDuplicate(company_code: string, div_code: string) {
    const repo = this.getRepository();
    return await repo.findOne({
      where: {
        company_code,
        div_code,
      },
    });
  }

  //  CREATE
  static async createDivision(data: {
    div_code: string;
    div_name: string;
    company_code: string;
    created_by: string;
    updated_by: string;
  }) {
    const repo = this.getRepository();

    const duplicate = await this.findDuplicate(data.company_code, data.div_code);

    if (duplicate) {
      await this.callMessageBox({
        screen: "TRNFAIL",
        type: "error",
        document_number: "",
        userId: data.updated_by,
        message: "Division already exists",
      });

      return {
        success: false,
        message: "Division already exists",
        status: constants.STATUS_CODES.BAD_REQUEST,
      };
    }

    const division = repo.create({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const saved = await repo.save(division);

    await this.callMessageBox({
      screen: "DIVISIONADDED",
      type: "success",
      document_number: "",
      userId: data.updated_by,
      message: "Division Added Successfully",
    });

    return {
      success: true,
      message: "Division Successfully Added",
      data: saved,
      status: constants.STATUS_CODES.OK,
    };
  }

//   UPDATE
  static async updateDivision(div_code: string, company_code: string, updateData: any) {
    const repo = this.getRepository();

    const existing = await repo.findOne({
      where: { div_code, company_code },
    });

    if (!existing) {
      await this.callMessageBox({
        screen: "TRNFAIL",
        type: "error",
        document_number: "",
        userId: updateData.updated_by,
        message: "Division Does Not Exist",
      });

      return {
        success: false,
        message: "Division Does Not Exist",
        status: constants.STATUS_CODES.BAD_REQUEST,
      };
    }

    const result = await repo.update(
      { div_code, company_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    if (!result.affected) {
      return {
        success: false,
        message: "Error while updating Division",
        status: constants.STATUS_CODES.INTERNAL_SERVER_ERROR,
      };
    }

    await this.callMessageBox({
      screen: "DIVISIONUPDATED",
      type: "success",
      document_number: "",
      userId: updateData.updated_by,
      message: "Division Updated Successfully",
    });

    return {
      success: true,
      message: "Division Updated Successfully",
      status: constants.STATUS_CODES.OK,
    };
  }
  //     DELETE
  
  static async deleteDivision(items: any[], userId: string) {
    const repo = this.getRepository();

    if (!items.length) {
      return {
        success: false,
        message: "Select at least one Division",
        status: constants.STATUS_CODES.BAD_REQUEST,
      };
    }

    for (const item of items) {
      await repo.delete({
        div_code: item.div_code,
      });
    }

    await this.callMessageBox({
      screen: "DIVISIONDELETED",
      type: "success",
      document_number: "",
      userId,
      message: "Division Deleted Successfully",
    });

    return {
      success: true,
      message: "Division Successfully Deleted",
      status: constants.STATUS_CODES.OK,
    };
  }
}
