export type FetchPOListingData = {
  request_number: string;
  company_code: string;
  po_number: string;
  po_date: Date | string;
  status: string;
  supplier: string;
  total_amount?: number;
  [key: string]: unknown;
};
