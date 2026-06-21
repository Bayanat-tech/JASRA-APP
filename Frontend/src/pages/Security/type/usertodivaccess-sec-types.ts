export type Tuser = {
  user_id: string;
  username: string;
  company_code: string;
};

export type Tdivisionaccess = {
  div_code: string;
  div_name: string;
  company_code: string;
};

export type Idivsionassigned = {
  div_code: string;
  user_id: string;
};

export type TAssigneddivision = {
  div_code: string;
  div_name: string;
};
