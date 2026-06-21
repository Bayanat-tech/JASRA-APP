import { ISearch } from 'components/filters/SearchFilter';
import dayjs from 'dayjs';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class Stockriteria {
  //--------------job----------
  getDetailReport = async ({ filterValue, reportName }: { filterValue: ISearch; reportName: string }) => {
    try {
      const response: IApiResponse<unknown[]> = await axiosServices.get(`api/wms/reports/stock-criteria/${reportName}`, {
        params: { ...(filterValue && { filter: JSON.stringify(filterValue) }) }
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

  getSummaryReport = async ({
    filterValue,
    reportName,
    prin_code,
    start_date,
    end_date,
    prod_code_from,
    prod_code_to
  }: {
    filterValue: ISearch;
    reportName: string;
    prin_code: string;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    prod_code_from?: string;
    prod_code_to?: string;
  }) => {
    try {
      const response: IApiResponse<unknown[]> = await axiosServices.get(`api/wms/reports/stock-criteria/${reportName}`, {
        params: {
          ...(filterValue && { filter: JSON.stringify(filterValue) }),
          ...(!!prin_code && { prin_code: prin_code }),
          ...(!!prod_code_from && { prod_code_from: prod_code_from }),
          ...(!!prod_code_to && { prod_code_to: prod_code_to }),
          ...(!!start_date && { start_date: dayjs(start_date).format('MM/DD/YYYY') }),
          ...(!!end_date && { end_date: dayjs(end_date).format('MM/DD/YYYY') })
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
  getAgingReport = async ({
    filterValue,
    reportName,
    date_to,
    age_1,
    age_2,
    age_3,
    age_4,
    age_5
  }: {
    filterValue: ISearch;
    reportName: string;
    date_to: Date | undefined;
    age_1: number;
    age_2: number;
    age_3: number;
    age_4: number;
    age_5: number;
  }) => {
    try {
      const formatDateToMMDDYYYY = (isoString: any) => {
        const date = new Date(isoString);

        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
      };
      const response: IApiResponse<unknown> = await axiosServices.get(
        `api/wms/reports/stock-criteria/${reportName}?date_to=${formatDateToMMDDYYYY(
          date_to
        )}&age_1=${age_1}&age_2=${age_2}&age_3=${age_3}&age_4=${age_4}&age_5=${age_5}`,
        {
          params: { ...(filterValue && { filter: JSON.stringify(filterValue) }) }
        }
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

const StockcriteriaServiceInstance = new Stockriteria();
export default StockcriteriaServiceInstance;
