import { TSite } from 'pages/WMS/types/site-wms.types';

import { dispatch } from 'store';

import { openSnackbar } from 'store/reducers/snackbar';

import axiosServices from 'utils/axios';

 

type ApiResponse = {

  success: boolean;

  message?: string;

  details?: string[];

};

 

class common {

  procBuildCommonProcedurewmc = async (params: {

    parameter: string;

    loginid: string;

 

    // STRING VALUES (1–20)

    val1s1?: string;

    val1s2?: string;

    val1s3?: string;

    val1s4?: string;

    val1s5?: string;

    val1s6?: string;

    val1s7?: string;

    val1s8?: string;

    val1s9?: string;

    val1s10?: string;

    val1s11?: string;

    val1s12?: string;

    val1s13?: string;

    val1s14?: string;

    val1s15?: string;

    val1s16?: string;

    val1s17?: string;

    val1s18?: string;

    val1s19?: string;

    val1s20?: string;

 

    // NUMBER VALUES (1–10)

    val1n1?: number;

    val1n2?: number;

    val1n3?: number;

    val1n4?: number;

    val1n5?: number;

    val1n6?: number;

    val1n7?: number;

    val1n8?: number;

    val1n9?: number;

    val1n10?: number;

  }): Promise<ApiResponse> => {

    try {

      console.log('before calling apisandeep');

      const { data } = await axiosServices.post('/api/pf/gm/procBuildCommonProcedurewmc', params);

 

      dispatch(

        openSnackbar({

          open: true,

          message: data.message,

          variant: 'alert',

          alert: { color: data.success ? 'success' : 'error' },

          close: true

        })

      );

 

      return data;

    } catch (error: unknown) {

      const err = error as any;

 

      const apiMessage = err?.response?.data?.message || err?.response?.data?.Message || err?.message || 'Something went wrong';

 

      const apiDetails = err?.response?.data?.details ?? err?.response?.data?.Details ?? err?.details ?? err?.data?.details ?? '';

 

      const res: ApiResponse = {

        success: false,

        message: apiMessage,

        details: apiDetails

      };

      const fullMessage = `${apiMessage} -${apiDetails}`;

 

      dispatch(

        openSnackbar({

          open: true,

          message: fullMessage,

          variant: 'alert',

          alert: { color: 'error' },

          severity: 'error',

          close: true

        })

      );

 

      console.error('handlePostValid api error:', err);

      console.log('DETAILS STRING hpv:', apiDetails);

      console.log('TYPE hpv:', typeof apiDetails);

 

      return res;

    }

  };

 

  // Existing SQL fetch method

