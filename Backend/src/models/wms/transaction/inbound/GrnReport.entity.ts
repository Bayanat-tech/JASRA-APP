import { Entity, Column } from "typeorm";
import constants from "../../../../helpers/constants";

@Entity({ name: constants.VIEW.VW_WM_INB_GRN })
export class GrnReport {

  @Column({ name: "COMPANY_CODE", type: "varchar2", nullable: true })
  company_code?: string;

  @Column({ name: "COMPANY_NAME", type: "varchar2", nullable: true })
  company_name?: string;

  @Column({ name: "PRIN_CODE", type: "varchar2", nullable: true })
  prin_code?: string;

  @Column({ name: "PRIN_NAME", type: "varchar2", nullable: true })
  prin_name?: string;

  @Column({ name: "JOB_NO", type: "varchar2", nullable: true })
  job_no?: string;

  @Column({ name: "TXN_DATE", type: "date", nullable: true })
  txn_date?: Date;

  @Column({ name: "PROD_CODE", type: "varchar2", nullable: true })
  prod_code?: string;

  @Column({ name: "PROD_NAME", type: "varchar2", nullable: true })
  prod_name?: string;

  @Column({ name: "UPPP", type: "number", nullable: true })
  uppp?: number;

  @Column({ name: "SITE_CODE", type: "varchar2", nullable: true })
  site_code?: string;

  @Column({ name: "QTYPUOM", type: "number", nullable: true })
  qtypuom?: number;

  @Column({ name: "QTYLUOM", type: "number", nullable: true })
  qtyluom?: number;

  @Column({ name: "P_UOM", type: "varchar2", nullable: true })
  p_uom?: string;

  @Column({ name: "L_UOM", type: "varchar2", nullable: true })
  l_uom?: string;

  @Column({ name: "VESSEL_NAME", type: "varchar2", nullable: true })
  vessel_name?: string;

  @Column({ name: "CONTAINER_NO", type: "varchar2", nullable: true })
  container_no?: string;

  @Column({ name: "SEAL_NO", type: "varchar2", nullable: true })
  seal_no?: string;

  @Column({ name: "PO_NO", type: "varchar2", nullable: true })
  po_no?: string;

  @Column({ name: "DOC_REF", type: "varchar2", nullable: true })
  doc_ref?: string;

  @Column({ name: "LOT_NO", type: "varchar2", nullable: true })
  lot_no?: string;

  @Column({ name: "MFG_DATE", type: "date", nullable: true })
  mfg_date?: Date;

  @Column({ name: "EXP_DATE", type: "date", nullable: true })
  exp_date?: Date;

  @Column({ name: "GRN_NO", type: "number", nullable: true })
  grn_no?: number;

  @Column({ name: "GRN_DATE", type: "date", nullable: true })
  grn_date?: Date;

  @Column({ name: "USER_ID", type: "varchar2", nullable: true })
  user_id?: string;

  @Column({ name: "VOLUME", type: "number", nullable: true })
  volume?: number;

  @Column({ name: "NETWT", type: "number", nullable: true })
  netwt?: number;

  @Column({ name: "RECEIPT_DATE", type: "date", nullable: true })
  receipt_date?: Date;

  @Column({ name: "CONTAINER_SIZE", type: "number", nullable: true })
  container_size?: number;

  @Column({ name: "ORIGIN_COUNTRY", type: "varchar2", nullable: true })
  origin_country?: string;

  @Column({ name: "SITE_IND", type: "varchar2", nullable: true })
  site_ind?: string;

  @Column({ name: "BATCH_NO", type: "varchar2", nullable: true })
  batch_no?: string;

  @Column({ name: "GROSSWT", type: "number", nullable: true })
  grosswt?: number;

  @Column({ name: "UNSTUFF_DATE", type: "varchar2", nullable: true })
  unstuff_date?: string;

  @Column({ name: "JOB_CLASS", type: "varchar2", nullable: true })
  job_class?: string;

  @Column({ name: "S_NO", type: "number", nullable: true })
  s_no?: number;

  @Column({ name: "RCPT_TYPE", type: "varchar2", nullable: true })
  rcpt_type?: string;

  @Column({ name: "SEAL_NO1", type: "varchar2", nullable: true })
  seal_no1?: string;

  @Column({ name: "CNT_LOTNO", type: "number", nullable: true })
  cnt_lotno?: number;

  @Column({ name: "PRIN_REF2", type: "varchar2", nullable: true })
  prin_ref2?: string;

  @Column({ name: "GROUP_NAME", type: "varchar2", nullable: true })
  group_name?: string;

  @Column({ name: "QTY", type: "number", nullable: true })
  qty?: number;

  @Column({ name: "JOB_QTYEXPECTED", type: "number", nullable: true })
  job_qtyexpected?: number;

  @Column({ name: "JOB_NO_OF_CSE", type: "number", nullable: true })
  job_no_of_cse?: number;

  @Column({ name: "JOB_QTYLUOM_EXPECTED", type: "number", nullable: true })
  job_qtyluom_expected?: number;

  @Column({ name: "JOB_QTYPUOM_EXPECTED", type: "number", nullable: true })
  job_qtypuom_expected?: number;

  @Column({ name: "NO_OF_CSE", type: "number", nullable: true })
  no_of_cse?: number;

  @Column({ name: "QTYPUOM_EXPECTED", type: "number", nullable: true })
  qtypuom_expected?: number;

  @Column({ name: "QTYLUOM_EXPECTED", type: "number", nullable: true })
  qtyluom_expected?: number;

  @Column({ name: "QTYEXPECTED", type: "number", nullable: true })
  qtyexpected?: number;

  @Column({ name: "QTY_RCVD", type: "number", nullable: true })
  qty_rcvd?: number;

  @Column({ name: "QTYPUOM_DAM", type: "number", nullable: true })
  qtypuom_dam?: number;

  @Column({ name: "QTYLUOM_DAM", type: "number", nullable: true })
  qtyluom_dam?: number;

  @Column({ name: "QTY_DAM", type: "number", nullable: true })
  qty_dam?: number;
}
