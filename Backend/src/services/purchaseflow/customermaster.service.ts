import { getRepository, oracleDb } from "../../database/connection";
import { CustomerMaster } from "../../entity/Purchaseflow/customermaster.entity";
import constants from "../../helpers/constants";

export class CustomerMasterService {
  private static getRepository() {
    return getRepository(CustomerMaster);
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
    cust_code: string) {
    const repo = this.getRepository();
    return await repo.findOne({
      where: { company_code, cust_code },
    });
  }

  // --- CREATE ---
  static async createCustomer(data: any) {
    const repo = this.getRepository();

    const duplicate = await this.findDuplicate(
        data.company_code, 
        data.cust_code);

    if (duplicate) {
      await this.callMessageBox({
        screen: "TRNFAIL",
        type: "error",
        document_number: "",
        userId: data.updated_by,
        message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_ALREADY_EXISTS,
      });

      return {
        success: false,
        message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_ALREADY_EXISTS,
        status: constants.STATUS_CODES.BAD_REQUEST,
      };
    }

    const customer = repo.create({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const saved = await repo.save(customer);

    await this.callMessageBox({
      screen: "CUSTOMERADDED",
      type: "success",
      document_number: "",
      userId: data.updated_by,
      message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_CREATED_SUCCESSFULLY,
    });

    return {
      success: true,
      message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_CREATED_SUCCESSFULLY,
      data: saved,
      status: constants.STATUS_CODES.OK,
    };
  }

  // --- UPDATE ---
  static async updateCustomer(
    company_code: string, 
    cust_code: string, 
    updateData: any) {
    const repo = this.getRepository();

    const existing = await repo.findOne({
      where: { company_code, cust_code },
    });

    if (!existing) {
      await this.callMessageBox({
        screen: "TRNFAIL",
        type: "error",
        document_number: "",
        userId: updateData.updated_by,
        message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_DOES_NOT_EXIST,
      });

      return {
        success: false,
        message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_DOES_NOT_EXIST,
        status: constants.STATUS_CODES.BAD_REQUEST,
      };
    }

    const result = await repo.update(
      { company_code, cust_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    if (!result.affected || result.affected === 0) {
      return {
        success: false,
        message: "Error while updating customer",
        status: constants.STATUS_CODES.INTERNAL_SERVER_ERROR,
      };
    }

    await this.callMessageBox({
      screen: "CUSTOMERUPDATED",
      type: "success",
      document_number: "",
      userId: updateData.updated_by,
      message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_UPDATED_SUCCESSFULLY,
    });

    return {
      success: true,
      message: constants.MESSAGES.CUSTOMER_PF.CUSTOMER_UPDATED_SUCCESSFULLY,
      status: constants.STATUS_CODES.OK,
    };
  }

  // --- DELETE  ---
  static async deleteCustomer(
    items: any[], 
    userId: string) {
   const repo = this.getRepository();

   if (!items.length) {
    return {
      success: false,
      message: "Select at least one Customer",
      status: constants.STATUS_CODES.BAD_REQUEST,
    };
   }

   for (const item of items) {
    await repo.delete({
      company_code: item.company_code,
      cust_code: item.cust_code,
    });
   }

   // Message Box
   await this.callMessageBox({
    screen: "CUSTOMERDELETED",
    type: "success",
    document_number: "",
    userId,
    message: "Customer Deleted Successfully",
   });

   return {
    success: true,
    message: "Customer Successfully Deleted",
    status: constants.STATUS_CODES.OK,
   };
  }
}
