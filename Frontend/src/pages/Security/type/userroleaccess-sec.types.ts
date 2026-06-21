export type TuserRoleaccess = {
  user_id: string;
  user_role: string;
  role_name: string;
};

export type TUserRoleAssigned = {
  user_id: string;
  user_role: string;
  company_code: string;
};

export type TUsers = {
  user_id: string;
  username: string;
};

export type TAssignedrole = {
  user_role: string;
  role_name: string;
  company_code: string;
};
