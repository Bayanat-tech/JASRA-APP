import { getRepository } from "../../../../database/connection";
// import { InboundJobWms } from "../../../../models/wms/transaction/inbound/InboundJobWms.entity";
import {InboundJobWms} from "../../../../entities/wms/transaction/inbound/InboundJobWms.entity"
import { PackingDetailsInboundWms } from "../../../../entity/WMS/transaction/inbound/PackingDetailsInboundWms.entity";
import { IJobInboundWms } from "../../../../interfaces/wms/transaction/inbound/inboundJobWms.interface";
import { FindManyOptions } from "typeorm";
import {TiTallyDetail} from "../../../../entity/WMS/TiTallyDetail.entity"

export class InboundJobWmsService {
  async getTallyProductData(prin_code: string, job_no: string, container_no: string) {
    try {
      const repository = getRepository(PackingDetailsInboundWms);
      
      // Build where conditions
      const whereConditions: any = {
        prin_code: prin_code,
        job_no: job_no,
      };
      
      // Add container_no filter if provided
      if (container_no) {
        whereConditions.container_no = container_no;
      }
      
      // Query the packing details for tally data
      const tallyData = await repository.find({
        where: whereConditions,
        order: {
          packdet_no: "ASC"
        }
      });
      
      return tallyData;
    } catch (error: any) {
      console.error("Error fetching tally product data:", error);
      throw new Error(`Failed to fetch tally product data: ${error.message}`);
    }
  }
  
  private static getInboundJobRepository() {
    return getRepository(InboundJobWms);
  }

  // Find a single inbound job by composite key
  static async findOne(params: {
    company_code: string;
    prin_code: string;
    job_no: string;
  }): Promise<InboundJobWms | null> {
    const repository = this.getInboundJobRepository();
    return await repository.findOne({
      where: {
        company_code: params.company_code,
        prin_code: params.prin_code,
        job_no: params.job_no,
      },
    });
  }

  // Find all inbound jobs with optional filters
  static async findAll(
    options?: FindManyOptions<InboundJobWms>
  ): Promise<InboundJobWms[]> {
    const repository = this.getInboundJobRepository();
    return await repository.find(options);
  }

  // Find inbound jobs by company code
  static async findByCompanyCode(
    company_code: string
  ): Promise<InboundJobWms[]> {
    const repository = this.getInboundJobRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Find inbound jobs with search filters
  static async findWithFilters(
    whereConditions: any
  ): Promise<InboundJobWms[]> {
    const repository = this.getInboundJobRepository();
    return await repository.find({
      where: whereConditions,
    });
  }

  // Create a new inbound job
  static async create(
    inboundJobData: Partial<IJobInboundWms>
  ): Promise<InboundJobWms> {
    const repository = this.getInboundJobRepository();

    const inboundJob = repository.create({
      ...inboundJobData,
    });

    return await repository.save(inboundJob);
  }

  // Update an inbound job
  static async update(
    params: {
      company_code: string;
      prin_code: string;
      job_no: string;
    },
    updateData: Partial<IJobInboundWms>
  ): Promise<InboundJobWms | null> {
    const repository = this.getInboundJobRepository();

    await repository.update(
      {
        company_code: params.company_code,
        prin_code: params.prin_code,
        job_no: params.job_no,
      },
      {
        ...updateData,
      }
    );

    // Return the updated record
    return await this.findOne(params);
  }

  // Delete an inbound job
  static async delete(params: {
    company_code: string;
    prin_code: string;
    job_no: string;
  }): Promise<boolean> {
    const repository = this.getInboundJobRepository();

    const result = await repository.delete({
      company_code: params.company_code,
      prin_code: params.prin_code,
      job_no: params.job_no,
    });

    return (result.affected ?? 0) > 0;
  }

  // Count inbound jobs with optional filters
  static async count(whereConditions?: any): Promise<number> {
    const repository = this.getInboundJobRepository();
    return await repository.count({
      where: whereConditions,
    });
  }
  // Cancel an inbound job
static async cancel(
  params: {
    company_code: string;
    prin_code: string;
    job_no: string;
  },
  updated_by: string
): Promise<InboundJobWms | null> {
  const repository = this.getInboundJobRepository();

  await repository.update(
    {
      company_code: params.company_code,
      prin_code: params.prin_code,
      job_no: params.job_no,
    },
    {
      canceled: 'Y',
      updated_by: updated_by,
      updated_at: new Date(),
    }
  );

  // Return the updated record
  return await this.findOne(params);
}
}
