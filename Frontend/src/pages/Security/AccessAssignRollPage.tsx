import { useState, useEffect } from 'react';
import { Taccessrole, Taccesssecmodule, Toperationmaster, Tsecrollappaccess } from 'pages/Security/type/accessapproll-sec.types';
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

const AccessAssignRollPage = () => {
  const [roles, setRoles] = useState<Taccessrole[]>([]);
  const [screens, setScreens] = useState<Taccesssecmodule[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedScreen, setSelectedScreen] = useState<string>('');
  const [operationMaster, setOperationMaster] = useState<Toperationmaster | null>(null);
  const [existingPermissions, setExistingPermissions] = useState<Tsecrollappaccess | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [actionType, setActionType] = useState<string>('add');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [appCodes, setAppCodes] = useState<string[]>([]);
  const [selectedAppCode, setSelectedAppCode] = useState<string>('');
  const [filteredScreens, setFilteredScreens] = useState<Taccesssecmodule[]>([]);
  // Fetch roles
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError
  } = useQuery({
    queryKey: ['fetchRoles', app, pathNameList[pathNameList.length - 1], undefined, undefined],
    queryFn: () => SecSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], undefined, undefined),
    enabled: !!app
  });

  // Fetch screens
  const { data: screensData } = useQuery({
    queryKey: ['fetchScreens', app, 'screens', undefined, undefined],
    queryFn: () => SecSerivceInstance.getMasters(app, 'serialno', undefined, undefined),
    enabled: !!app
  });

  useEffect(() => {
    if (rolesData) {
      setRoles((rolesData?.tableData as Taccessrole[]) || []);
    }
  }, [rolesData]);

  useEffect(() => {
    if (screensData) {
      setScreens((screensData?.tableData as Taccesssecmodule[]) || []);
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

  const handleRoleChange = async (roleId: string) => {
    setSelectedRole(roleId);
    if (selectedScreen) {
      await fetchExistingPermissions(roleId, selectedScreen);
    }
  };

  const handleScreenChange = async (serialNo: string) => {
    setSelectedScreen(serialNo);
    setExistingPermissions(null);
    setOperationMaster(null);
    if (selectedRole) {
      await fetchExistingPermissions(selectedRole, serialNo);
    }
  };

  const fetchExistingPermissions = async (roleId: string, serialNo: string) => {
    const data = await GmSecServiceInstance.getSecRollAppAccess(Number(roleId), Number(serialNo));
    if (data) {
      setExistingPermissions(data as Tsecrollappaccess);
      setActionType('edit');
    } else {
      setExistingPermissions(null);
      setActionType('add');
      setOpenConfirmDialog(true);
    }
  };

  const handleCheckboxChange = (field: keyof Tsecrollappaccess | keyof Toperationmaster) => {
    if (existingPermissions && field in existingPermissions) {
      setExistingPermissions({
        ...existingPermissions,
        [field]: existingPermissions[field as keyof Tsecrollappaccess] === 'Y' ? 'N' : 'Y'
      });
    } else if (operationMaster && field in operationMaster) {
      setOperationMaster({
        ...operationMaster,
        [field]: operationMaster[field as keyof Toperationmaster] === 'Y' ? 'N' : 'Y'
      });
    }
  };

  const addAccessMutation = useMutation({
    mutationFn: async (payload: Tsecrollappaccess) => {
      return GmSecServiceInstance.addSecRollAppAccess(payload);
    },
    onSuccess: () => {
      setErrorMessage('Access added successfully.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      setOperationMaster(null); // Clear operationMaster after successful add
      fetchExistingPermissions(selectedRole, selectedScreen);
    },
    onError: (error) => {
      console.error('Error adding access', error);
      setErrorMessage('There was an error adding the access.');
    }
  });

  const editAccessMutation = useMutation({
    mutationFn: async (payload: Tsecrollappaccess) => {
      return GmSecServiceInstance.editSecRollAppAcces(payload);
    },
    onSuccess: () => {
      setErrorMessage('Access edited successfully.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      fetchExistingPermissions(selectedRole, selectedScreen);
    },
    onError: (error) => {
      console.error('Error editing access', error);
      setErrorMessage('There was an error editing the access.');
    }
  });

  const deleteAccessMutation = useMutation({
    mutationFn: async () => {
      return GmSecServiceInstance.deleteSecRollAppAccess(Number(selectedScreen), Number(selectedRole));
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
  console.log('existingPermission', existingPermissions);
  console.log('operation', operationMaster);
  const handleSubmit = () => {
    if (existingPermissions && selectedRole && selectedScreen) {
      const payload: Tsecrollappaccess = {
        role_id: Number(selectedRole),
        serial_no: Number(selectedScreen),
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
    } else if (operationMaster && selectedRole && selectedScreen) {
      const selectedScreenData = screens.find((screen) => screen.serial_no === Number(selectedScreen));
      const payload: Tsecrollappaccess = {
        role_id: Number(selectedRole),
        serial_no: Number(selectedScreen),
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
    const data = await GmSecServiceInstance.getOperationalMaster(Number(selectedScreen));
    if (Array.isArray(data) && data.length > 0) {
      setOperationMaster(data[0] as Toperationmaster);
    } else {
      setOperationMaster(null);
    }
    setOpenConfirmDialog(false);
  };

  return (
    <div className="access-assign-roll-container p-6 flex justify-center items-center min-h-screen overflow-hidden bg-gray-100">
      <div className="w-full max-w-6xl bg-white p-8 rounded-lg shadow-lg m-0" style={{ height: '95vh' }}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Assign Access to Role</h2>
        {rolesError && <div className="error-message text-red-500 mb-4">Error fetching roles</div>}
        {rolesLoading && <div className="loading-message text-blue-500 mb-4">Loading...</div>}
        {/* Role Selection */}
        <div className="mb-6 flex flex-col">
          <FormControl fullWidth>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value as string)}
              label="Select Role"
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
              {roles.map((role) => (
                <MenuItem key={role.role_id} value={role.role_id}>
                  {role.role_desc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        {selectedRole && (
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
                <Select value={selectedScreen} onChange={(e) => handleScreenChange(e.target.value as string)} label="Select Screen">
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
                  if (existingPermissions[key as keyof Tsecrollappaccess] !== 'NA') {
                    return (
                      <div key={key} className="flex items-center">
                        <label className="mr-2 text-gray-700">{key.toUpperCase()}:</label>
                        <input
                          type="checkbox"
                          checked={existingPermissions[key as keyof Tsecrollappaccess] === 'Y'}
                          onChange={() => handleCheckboxChange(key as keyof Tsecrollappaccess)}
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
                  if (operationMaster[key as keyof Toperationmaster] !== 'NA') {
                    return (
                      <div key={key} className="flex items-center">
                        <label className="mr-2 text-gray-700">{key.toUpperCase()}:</label>
                        <input
                          type="checkbox"
                          checked={operationMaster[key as keyof Toperationmaster] === 'Y'}
                          onChange={() => handleCheckboxChange(key as keyof Toperationmaster)}
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
            Add Access to Role
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
            Selected role doesn't have existing permissions against the selected screen. Do you want to assign functionality to the selected
            role against the selected screen?
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

export default AccessAssignRollPage;
