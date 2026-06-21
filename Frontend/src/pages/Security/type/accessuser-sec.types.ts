export type TUserSecmodule = {
  serial_no: number;
  level3: string;
  company_code: string;
  app_code: string;
};

export type TUserSecLogin = {
  loginid: string;
  username: string;
  company_code: string;
};

export type TUseroperationmaster = {
  serial_no: number;
  snew: string;
  smodify: string;
  sdelete: string;
  ssave: string;
  ssearch: string;
  ssaveas: string;
  supload: string;
  sundo: string;
  sprint: string;
  sprintsetup: string;
  shelp: string;
  company_code: string;
};

export type TUsersecrollaccessuser = {
  loginid: string;
  serial_no_or_role_id: number;
  snew: string;
  smodify: string;
  sdelete: string;
  ssave: string;
  ssearch: string;
  ssaveas: string;
  supload: string;
  sundo: string;
  sprint: string;
  sprintsetup: string;
  shelp: string;
  company_code: string;
};
