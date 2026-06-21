// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { ICategorymaster } from "../../interfaces/Hr/hr_category_interface";

// Define the Categorymaster entity
@Entity(constants.TABLE.MS_HR_CATEGORY)
export class Categorymaster implements ICategorymaster {
    // Company code attribute
    @Column({ 
        name: "COMPANY_CODE", 
        type: "varchar2", 
        length: 20, 
        nullable: false 
    })
    company_code!: string;

    // Category code attribute (primary key)
    @PrimaryColumn({ 
        name: "CATEGORY_CODE", 
        type: "varchar2", 
        length: 20, 
        nullable: false 
    })
    category_code!: string;

    // Category name attribute
    @Column({ 
        name: "CATEGORY_NAME", 
        type: "varchar2", 
        length: 50, 
        nullable: false 
    })
    category_name!: string;

    // Category short name attribute
    @Column({ 
        name: "CATEGORY_SHORT_NAME", 
        type: "varchar2", 
        length: 10, 
        nullable: true 
    })
    category_short_name!: string;

    // Remarks attribute
    @Column({ 
        name: "REMARKS", 
        type: "varchar2", 
        length: 100, 
        nullable: true 
    })
    remarks!: string;

    // Status attribute
    @Column({ 
        name: "STATUS", 
        type: "char", 
        length: 1, 
        nullable: false 
    })
    status!: string;

    // Updated at attribute (timestamp)
    @UpdateDateColumn({ 
        name: "UPDATED_AT", 
        type: "timestamp",
        nullable: true 
    })
    updated_at!: Date;

    // Updated by attribute
    @Column({ 
        name: "UPDATED_BY", 
        type: "varchar2", 
        length: 50, 
        nullable: true 
    })
    updated_by!: string;

    // Created by attribute
    @Column({ 
        name: "CREATED_BY", 
        type: "varchar2", 
        length: 20, 
        nullable: false 
    })
    created_by!: string;

    // Created at attribute (timestamp)
    @CreateDateColumn({ 
        name: "CREATED_AT", 
        type: "timestamp",
        nullable: false 
    })
    created_at!: Date;
}