import { getRepository } from "../../../../database/connection";
import { TtBatch } from "../../../../entity/WMS/transaction/inbound/TtBatch.entity";
import { TPutawaymanual } from "../../../../interfaces/wms/transaction/inbound/manualputaway.interface";

/**
 * Service for TT_BATCH table operations using TypeORM
 */
export class TtBatchService {
  private static getRepository() {
    return getRepository(TtBatch);
  }

  /**
   * Utility: Convert JS Date or dd-mm-yyyy string to Date object
   */
  private static toDate(dateInput?: string | Date | null): Date | undefined {
    if (!dateInput) return undefined;
    if (dateInput instanceof Date) return dateInput;

    const parts = dateInput.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // yyyy-mm-dd
        return new Date(dateInput);
      } else {
        // dd-mm-yyyy
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}`);
      }
    }
    return undefined;
  }

  /**
   * Check if a record exists in TT_BATCH by IDENTITY_NUMBER
   */
  static async recordExists(identityNumber: number): Promise<boolean> {
    const repository = this.getRepository();
    const count = await repository.count({
      where: {
        IDENTITY_NUMBER: identityNumber,
      },
    });
    return count > 0;
  }

  /**
   * Check if a record exists by business key (for upsert logic)
   */
  static async findByBusinessKey(
    companyCode: string,
    prinCode: string,
    jobNo: string,
    txnType: string,
    keyNumber: string = ""
  ): Promise<TtBatch | null> {
    const repository = this.getRepository();
    return await repository.findOne({
      where: {
        COMPANY_CODE: companyCode,
        PRIN_CODE: prinCode,
        JOB_NO: jobNo,
        TXN_TYPE: txnType,
        KEY_NUMBER: keyNumber || undefined,
      },
    });
  }

  /**
   * Upsert (Insert or Update) a TT_BATCH record
   */
  static async upsertPutawaymanual(data: TPutawaymanual): Promise<{ JOB_NO: string; PACKDET_NO: number }> {
    const repository = this.getRepository();

    // Check if record exists by business key
    const existingRecord = await this.findByBusinessKey(
      data.COMPANY_CODE,
      data.PRIN_CODE,
      data.JOB_NO,
      data.TXN_TYPE,
      data.KEY_NUMBER ?? ""
    );

    // Prepare the entity data with date conversions
    const entityData: Partial<TtBatch> = {
      IDENTITY_NUMBER: data.IDENTITY_NUMBER,
      COMPANY_CODE: data.COMPANY_CODE,
      PRIN_CODE: data.PRIN_CODE,
      JOB_NO: data.JOB_NO,
      TXN_TYPE: data.TXN_TYPE,
      TXN_DATE: this.toDate(data.TXN_DATE) || new Date(),
      PACKDET_NO: data.PACKDET_NO,
      KEY_NUMBER: data.KEY_NUMBER,
      PROD_CODE: data.PROD_CODE,
      SITE_CODE: data.SITE_CODE,
      LOCATION_CODE: data.LOCATION_CODE,
      QUANTITY: data.QUANTITY || 0,
      QTY_PUOM: data.QTY_PUOM || 0,
      QTY_LUOM: data.QTY_LUOM || 0,
      P_UOM: data.P_UOM,
      L_UOM: data.L_UOM,
      QTY_CONFIRMED: data.QTY_CONFIRMED,
      PQTY_CONFIRMED: data.PQTY_CONFIRMED,
      LQTY_CONFIRMED: data.LQTY_CONFIRMED,
      PUOM_CONFIRMED: data.PUOM_CONFIRMED,
      LUOM_CONFIRMED: data.LUOM_CONFIRMED,
      UPPP: data.UPPP,
      PACK_KEY: data.PACK_KEY,
      UPP: data.UPP,
      CONFIRM_DATE: this.toDate(data.CONFIRM_DATE),
      CUST_CODE: data.CUST_CODE,
      ORDER_NO: data.ORDER_NO,
      ORDER_SRNO: data.ORDER_SRNO,
      VESSEL_NAME: data.VESSEL_NAME,
      CONTAINER_NO: data.CONTAINER_NO,
      SEAL_NO: data.SEAL_NO,
      PO_NO: data.PO_NO,
      BL_NO: data.BL_NO,
      DOC_REF: data.DOC_REF,
      LOT_NO: data.LOT_NO,
      PALLET_ID: data.PALLET_ID,
      PALLET_SERIAL_NO: data.PALLET_SERIAL_NO,
      MANU_CODE: data.MANU_CODE,
      MFG_DATE: this.toDate(data.MFG_DATE),
      EXP_DATE: this.toDate(data.EXP_DATE),
      CURR_CODE: data.CURR_CODE,
      EX_RATE: data.EX_RATE,
      UNIT_PRICE: data.UNIT_PRICE,
      SELECTED: data.SELECTED ?? "N",
      ALLOCATED: data.ALLOCATED ?? "Y",
      CONFIRMED: data.CONFIRMED ?? "N",
      USER_ID: data.USER_ID,
      USER_DT: this.toDate(data.USER_DT),
      APPLIED_KEYNO: data.APPLIED_KEYNO,
      RECEIPT_TYPE: data.RECEIPT_TYPE,
      RECEIPT_DATE: this.toDate(data.RECEIPT_DATE),
      CONTAINER_SIZE: data.CONTAINER_SIZE,
      MOC1: data.MOC1,
      MOC2: data.MOC2,
      ORIGIN_COUNTRY: data.ORIGIN_COUNTRY,
      SHELF_LIFE_DAYS: data.SHELF_LIFE_DAYS,
      SHELF_LIFE_DATE: this.toDate(data.SHELF_LIFE_DATE),
      TASK_ORDER: data.TASK_ORDER,
      PROD_ATTRIB_CODE: data.PROD_ATTRIB_CODE,
      PROD_GRADE1: data.PROD_GRADE1,
      PROD_GRADE2: data.PROD_GRADE2,
      TX_IDENTITY_NUMBER: data.TX_IDENTITY_NUMBER,
      ASSIGNED_PDA_USER: data.ASSIGNED_PDA_USER,
      PDA_VERIFIED: data.PDA_VERIFIED,
      SUPP_CODE: data.SUPP_CODE,
      PUTAWAY_DT: this.toDate(data.PUTAWAY_DT),
      MASTER_CTN: data.MASTER_CTN,
      LOOSE_CTN: data.LOOSE_CTN,
      HS_CODE: data.HS_CODE,
      NET_WT: data.NET_WT,
      NET_VOLUME: data.NET_VOLUME,
      LC_PO_VALUE: data.LC_PO_VALUE,
      GROSS_WT: data.GROSS_WT,
      DA_NO: data.DA_NO,
      BATCH_NO: data.BATCH_NO,
      EDIT_USER: data.EDIT_USER,
      CARTON_NO: data.CARTON_NO,
      SERIALIZE: data.SERIALIZE ?? "N",
      CREATED_BY: data.created_by,
      UPDATED_BY: data.updated_by,
    };

    if (existingRecord) {
      // Update existing record by IDENTITY_NUMBER
      entityData.UPDATED_AT = new Date();
      await repository.update(
        { IDENTITY_NUMBER: existingRecord.IDENTITY_NUMBER },
        entityData
      );
    } else {
      // Insert new record
      entityData.CREATED_AT = new Date();
      entityData.UPDATED_AT = new Date();
      const newRecord = repository.create(entityData);
      await repository.save(newRecord);
    }

    // Fetch the record to get the PACKDET_NO generated by trigger
    const savedRecord = await this.findByBusinessKey(
      data.COMPANY_CODE,
      data.PRIN_CODE,
      data.JOB_NO,
      data.TXN_TYPE,
      data.KEY_NUMBER ?? ""
    );

    if (!savedRecord) {
      throw new Error("Failed to retrieve saved record");
    }

    return {
      JOB_NO: data.JOB_NO,
      PACKDET_NO: savedRecord.PACKDET_NO
    };
  }

  /**
   * Find a specific TT_BATCH record by IDENTITY_NUMBER
   */
  static async findOne(identityNumber: number): Promise<TtBatch | null> {
    const repository = this.getRepository();
    return await repository.findOne({
      where: {
        IDENTITY_NUMBER: identityNumber,
      },
    });
  }

  /**
   * Find all TT_BATCH records by Job Number
   */
  static async findByJobNo(
    companyCode: string,
    prinCode: string,
    jobNo: string
  ): Promise<TtBatch[]> {
    const repository = this.getRepository();
    return await repository.find({
      where: {
        COMPANY_CODE: companyCode,
        PRIN_CODE: prinCode,
        JOB_NO: jobNo,
      },
    });
  }

  /**
   * Delete a TT_BATCH record by IDENTITY_NUMBER
   */
  static async delete(identityNumber: number): Promise<boolean> {
    const repository = this.getRepository();
    const result = await repository.delete({
      IDENTITY_NUMBER: identityNumber,
    });
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Find all TT_BATCH records by filters
   */
  static async findByFilters(filters: Partial<TtBatch>): Promise<TtBatch[]> {
    const repository = this.getRepository();
    return await repository.find({
      where: filters,
    });
  }
}
