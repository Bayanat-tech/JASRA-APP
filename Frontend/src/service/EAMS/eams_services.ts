import axiosServices from 'utils/axios';

class eams {
proc_build_dynamic_sql_EAMS = async (
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
      "api/eams/gm/proc_build_dynamic_sql_EAMS",
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

const eamsSerivceInstance = new eams();
export default eamsSerivceInstance;