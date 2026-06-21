import { Repository } from "typeorm";

import { AppDataSource } from "../../database/connection"; 
import { PRRejected } from "../../models/Purchaseflow/purchaserequest_pf.model";

export interface FetchResult<T> {
  fetchedData: T[];
  totalCount: number;
}

export interface FilterOptions {
  search?: any;
  sort?: { field_name: string; desc: boolean };
}

export interface PaginationOptions {
  skip?: number;
  take?: number;
}

export class PRRejectedService {
  static getRequestRejectedData(company_code: string, page: number, limit: number): { fetchedData: any[]; totalCount: number; } | PromiseLike<{ fetchedData: any[]; totalCount: number; }> {
    throw new Error("Method not implemented.");
  }
  private static getRepository(): Repository<PRRejected> {
    return AppDataSource.getRepository(PRRejected);
  }

  static async getCancelledRequests(
    company_code: string,
    loginid: string,
    filter: FilterOptions = {},
    paginationOptions: PaginationOptions = { skip: 0, take: 20 }
  ): Promise<FetchResult<PRRejected>> {
    const repository = this.getRepository();

    // Build base query
    const queryBuilder = repository.createQueryBuilder("pr");

    queryBuilder
      .where("pr.company_code = :company_code", { company_code })
      .andWhere("pr.created_by = :loginid", { loginid })
      .andWhere("pr.last_action = :last_action", { last_action: "CANCEL" });

    // Apply search filters dynamically
    if (filter?.search) {
      for (const [field, value] of Object.entries(filter.search)) {
        queryBuilder.andWhere(`pr.${field} LIKE :${field}`, {
          [field]: `%${value}%`,
        });
      }
    }

    // Apply sorting if provided
    if (filter?.sort && filter.sort.field_name) {
      queryBuilder.orderBy(
        `pr.${filter.sort.field_name}`,
        filter.sort.desc ? "DESC" : "ASC"
      );
    }

    // Apply pagination
    if (paginationOptions.skip !== undefined) {
      queryBuilder.skip(paginationOptions.skip);
    }
    if (paginationOptions.take !== undefined) {
      queryBuilder.take(paginationOptions.take);
    }

    // Execute query
    const [fetchedData, totalCount] = await queryBuilder.getManyAndCount();

    return { fetchedData, totalCount };
  }
}
