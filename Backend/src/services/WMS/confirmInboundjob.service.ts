import { getRepository } from "../../database/connection";
import { ConfirmInboundjob } from "../../entity/WMS/confirmInboundjob.entity";

export class ConfirmInboundjobService {
  private static getConfirmInboundjobRepository() {
    return getRepository(ConfirmInboundjob);
  }

  /**
   * Find a confirm inbound job by prin_code, job_no and company_code
   */
  static async findByJobNo(
    prinCode: string,
    jobNo: string,
    companyCode: string
  ): Promise<ConfirmInboundjob | null> {
    const repository = this.getConfirmInboundjobRepository();
    return await repository.findOne({
      where: { 
        prinCode, 
        jobNo, 
        companyCode 
      },
    });
  }

  /**
   * Find all confirm inbound jobs by company code and optional filters
   */
  static async findAll(
    companyCode: string,
    filters?: {
      prinCode?: string;
      jobNo?: string;
      prodCode?: string;
      siteCode?: string;
      selected?: string;
      confirmed?: string;
    }
  ): Promise<ConfirmInboundjob[]> {
    const repository = this.getConfirmInboundjobRepository();
    const queryBuilder = repository.createQueryBuilder("confirmJob");

    queryBuilder.where("confirmJob.companyCode = :companyCode", { companyCode });

    if (filters) {
      if (filters.prinCode) {
        queryBuilder.andWhere("confirmJob.prinCode = :prinCode", {
          prinCode: filters.prinCode,
        });
      }
      if (filters.jobNo) {
        queryBuilder.andWhere("confirmJob.jobNo = :jobNo", {
          jobNo: filters.jobNo,
        });
      }
      if (filters.prodCode) {
        queryBuilder.andWhere("confirmJob.prodCode = :prodCode", {
          prodCode: filters.prodCode,
        });
      }
      if (filters.siteCode) {
        queryBuilder.andWhere("confirmJob.siteCode = :siteCode", {
          siteCode: filters.siteCode,
        });
      }
      if (filters.selected) {
        queryBuilder.andWhere("confirmJob.selected = :selected", {
          selected: filters.selected,
        });
      }
      if (filters.confirmed) {
        queryBuilder.andWhere("confirmJob.confirmed = :confirmed", {
          confirmed: filters.confirmed,
        });
      }
    }

    return await queryBuilder.getMany();
  }

  /**
   * Find confirm inbound jobs by packdet numbers
   */
  static async findByPackdetNos(
    companyCode: string,
    prinCode: string,
    jobNo: string,
    packdetNos: number[]
  ): Promise<ConfirmInboundjob[]> {
    const repository = this.getConfirmInboundjobRepository();
    const queryBuilder = repository.createQueryBuilder("confirmJob");

    queryBuilder
      .where("confirmJob.companyCode = :companyCode", { companyCode })
      .andWhere("confirmJob.prinCode = :prinCode", { prinCode })
      .andWhere("confirmJob.jobNo = :jobNo", { jobNo })
      .andWhere("confirmJob.packdetNo IN (:...packdetNos)", { packdetNos });

    return await queryBuilder.getMany();
  }

  /**
   * Get paginated confirm inbound jobs
   */
  static async getPaginated(
    companyCode: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      prinCode?: string;
      jobNo?: string;
      prodCode?: string;
      siteCode?: string;
      selected?: string;
      confirmed?: string;
    }
  ): Promise<{ data: ConfirmInboundjob[]; total: number; page: number; totalPages: number }> {
    const repository = this.getConfirmInboundjobRepository();
    const queryBuilder = repository.createQueryBuilder("confirmJob");

    queryBuilder.where("confirmJob.companyCode = :companyCode", { companyCode });

    if (filters) {
      if (filters.prinCode) {
        queryBuilder.andWhere("confirmJob.prinCode = :prinCode", {
          prinCode: filters.prinCode,
        });
      }
      if (filters.jobNo) {
        queryBuilder.andWhere("confirmJob.jobNo = :jobNo", {
          jobNo: filters.jobNo,
        });
      }
      if (filters.prodCode) {
        queryBuilder.andWhere("confirmJob.prodCode = :prodCode", {
          prodCode: filters.prodCode,
        });
      }
      if (filters.siteCode) {
        queryBuilder.andWhere("confirmJob.siteCode = :siteCode", {
          siteCode: filters.siteCode,
        });
      }
      if (filters.selected) {
        queryBuilder.andWhere("confirmJob.selected = :selected", {
          selected: filters.selected,
        });
      }
      if (filters.confirmed) {
        queryBuilder.andWhere("confirmJob.confirmed = :confirmed", {
          confirmed: filters.confirmed,
        });
      }
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Check if a confirm inbound job exists
   */
  static async exists(
    prinCode: string,
    jobNo: string,
    companyCode: string
  ): Promise<boolean> {
    const repository = this.getConfirmInboundjobRepository();
    const count = await repository.count({
      where: { 
        prinCode, 
        jobNo, 
        companyCode 
      },
    });
    return count > 0;
  }

  /**
   * Find all jobs by principal code
   */
  static async findByPrincipalCode(
    prinCode: string,
    companyCode: string
  ): Promise<ConfirmInboundjob[]> {
    const repository = this.getConfirmInboundjobRepository();
    return await repository.find({
      where: { 
        prinCode, 
        companyCode 
      },
    });
  }

  /**
   * Get summary of confirm jobs grouped by status
   */
  static async getStatusSummary(
    companyCode: string,
    prinCode?: string
  ): Promise<{ selected: number; confirmed: number; pending: number }> {
    const repository = this.getConfirmInboundjobRepository();
    const queryBuilder = repository.createQueryBuilder("confirmJob");

    queryBuilder.where("confirmJob.companyCode = :companyCode", { companyCode });

    if (prinCode) {
      queryBuilder.andWhere("confirmJob.prinCode = :prinCode", { prinCode });
    }

    const allJobs = await queryBuilder.getMany();

    const selected = allJobs.filter(job => job.selected === 'Y').length;
    const confirmed = allJobs.filter(job => job.confirmed === 'Y').length;
    const pending = allJobs.length - confirmed;

    return { selected, confirmed, pending };
  }
}
