// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";
import { IOperationMaster } from "../../interfaces/Hr/hr_category_interface";

// Define the OperationMaster entity
@Entity(constants.TABLE.MS_KPI_OPERATION)
export class OperationMaster implements IOperationMaster {
  // Company code attribute
  @Column({ type: "varchar2", name: "COMPANY_CODE", length: 20, nullable: false })
  company_code!: string;

  // Operation name attribute (primary key)
  @PrimaryColumn({ type: "varchar2", name: "OPERATION_NAME", length: 100, nullable: false })
  operation_name!: string;

  // Serial number attribute
  @Column({ type: "number", name: "SERIAL_NO", nullable: false })
  serial_no!: number;
}