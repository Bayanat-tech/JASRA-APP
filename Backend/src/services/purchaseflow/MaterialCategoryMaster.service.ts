import { getRepository, oracleDb } from "../../database/connection";
import { MaterialCategoryMaster } from "../../entity/Purchaseflow/materialcategary.entity";
import constants from "../../helpers/constants";

export class MaterialCategoryService {
  private static getRepository() {
    return getRepository(MaterialCategoryMaster);
  }

  // --- CALL MESSAGE BOX  ---
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
  static async findDuplicate(
    company_code: string, 
    mater_category_code: string
  ) {
    const repo = this.getRepository();
    return await repo.findOne({
      where: {
        company_code,
        mater_category_code,
      },
    });
  }

  // --- CREATE ---
  static async createCategory(data: {
    mater_category_code: string;
    mater_category_desp: string;
    company_code: string;
    created_by: string;
    updated_by: string;
  }) {
    const repo = this.getRepository();

    const duplicate = await this.findDuplicate(
      data.company_code,
      data.mater_category_code
    );

    if (duplicate) {
      await this.callMessageBox({
        screen: "TRNFAIL",
        type: "error",
        document_number: "",
        userId: data.updated_by,
        message: "Material Category already exists",
      });

      return {
        success: false,
        message: "Material Category already exists",
        status: constants.STATUS_CODES.BAD_REQUEST,
      };
    }

    const category = repo.create({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const saved = await repo.save(category);

    await this.callMessageBox({
      screen: "MATCATEGORYCODEADDED",
      type: "success",
      document_number: "",
      userId: data.updated_by,
      message: "Material Category Code Added Successfully",
    });

    return {
      success: true,
      message: "Material Category Successfully Added",
      data: saved,
      status: constants.STATUS_CODES.OK,
    };
  }

  // --- UPDATE ---
  static async updateCategory(
    mater_category_code: string,
    company_code: string,
    updateData: any
  ) {
    const repo = this.getRepository();

    const existing = await repo.findOne({
      where: { mater_category_code, company_code },
    });

    if (!existing) {
      await this.callMessageBox({
        screen: "TRNFAIL",
        type: "error",
        document_number: "",
        userId: updateData.updated_by,
        message: "Material Category Does Not Exist",
      });

      return {
        success: false,
        message: "Material Category Does Not Exist",
        status: constants.STATUS_CODES.BAD_REQUEST,
      };
    }

    const result = await repo.update(
      { mater_category_code, company_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    if (!result.affected || result.affected === 0) {
      return {
        success: false,
        message: "Error while updating Material Category",
        status: constants.STATUS_CODES.INTERNAL_SERVER_ERROR,
      };
    }

    await this.callMessageBox({
      screen: "MATCATCODEADDED",
      type: "success",
      document_number: "",
      userId: updateData.updated_by,
      message: "Material Category Updated Successfully",
    });

    return {
      success: true,
      message: "Material Category Updated Successfully",
      status: constants.STATUS_CODES.OK,
    };
  }

  // --- DELETE ---
  // static async deleteCategory(items: any[], userId: string) {
  //   const repo = this.getRepository();

  //   if (!items.length) {
  //     return {
  //       success: false,
  //       message: "Select at least one Material Category",
  //       status: constants.STATUS_CODES.BAD_REQUEST,
  //     };
  //   }

  //   for (const item of items) {
  //     await repo.delete({
  //       mater_category_code: item.mater_category_code,
  //     });
  //   }

  //   await this.callMessageBox({
  //     screen: "MATCATEGORYCODEDELETED",
  //     type: "success",
  //     document_number: "",
  //     userId,
  //     message: "Material Category Code Deleted Successfully",
  //   });

  //   return {
  //     success: true,
  //     message: "Material Category Successfully Deleted",
  //     status: constants.STATUS_CODES.OK,
  //   };
  // }
}

