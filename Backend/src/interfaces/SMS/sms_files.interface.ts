export interface ISmsFiles {
    sr_no: number;
    company_code: string;
    module: string;
    file_name: string;
    org_file_name: string;
    extension: string; 
    aws_file_location: string;
    updated_at?: Date;
    created_at?: Date;
    updated_by?: string;
    created_by?: string;
}