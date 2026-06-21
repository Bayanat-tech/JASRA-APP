import { getRepository } from "../../../../database/connection";
import { PackingDetailsInboundWms } from "../../../../entities/wms/transportation/inbound/PackingDetailsInboundWms.entity";
import { IPackingDetails } from "../../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import { FindManyOptions, FindOneOptions } from "typeorm";

export class PackingDetailsService {
  private static getPackingDetailsRepository() {
    return getRepository(PackingDetailsInboundWms);
  }

  // Find a single packing detail by composite key
  static async findOne(params: {
    company_code: string;
    prin_code: string;
    job_no: string;
    packdet_no: number;
  }): Promise<PackingDetailsInboundWms | null> {
    const repository = this.getPackingDetailsRepository();
    return await repository.findOne({
      where: {
        company_code: params.company_code,
        prin_code: params.prin_code,
        job_no: params.job_no,
        packdet_no: params.packdet_no,
      },
    });
  }

  // Find all packing details with optional filters
  static async findAll(
    options?: FindManyOptions<PackingDetailsInboundWms>
  ): Promise<PackingDetailsInboundWms[]> {
    const repository = this.getPackingDetailsRepository();
    return await repository.find(options);
  }

  // Find packing details by company code
  static async findByCompanyCode(
    company_code: string
  ): Promise<PackingDetailsInboundWms[]> {
    const repository = this.getPackingDetailsRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Find packing details with search filters
  static async findWithFilters(
    whereConditions: any
  ): Promise<PackingDetailsInboundWms[]> {
    const repository = this.getPackingDetailsRepository();
    return await repository.find({
      where: whereConditions,
    });
  }

  // Helper method to format dates for Oracle
  private static formatDatesForOracle(data: Partial<IPackingDetails>): Partial<IPackingDetails> {
    const formattedData = { ...data };
    
    // Format date fields to Oracle DATE format (DD-MON-YY)
    const dateFields = ['mfg_date', 'exp_date', 'user_dt', 'cleared_date', 'shelf_life_date', 'tally_dt', 'confirm_dt'];
    
    dateFields.forEach(field => {
      if (formattedData[field as keyof IPackingDetails]) {
        const dateValue = formattedData[field as keyof IPackingDetails];
        if (typeof dateValue === 'string') {
          // Convert string to Date object
          formattedData[field as keyof IPackingDetails] = new Date(dateValue) as any;
        }
      }
    });
    
    // Handle empty string fields - convert to null or undefined to avoid constraint violations
    const stringFields = ['manu_code', 'from_site', 'to_site', 'from_aisle', 'to_aisle', 
                         'location_from', 'location_to', 'pallet_id', 'pallet_serial_no',
                         'lot_no', 'po_no', 'bl_no', 'vessel_name', 'voyage_no', 'container_no',
                         'doc_ref', 'curr_code', 'user_id', 'cleared_user', 'reject_reason',
                         'cust_code', 'moc1', 'moc2', 'new_product', 'prod_name', 'origin_country',
                         'prod_attrib_code', 'prod_grade1', 'prod_grade2', 'tx_identity_number',
                         'supp_code', 'assigned_putaway_user', 'assigned_tally_user', 'prv_location_code',
                         'be_doc_no', 'po_curr_code', 'hs_code', 'confirm_user', 'batch_no'];
    
    stringFields.forEach(field => {
      const value = formattedData[field as keyof IPackingDetails];
      if (value === '' || value === null) {
        delete formattedData[field as keyof IPackingDetails];
      }
    });
    
    return formattedData;
  }

  // Create a new packing detail
  static async create(
    packingDetailsData: Partial<IPackingDetails>
  ): Promise<PackingDetailsInboundWms> {
    const repository = this.getPackingDetailsRepository();

    // Auto-generate packdet_no if not provided
    // NOTE: Remove this auto-generation logic when database trigger is enabled
    let packdetNo = packingDetailsData.packdet_no;
    if (!packdetNo) {
      const maxResult = await repository
        .createQueryBuilder("packdet")
        .select("MAX(packdet.packdet_no)", "max")
        .where("packdet.company_code = :company_code", { company_code: packingDetailsData.company_code })
        .andWhere("packdet.prin_code = :prin_code", { prin_code: packingDetailsData.prin_code })
        .andWhere("packdet.job_no = :job_no", { job_no: packingDetailsData.job_no })
        .getRawOne();
      
      packdetNo = (maxResult?.max || 0) + 1;
    }

    // Format dates for Oracle
    const formattedData = this.formatDatesForOracle(packingDetailsData);

    const packingDetail = repository.create({
      ...formattedData,
      packdet_no: packdetNo,
    });

    return await repository.save(packingDetail);
  }

  // Bulk create packing details
  // NOTE: Remove packdet_no auto-generation when database trigger is enabled
  static async bulkCreate(
    packingDetailsArray: Partial<IPackingDetails>[],
    options?: { ignoreDuplicates?: boolean }
  ): Promise<PackingDetailsInboundWms[]> {
    const repository = this.getPackingDetailsRepository();

    // Group by company_code, prin_code, job_no to generate packdet_no sequentially
    const groupedData: { [key: string]: Partial<IPackingDetails>[] } = {};
    
    for (const data of packingDetailsArray) {
      const key = `${data.company_code}_${data.prin_code}_${data.job_no}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(data);
    }

    // Process each group and assign packdet_no
    const processedData: Partial<IPackingDetails>[] = [];
    
    for (const key in groupedData) {
      const group = groupedData[key];
      const firstItem = group[0];
      
      // Get max packdet_no for this group
      const maxResult = await repository
        .createQueryBuilder("packdet")
        .select("MAX(packdet.packdet_no)", "max")
        .where("packdet.company_code = :company_code", { company_code: firstItem.company_code })
        .andWhere("packdet.prin_code = :prin_code", { prin_code: firstItem.prin_code })
        .andWhere("packdet.job_no = :job_no", { job_no: firstItem.job_no })
        .getRawOne();
      
      let nextPackdetNo = (maxResult?.max || 0) + 1;
      
      // Assign packdet_no to each item in the group
      for (const item of group) {
        const formattedItem = this.formatDatesForOracle(item);
        processedData.push({
          ...formattedItem,
          packdet_no: item.packdet_no || nextPackdetNo++,
        });
      }
    }

    const packingDetails = processedData.map((data) =>
      repository.create(data)
    );

    if (options?.ignoreDuplicates) {
      // Save each individually to handle duplicates gracefully
      const results: PackingDetailsInboundWms[] = [];
      for (const detail of packingDetails) {
        try {
          const saved = await repository.save(detail);
          results.push(saved);
        } catch (error) {
          // Ignore duplicate errors silently
          console.log("Skipping duplicate entry");
        }
      }
      return results;
    }

    return await repository.save(packingDetails);
  }

  // Update a packing detail
  static async update(
    params: {
      company_code: string;
      prin_code: string;
      job_no: string;
      packdet_no: number;
    },
    updateData: Partial<IPackingDetails>
  ): Promise<boolean> {
    const repository = this.getPackingDetailsRepository();

    // Format dates for Oracle
    const formattedData = this.formatDatesForOracle(updateData);

    const result = await repository.update(
      {
        company_code: params.company_code,
        prin_code: params.prin_code,
        job_no: params.job_no,
        packdet_no: params.packdet_no,
      },
      {
        ...formattedData,
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete a packing detail
  static async delete(params: {
    company_code: string;
    prin_code: string;
    job_no: string;
    packdet_no: number;
  }): Promise<boolean> {
    const repository = this.getPackingDetailsRepository();

    const result = await repository.delete({
      company_code: params.company_code,
      prin_code: params.prin_code,
      job_no: params.job_no,
      packdet_no: params.packdet_no,
    });

    return result.affected ? result.affected > 0 : false;
  }

  // Delete multiple packing details
  static async deleteMany(
    packingDetails: Array<{
      company_code: string;
      prin_code: string;
      job_no: string;
      packdet_no: number;
    }>
  ): Promise<number> {
    const repository = this.getPackingDetailsRepository();
    let deletedCount = 0;

    for (const detail of packingDetails) {
      const result = await repository.delete({
        company_code: detail.company_code,
        prin_code: detail.prin_code,
        job_no: detail.job_no,
        packdet_no: detail.packdet_no,
      });

      if (result.affected) {
        deletedCount += result.affected;
      }
    }

    return deletedCount;
  }

  // Check if packing detail exists
  static async exists(params: {
    company_code: string;
    prin_code: string;
    job_no: string;
    packdet_no: number;
  }): Promise<boolean> {
    const repository = this.getPackingDetailsRepository();
    const count = await repository.count({
      where: {
        company_code: params.company_code,
        prin_code: params.prin_code,
        job_no: params.job_no,
        packdet_no: params.packdet_no,
      },
    });
    return count > 0;
  }

  // Count packing details with optional filters
  static async count(where?: any): Promise<number> {
    const repository = this.getPackingDetailsRepository();
    return await repository.count(where ? { where } : {});
  }

  // Update receiving details (qty1_arrived and qty2_arrived)
  static async updateReceivingDetails(
    params: {
      company_code: string;
      prin_code: string;
      job_no: string;
      packdet_no: number;
    },
    receivingData: {
      qty1_arrived?: number;
      qty2_arrived?: number;
    }
  ): Promise<boolean> {
    const repository = this.getPackingDetailsRepository();

    const result = await repository.update(
      {
        company_code: params.company_code,
        prin_code: params.prin_code,
        job_no: params.job_no,
        packdet_no: params.packdet_no,
      },
      receivingData
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Update clearance status to 'Y' for specific packing details
  static async updateClearance(
    params: {
      company_code: string;
      prin_code: string;
      job_no: string;
      packdet_no?: number; // Optional - if not provided, updates all matching records
    },
    clearanceData: {
      clearance: string;
      cleared_user?: string;
      cleared_date?: Date;
    }
  ): Promise<number> {
    const repository = this.getPackingDetailsRepository();

    const whereConditions: any = {
      company_code: params.company_code,
      prin_code: params.prin_code,
      job_no: params.job_no,
    };

    // If packdet_no is provided, include it in the where clause
    if (params.packdet_no !== undefined) {
      whereConditions.packdet_no = params.packdet_no;
    }

    const result = await repository.update(whereConditions, clearanceData);

    return result.affected || 0;
  }

  /**
   * Update SELECTED and ALLOCATED flags for a job
   * @param companyCode Company code
   * @param jobNo Job number
   */
  static async updateSelectedForJob(
    companyCode: string,
    jobNo: string
  ): Promise<void> {
    const repository = this.getPackingDetailsRepository();
    
    await repository
      .createQueryBuilder()
      .update()
      .set({
        selected: "Y",
        allocated: "N",
      })
      .where("JOB_NO = :jobNo", { jobNo })
      .andWhere("COMPANY_CODE = :companyCode", { companyCode })
      .execute();
  }
}
