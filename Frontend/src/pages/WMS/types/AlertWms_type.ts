export type TAlert = {
    company_code: string;
    op_code: string;
    op_type: string;
    op_desc: string;
    op_sequence: string;
    op_module?: string | null;
    op_mode?: string | null;
    instruction: 'Y' | 'N';
    updated_at?: Date;
    updated_by?: string | null;
    created_by?: string | null;
    created_at?: Date;
  };
  