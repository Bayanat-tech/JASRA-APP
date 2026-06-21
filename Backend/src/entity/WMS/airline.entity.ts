import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("MS_AIRLINE")
export class Airline {
  @PrimaryColumn({ name: "COMPANY_CODE", length: 5 })
  companyCode: string;

  @PrimaryColumn({ name: "AIRLINE_CODE", length: 5 })
  airlineCode: string;

  @Column({ name: "AIRLINE_NAME", length: 50, nullable: true })
  airlineName: string;

  @Column({ name: "AIRLINE_NO", length: 25, nullable: true })
  airlineNo: string;

  @Column({ name: "CONTACT_PERSON", length: 50, nullable: true })
  contactPerson: string;

  @Column({ name: "ADDRESS", length: 200, nullable: true })
  address: string;

  @Column({ name: "TEL_NO", length: 20, nullable: true })
  telNo: string;

  @Column({ name: "FAX_NO", length: 20, nullable: true })
  faxNo: string;

  @Column({ name: "EMAIL", length: 25, nullable: true })
  email: string;

  // @Column({ nullable: true })
  // createdBy: string;

  // @Column({ nullable: true })
  // updatedBy: string;

  // @Column({ nullable: true })
  // userDate: Date;

  // @Column({ nullable: true })
  // userId: string;
}
