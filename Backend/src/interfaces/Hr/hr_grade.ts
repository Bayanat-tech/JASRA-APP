export interface IHrGrade {
  company_code: string;
  grade_code: string;
  grade_name: string;
  grade_short_name: string;
  ot_eligibility: string;
  airfare_entitlement: string;
  spouse_af_entitlement: string;
  dep_af_entitlement: string;
  medical_entitlement: string;
  spouse_med_entitlement: string;
  dep_med_entitlement: string;
  remarks: string;
  status: string;
  type: string;
  grade_status: string;
  updated_at?: Date;
  updated_by?: string;
  created_by?: string;
  created_at?: Date;
}
