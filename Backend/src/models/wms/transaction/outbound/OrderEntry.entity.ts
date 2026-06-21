import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "VW_TO_ORDER" })
export class OrderEntry {
  @PrimaryGeneratedColumn({ name: "ID", type: "number" })
  id: number;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code: string;

  @Column({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code: string;

  @Column({ name: "JOB_NO", type: "varchar2", length: 10 })
  job_no: string;

  @Column({ name: "CUST_CODE", type: "varchar2", length: 20 })
  cust_code: string;

  @Column({ name: "CUST_NAME", type: "varchar2", length: 20, nullable: true })
  cust_name?: string;

  @Column({ name: "ORDER_NO", type: "varchar2", length: 20 })
  order_no: string;

  @Column({ name: "ORDER_DATE", type: "date" })
  order_date: Date;

  @Column({ name: "ORDER_DUE_DATE", type: "date" })
  order_due_date: Date;

  @Column({ name: "CUST_REFERENCE", type: "varchar2", length: 50, nullable: true })
  cust_reference?: string;

  @Column({ name: "PO_NO", type: "varchar2", length: 50, nullable: true })
  po_no?: string;

  @Column({ name: "PO_DATE", type: "date", nullable: true })
  po_date?: Date;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3 })
  curr_code: string;

  @Column({ name: "EX_RATE", type: "number", precision: 10, scale: 5 })
  ex_rate: number;

  @Column({ name: "EXP_CONTAINER_NO", type: "varchar2", length: 50, nullable: true })
  exp_container_no?: string;

  @Column({ name: "EXP_CONTAINER_SIZE", type: "varchar2", length: 10, nullable: true })
  exp_container_size?: string;

  @Column({ name: "EXP_CONTAINER_TYPE", type: "varchar2", length: 20, nullable: true })
  exp_container_type?: string;

  @Column({ name: "EXP_CONTAINER_SEALNO", type: "varchar2", length: 50, nullable: true })
  exp_container_sealno?: string;

  @Column({ name: "MOC1", type: "varchar2", length: 10, nullable: true })
  moc1?: string;

  @Column({ name: "MOC2", type: "varchar2", length: 10, nullable: true })
  moc2?: string;

  @Column({ name: "ACT_CODE", type: "varchar2", length: 10, nullable: true })
  act_code?: string;

  @Column({ name: "UOC", type: "varchar2", length: 10, nullable: true })
  uoc?: string;

  @Column({ name: "VOLUME", type: "varchar2", length: 20, nullable: true })
  volume?: string;

  @Column({ name: "NET_WEIGHT", type: "varchar2", length: 20, nullable: true })
  net_weight?: string;

  @Column({ name: "ASSIGNED_PDA_USER", type: "varchar2", length: 50, nullable: true })
  assigned_pda_user?: string;

  @Column({ name: "ORDER_SERIAL", type: "varchar2", length: 50, nullable: true })
  order_serial?: string;

  @Column({ name: "REF_TXN_CODE", type: "varchar2", length: 10, nullable: true })
  ref_txn_code?: string;

  @Column({ name: "REF_TXN_DOCNO", type: "varchar2", length: 50, nullable: true })
  ref_txn_docno?: string;

  @Column({ name: "REF_TXN_SLNO", type: "varchar2", length: 10, nullable: true })
  ref_txn_slno?: string;

  @Column({ name: "SO_TXN_CODE", type: "varchar2", length: 10, nullable: true })
  so_txn_code?: string;

  @Column({ name: "DELIVERY_TERM", type: "varchar2", length: 50, nullable: true })
  delivery_term?: string;

  @Column({ name: "SALESMAN_CODE", type: "varchar2", length: 10, nullable: true })
  salesman_code?: string;

  @Column({ name: "RECOLLECTED_FLAG", type: "char", length: 1 })
  recollected_flag: string;

  @Column({ name: "RECOLLECTED_DT", type: "date", nullable: true })
  recollected_dt?: Date;

  @Column({ name: "RECOLLECTED_REMARKS", type: "varchar2", length: 100, nullable: true })
  recollected_remarks?: string;

  @Column({ name: "STUFF_START", type: "date", nullable: true })
  stuff_start?: Date;

  @Column({ name: "STUFF_END", type: "date", nullable: true })
  stuff_end?: Date;

  @Column({ name: "PICK_START", type: "date", nullable: true })
  pick_start?: Date;

  @Column({ name: "PICK_END", type: "date", nullable: true })
  pick_end?: Date;

  @Column({ name: "PACK_START", type: "date", nullable: true })
  pack_start?: Date;

  @Column({ name: "PACK_END", type: "date", nullable: true })
  pack_end?: Date;

  @Column({ name: "LOAD_START", type: "date", nullable: true })
  load_start?: Date;

  @Column({ name: "LOAD_END", type: "date", nullable: true })
  load_end?: Date;

  @Column({ name: "ALLOW_DOC_GEN", type: "varchar2", length: 50, nullable: true })
  allow_doc_gen?: string;

  @Column({ name: "PRE_SO", type: "varchar2", length: 50, nullable: true })
  pre_so?: string;

  @Column({ name: "ASSIGNED_PACK_USER", type: "varchar2", length: 50, nullable: true })
  assigned_pack_user?: string;

  @Column({ name: "ORDER_LOCATION", type: "varchar2", length: 50, nullable: true })
  order_location?: string;

  @Column({ name: "ROUTE_CODE", type: "varchar2", length: 10, nullable: true })
  route_code?: string;

  @Column({ name: "MANIFEST_NO", type: "varchar2", length: 50, nullable: true })
  manifest_no?: string;

  @Column({ name: "VEHICLE_NO", type: "varchar2", length: 20, nullable: true })
  vehicle_no?: string;

  @Column({ name: "ORDER_LOAD_SEQ_NR", type: "varchar2", length: 10, nullable: true })
  order_load_seq_nr?: string;
}
