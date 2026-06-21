import { getRepository, oracleDb } from "../../database/connection";
import { TaAdjDetail } from "../../entity/WMS/taAdjDetail.entity";

export class TaAdjDetailService {
  private static getRepository() {
    return getRepository(TaAdjDetail);
  }

  static async findAll(): Promise<TaAdjDetail[]> {
    const repository = this.getRepository();
    return await repository.find();
  }

  static async findByJobNo(JOB_NO: string, COMPANY_CODE: string): Promise<TaAdjDetail | null> {
    const repository = this.getRepository();
    return await repository.findOne({
      where: { JOB_NO, COMPANY_CODE },
    });
  }

  static async findByCompany(COMPANY_CODE: string): Promise<TaAdjDetail[]> {
    const repository = this.getRepository();
    return await repository.find({
      where: { COMPANY_CODE },
    });
  }

  static async createAdjustment(adjustmentData: {
    ADJ_NO: number;
    ADJ_SERIALNO: number;
    JOB_NO: string;
    PROD_CODE?: string;
    ADJ_TYPE?: string;
    QTY_PUOM?: number;
    SITE_CODE?: string;
    LOCATION_CODE?: string;
    QTY_LUOM?: number;
    PRIN_CODE?: string;
    P_UOM?: string;
    L_UOM?: string;
    PALLET_ID?: string;
    KEY_NUMBER?: string;
    COMPANY_CODE: string;
    CREATED_BY?: string;
    UPDATED_BY?: string;
  }): Promise<TaAdjDetail> {
    const repository = this.getRepository();

    // Generate unique IDENTITY_NUMBER
    const IDENTITY_NUMBER = await this.getNextIdentityNumber();

    const adjustment = repository.create({
      ...adjustmentData,
      IDENTITY_NUMBER,
    });

    return await repository.save(adjustment);
  }

  static async updateAdjustment(
    JOB_NO: string,
    COMPANY_CODE: string,
    updateData: Partial<TaAdjDetail>
  ): Promise<boolean> {
    const repository = this.getRepository();

    const result = await repository.update(
      { JOB_NO, COMPANY_CODE },
      updateData
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteAdjustment(JOB_NO: string, COMPANY_CODE: string): Promise<boolean> {
    const repository = this.getRepository();
    const result = await repository.delete({ JOB_NO, COMPANY_CODE });
    return result.affected ? result.affected > 0 : false;
  }

  static async checkExists(JOB_NO: string, COMPANY_CODE: string): Promise<boolean> {
    const repository = this.getRepository();
    const count = await repository.count({
      where: { JOB_NO, COMPANY_CODE },
    });
    return count > 0;
  }

  static async getNextIdentityNumber(): Promise<number> {
    const repository = this.getRepository();
    
    // Get the maximum IDENTITY_NUMBER and increment by 1
    const result = await repository
      .createQueryBuilder("detail")
      .select("MAX(detail.IDENTITY_NUMBER)", "maxIdentityNumber")
      .getRawOne();
    
    const maxIdentityNumber = result?.maxIdentityNumber || 0;
    const nextIdentityNumber = maxIdentityNumber + 1;
    
    // Ensure the value is an integer
    return Math.floor(nextIdentityNumber);
  }

  static async processAdjustment(data: {
    COMPANY_CODE: string;
    PRIN_CODE: string;
    ADJ_NO: number;
    USERID: string;
  }): Promise<void> {
    try {
      console.log('Processing adjustment with params:', data);
      
      const result = await oracleDb.query(
        `BEGIN SP_WM_ADJUSTMNT_PROCESS(:P_COMPANY_CODE, :P_PRIN_CODE, :P_ADJ_NO, :P_USERID); END;`,
        {
          P_COMPANY_CODE: data.COMPANY_CODE,
          P_PRIN_CODE: data.PRIN_CODE,
          P_ADJ_NO: data.ADJ_NO,
          P_USERID: data.USERID,
        }
      );
      
      console.log('Stored procedure executed successfully:', result);
    } catch (error: any) {
      console.error('Error in processAdjustment service:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.errorNum,
        offset: error.offset
      });
      throw new Error(`Failed to process adjustment: ${error.message}`);
    }
  }
}