  proc_build_dynamic_ins_upd_column90 = async (params: {

    parameter: string;

    loginid: string;

 

    // STRING VALUES (1–90)

    val1s1?: string;

    val1s2?: string;

    val1s3?: string;

    val1s4?: string;

    val1s5?: string;

    val1s6?: string;

    val1s7?: string;

    val1s8?: string;

    val1s9?: string;

    val1s10?: string;

    val1s11?: string;

    val1s12?: string;

    val1s13?: string;

    val1s14?: string;

    val1s15?: string;

    val1s16?: string;

    val1s17?: string;

    val1s18?: string;

    val1s19?: string;

    val1s20?: string;

    val1s21?: string;

    val1s22?: string;

    val1s23?: string;

    val1s24?: string;

    val1s25?: string;

    val1s26?: string;

    val1s27?: string;

    val1s28?: string;

    val1s29?: string;

    val1s30?: string;

    val1s31?: string;

    val1s32?: string;

    val1s33?: string;

    val1s34?: string;

    val1s35?: string;

    val1s36?: string;

    val1s37?: string;

    val1s38?: string;

    val1s39?: string;

    val1s40?: string;

    val1s41?: string;

    val1s42?: string;

    val1s43?: string;

    val1s44?: string;

    val1s45?: string;

    val1s46?: string;

    val1s47?: string;

    val1s48?: string;

    val1s49?: string;

    val1s50?: string;

    val1s51?: string;

    val1s52?: string;

    val1s53?: string;

    val1s54?: string;

    val1s55?: string;

    val1s56?: string;

    val1s57?: string;

    val1s58?: string;

    val1s59?: string;

    val1s60?: string;

    val1s61?: string;

    val1s62?: string;

    val1s63?: string;

    val1s64?: string;

    val1s65?: string;

    val1s66?: string;

    val1s67?: string;

    val1s68?: string;

    val1s69?: string;

    val1s70?: string;

    val1s71?: string;

    val1s72?: string;

    val1s73?: string;

    val1s74?: string;

    val1s75?: string;

    val1s76?: string;

    val1s77?: string;

    val1s78?: string;

    val1s79?: string;

    val1s80?: string;

    val1s81?: string;

    val1s82?: string;

    val1s83?: string;

    val1s84?: string;

    val1s85?: string;

    val1s86?: string;

    val1s87?: string;

    val1s88?: string;

    val1s89?: string;

    val1s90?: string;

 

    // NUMBER VALUES (1–10)

    val1n1?: number;

    val1n2?: number;

    val1n3?: number;

    val1n4?: number;

    val1n5?: number;

    val1n6?: number;

    val1n7?: number;

    val1n8?: number;

    val1n9?: number;

    val1n10?: number;

  }): Promise<{ success: boolean; message: string }> => {

    console.log('params', params);

    const response = await axiosServices.post('api/wms/common/proc_build_dynamic_ins_upd_column90', params);

    return response.data;

  };

 

  // proc_build_dynamic_sql_common = async (params: {

  //   parameter: string;

  //   loginid?: string;

  //   code1?: string;

  //   code2?: string;

  //   code3?: string;

  //   code4?: string;

  //   number1?: number;

  //   number2?: number;

  //   number3?: number;

  //   number4?: number;

  //   date1?: string | null;

  //   date2?: string | null;

  //   date3?: string | null;

  //   date4?: string | null;

  // }): Promise<any[] | null> => {

  //   try {

  //     if (!params?.parameter) return null;

 

  //     const response = await axiosServices.post('api/wms/common/proc_build_dynamic_sql_common', params);

 

  //     if (response.data?.success && response.data?.data) return response.data.data;

  //     return null;

  //   } catch (error: unknown) {

  //     console.error('Error in proc_build_dynamic_sql:', (error as { message: string }).message);

  //     return null;

  //   }

  // };

  // ─── Drop-in replacement for proc_build_dynamic_sql_common ───────────────────

  // Extend your existing `common` class with this updated signature.

  // Supports code1–code10, number1–number4, date1–date4.

 

  proc_build_dynamic_sql_common = async (params: {

    parameter: string;

    loginid?: string;

 

    code1?: string;

    code2?: string;

    code3?: string;

    code4?: string;

    code5?: string; // ← NEW

    code6?: string; // ← NEW

    code7?: string; // ← NEW

    code8?: string; // ← NEW

    code9?: string; // ← NEW

    code10?: string; // ← NEW

 

    number1?: number;

    number2?: number;

    number3?: number;

    number4?: number;

 

    date1?: string | null;

    date2?: string | null;

    date3?: string | null;

    date4?: string | null;

  }): Promise<any[] | null> => {

    try {

      if (!params?.parameter) return null;
      console.log("Hiting the procedure : proc_build_dynamic_sql_common")
      console.log("parmas",params)

 

      const response = await axiosServices.post('/api/pf/gm/proc_build_dynamic_sql_common', params);

 

      if (response.data?.success && response.data?.data) return response.data.data;

      return null;

    } catch (error: unknown) {

      console.error('Error in proc_build_dynamic_sql:', (error as { message: string }).message);

      return null;

    }

  };

 

