import { useState, useEffect } from 'react';
import { TUserSecLogin, TUserSecmodule, TUseroperationmaster, TUsersecrollaccessuser } from 'pages/Security/type/accessuser-sec.types';
import SecSerivceInstance from 'service/service.security';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import GmSecServiceInstance from 'service/security/services.gm_security';

const AccessAssignUserPage = () => {
  const [users, setUsers] = useState<TUserSecLogin[]>([]);
  const [screens, setScreens] = useState<TUserSecmodule[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedScreen, setSelectedScreen] = useState<string>('');
  const [operationMaster, setOperationMaster] = useState<TUseroperationmaster | null>(null);
  const [existingPermissions, setExistingPermissions] = useState<TUsersecrollaccessuser | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [actionType, setActionType] = useState<string>('add');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [appCodes, setAppCodes] = useState<string[]>([]);
  const [selectedAppCode, setSelectedAppCode] = useState<string>('');
  const [filteredScreens, setFilteredScreens] = useState<TUserSecmodule[]>([]);

  // Fetch users
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['fetchUsers', app, pathNameList[pathNameList.length - 1], undefined, undefined],
    queryFn: () => SecSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], undefined, undefined),
    enabled: !!app
  });

  // Fetch screens
  const {
    data: screensData,
    isLoading: screensLoading,
    error: screensError
  } = useQuery({
    queryKey: ['fetchScreens', app, 'screens', undefined, undefined],
    queryFn: () => SecSerivceInstance.getMasters(app, 'serialno', undefined, undefined),
    enabled: !!app
  });

  useEffect(() => {
    if (usersData) {
      setUsers((usersData?.tableData as TUserSecLogin[]) || []);
    }
  }, [usersData]);

  useEffect(() => {
    if (screensData) {
      setScreens((screensData?.tableData as TUserSecmodule[]) || []);
    }
  }, [screensData]);

  useEffect(() => {
    // Fetch unique app codes from screens
    const uniqueAppCodes = Array.from(new Set(screens.map((screen) => screen.app_code)));
    setAppCodes(uniqueAppCodes);
  }, [screens]);

  useEffect(() => {
    // Filter screens based on selected app_code
    if (selectedAppCode) {
      const filtered = screens.filter((screen) => screen.app_code === selectedAppCode);
      setFilteredScreens(filtered);
    } else {
      setFilteredScreens(screens);
    }
  }, [selectedAppCode, screens]);

  const handleUserChange = async (loginid: string) => {
    setSelectedUser(loginid);
    if (selectedScreen) {
      await fetchExistingPermissions(loginid, selectedScreen);
    }
  };

  const handleScreenChange = async (serialNo: string) => {
    setSelectedScreen(serialNo);
    setExistingPermissions(null);
    setOperationMaster(null);
    if (selectedUser) {
      await fetchExistingPermissions(selectedUser, serialNo);
    }
  };

  const fetchExistingPermissions = async (loginid: string, serialNo: string) => {
    const data = await GmSecServiceInstance.getSecRollFunctionAccessUser(loginid, Number(serialNo));
    if (data) {
      setExistingPermissions(data as TUsersecrollaccessuser);
      setActionType('edit');
    } else {
      setExistingPermissions(null);
      setActionType('add');
      setOpenConfirmDialog(true);
    }
  };

  const handleCheckboxChange = (field: keyof TUsersecrollaccessuser | keyof TUseroperationmaster) => {
    if (existingPermissions && field in existingPermissions) {
      setExistingPermissions({
        ...existingPermissions,
        [field]: existingPermissions[field as keyof TUsersecrollaccessuser] === 'Y' ? 'N' : 'Y'
      });
    } else if (operationMaster && field in operationMaster) {
      setOperationMaster({
        ...operationMaster,
        [field]: operationMaster[field as keyof TUseroperationmaster] === 'Y' ? 'N' : 'Y'
      });
    }
  };

  const addAccessMutation = useMutation({
    mutationFn: async (payload: TUsersecrollaccessuser) => {
      return GmSecServiceInstance.addSecRollFunctionAccessUser(payload);
    },
    onSuccess: () => {
      setErrorMessage('Access added successfully.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      setOperationMaster(null); // Clear operationMaster after successful add
      fetchExistingPermissions(selectedUser, selectedScreen);
    },
    onError: (error) => {
      console.error('Error adding access', error);
      setErrorMessage('There was an error adding the access.');
    }
  });

  const editAccessMutation = useMutation({
    mutationFn: async (payload: TUsersecrollaccessuser) => {
      return GmSecServiceInstance.editSecRollFunctionAccessUser(payload);
    },
    onSuccess: () => {
      setErrorMessage('Access edited successfully.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      fetchExistingPermissions(selectedUser, selectedScreen);
    },
    onError: (error) => {
      console.error('Error editing access', error);
      setErrorMessage('There was an error editing the access.');
    }
  });

  const deleteAccessMutation = useMutation({
    mutationFn: async () => {
      return GmSecServiceInstance.deleteSecRollFunctionAccessUser(Number(selectedScreen), selectedUser);
    },
    onSuccess: () => {
      setErrorMessage('Access deleted successfully.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      setExistingPermissions(null);
      setActionType('add');
    },
    onError: (error) => {
      console.error('Error deleting access', error);
      setErrorMessage('There was an error deleting the access.');
    }
  });

  const handleSubmit = () => {
    if (existingPermissions && selectedUser && selectedScreen) {
      const payload: TUsersecrollaccessuser = {
        loginid: selectedUser,
        serial_no_or_role_id: Number(selectedScreen),
        snew: existingPermissions.snew !== 'NA' ? existingPermissions.snew : 'NA',
        smodify: existingPermissions.smodify !== 'NA' ? existingPermissions.smodify : 'NA',
        sdelete: existingPermissions.sdelete !== 'NA' ? existingPermissions.sdelete : 'NA',
        ssave: existingPermissions.ssave !== 'NA' ? existingPermissions.ssave : 'NA',
        ssearch: existingPermissions.ssearch !== 'NA' ? existingPermissions.ssearch : 'NA',
        ssaveas: existingPermissions.ssaveas !== 'NA' ? existingPermissions.ssaveas : 'NA',
        supload: existingPermissions.supload !== 'NA' ? existingPermissions.supload : 'NA',
        sundo: existingPermissions.sundo !== 'NA' ? existingPermissions.sundo : 'NA',
        sprint: existingPermissions.sprint !== 'NA' ? existingPermissions.sprint : 'NA',
        sprintsetup: existingPermissions.sprintsetup !== 'NA' ? existingPermissions.sprintsetup : 'NA',
        shelp: existingPermissions.shelp !== 'NA' ? existingPermissions.shelp : 'NA',
        company_code: existingPermissions.company_code
      };
      if (actionType === 'add') {
        addAccessMutation.mutate(payload);
      } else if (actionType === 'edit') {
        editAccessMutation.mutate(payload);
      }
    } else if (operationMaster && selectedUser && selectedScreen) {
      const selectedScreenData = screens.find((screen) => screen.serial_no === Number(selectedScreen));
      const payload: TUsersecrollaccessuser = {
        loginid: selectedUser,
        serial_no_or_role_id: Number(selectedScreen),
        snew: operationMaster.snew !== 'NA' ? operationMaster.snew : 'NA',
        smodify: operationMaster.smodify !== 'NA' ? operationMaster.smodify : 'NA',
        sdelete: operationMaster.sdelete !== 'NA' ? operationMaster.sdelete : 'NA',
        ssave: operationMaster.ssave !== 'NA' ? operationMaster.ssave : 'NA',
        ssearch: operationMaster.ssearch !== 'NA' ? operationMaster.ssearch : 'NA',
        ssaveas: operationMaster.ssaveas !== 'NA' ? operationMaster.ssaveas : 'NA',
        supload: operationMaster.supload !== 'NA' ? operationMaster.supload : 'NA',
        sundo: operationMaster.sundo !== 'NA' ? operationMaster.sundo : 'NA',
        sprint: operationMaster.sprint !== 'NA' ? operationMaster.sprint : 'NA',
        sprintsetup: operationMaster.sprintsetup !== 'NA' ? operationMaster.sprintsetup : 'NA',
        shelp: operationMaster.shelp !== 'NA' ? operationMaster.shelp : 'NA',
        company_code: selectedScreenData ? selectedScreenData.company_code : '' // Ensure company_code is passed correctly
      };
      addAccessMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    deleteAccessMutation.mutate();
  };

  const confirmAssign = async () => {
    const data = await GmSecServiceInstance.getUserOperationalMaster(Number(selectedScreen));
    if (Array.isArray(data) && data.length > 0) {
      setOperationMaster(data[0] as TUseroperationmaster);
    } else {
      setOperationMaster(null);
    }
    setOpenConfirmDialog(false);
  };

  return (
    <div className="access-assign-user-container p-6 flex justify-center items-center min-h-screen overflow-hidden bg-gray-100">
      <div className="w-full max-w-6xl bg-white p-8 rounded-lg shadow-lg m-0" style={{ height: '95vh' }}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Assign Access to User</h2>
        {usersError && <div className="error-message text-red-500 mb-4">Error fetching users</div>}
        {usersLoading && <div className="loading-message text-blue-500 mb-4">Loading...</div>}
        {/* User Selection */}
        <div className="mb-6 flex flex-col">
          <FormControl fullWidth>
            <InputLabel>Select User</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => handleUserChange(e.target.value as string)}
              label="Select User"
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left'
                }
              }}
            >
              {users.map((user) => (
                <MenuItem key={user.loginid} value={user.loginid}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        {selectedUser && (
          <>
            {/* App Code Dropdown */}
            <div className="mb-6 flex flex-col">
              <FormControl fullWidth>
                <InputLabel>Select App Code</InputLabel>
                <Select value={selectedAppCode} onChange={(e) => setSelectedAppCode(e.target.value)} label="Select App Code">
                  {appCodes.map((appCode) => (
                    <MenuItem key={appCode} value={appCode}>
                      {appCode.replace(/_/g, ' ')} {/* Remove underscores */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            {/* Screen Dropdown */}
            <div className="mb-6 flex flex-col">
              <FormControl fullWidth>
                <InputLabel>Select Screen</InputLabel>
                {screensError && <div className="error-message text-red-500 mb-4">Error fetching screens</div>}
                {screensLoading && <div className="loading-message text-blue-500 mb-4">Loading...</div>}
                {/* Screen Selection */}
                <Select
                  value={selectedScreen}
                  onChange={(e) => handleScreenChange(e.target.value as string)}
                  label="Select Screen"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left'
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left'
                    }
                  }}
                >
                  {filteredScreens.map((screen) => (
                    <MenuItem key={screen.serial_no} value={screen.serial_no}>
                      {screen.level3.replace(/_/g, ' ')} {/* Remove underscores */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </>
        )}
        {existingPermissions && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Existing Permissions</h3>
            <div className="grid grid-cols-2 gap-4">
              {['snew', 'smodify', 'sdelete', 'ssave', 'ssearch', 'ssaveas', 'supload', 'sundo', 'sprint', 'sprintsetup', 'shelp'].map(
                (key) => {
                  if (existingPermissions[key as keyof TUsersecrollaccessuser] !== 'NA') {
                    return (
                      <div key={key} className="flex items-center">
                        <label className="mr-2 text-gray-700">{key.toUpperCase()}:</label>
                        <input
                          type="checkbox"
                          checked={existingPermissions[key as keyof TUsersecrollaccessuser] === 'Y'}
                          onChange={() => handleCheckboxChange(key as keyof TUsersecrollaccessuser)}
                        />
                      </div>
                    );
                  }
                  return null;
                }
              )}
            </div>
          </div>
        )}
        {operationMaster && !existingPermissions && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Permissions</h3>
            <div className="grid grid-cols-2 gap-4">
              {['snew', 'smodify', 'sdelete', 'ssave', 'ssearch', 'ssaveas', 'supload', 'sundo', 'sprint', 'sprintsetup', 'shelp'].map(
                (key) => {
                  if (operationMaster[key as keyof TUseroperationmaster] !== 'NA') {
                    return (
                      <div key={key} className="flex items-center">
                        <label className="mr-2 text-gray-700">{key.toUpperCase()}:</label>
                        <input
                          type="checkbox"
                          checked={operationMaster[key as keyof TUseroperationmaster] === 'Y'}
                          onChange={() => handleCheckboxChange(key as keyof TUseroperationmaster)}
                        />
                      </div>
                    );
                  }
                  return null;
                }
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-left space-y-2 md:space-y-0 md:space-x-2">
          <button
            className={`bg-blue-500 text-white text-center p-3 rounded w-full ${
              actionType === 'edit' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              setActionType('add');
              handleSubmit();
            }}
            disabled={actionType === 'edit'}
          >
            Add Access to User
          </button>
          <button
            className={`bg-yellow-500 text-white text-center p-3 rounded w-full ${
              actionType === 'add' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              setActionType('edit');
              handleSubmit();
            }}
            disabled={actionType === 'add'}
          >
            Edit Access
          </button>
          <button
            className={`bg-red-500 text-white text-center p-3 rounded w-full ${
              !existingPermissions ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleDelete}
            disabled={!existingPermissions}
          >
            Delete Access
          </button>
        </div>
        {errorMessage && <div className="error-message text-red-500 mt-4">{errorMessage}</div>}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm Assign'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Selected user doesn't have existing permissions against the selected screen. Do you want to assign functionality to the selected
            user against the selected screen?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmAssign} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AccessAssignUserPage;
