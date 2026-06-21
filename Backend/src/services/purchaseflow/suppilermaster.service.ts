import { getRepository, oracleDb } from "../../database/connection";
import { SupplierMaster } from "../../entity/PurchaseFlow/suppliermaster_pf.entity";

export class SupplierMasterService {
  private static getRepository() {
    return getRepository(SupplierMaster);
  }

  // --- CALL MESSAGE BOX ---
  static async callMessageBox(params: {
    screen: string;
    type: string;
    document_number?: string | null;
    userId: string | null;
    message: string;
  }) {
    try {
      const { screen, type, document_number, userId, message } = params;

      const binds = {
        screen: { val: screen },
        type: { val: type },
        document_number: { val: document_number ?? "" },
        userId: { val: userId ?? null },
        message: { val: message },
      };

      await oracleDb.query(
        `BEGIN PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, :message); END;`,
        binds
      );
    } catch (err) {
      console.error("callMessageBox failed:", {
        params,
        err,
      });
    }
  }

  // --- CREATE SUPPLIER ---
  static async createSupplier(data: any) {
    const repo = this.getRepository();

    const exists = await repo.findOne({
      where: {
        company_code: data.company_code,
        supp_code: data.supp_code,
      },
    });

    if (exists) {
      await this.callMessageBox({
        screen: "TRNFAIL",
        type: "error",
        document_number: null,
        userId: data.created_by,
        message: "Supplier Code Already Exists",
      });

      return {
        success: false,
        message: "This Supplier Already Exists",
      };
    }

    const supplier = repo.create({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const saved = await repo.save(supplier);

    await this.callMessageBox({
      screen: "SUPPLIERADDED",
      type: "success",
      document_number: "",
      userId: data.created_by,
      message: "Supplier added successfully",
    });

    return {
      success: true,
      message: "Supplier details added successfully",
      data: saved,
    };
  }

  // --- UPDATE SUPPLIER ---
  static async updateSupplier(
    company_code: string,
    supp_code: string,
    updateData: any
  ) {
    const repo = this.getRepository();

    const existing = await repo.findOne({
      where: { company_code, supp_code },
    });

    if (!existing) {
      await this.callMessageBox({
        screen: "TRNFAIL",
        type: "error",
        document_number: "",
        userId: updateData.updated_by,
        message: "Supplier Code Does Not Exist",
      });

      return {
        success: false,
        message: "Supplier detail Does Not Exist",
      };
    }

    await repo.update(
      { company_code, supp_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    await this.callMessageBox({
      screen: "SUPPLIERUPDATED",
      type: "success",
      document_number: "",
      userId: updateData.updated_by,
      message: "Updated Successfully",
    });

    return {
      success: true,
      message: "Updated Successfully",
    };
  }
}
