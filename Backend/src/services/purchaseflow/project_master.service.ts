import { getRepository } from "../../database/connection";
import { VProjectMaster } from "../../entity/PurchaseFlow/projectmaster_pf_view.entity";

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class ProjectMasterService {
  static getRepository(company_code: string, page: number, limit: number): { fetchedData: any[]; totalCount: number; } | PromiseLike<{ fetchedData: any[]; totalCount: number; }> {
    throw new Error("Method not implemented.");
  }
  static async getProjectMaster(
    loginid: string,
    page = 1,
    limit = 4000
  ): Promise<Master<VProjectMaster>> {
    const skip = (page - 1) * limit;
    const repository = getRepository(VProjectMaster);

    let fetchedData: VProjectMaster[] = [];
    let totalCount = 0;

   
    if (loginid !== "PRAKASH") {
      [fetchedData, totalCount] = await repository
        .createQueryBuilder("proj")
        .where(
          `proj.project_code IN (
            SELECT project_code 
            FROM MS_PROJECT_USER_ASSIGN 
            WHERE user_id = :loginid
          )`,
          { loginid }
        )
        .skip(skip)
        .take(limit)
        .getManyAndCount();
    } else {
      [fetchedData, totalCount] = await repository
        .createQueryBuilder("proj")
        .skip(skip)
        .take(limit)
        .getManyAndCount();
    }

    return { fetchedData, totalCount };
  }
}
