
// import { getRepository } from "../../database/connection";
// import { MSPSFlowRoleMapping } from "../../entity/PurchaseFlow/MSPSFlowRoleMapping .entity";
// import { MSPSRole } from "../../entity/PurchaseFlow/MSPSRole.entity";


// export class FlowRoleService {
//   static async getSentBackRoles(p0: { flowCode: string; }, page: number, limit: number, flowCode: string) {
//     const sentbackrolls = await getRepository(MSPSFlowRoleMapping)
//       .createQueryBuilder("A")
//       .innerJoin(MSPSRole, "B", "A.FLOW_ROLE = B.ROLE_CODE")
//       .select(["B.ROLE_NAME as role_name", "A.FLOW_LEVEL as flow_level"])
//       .where("A.FLOW_CODE = :flowCode", { flowCode })
//       .orderBy("A.FLOW_LEVEL", "DESC")
//       .getRawMany(); 

//     return sentbackrolls;
//   }
// }


import { getRepository } from "../../database/connection";
import { MSPSFlowRoleMapping } from "../../entity/PurchaseFlow/MSPSFlowRoleMapping .entity";
// import { MSPSFlowRoleMapping } from "../../entity/PurchaseFlow/MSPSFlowRoleMapping.entity";
import { MSPSRole } from "../../entity/PurchaseFlow/MSPSRole.entity";

export interface SentBackRole {
  role_name: string;
  flow_level: number;
}

export interface Master<T> {
  fetchedData: T[];
  totalCount: number;
}

export class FlowRoleService {
  static async getSentBackRoles(
    flowCode: string,
    page = 1,
    limit = 4000
  ): Promise<Master<SentBackRole>> {

    const skip = (page - 1) * limit;

    const repo = getRepository(MSPSFlowRoleMapping);

    const query = repo
      .createQueryBuilder("A")
      .innerJoin(MSPSRole, "B", "A.FLOW_ROLE = B.ROLE_CODE")
      .select([
        "B.ROLE_NAME AS role_name",
        "A.FLOW_LEVEL AS flow_level"
      ])
      .where("A.FLOW_CODE = :flowCode", { flowCode })
      .orderBy("A.FLOW_LEVEL", "DESC")
      .skip(skip)
      .take(limit);

    const fetchedData = await query.getRawMany();

    return {
      fetchedData,
      totalCount: fetchedData.length
    };
  }
}
