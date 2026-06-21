import { useState, useEffect } from 'react';
import { Tuser, Tdivisionaccess, Idivsionassigned, TAssigneddivision } from 'pages/Security/type/usertodivaccess-sec-types';
import SecSerivceInstance from 'service/service.security';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import { useQuery, useMutation } from '@tanstack/react-query';
import GmSecServiceInstance from 'service/security/services.gm_security';
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

const UserDivisionAccessPage = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedDivisions, setSelectedDivisions] = useState<TAssigneddivision[]>([]);
  const [userAssignments, setUserAssignments] = useState<Tdivisionaccess[]>([]);
  const [users, setUsers] = useState<Tuser[]>([]);
  const [divisions, setDivisions] = useState<TAssigneddivision[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedDivisionCode, setSelectedDivisionCode] = useState<string>('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [divisionToDelete, setDivisionToDelete] = useState<string | null>(null);
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

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

  // Fetch divisions
  const {
    data: divisionsData,
    isLoading: divisionsLoading,
    error: divisionsError
  } = useQuery({
    queryKey: ['fetchDivisions', app, 'divisions', undefined, undefined],
    queryFn: () => SecSerivceInstance.getMasters(app, 'divisions', undefined, undefined),
    enabled: !!app
  });

  // Fetch user assignments
  const {
    data: userAssignmentsData,
    isLoading: userAssignmentsLoading,
    error: userAssignmentsError
  } = useQuery({
    queryKey: ['fetchUserAssignments', selectedUser],
    queryFn: () => GmSecServiceInstance.getDivisionAccessList(selectedUser),
    enabled: !!selectedUser
  });

  // Set users and divisions when data is fetched
  useEffect(() => {
    if (usersData) {
      setUsers((usersData?.tableData as Tuser[]) || []);
    }
  }, [usersData]);

  useEffect(() => {
    if (divisionsData) {
      setDivisions((divisionsData?.tableData as TAssigneddivision[]) || []);
    }
  }, [divisionsData]);

  useEffect(() => {
    if (userAssignmentsData) {
      const data = userAssignmentsData as unknown as Tdivisionaccess[];
      setUserAssignments(data || []);
    }
  }, [userAssignmentsData]);

  // Mutation to add divisions to the user
  const addDivisionsMutation = useMutation({
    mutationFn: async (payload: Idivsionassigned) => {
      return GmSecServiceInstance.addDivisionAccess(payload);
    },
    onSuccess: async () => {
      // Refresh user assignments after a successful add
      const updatedAssignments = await GmSecServiceInstance.getDivisionAccessList(selectedUser);
      setUserAssignments(updatedAssignments as Tdivisionaccess[]);

      // Clear the selected divisions after adding them
      setSelectedDivisions([]);
    },
    onError: (error) => {
      console.error('Error adding divisions', error);
      setErrorMessage('There was an error adding the divisions.');
    }
  });

  // Mutation to delete a division from the user assignments
  const deleteDivisionMutation = useMutation({
    mutationFn: async (divisionCode: string) => {
      return GmSecServiceInstance.deleteDivisionAccess(selectedUser, divisionCode);
    },
    onSuccess: (data, variables) => {
      // Optimistically update the assignments list
      setUserAssignments((prev) => prev.filter((assignment) => assignment.div_code !== variables));
    },
    onError: (error) => {
      console.error('Error deleting division', error);
      setErrorMessage('There was an error deleting the division.');
    }
  });

  const handleAddDivisions = async () => {
    try {
      // Check for duplicate divisions before adding
      const duplicateDivisions = selectedDivisions.filter((division) =>
        userAssignments.some((assignment) => assignment.div_code === division.div_code)
      );

      if (duplicateDivisions.length > 0) {
        setErrorMessage(
          `The following division(s) are already assigned to this user: ${duplicateDivisions.map((d) => d.div_name).join(', ')}`
        );
        setTimeout(() => {
          setErrorMessage('');
        }, 500);
        return;
      }

      // Add the selected divisions to the user
      for (const division of selectedDivisions) {
        const payload: Idivsionassigned = {
          user_id: selectedUser,
          div_code: division.div_code // Assuming div_code is the project_code
        };
        addDivisionsMutation.mutate(payload); // Use mutation instead of direct API call
      }
    } catch (error) {
      console.error('Error adding divisions', error);
    }
  };

  const handleDeleteDivision = (divisionCode: string) => {
    setDivisionToDelete(divisionCode);
    setOpenConfirmDialog(true);
  };

  const confirmDeleteDivision = () => {
    if (divisionToDelete) {
      deleteDivisionMutation.mutate(divisionToDelete);
      setOpenConfirmDialog(false);
      setDivisionToDelete(null);
    }
  };

  const handleDivisionSelection = (divisionCode: string) => {
    const division = divisions.find((d) => d.div_code === divisionCode);

    if (division) {
      // Check if the division is already assigned
      if (userAssignments.some((assignment) => assignment.div_code === division.div_code)) {
        setErrorMessage('This division is already assigned.');
        setTimeout(() => {
          setErrorMessage('');
        }, 500);
      } else if (!selectedDivisions.some((d) => d.div_code === division.div_code)) {
        setSelectedDivisions((prev) => [...prev, division]);
        setErrorMessage('');
      } else {
        setErrorMessage('This division is already selected.');
        setTimeout(() => {
          setErrorMessage('');
        }, 500);
      }
    }
    setSelectedDivisionCode(divisionCode);
  };

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    setSelectedDivisions([]);
    setSelectedDivisionCode('');
    setErrorMessage('');

    // Fetch divisions for the selected user
    if (userId) {
      SecSerivceInstance.getMasters(app, 'divisions', undefined, undefined)
        .then((response) => {
          setDivisions((response?.tableData as TAssigneddivision[]) || []);
        })
        .catch((error) => {
          console.error('Error fetching divisions', error);
          setDivisions([]);
        });
    } else {
      setDivisions([]);
    }
  };

  return (
    <Box
      className="division-access-container"
      p={4}
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      minHeight="120vh"
      overflow="hidden"
    >
      <Box className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md" maxHeight="85vh" overflow="auto">
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Division Assignments
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
            <InputLabel>Select Division</InputLabel>
            {divisionsError && (
              <Typography color="error" gutterBottom>
                Error fetching divisions
              </Typography>
            )}
            {divisionsLoading && <CircularProgress color="primary" />}
            {/* Division Selection */}
            <Select
              value={selectedDivisionCode}
              onChange={(e) => handleDivisionSelection(e.target.value as string)}
              label="Select Division"
            >
              {divisions.map((division) => (
                <MenuItem key={division.div_code} value={division.div_code}>
                  {division.div_name}
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
        {/* Display Selected Divisions */}
        {selectedDivisions.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Selected Divisions
            </Typography>
            <List>
              {selectedDivisions.map((division) => (
                <ListItem
                  key={division.div_code}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => setSelectedDivisions((prev) => prev.filter((d) => d.div_code !== division.div_code))}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemText primary={division.div_name} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {/* Display User Assigned Divisions */}
        {userAssignments.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Assigned Divisions
            </Typography>
            <List>
              {userAssignments.map((assignment) => (
                <ListItem
                  key={assignment.div_code}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDivision(assignment.div_code)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemText primary={assignment.div_name} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {/* Add Divisions Button */}
        <Box mt={4} display="flex" justifyContent="flex-start">
          <Button variant="contained" color="primary" fullWidth onClick={handleAddDivisions}>
            Add Divisions to User
          </Button>
        </Box>
        {userAssignmentsError && (
          <Typography color="error" gutterBottom>
            Error fetching user assignments
          </Typography>
        )}
        {userAssignmentsLoading && <CircularProgress color="primary" />}
      </Box>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm Delete'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Do you want to revoke access to this division?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteDivision} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDivisionAccessPage;
