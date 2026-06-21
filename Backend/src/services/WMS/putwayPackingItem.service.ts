import { In } from "typeorm";
import { AppDataSource } from "../../database/connection";
import { TiPackdet } from "../../entity/WMS/TiPackdet";
import { PackingDetailsInboundWms } from "../../entities/wms/transportation/inbound/PackingDetailsInboundWms.entity";

export class PutwayPackingItemService {

  /**
   * UPDATE PackingDetailsInboundWms (NO COMMIT)
   */
  async markPacketsAsSelected(
    companyCode: string,
    prinCode: string,
    jobNo: string,
    packdetNo: string[],
    siteFrom: string,
    siteTo: string,
    locationFrom: string,
    locationTo: string
  ): Promise<void> {

    await AppDataSource.getRepository(PackingDetailsInboundWms).update(
      {
        company_code: companyCode,
        prin_code: prinCode,
        job_no: jobNo,
        packdet_no: In(packdetNo),
      },
      {
        selected: "Y",
        from_site: siteFrom,
        to_site: siteTo,
        location_from: locationFrom,
        location_to: locationTo,
      }
    );

    console.log("✅ PackingDetailsInboundWms updated");
  }

  /**
   * UPDATE TI_PACKDET (NO COMMIT)
   */
  async updateTiPackdet(
    companyCode: string,
    prinCode: string,
    jobNo: string
  ): Promise<void> {

    await AppDataSource
      .getRepository(TiPackdet)
      .createQueryBuilder()
      .update(TiPackdet)
      .set({
        selected: "Y",
        allocated: "N",
      })
      .where("COMPANY_CODE = :companyCode", { companyCode })
      .andWhere("PRIN_CODE = :prinCode", { prinCode })
      .andWhere("JOB_NO = :jobNo", { jobNo })
      .execute();

    console.log("✅ TI_PACKDET updated");
  }

  /**
   * RESET selection (NO COMMIT)
   */
  async resetPacketSelection(
    companyCode: string,
    prinCode: string,
    jobNo: string,
    packdetNo: string[]
  ): Promise<void> {

    await AppDataSource.getRepository(PackingDetailsInboundWms).update(
      {
        company_code: companyCode,
        prin_code: prinCode,
        job_no: jobNo,
        packdet_no: In(packdetNo),
      },
      { selected: "N" }
    );

    console.log("✅ Packet selection reset");
  }

  /**
   * CALL STORED PROCEDURE (HANDLES COMMIT)
   */
  async callPutawayStoredProcedure(
    companyCode: string,
    prinCode: string,
    jobNo: string
  ): Promise<void> {

    await AppDataSource.query(
      `BEGIN SP_PUTAWAY_NORMAL(:1, :2, :3); END;`,
      [companyCode, prinCode, jobNo]
    );

    console.log("✅ Stored procedure executed");
  }

  /**
   * MAIN PROCESS
   */
  async processPutway(params: {
    companyCode: string;
    prinCode: string;
    jobNo: string;
    packdetNo: string[];
    siteFrom: string;
    siteTo: string;
    locationFrom: string;
    locationTo: string;
  }): Promise<void> {

    // 1️⃣ Update Packing Details
    await this.markPacketsAsSelected(
      params.companyCode,
      params.prinCode,
      params.jobNo,
      params.packdetNo,
      params.siteFrom,
      params.siteTo,
      params.locationFrom,
      params.locationTo
    );

    // 2️⃣ Update TI_PACKDET
    await this.updateTiPackdet(
      params.companyCode,
      params.prinCode,
      params.jobNo
    );

    // 3️⃣ Stored Procedure handles COMMIT / ROLLBACK
    await this.callPutawayStoredProcedure(
      params.companyCode,
      params.prinCode,
      params.jobNo
    );

    // 4️⃣ Optional reset (if needed after procedure)
    await this.resetPacketSelection(
      params.companyCode,
      params.prinCode,
      params.jobNo,
      params.packdetNo
    );

    console.log("✅ Putaway process completed");
  }
}