  proc_build_dynamic_sql_common20 = async (params: {

    parameter: string;

    loginid?: string;

 

    code1?: string;

    code2?: string;

    code3?: string;

    code4?: string;

    code5?: string;

    code6?: string;

    code7?: string;

    code8?: string;

    code9?: string;

    code10?: string;

    code11?: string;

    code12?: string;

    code13?: string;

    code14?: string;

    code15?: string;

    code16?: string;

    code17?: string;

    code18?: string;

    code19?: string;

    code20?: string;

 

    number1?: number;

    number2?: number;

    number3?: number;

    number4?: number;

 

    date1?: string | null;

    date2?: string | null;

    date3?: string | null;

    date4?: string | null;

  }): Promise<any[] | null> => {

    try {

      if (!params?.parameter) {

        return null;

      }

 

      const response = await axiosServices.post(

        'api/wms/common/proc_build_dynamic_sql_common20',

 

        params

      );

 

      if (response.data?.success && response.data?.data) {

        return response.data.data;

      }

 

      return null;

    } catch (error: unknown) {

      console.error('Error in proc_build_dynamic_sql_common20:', (error as { message: string }).message);

 

      return null;

    }

  };

 

  async update_site(updatedRow: TSite) {

    const response = await axiosServices.post('api/wms/common/update_site', updatedRow);

    return response.data;

  }

 

  // ================================ INSERT AND UPDATE ===========================

 

  // proc_build_dynamic_ins_upd_common = async (

  //   params: {

  //     parameter: string;

  //     loginid: string;

 

  //     // INSERT / UPDATE VALUES

  //     val1s1?: string;

  //     val1s2?: string;

  //     val1s3?: string;

  //     val1s4?: string;

  //     val1s5?: string;

  //     val1s6?: string;

  //     val1s7?: string;

  //     val1s8?: string;

  //     val1s9?: string;

  //     val1s10?: string;

 

  //     val1n1?: number;

  //     val1n2?: number;

  //     val1n3?: number;

  //     val1n4?: number;

  //     val1n5?: number;

 

  //     val1d1?: string | null;

  //     val1d2?: string | null;

  //     val1d3?: string | null;

  //     val1d4?: string | null;

  //     val1d5?: string | null;

 

  //     // WHERE VALUES

  //     wval1s1?: string;

  //     wval1s2?: string;

  //     wval1s3?: string;

  //     wval1s4?: string;

  //     wval1s5?: string;

 

  //     wval1n1?: number;

  //     wval1n2?: number;

  //     wval1n3?: number;

  //     wval1n4?: number;

  //     wval1n5?: number;

 

  //     wval1d1?: string | null;

  //     wval1d2?: string | null;

  //     wval1d3?: string | null;

  //     wval1d4?: string | null;

  //     wval1d5?: string | null;

  //   }

  // ): Promise<{ success: boolean; message: string } | null> => {

  //   try {

  //     if (!params?.parameter) return null;

 

  //     const response = await axiosServices.post(

  //       "api/common/gm/proc_build_dynamic_ins_upd_common",

  //       params

  //     );

 

  //     if (response.data?.success) {

  //       return {

  //         success: true,

  //         message: response.data?.message ?? "Inserted / Updated successfully"

  //       };

  //     }

 

  //     return {

  //       success: false,

  //       message: response.data?.message ?? "Insert / Update failed"

  //     };

 

  //   } catch (error: unknown) {

  //     console.error(

  //       "Error in proc_build_dynamic_ins_upd_common:",

  //       (error as { message: string }).message

  //     );

  //     return {

  //       success: false,

  //       message: "Insert / Update failed"

  //     };

  //   }

  // };

 

