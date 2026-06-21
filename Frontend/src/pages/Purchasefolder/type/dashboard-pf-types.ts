export interface TDashboardBasic {
  PR_COUNT: number;
  PR_PENDING: number;
  PR_REJECTED: number;
  PR_CANCEL: number;
  PR_APPROVED: number;
  PO_PENDING_COUNT: number;
  PO_COUNT: number;
}

export interface TPoDivCount {
  DIVISION_NAME: string;
  PO_COUNT: number;
}
export interface TPrDivCount {
  DIVISION_NAME: string;
   PR_DIV_COUNT: number;
}

export interface TPoCostCentre {
  COST_NAME: string;
  BUDGETED_AMT: number;
  PO_COST_CENTRE: number;
}

export interface TPOServiceType {
  SERVICE_TYPE: string;
  TOTAL_PO_AMOUNT: number;
}
export interface TPRServiceType {
  SERVICE_TYPE: string;
  TOTAL_PO_AMOUNT: number;
}

export interface TMonthwisePO {
  PO_YEAR: number;
  PO_MONTH: number;
  PO_AMOUNT: number;
}

export interface TDashboardData {
  Dashboardbasicdata: TDashboardBasic;
  VW_DB_PO_DIV_COUNTdata: TPoDivCount[];
  PO_COST_CENTREdata: TPoCostCentre[];
  VW_DB_POSERVICE_TYPEdata: TPOServiceType[];
  VW_MONTHWISE_POdata: TMonthwisePO[];
  VW_DB_PR_DIV_COUNTdata: TPrDivCount[];
  VW_DB_PRSERVICE_TYPEdata: TPRServiceType[];
}