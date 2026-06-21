// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column } from "typeorm";

// Import constants and interface for KPI Name Master
import constants from "../../helpers/constants";
import { IKpiNameMaster } from "../../interfaces/Hr/hr_category_interface";

// Define the KpiNamemaster entity
@Entity(constants.TABLE.MS_KPI_NAME)
export class KpiNamemaster implements IKpiNameMaster {
  // Company code attribute
  @Column({ type: "varchar2", name: "COMPANY_CODE", length: 20, nullable: false })
  company_code!: string;

  // KPI name attribute (primary key)
  @PrimaryColumn({ type: "varchar2", name: "KPI_NAME", length: 20, nullable: false })
  kpi_name!: string;

  // Serial number attribute
  @Column({ type: "number", name: "SERIAL_NO", nullable: false })
  serial_no!: string;
}