  proc_build_dynamic_ins_upd_common = async (params: {

    parameter: string;

    loginid: string;

 

    // INSERT / UPDATE VALUES

    val1s1?: string;

    val1s2?: string;

    val1s3?: string;

    val1s4?: string;

    val1s5?: string;

    val1s6?: string;

    val1s7?: string;

    val1s8?: string;

    val1s9?: string;

    val1s10?: string;

    // val1s11?: string;

    // val1s12?: string;

    //   val1s13?: string;

    //   val1s14?: string;

 

    val1n1?: number;

    val1n2?: number;

    val1n3?: number;

    val1n4?: number;

    val1n5?: number;

    val1n6?: number;

    val1n7?: number;

 

    val1d1?: Date | null;

    val1d2?: Date | null;

    val1d3?: Date | null;

    val1d4?: Date | null;

    val1d5?: Date | null;

 

    // WHERE VALUES

    wval1s1?: string;

    wval1s2?: string;

    wval1s3?: string;

    wval1s4?: string;

    wval1s5?: string;

 

    wval1n1?: number;

    wval1n2?: number;

    wval1n3?: number;

    wval1n4?: number;

    wval1n5?: number;

 

    wval1d1?: Date | null;

    wval1d2?: Date | null;

    wval1d3?: Date | null;

    wval1d4?: Date | null;

    wval1d5?: Date | null;

  }): Promise<ApiResponse> => {

    try {

      if (!params?.parameter) {

        const res = {

          success: false,

          message: 'No values provided'

        };

 

        dispatch(

          openSnackbar({

            open: true,

            message: res.message,

            variant: 'alert',

            alert: { color: 'error' },

            close: true

          })

        );

 

        return res;

      }

 

      const { data } = await axiosServices.post<ApiResponse>('api/pf/proc_build_dynamic_ins_upd_common', params);

 

      dispatch(

        openSnackbar({

          open: true,

          message: data.message,

          variant: 'alert',

          alert: { color: data.success ? 'success' : 'error' },

          close: true

        })

      );

      return data;

    } catch (error: unknown) {

      const err = error as any;

 

      const apiMessage = err?.response?.data?.message || err?.response?.data?.Message || err?.message || 'Something went wrong';

 

      const apiDetails = err?.response?.data?.details ?? err?.response?.data?.Details ?? err?.details ?? err?.data?.details ?? '';

 

      const res: ApiResponse = {

        success: false,

        message: apiMessage,

        details: apiDetails

      };

      const fullMessage = `${apiMessage} -${apiDetails}`;

 

      dispatch(

        openSnackbar({

          open: true,

          message: fullMessage,

          variant: 'alert',

          alert: { color: 'error' },

          severity: 'error',

          close: true

        })

      );

 

      console.error('Full API Error:', err);

      console.log('DETAILS STRING:', apiDetails);

      console.log('TYPE:', typeof apiDetails);

 

      return res;

    }

  };

 

  //===================== ✅ New DELETE method ===================

  proc_build_dynamic_del_common = async (params: {

    parameter: string;

    loginid: string;

    code1?: string;

    code2?: string;

    code3?: string;

    code4?: string;

    code5?: string;

    number1?: number;

    number2?: number;

    number3?: number;

    number4?: number;

    date1?: string | null;

    date2?: string | null;

    date3?: string | null;

    date4?: string | null;

  }): Promise<ApiResponse> => {

    try {

      if (!params?.parameter) {

        const res = {

          success: false,

          message: 'No values provided'

        };

 

        dispatch(

          openSnackbar({

            open: true,

            message: res.message,

            variant: 'alert',

            alert: { color: 'error' },

            close: true

          })

        );

 

        return res;

      }

      const { data } = await axiosServices.post('api/wms/common/proc_build_dynamic_del_common', params);

 

      dispatch(

        openSnackbar({

          open: true,

          message: data.message,

          variant: 'alert',

          alert: { color: data.success ? 'success' : 'error' },

          close: true

        })

      );

      return data;

    } catch (error: unknown) {

      const err = error as any;

 

      const apiMessage = err?.response?.data?.message || err?.response?.data?.Message || err?.message || 'Something went wrong';

 

      const apiDetails = err?.response?.data?.details ?? err?.response?.data?.Details ?? err?.details ?? err?.data?.details ?? '';

 

      const res: ApiResponse = {

        success: false,

        message: apiMessage,

        details: apiDetails

      };

      const fullMessage = `${apiMessage} -${apiDetails}`;

 

      dispatch(

        openSnackbar({

          open: true,

          message: fullMessage,

          variant: 'alert',

          alert: { color: 'error' },

          severity: 'error',

          close: true

        })

      );

 

      return res;

    }

  };

}

 

const commonServiceInstance = new common();

export default commonServiceInstance;