// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column } from "typeorm";
// Import constants for table names
import constants from "../../helpers/constants";
// Import the interface for HrPaycomponent
import { IHrPaycomponent } from "../../interfaces/Hr/hr_paycomponents";

// Define the HrPaycomponent entity
@Entity(constants.TABLE.MS_HR_PAY_COMPONENTS)
export class HrPaycomponent implements IHrPaycomponent {
  // Company code attribute
  @Column({ type: "varchar2", name: "COMPANY_CODE", length: 5, nullable: true })
  company_code!: string;

  // Pay component ID attribute (primary key)
  @PrimaryColumn({ type: "varchar2", name: "PAY_COMP_ID", length: 5, nullable: false })
  pay_comp_id!: string;

  // Pay component description attribute
  @Column({ type: "varchar2", name: "PAY_COMP_DESC", length: 50, nullable: true })
  pay_comp_desc!: string;

  // Remarks attribute
  @Column({ type: "varchar2", name: "REMARKS", length: 100, nullable: true })
  remarks!: string;
}