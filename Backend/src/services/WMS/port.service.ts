import { getRepository } from "../../database/connection";
import { PortMaster } from "../../entity/WMS/port.entity";
import { In } from "typeorm";

export class PortService {
  private static getPortMasterRepository() {
    return getRepository(PortMaster);
  }

  static async findByDescriptionAndCompany(
    port_name: string,
    company_code: string
  ): Promise<PortMaster | null> {
    const repository = this.getPortMasterRepository();
    return await repository.findOne({
      where: { port_name, company_code },
    });
  }

  static async findByPortCodeAndCompany(
    port_code: string,
    company_code: string
  ): Promise<PortMaster | null> {
    const repository = this.getPortMasterRepository();
    return await repository.findOne({
      where: { port_code, company_code },
    });
  }

  static async createPort(portData: {
    port_name: string;
    company_code: string;
    created_by: string;
    updated_by: string;
    trp_mode?: string;
    country_code: string;
    port_code?: string; // <-- Allow custom port_code
  }): Promise<PortMaster> {
    const repository = this.getPortMasterRepository();

    // Use provided port_code or generate a new one
    let portCode = portData.port_code;
    
    if (!portCode) {
      // Generate port_code (customize logic if needed)
      const maxPortCode = await repository
        .createQueryBuilder("portMaster")
        .select("MAX(portMaster.port_code)", "max")
        .getRawOne();

      portCode = "P0001";
      if (maxPortCode?.max) {
        const currentMax = parseInt(maxPortCode.max.replace("P", ""));
        portCode = `P${(currentMax + 1).toString().padStart(4, "0")}`;
      }
    }

    const port = repository.create({
      ...portData,
      port_code: portCode,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await repository.save(port);
  }

  static async updatePort(
    port_code: string,
    company_code: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getPortMasterRepository();

    console.log("updatePort - Updating port:", { port_code, company_code, updateData });

    const result = await repository.update(
      { port_code, company_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    console.log("updatePort - Update result:", result);
    return result.affected ? result.affected > 0 : false;
  }

  static async deletePorts(port_codes: string[]): Promise<boolean> {
    const repository = this.getPortMasterRepository();

    const result = await repository.delete({
      port_code: In(port_codes),
    });

    return result.affected ? result.affected > 0 : false;
  }

  static async checkPortExists(
    port_code: string,
    company_code: string
  ): Promise<boolean> {
    const repository = this.getPortMasterRepository();
    const count = await repository.count({
      where: { port_code, company_code },
    });
    return count > 0;
  }

  static async getPorts(
    filters: any,
    page: number,
    limit: number
  ): Promise<{ data: PortMaster[]; total: number }> {
    const repository = this.getPortMasterRepository();

    console.log("PortService.getPorts filters:", filters); // Debug log

    // Build query with proper filtering
    const queryBuilder = repository.createQueryBuilder("port");

    // Apply company_code filter (required)
    if (filters.company_code) {
      queryBuilder.andWhere("port.company_code = :company_code", {
        company_code: filters.company_code,
      });
    } else {
      // If no company_code is provided, return empty result
      return { data: [], total: 0 };
    }

    // Apply optional filters only if they have valid, non-empty values
    if (filters.port_code && typeof filters.port_code === 'string' && filters.port_code.trim() !== '') {
      queryBuilder.andWhere("port.port_code LIKE :port_code", {
        port_code: `%${filters.port_code}%`,
      });
    }

    if (filters.port_name && typeof filters.port_name === 'string' && filters.port_name.trim() !== '') {
      queryBuilder.andWhere("port.port_name LIKE :port_name", {
        port_name: `%${filters.port_name}%`,
      });
    }

    if (filters.country_code && typeof filters.country_code === 'string' && filters.country_code.trim() !== '') {
      queryBuilder.andWhere("port.country_code = :country_code", {
        country_code: filters.country_code,
      });
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();
    console.log("PortService total count:", total); // Debug log

    // Apply ordering
    queryBuilder.orderBy("port.port_code", "ASC");

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Execute query
    const data = await queryBuilder.getMany();
    console.log("PortService data count:", data.length); // Debug log

    return { data, total };
  }

  static async updatePortSmart(
    port_code: string,
    company_code: string,
    updateData: any
  ): Promise<boolean> {
    const repository = this.getPortMasterRepository();

    console.log("updatePortSmart - Attempting update:", { port_code, company_code, updateData });

    // Try to find port by the provided port_code first
    let existingPort = await repository.findOne({
      where: { port_code, company_code },
    });

    // If not found, try to find by port_name (in case user changed port_code)
    if (!existingPort && updateData.port_name) {
      existingPort = await repository.findOne({
        where: { port_name: updateData.port_name, company_code },
      });
      console.log("updatePortSmart - Found by port_name:", existingPort);
    }

    if (!existingPort) {
      console.log("updatePortSmart - Port not found");
      return false;
    }

    // Update using the actual port_code from database
    const result = await repository.update(
      { port_code: existingPort.port_code, company_code },
      {
        ...updateData,
        updated_at: new Date(),
      }
    );

    console.log("updatePortSmart - Update result:", result);
    return result.affected ? result.affected > 0 : false;
  }
}
