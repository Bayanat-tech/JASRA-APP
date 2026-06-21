export type IResponse = {
  data: {
    data?: any;
    success: boolean;
  };
};
export type TResponseWithPermissions = {
  data: { users_permissions: any; permissions: any };
  success: boolean;
  error?: any;
};
export type IApiResponse<T> = {
  message: string;
  success: any;
  status: number;
  data: {
    status: number;
    success: boolean;
    data?: T;
    message?: string;
  };
};

export type TMasterWGetResponse<T> = {
  tableData: T[];
  count: number;
};
