import { TFlowmaster } from 'pages/Security/type/flowmaster-sec-types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { Tsecrollmaster } from 'pages/Security/type/flowmaster-sec-types';
import { TSecmaster } from 'pages/Security/type/flowmaster-sec-types';
import { TSecmodulemaster } from 'pages/Security/type/flowmaster-sec-types';
import { TCompanymaster } from 'pages/Security/type/flowmaster-sec-types';
import { TUserAssigned } from 'pages/Security/type/screenaccess-sec-types';
import { TUserRoleAssigned } from 'pages/Security/type/userroleaccess-sec.types';
import { Tsecrollappaccess } from 'pages/Security/type/accessapproll-sec.types';
import { TUsersecrollaccessuser } from 'pages/Security/type/accessuser-sec.types';
import { Idivsionassigned } from 'pages/Security/type/usertodivaccess-sec-types';
import { TQuerymaster } from 'pages/Security/type/querymaster-sec.types';

class GMsec {
  //--------------Flowmaster--------------
  addFlowmaster = async (values: TFlowmaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/flowmaster', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  editFlowmaster = async (values: TFlowmaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/security/gm/flowmaster', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  //--------------------Rollmaster--------------------
  addsecrolemaster = async (values: Tsecrollmaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/rolemaster', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  editsecrolemaster = async (values: Tsecrollmaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/security/gm/rolemaster', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  //-------------------------SecLogin------------------
  addsecemaster = async (values: TSecmaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/secmaster', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  editsecemaster = async (values: TSecmaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/security/gm/secmaster', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  //-----------------------------secModule-----------------
  addsecmoduleemaster = async (values: TSecmodulemaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/secmoduledata', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  editsecmodulemaster = async (values: TSecmodulemaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/security/gm/secmoduledata', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  addcompanymaster = async (values: TCompanymaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/seccompany', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  editcompanymaster = async (values: TCompanymaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/security/gm/seccompany', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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

  //--------------------screenaccess---------------------
  addscreenAccess = async (values: TUserAssigned) => {
    try {
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/projectaccess', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  getScreenAccessList = async (user_id: string | undefined) => {
    try {
      const response: IApiResponse<unknown[]> = await axiosServices.get(`api/security/gm/projectaccess/${user_id}`);

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
  deleteScreenAccess = async (user_id: string, project_code: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(`api/security/gm/projectaccess/delete`, {
        screen_details: [{ user_id, project_code }]
      });
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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

  //--------------------User Role Access Screen -----------------------------------------------
  addRoleAccess = async (values: TUserRoleAssigned) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/userroleaccess', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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

  getRoleAccessList = async (user_id: string | undefined) => {
    try {
      const response: IApiResponse<unknown[]> = await axiosServices.get(`api/security/gm/userroleaccess/${user_id}`);

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
  deleteRoleAccess = async (user_id: string, user_role: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(`api/security/gm/userroleaccess/delete`, {
        screen_details: [{ user_id, user_role }]
      });
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  //----------Add functionality to Roll----------------------------
  getSecRollAppAccess = async (role_id: number, serial_no: number) => {
    try {
      const response: IApiResponse<Tsecrollappaccess> = await axiosServices.get(`api/security/gm/accessassignrole`, {
        params: {
          ...(role_id && { role_id }),
          ...(serial_no && { serial_no })
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
  addSecRollAppAccess = async (values: Tsecrollappaccess) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/accessassignrole', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  getOperationalMaster = async (serial_no: number | undefined) => {
    try {
      const response: IApiResponse<unknown[]> = await axiosServices.get(`api/security/gm/accessassignrole/${serial_no}`);

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
  editSecRollAppAcces = async (values: Tsecrollappaccess) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/security/gm/accessassignrole', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  deleteSecRollAppAccess = async (serial_no: number, role_id: number) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(`api/security/gm/accessassignrole/delete`, {
        screen_details: [{ serial_no, role_id }]
      });
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  //------------------Add Functionality To User --------------------
  getSecRollFunctionAccessUser = async (loginid: string, serial_no_or_role_id: number) => {
    try {
      const response: IApiResponse<TUsersecrollaccessuser> = await axiosServices.get(`api/security/gm/accessassignuser`, {
        params: {
          ...(loginid && { loginid }),
          ...(serial_no_or_role_id && { serial_no_or_role_id })
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
  addSecRollFunctionAccessUser = async (values: TUsersecrollaccessuser) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/accessassignuser', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  getUserOperationalMaster = async (serial_no: number | undefined) => {
    try {
      const response: IApiResponse<unknown[]> = await axiosServices.get(`api/security/gm/accessassignuser/${serial_no}`);

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
  editSecRollFunctionAccessUser = async (values: TUsersecrollaccessuser) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/security/gm/accessassignuser', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  deleteSecRollFunctionAccessUser = async (serial_no_or_role_id: number, loginid: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(`api/security/gm/accessassignuser/delete`, {
        screen_details: [{ serial_no_or_role_id, loginid }]
      });
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  //--------------------division access ---------------------
  addDivisionAccess = async (values: Idivsionassigned) => {
    try {
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/userdivisionaccess', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  getDivisionAccessList = async (user_id: string | undefined) => {
    try {
      const response: IApiResponse<unknown[]> = await axiosServices.get(`api/security/gm/userdivisionaccess/${user_id}`);

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
  deleteDivisionAccess = async (user_id: string, div_code: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(`api/security/gm/userdivisionaccess/delete`, {
        screen_details: [{ user_id, div_code }]
      });
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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

  //report master
  addReportMaster = async (payload: any) => {
    try {
      const response: IApiResponse<{}> = await axiosServices.post('api/security/gm/reportmaster/create', payload);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Report created successfully!',
            variant: 'alert',
            alert: { color: 'success' },
            severity: 'success',
            close: true
          })
        );
        return response.data;
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Failed to create report!',
            variant: 'alert',
            alert: { color: 'error' },
            severity: 'error',
            close: true
          })
        );
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };

  editReportMaster = async (payload: any) => {
    try {
      const response: IApiResponse<{}> = await axiosServices.patch('api/security/gm/reportmaster/modify', payload);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Report updated successfully!',
            variant: 'alert',
            alert: { color: 'success' },
            severity: 'success',
            close: true
          })
        );
        return response.data;
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Failed to update report!',
            variant: 'alert',
            alert: { color: 'error' },
            severity: 'error',
            close: true
          })
        );
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };


  //Query Master:
  addquerymaster = async (values: TQuerymaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/security/gm/query_master', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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
  editquerymaster = async (values: TQuerymaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/security/gm/query_master', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
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

  deletequerymaster = async (app_code: string, master: string, listOfId: string[]) => {
    try {
      const response: IApiResponse<{}> = await axiosServices.post(`api/${app_code}/${master}`, { ids: listOfId });
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
}

const GmSecServiceInstance = new GMsec();
export default GmSecServiceInstance;
