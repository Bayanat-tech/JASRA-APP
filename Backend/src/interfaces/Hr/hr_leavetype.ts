// interfaces/Hr/hr_leavetype.ts
export interface IHrLeavetype {
    company_code: string;
    leave_type: string;
    leave_type_desc: string;
    carry_forward: string;
    half_day: string;
    updated_at?: Date | null; 
    updated_by?: string | null;
    created_by: string;
    created_at: Date;
}