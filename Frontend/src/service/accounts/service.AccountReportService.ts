import { ISearch } from 'components/filters/SearchFilter';
import dayjs from 'dayjs';
import { TAccountDetailsAccounts, TGroupDetailAccounts } from 'pages/accounts/reports/ageing/types/PeriodWiseAccounts.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class Accounts {
  getAccount = async (app_code: string, master: string) => {
    try {
      const response: IApiResponse<TAccountDetailsAccounts[]> = await axiosServices.get(`api/${app_code}/${master}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
    }
  };
  getGroup = async (app_code: string, master: string) => {
    try {
      const response: IApiResponse<TGroupDetailAccounts[]> = await axiosServices.get(`api/${app_code}/${master}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
    }
  };
  getPeriodWiseReport = async ({
    filterValue,
    date_to,
    age_1,
    age_2,
    age_3,
    age_4,
    age_5,
    age_6,
    ac_code,
    l4_code,
    div_code
  }: {
    filterValue?: ISearch;
    age_1: number;
    age_2: number;
    age_3: number;
    age_4: number;
    age_5: number;
    age_6: number;
    ac_code: string[];
    l4_code: string[];
    div_code: string;
    date_to: Date;
  }) => {
    try {
      const response: IApiResponse<unknown> = await axiosServices.get(`api/accounts/period-wise`, {
        params: {
          ...{ age_1: age_1 },
          ...{ age_2: age_2 },
          ...{ age_3: age_3 },
          ...{ age_4: age_4 },
          ...{ age_5: age_5 },
          ...{ age_6: age_6 },
          ...{ date_to: dayjs(date_to).format('MM/DD/YYYY') },
          ...(l4_code.length > 0 && { l4_code: JSON.stringify(l4_code) }),
          ...(ac_code.length > 0 && { ac_code: JSON.stringify(ac_code) })
        }
      });

      if (response.data.success === true && response.data.data) {
        return response.data.data;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
    }
  };
  getProfitLossReport = async ({
    filterValue,
    dt_from,
    dt_to,
    div_code
  }: {
    filterValue?: ISearch;
    div_code: string;
    dt_from: Date;
    dt_to: Date;
  }) => {
    try {
      const response: IApiResponse<unknown> = await axiosServices.get(
        `api/accounts/profit-and-loss?dt_from=${dt_from}&dt_to=${dt_to}&div_code=${div_code}`
      );

      if (response.data.success === true && response.data.data) {
        return response.data.data;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
    }
  };
}

const AccountsSerivceInstance = new Accounts();
export default AccountsSerivceInstance;
