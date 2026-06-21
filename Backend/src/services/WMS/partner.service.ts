import { getRepository } from "../../database/connection";
import { BrokerMaster } from "../../entity/WMS/partner.entity";
import { Like, In } from "typeorm";

export class PartnerService {
  private static getBrokerRepository() {
    return getRepository(BrokerMaster);
  }

  // Get partners with pagination
  static async getPartners(
    filters: any,
    page: number = 1,
    limit: number = 100
  ): Promise<{ data: BrokerMaster[]; total: number }> {
    const repository = this.getBrokerRepository();

    // Prepare filter conditions
    const whereConditions: any = {};

    // Apply company_code filter
    if (filters.company_code) {
      whereConditions.company_code = filters.company_code;
    }

    // Apply broker_name filter if provided
    if (filters.broker_name) {
      whereConditions.broker_name = Like(`%${filters.broker_name}%`);
    }

    // Apply broker_code filter if provided
    if (filters.broker_code) {
      whereConditions.broker_code = Like(`%${filters.broker_code}%`);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await repository.count({
      where: whereConditions,
    });

    // Get data with pagination
    const data = await repository.find({
      where: whereConditions,
      skip,
      take: limit,
    });

    return { data, total };
  }

  // Check for duplicate broker by code or name
  static async findDuplicate(params: {
    broker_code: string;
    broker_name?: string;
  }): Promise<BrokerMaster | null> {
    const repository = this.getBrokerRepository();
    return await repository.findOne({
      where: {
        broker_code: params.broker_code,
        broker_name: params.broker_name,
      },
    });
  }

  // Get all brokers
  static async findAll(): Promise<BrokerMaster[]> {
    const repository = this.getBrokerRepository();
    return await repository.find();
  }

  // Find broker by code
  static async findByCode(broker_code: string): Promise<BrokerMaster | null> {
    const repository = this.getBrokerRepository();
    return await repository.findOne({
      where: { broker_code },
    });
  }

  // Find brokers by company
  static async findByCompany(company_code: string): Promise<BrokerMaster[]> {
    const repository = this.getBrokerRepository();
    return await repository.find({
      where: { company_code },
    });
  }

  // Create new broker
  static async createBroker(brokerData: Partial<BrokerMaster>): Promise<BrokerMaster> {
    const repository = this.getBrokerRepository();

    const broker = repository.create({
      ...brokerData,
    });

    return await repository.save(broker);
  }

  // Update existing broker
  static async updateBroker(
    broker_code: string,
    updateData: Partial<BrokerMaster>
  ): Promise<boolean> {
    const repository = this.getBrokerRepository();

    const result = await repository.update(
      { broker_code },
      updateData
    );

    return result.affected ? result.affected > 0 : false;
  }

  // Delete broker
  static async deleteBroker(broker_code: string): Promise<boolean> {
    const repository = this.getBrokerRepository();
    const result = await repository.delete({ broker_code });
    return result.affected ? result.affected > 0 : false;
  }

  // Delete multiple partners
  static async deletePartners(partnerCodes: string[]): Promise<boolean> {
    const repository = this.getBrokerRepository();
    const result = await repository.delete({ broker_code: In(partnerCodes) });
    return result.affected ? result.affected > 0 : false;
  }

  // Check if broker exists
  static async checkBrokerExists(broker_code: string): Promise<boolean> {
    const repository = this.getBrokerRepository();
    const count = await repository.count({
      where: { broker_code },
    });
    return count > 0;
  }
}
