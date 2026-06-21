import { getRepository } from "../../database/connection";
import { AcSetup } from "../../entity/WMS/acsetup.entity";
import { In } from "typeorm";

export class AcSetupService {
  private static getAcSetupRepository() {
    return getRepository(AcSetup);
  }

  static async findByCompanyCode(
    companyCode: string,
    acCode: string
  ): Promise<AcSetup | null> {
    const repository = this.getAcSetupRepository();
    return await repository.findOne({
      where: { companyCode, acCode },
    });
  }

  static async createAcSetup(setupData: any): Promise<AcSetup | null> {
    const repository = this.getAcSetupRepository();
    const companyCodeNorm = setupData.companyCode?.trim().toUpperCase();
    const acCodeNorm = setupData.acCode?.trim().toUpperCase();

    // Only allow fields defined in the entity
    const allowedFields = [
      "companyCode", "pdcReceiptCode", "pdcIssueCode", "docDateEditable", "acCode", "bankName", "acName", "swiftCode",
      "baseCurrCode", "priceDecimalNos", "amountDecimalNos", "lcurDecimalNos", "qtyDecimalNos", "financialYrStart",
      "financialYrEnd", "docEditFrom", "docEditTo", "jobClass", "exchangeDiffAc", "principalAcGroup", "expsubtypeAccident",
      "expsubtypeFine", "expsubtypeFuel", "expsubtypeIns", "expsubtypeReg", "expsubtypeRepair", "expsubtypeService",
      "supplierAcGroup", "expcodeVehicle", "age1", "age2", "age3", "age4", "age5", "docnoType", "intercompanyAcGroup",
      "multyDivAccounting", "billSettleLcur", "defaultTaxBstype", "age6", "taxPerc"
    ];

    const filteredData = Object.keys(setupData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = setupData[key];
        return obj;
      }, {});

    // Check existence before creating with detailed logging
    console.log('Creating AcSetup with:', { companyCodeNorm, acCodeNorm });
    const exists = await this.checkAcSetupExists(companyCodeNorm, acCodeNorm);
    console.log('Existence check result:', exists);
    
    if (exists) {
      console.log('AcSetup already exists, returning null');
      return null;
    }

    const acSetup = repository.create({
      ...filteredData,
      companyCode: companyCodeNorm,
      acCode: acCodeNorm,
      createdAt: setupData.createdAt || new Date(),
      updatedAt: new Date(),
      updatedBy: setupData.createdBy,
      createdBy: setupData.createdBy,
    });

    try {
      console.log('Attempting to save AcSetup:', { companyCode: companyCodeNorm, acCode: acCodeNorm });
      const saved = await repository.save(acSetup);
      return Array.isArray(saved) ? (saved[0] as AcSetup) : (saved as AcSetup);
    } catch (error: any) {
      console.error('Error saving AcSetup:', error.message);
      // Check for Oracle unique constraint violation error
      if (
        error &&
        typeof error.message === "string" &&
        error.message.includes("ORA-00001") &&
        error.message.includes("PK_MS_AC_SETUP")
      ) {
        // Return null instead of throwing
        return null;
      }
      throw error;
    }
  }

  static async updateAcSetup(
    companyCode: string,
    acCode: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getAcSetupRepository();
    const companyCodeNorm = companyCode?.trim().toUpperCase();
    const acCodeNorm = acCode?.trim().toUpperCase();

    const result = await repository.update(
      { companyCode: companyCodeNorm, acCode: acCodeNorm },
      {
        ...updateData,
        updatedAt: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteAcSetup(companyCode: string, acCode: string): Promise<boolean> {
    const repository = this.getAcSetupRepository();
    const companyCodeNorm = companyCode?.trim().toUpperCase();
    const acCodeNorm = acCode?.trim().toUpperCase();

    const result = await repository.delete({ companyCode: companyCodeNorm, acCode: acCodeNorm });

    return result.affected ? result.affected > 0 : false;
  }

  static async deleteMultipleAcSetups(keys: { companyCode: string, acCode: string }[]): Promise<boolean> {
    const repository = this.getAcSetupRepository();

    const deletePromises = keys.map(key =>
      repository.delete({ 
        companyCode: key.companyCode?.trim().toUpperCase(), 
        acCode: key.acCode?.trim().toUpperCase() 
      })
    );
    const results = await Promise.all(deletePromises);

    return results.some(result => result.affected && result.affected > 0);
  }

  static async checkAcSetupExists(
    companyCode: string,
    acCode: string
  ): Promise<boolean> {
    const repository = this.getAcSetupRepository();
    const companyCodeNorm = companyCode?.trim().toUpperCase();
    const acCodeNorm = acCode?.trim().toUpperCase();

    console.log('checkAcSetupExists - Input:', { companyCode, acCode });
    console.log('checkAcSetupExists - Normalized:', { companyCodeNorm, acCodeNorm });

    // Guard: If either key is missing, do not match any record
    if (!companyCodeNorm || !acCodeNorm) {
      console.warn('checkAcSetupExists: Missing companyCode or acCode');
      return false;
    }

    try {
      // Use raw query to check directly against database columns
      const manager = repository.manager;
      const result = await manager.query(
        `SELECT COUNT(*) as cnt FROM MS_AC_SETUP 
         WHERE COMPANY_CODE = :companyCode 
         AND AC_CODE = :acCode`,
        [companyCodeNorm, acCodeNorm]
      );
      
      const count = parseInt(result[0]?.CNT || result[0]?.cnt || '0');
      console.log('checkAcSetupExists - Raw query count:', count);
      return count > 0;
    } catch (error: any) {
      console.error('Error in checkAcSetupExists raw query:', error.message);
      
      // Fallback: Try with findOne
      try {
        const existing = await repository.findOne({
          where: { companyCode: companyCodeNorm, acCode: acCodeNorm },
        });
        console.log('checkAcSetupExists - Fallback findOne result:', existing ? 'Found' : 'Not found');
        return !!existing;
      } catch (fallbackError: any) {
        console.error('Error in checkAcSetupExists fallback:', fallbackError.message);
        return false;
      }
    }
  }

  static async getAcSetups(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: AcSetup[]; total: number }> {
    const repository = this.getAcSetupRepository();

    const [data, total] = await repository.findAndCount({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
      order: { companyCode: "ASC" },
    });

    return { data, total };
  }
}