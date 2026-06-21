import { getRepository } from "../../database/connection";
import { DepartmentMaster } from "../../entity/WMS/department.entity";

export class DepartmentService {
  private static getDepartmentRepository() {
    return getRepository(DepartmentMaster);
  }

  // Check for duplicate department by code and name
  static async findDuplicate(params: {
    company_code: string;
    div_code: string;
    dept_code: string;
  }): Promise<DepartmentMaster | null> {
    const repository = this.getDepartmentRepository();
    return await repository.findOne({
      where: {
        company_code: params.company_code,
        div_code: params.div_code,
        dept_code: params.dept_code,
      },
    });
  }

  // Get all departments
  static async findAll(): Promise<DepartmentMaster[]> {
    const repository = this.getDepartmentRepository();
    return await repository.find();
  }

  // Find department by code
  static async findByCode(
    dept_code: string,
    company_code: string
  ): Promise<DepartmentMaster | null> {
    const repository = this.getDepartmentRepository();
    return await repository.findOne({
      where: { dept_code, company_code },
    });
  }

  // Create new department
  static async createDepartment(deptData: {
    company_code: string;
    div_code: string;
    dept_code: string;
    dept_name: string;
    dept_short_name?: string;
    dept_addr1: string;
    dept_addr2?: string;
    dept_addr3?: string;
    phone?: string;
    fax?: string;
    email?: string;
    dept_head_id?: string;
    remarks?: string;
    status: string;
    user_id?: string;
    user_dt?: Date;
    enterprice_code: string;
  }): Promise<DepartmentMaster> {
    const repository = this.getDepartmentRepository();
    const department = repository.create(deptData);
    return await repository.save(department);
  }

  // Update existing department
  static async updateDepartment(
    dept_code: string,
    company_code: string,
    updateData: Partial<DepartmentMaster>
  ): Promise<boolean> {
    const repository = this.getDepartmentRepository();
    const result = await repository.update(
      { dept_code, company_code },
      updateData
    );
    return result.affected ? result.affected > 0 : false;
  }

  // Delete department
  static async deleteDepartment(
    dept_code: string,
    company_code?: string
  ): Promise<boolean> {
    const repository = this.getDepartmentRepository();
    const whereClause = company_code
      ? { dept_code, company_code }
      : { dept_code };
    const result = await repository.delete(whereClause);
    return result.affected ? result.affected > 0 : false;
  }

  // Check if department exists
  static async checkDepartmentExists(dept_code: string): Promise<boolean> {
    const repository = this.getDepartmentRepository();
    const count = await repository.count({
      where: { dept_code },
    });
    return count > 0;
  }
}
