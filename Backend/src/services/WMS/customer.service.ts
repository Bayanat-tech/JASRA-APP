import { Like, Repository } from "typeorm";
import { CustomerMaster } from "../../entity/WMS/Customer.entity";
import { AppDataSource } from "../../database/connection";

// export class CustomerService {

 export class CustomerService {
  private static getRepository(): Repository<CustomerMaster> {
    return AppDataSource.getRepository(CustomerMaster);
  }

 //Get Customers Master
  static async getCustomers(
    filters: any,
    page: number,
    limit: number
  ) {
    const repository: Repository<CustomerMaster> =
      AppDataSource.getRepository(CustomerMaster);

    const where: any = {
      company_code: filters.company_code,
    };

    const [data, total] = await repository.findAndCount({
      where,
      order: {
        cust_name: "ASC",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
    
 // CREATE CUSTOMER 

  static async createCustomer(data: any) {
    const repo = this.getRepository();

    const exists = await repo.findOne({
      where: {
        company_code: data.company_code,
        cust_code: data.cust_code
      }
    });

    if (exists) {
      return {
        success: false,
        message: 'Customer Code Already Exists'
      };
    }

    const customer = repo.create({
      ...data,
    });

    const saved = await repo.save(customer);

    return {
      success: true,
      message: 'Customer details added successfully',
      data: saved
    };
  }

  // UPDATE CUSTOMER 
  static async updateCustomer(
    company_code: string,
    cust_code: string,
    updateData: any
  ) {
    const repo = this.getRepository();

    const existing = await repo.findOne({
      where: { company_code, cust_code }
    });

    if (!existing) {
      return {
        success: false,
        message: 'Customer Code Does Not Exist'
      };
    }

    await repo.update(
      { company_code, cust_code },
      {
        ...updateData,
      }
    );

    return {
      success: true,
      message: 'Customer updated successfully'
    };
  }
}


