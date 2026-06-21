/**
 * Import necessary modules from TypeORM.
 */
import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";
import { IHrDesignation } from "../../interfaces/Hr/hr_designation";

/**
 * Define the HrDesignation entity.
 */
@Entity(constants.TABLE.MS_HR_DESIGNATION)
export class HrDesignation implements IHrDesignation {
  /**
   * Company code attribute.
   */
  @Column("varchar2", { 
    name: "COMPANY_CODE", 
    length: 5, 
    nullable: true 
  })
  company_code!: string;

  /**
   * Designation code attribute (primary key).
   */
  @PrimaryColumn("varchar2", { 
    name: "DESG_CODE", 
    length: 5, 
  })
  desg_code!: string;

  /**
   * Designation name attribute.
   */
  @Column("varchar2", { 
    name: "DESG_NAME", 
    length: 50, 
    nullable: true 
  })
  desg_name!: string;

  /**
   * Designation short name attribute.
   */
  @Column("varchar2", { 
    name: "DESG_SHORT_NAME", 
    length: 10, 
    nullable: true 
  })
  desg_short_name!: string;

  /**
   * Remarks attribute.
   */
  @Column("varchar2", { 
    name: "REMARKS", 
    length: 100, 
    nullable: true 
  })
  remarks!: string;

  /**
   * Status attribute.
   */
  @Column("varchar2", { 
    name: "STATUS", 
    length: 1, 
    nullable: true 
  })
  status!: string;
}