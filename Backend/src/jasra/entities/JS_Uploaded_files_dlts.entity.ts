import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("UPLOADED_FILES_DLTS_LMS")
export class JSUploadfilesdltslms{

    @PrimaryColumn({name:"REQUEST_NUMBER",type:"varchar"})
    REQUEST_NUMBER?: string;

    @PrimaryColumn({name:"SR_NO",type:"decimal"})
    SR_NO?: number;

    @Column({name:"ORG_FILE_NAME",type:"varchar",nullable: true })
    ORG_FILE_NAME?: string;

    @Column({name:"AWS_FILE_LOCN",type:"varchar",nullable: true })
    AWS_FILE_LOCN?: string;

    @Column({name:"EXTENSIONS",type:"varchar",nullable: true })
    EXTENSIONS?: string;

    @Column({name:"USER_FILE_NAME",type:"varchar", nullable: true })
    USER_FILE_NAME?: string;
};
