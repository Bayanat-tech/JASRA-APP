// import { ISearch } from 'components/filters/SearchFilter';

// import { dispatch } from 'store';

// import { openSnackbar } from 'store/reducers/snackbar';

// import { IApiResponse } from 'types/types.services';

import axiosServices from 'utils/axios';

 

 

class Attendance {

 

  proc_build_dynamic_sql = async (

  params: {

    parameter: string;

  loginid: string;

    code1?: string;

    code2?: string;

    code3?: string;

    code4?: string;

    number1?: number;

    number2?: number;

    number3?: number;

    number4?: number;

    date1?: string | null;

    date2?: string | null;

    date3?: string | null;

    date4?: string | null;

  }

): Promise<any[] | null> => {

  try {

    if (!params?.parameter) {

      console.warn("Missing required 'parameter' value.");

      return null;

    }

 

    console.log("Sending parameters to backend:", params);

 

    const response = await axiosServices.post(

      "api/pf/gm/proc_build_dynamic_sql",

      params

    );

 

    if (response.data?.success && response.data?.data) {

      console.log("SQL execution results:", response.data.data);

      console.log(response.data.data)

      return response.data.data;

    } else {

      console.error("Execution failed:", response.data?.error);

      return null;

    }

  } catch (error: unknown) {

    console.error("Error in proc_build_dynamic_sql:", (error as { message: string }).message);

    return null;

  }

};

}

 

const AttendanceSerivceInstance = new Attendance();

export default AttendanceSerivceInstance;