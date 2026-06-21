import { getRepository } from "../../database/connection";
import { DropdownProjectmaster } from "../../entity/PurchaseFlow/dropdownprojectmaster.entity";
import { Master } from "./dddivisionMaster.service";


export class DropdownProjectMasterService {
  static async getDropdownProjectMaster(
    company_code: string,
    page = 1,
    limit = 4000
  ): Promise<Master<DropdownProjectmaster>> {
    const skip = (page - 1) * limit;

    const [fetchedData, totalCount] = await getRepository(DropdownProjectmaster).findAndCount({
      where: { company_code },
      skip,
      take: limit,
      select: [
       
        "project_code",
        "project_name",
      ],
    });

    return { fetchedData, totalCount };
  }
}
