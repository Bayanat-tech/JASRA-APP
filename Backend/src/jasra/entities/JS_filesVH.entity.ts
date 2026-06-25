// import {
//   Entity,
//   Column,
//   PrimaryColumn,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from "typeorm";

// @Entity("JS_UPLOADED_FILES_DLTS_VH")
// export class JSFilesVHEntity {
//   @Column({ name: "COMPANY_CODE", length: 7, nullable: true })
//   companyCode: string;

//   @Column({ name: "REQUEST_NUMBER", length: 25, nullable: true })
//   requestNumber: string;

//   @PrimaryColumn({ name: "SR_NO", type: "number", precision: 10 })
//   srNo: number;

//   @Column({ name: "FILE_NAME", length: 180, nullable: true })
//   fileName: string;

//   @Column({ name: "ORG_FILE_NAME", length: 400, nullable: true })
//   orgFileName: string;

//   @Column({ name: "AWS_FILE_LOCN", length: 500, nullable: true })
//   awsFileLocn: string;

//   @Column({ name: "FLOW_LEVEL", type: "number", precision: 3, nullable: true })
//   flowLevel: number;

//   @Column({ name: "MODULES", length: 50, nullable: true })
//   modules: string;

//   @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp", precision: 6 })
//   updatedAt: Date;

//   @Column({ name: "UPDATED_BY", length: 50, nullable: true })
//   updatedBy: string;

//   @Column({ name: "CREATED_BY", length: 20, nullable: true })
//   createdBy: string;

//   @CreateDateColumn({ name: "CREATED_AT", type: "timestamp", precision: 6 })
//   createdAt: Date;

//   @Column({ name: "EXTENSIONS", length: 5, nullable: true })
//   extensions: string;

//   @Column({ name: "USER_FILE_NAME", length: 75, nullable: true })
//   userFileName: string;

//   @Column({ name: "TYPE", length: 100, nullable: true })
//   type: string;

//   @Column({ name: "FILE_TRANSFER", length: 10, nullable: true })
//   fileTransfer: string;
// }
