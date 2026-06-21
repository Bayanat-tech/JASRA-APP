export type TProfitAndLoss = {
  div_code: string;
  date_from: Date;
  date_to: Date;
};
export type TProfitAndLossReport = {
  products: TProfitLossProducts[];
};
type TProfitLossProducts = {
  h_code: string;
  lcur_amount: string;
  h_name: string;
  isHeading: true;
  isTotal: true;
  plGrandTotal: true;
  pl_code: string;
  pl_name: string;
  s_order: number;
};