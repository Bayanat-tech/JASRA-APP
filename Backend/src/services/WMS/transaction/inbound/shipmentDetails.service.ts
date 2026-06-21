import { Repository, DataSource, Like } from "typeorm";
import { TiContainer } from "../../../../entities/wms/transaction/inbound/TiContainer.entity";
import { IShipmentDetails } from "../../../../interfaces/wms/transaction/inbound/shipmentDetails_wms.interface";

export class ShipmentDetailsService {
  private repository: Repository<TiContainer>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(TiContainer);
  }

  async findOne(
    prin_code: string,
    job_no: string,
    company_code: string
  ): Promise<TiContainer | null> {
    return await this.repository.findOne({
      where: {
        prin_code,
        job_no,
        company_code,
      },
    });
  }

  async create(data: Partial<TiContainer>): Promise<TiContainer> {
    const shipment = this.repository.create(data);
    return await this.repository.save(shipment);
  }

  async update(
    prin_code: string,
    job_no: string,
    container_no: string,
    company_code: string,
    data: Partial<TiContainer>
  ): Promise<boolean> {
    const result = await this.repository.update(
      {
        prin_code,
        job_no,
        container_no,
        company_code,
      },
      data
    );
    return result.affected! > 0;
  }

  async delete(
    prin_code: string,
    job_no: string,
    container_no: string,
    company_code: string
  ): Promise<boolean> {
    const result = await this.repository.delete({
      prin_code,
      job_no,
      container_no,
      company_code,
    });
    return result.affected! > 0;
  }

  async bulkCreate(data: Partial<TiContainer>[]): Promise<TiContainer[]> {
    const shipments = this.repository.create(data);
    return await this.repository.save(shipments, { chunk: 100 });
  }

  async findAll(
    company_code: string,
    searchFilter?: any
  ): Promise<TiContainer[]> {
    const where: any = { company_code };

    if (searchFilter && searchFilter.length > 0) {
      const orConditions = searchFilter.map((filter: any) => {
        const condition: any = { company_code };
        Object.keys(filter).forEach((key) => {
          if (filter[key]) {
            condition[key] = Like(`%${filter[key]}%`);
          }
        });
        return condition;
      });
      return await this.repository.find({ where: orConditions });
    }

    return await this.repository.find({ where });
  }

  async findAllWithPagination(
    filters: any,
    page: number,
    limit: number,
    sort?: { field_name: string; desc: boolean }
  ): Promise<{ data: TiContainer[]; total: number }> {
    const where: any = {};

    // Apply company_code filter (required)
    if (filters.company_code) {
      where.company_code = filters.company_code;
    }

    // Apply prin_code filter if provided
    if (filters.prin_code) {
      where.prin_code = filters.prin_code;
    }

    // Apply job_no filter if provided
    if (filters.job_no) {
      where.job_no = filters.job_no;
    }

    // Apply container_no filter if provided
    if (filters.container_no) {
      where.container_no = Like(`%${filters.container_no}%`);
    }

    // Apply vessel_name filter if provided
    if (filters.vessel_name) {
      where.vessel_name = Like(`%${filters.vessel_name}%`);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order options
    const order: any = {};
    if (sort && sort.field_name) {
      order[sort.field_name] = sort.desc ? "DESC" : "ASC";
    } else {
      order.user_dt = "DESC"; // Default sorting
    }

    // Get total count
    const total = await this.repository.count({ where });

    // Get paginated data
    const data = await this.repository.find({
      where,
      skip,
      take: limit,
      order,
    });

    return { data, total };
  }
}
