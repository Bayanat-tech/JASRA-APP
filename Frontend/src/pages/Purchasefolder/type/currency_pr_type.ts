export interface IddCurrency {
    curr_code: string; // Unique code, max length: 5
    curr_name: string; // Supplier name, max length: 50
    ex_rate: number;
    company_code: string; // Associated company code, max length: 10
    created_at?: Date; // Auto-generated creation timestamp
    created_by?: string; // User who created the record
    updated_at?: Date; // Auto-generated update timestamp
    updated_by?: string; // User who last updated the record
  }

    export interface CurrencyListResponse {
      tableData: IddCurrency[];
      count: number;
    }