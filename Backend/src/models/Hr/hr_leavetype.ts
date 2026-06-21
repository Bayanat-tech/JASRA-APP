import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrLeavetype } from "../../interfaces/Hr/hr_leavetype";


/**
 * Represents a Leavetype entity.
 */
@Entity(constants.TABLE.MS_HR_LEAVE_TYPES)
export class Leavetype implements IHrLeavetype {
    /**
     * Company code.
     */
    @Column({ 
        name: "COMPANY_CODE", 
        type: "varchar2", 
        length: 20, 
        nullable: false 
    })
    company_code!: string;

    /**
     * Leave type.
     */
    @PrimaryColumn({ 
        name: "LEAVE_TYPE", 
        type: "varchar2", 
        length: 20, 
        nullable: false 
    })
    leave_type!: string;

    /**
     * Leave type description.
     */
    @Column({ 
        name: "LEAVE_TYPE_DESC", 
        type: "varchar2", 
        length: 50, 
        nullable: false 
    })
    leave_type_desc!: string;

    /**
     * Carry forward flag.
     */
    @Column({ 
        name: "CARRY_FORWARD", 
        type: "varchar2", 
        length: 1, 
        nullable: false 
    })
    carry_forward!: string;

    /**
     * Half day flag.
     */
    @Column({ 
        name: "HALF_DAY", 
        type: "varchar2", 
        length: 1, 
        nullable: false 
    })
    half_day!: string;

    /**
     * Updated at timestamp.
     */
    @UpdateDateColumn({ 
        name: "UPDATED_AT", 
        type: "timestamp",
        nullable: true 
    })
    updated_at!: Date;

    /**
     * Updated by user.
     */
    @Column({ 
        name: "UPDATED_BY", 
        type: "varchar2", 
        length: 50, 
        nullable: true 
    })
    updated_by!: string;

    /**
     * Created by user.
     */
    @Column({ 
        name: "CREATED_BY", 
        type: "varchar2", 
        length: 20, 
        nullable: false 
    })
    created_by!: string;

    /**
     * Created at timestamp.
     */
    @CreateDateColumn({ 
        name: "CREATED_AT", 
        type: "timestamp",
        nullable: false 
    })
    created_at!: Date;
}