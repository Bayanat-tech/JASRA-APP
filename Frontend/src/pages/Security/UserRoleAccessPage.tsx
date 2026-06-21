import { useState, useEffect } from 'react';
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
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SecSerivceInstance from 'service/service.security';
import GmSecServiceInstance from 'service/security/services.gm_security';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import { TAssignedrole, TuserRoleaccess, TUserRoleAssigned, TUsers } from './type/userroleaccess-sec.types';

const RoleAccessPage = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<TAssignedrole[]>([]);
  const [userAssignments, setUserAssignments] = useState<TuserRoleaccess[]>([]);
  const [users, setUsers] = useState<TUsers[]>([]);
  const [roles, setRoles] = useState<TAssignedrole[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['fetchUsers', app, pathNameList[pathNameList.length - 1], undefined, undefined],
    queryFn: () => SecSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], undefined, undefined),
    enabled: !!app
  });

  // Fetch roles
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError
  } = useQuery({
    queryKey: ['fetchRoles', app, 'roles', undefined, undefined],
    queryFn: () => SecSerivceInstance.getMasters(app, 'roles', undefined, undefined),
    enabled: !!app
  });

  const {
    data: userAssignmentsData,
    isLoading: userAssignmentsLoading,
    error: userAssignmentsError
  } = useQuery({
    queryKey: ['fetchUserRoleAssignments', selectedUser],
    queryFn: () => GmSecServiceInstance.getRoleAccessList(selectedUser),
    enabled: !!selectedUser
  });

  useEffect(() => {
    if (usersData) {
      setUsers((usersData?.tableData as TUsers[]) || []);
    }
  }, [usersData]);

  useEffect(() => {
    if (rolesData) {
      setRoles((rolesData?.tableData as TAssignedrole[]) || []);
    }
  }, [rolesData]);

  useEffect(() => {
    if (userAssignmentsData) {
      const data = userAssignmentsData as unknown as TuserRoleaccess[];
      setUserAssignments(data || []);
    }
  }, [userAssignmentsData]);

  // Mutation to add roles to the user
  const addRolesMutation = useMutation({
    mutationFn: async (payload: TUserRoleAssigned) => {
      return GmSecServiceInstance.addRoleAccess(payload);
    },
    onSuccess: async () => {
      const updatedAssignments = await GmSecServiceInstance.getRoleAccessList(selectedUser);
      setUserAssignments(updatedAssignments as TuserRoleaccess[]);

      setSelectedRoles([]);
    },
    onError: (error) => {
      console.error('Error adding roles', error);
      setErrorMessage('There was an error adding the roles.');
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (userrole: string) => {
      return GmSecServiceInstance.deleteRoleAccess(selectedUser, userrole);
    },
    onSuccess: (data, variables) => {
      setUserAssignments((prev) => prev.filter((assignment) => assignment.user_role !== variables));
      setOpenConfirmDialog(false);
      setRoleToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting role', error);
      setErrorMessage('There was an error deleting the role.');
    }
  });

  const handleAddRoles = async () => {
    try {
      const duplicateRoles = selectedRoles.filter((role) => userAssignments.some((assignment) => assignment.user_role === role.user_role));

      if (duplicateRoles.length > 0) {
        setErrorMessage(`The following role(s) are already assigned to this user: ${duplicateRoles.map((r) => r.role_name).join(', ')}`);
        setTimeout(() => {
          setErrorMessage('');
        }, 5000); // Clear the error message after 5 seconds
        return;
      }

      for (const role of selectedRoles) {
        const payload: TUserRoleAssigned = {
          user_id: selectedUser,
          user_role: role.user_role,
          company_code: role.company_code
        };
        addRolesMutation.mutate(payload);
      }
    } catch (error) {
      console.error('Error adding roles', error);
    }
  };

  const handleDeleteRole = (userrole: string) => {
    setRoleToDelete(userrole);
    setOpenConfirmDialog(true);
  };

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate(roleToDelete);
    }
  };

  const handleRoleSelection = (userrole: string) => {
    const role = roles.find((r) => r.user_role === userrole);

    if (role) {
      if (userAssignments.some((assignment) => assignment.user_role === role.user_role)) {
        setErrorMessage('This role is already assigned.');
        setTimeout(() => {
          setErrorMessage('');
        }, 5000); // Clear the error message after 5 seconds
      } else if (!selectedRoles.some((r) => r.user_role === role.user_role)) {
        setSelectedRoles((prev) => [...prev, role]);
        setErrorMessage('');
      } else {
        setErrorMessage('This role is already selected.');
        setTimeout(() => {
          setErrorMessage('');
        }, 5000); // Clear the error message after 5 seconds
      }
    }
    setSelectedRoleCode(userrole);
  };

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    setSelectedRoles([]);
    setSelectedRoleCode('');
    setErrorMessage('');
    if (userId) {
      SecSerivceInstance.getMasters(app, 'roles', undefined, undefined)
        .then((response) => {
          setRoles((response?.tableData as TAssignedrole[]) || []);
        })
        .catch((error) => {
          console.error('Error fetching roles', error);
          setRoles([]);
        });
    } else {
      setRoles([]);
    }
  };

  return (
    <Box
      className="screen-access-container"
      p={4}
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      minHeight="100vh"
      overflow="hidden"
    >
      <Box className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md" maxHeight="85vh" overflow="auto">
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Role Assignments
        </Typography>
        {usersError && (
          <Typography color="error" gutterBottom>
            Error fetching users
          </Typography>
        )}
        {usersLoading && <CircularProgress color="primary" />}
        {/* User Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select User</InputLabel>
          <Select value={selectedUser} onChange={(e) => handleUserChange(e.target.value as string)} label="Select User">
            {users.map((user) => (
              <MenuItem key={user.user_id} value={user.user_id}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedUser && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Role</InputLabel>
            {rolesError && (
              <Typography color="error" gutterBottom>
                Error fetching roles
              </Typography>
            )}
            {rolesLoading && <CircularProgress color="primary" />}
            {/* Role Selection */}
            <Select value={selectedRoleCode} onChange={(e) => handleRoleSelection(e.target.value as string)} label="Select Role">
              {roles.map((role) => (
                <MenuItem key={role.user_role} value={role.user_role}>
                  {role.role_name}
                </MenuItem>
              ))}
            </Select>
            {errorMessage && (
              <Typography color="error" mt={2}>
                {errorMessage}
              </Typography>
            )}
          </FormControl>
        )}
        {/* Display Selected Roles */}
        {selectedRoles.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Selected Roles
            </Typography>
            <List>
              {selectedRoles.map((role) => (
                <ListItem
                  key={role.user_role}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => setSelectedRoles((prev) => prev.filter((r) => r.user_role !== role.user_role))}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemText primary={role.role_name} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {/* Display User Assigned Roles */}
        {userAssignments.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Assigned Roles
            </Typography>
            <List>
              {userAssignments.map((assignment) => (
                <ListItem
                  key={assignment.user_role}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteRole(assignment.user_role)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemText primary={assignment.role_name} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {/* Add Roles Button */}
        <Box mt={4} display="flex" justifyContent="flex-start">
          <Button variant="contained" color="primary" fullWidth onClick={handleAddRoles}>
            Add Roles to User
          </Button>
        </Box>
        {userAssignmentsError && (
          <Typography color="error" gutterBottom>
            Error fetching user assignments
          </Typography>
        )}
        {userAssignmentsLoading && <CircularProgress color="primary" />}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm Delete'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Do you want to revoke access to this role?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteRole} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleAccessPage;
