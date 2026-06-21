export interface ICategorymaster {
    company_code: string;
    category_code: string;
    category_name: string;
    category_short_name?: string;
    remarks?: string;
    status: string;
    updated_at?: Date;
    updated_by?: string;
    created_by: string;
    created_at: Date;
  }
  export interface IKpiNameMaster {
    company_code: string;
    kpi_name: string;
    serial_no: string;
  }
  

  export interface IOperationMaster {
    company_code: string;
    operation_name: string;
    serial_no: number;
  }
  