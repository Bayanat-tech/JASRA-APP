import { getRepository } from "../../database/connection"; 
import { MSPSFlowRoleMapping } from "../../entity/PurchaseFlow/MSPSFlowRoleMapping .entity";


export interface SentBackRole {
  role_name: string;
  flow_level: number;
}

export class WorkflowService {
  static async getSentBackRoles(): Promise<SentBackRole[]> {
    const query = `
      SELECT B.ROLE_NAME as role_name, A.FLOW_LEVEL as flow_level
      FROM MS_PS_FLOW_ROLE_MAPPING A
      JOIN MS_PS_ROLE B ON A.FLOW_ROLE = B.ROLE_CODE
      WHERE A.FLOW_CODE = '002'
      ORDER BY A.FLOW_LEVEL DESC
    `;

    
    const sentbackrolls: SentBackRole[] = await getRepository(MSPSFlowRoleMapping).query(query);

    return sentbackrolls;
  }
}
