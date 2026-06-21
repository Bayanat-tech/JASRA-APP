import { useState, useEffect } from 'react';
import { TUserAssigned, TUser, TAssignedProject, TScreenaccess } from 'pages/Security/type/screenaccess-sec-types';
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

const ScreenAccessPage = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<TAssignedProject[]>([]);
  const [userAssignments, setUserAssignments] = useState<TScreenaccess[]>([]);
  const [users, setUsers] = useState<TUser[]>([]);
  const [projects, setProjects] = useState<TAssignedProject[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
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

  // Fetch projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError
  } = useQuery({
    queryKey: ['fetchProjects', app, 'projects', undefined, undefined],
    queryFn: () => SecSerivceInstance.getMasters(app, 'projects', undefined, undefined),
    enabled: !!app
  });

  // Fetch user assignments
  const {
    data: userAssignmentsData,
    isLoading: userAssignmentsLoading,
    error: userAssignmentsError
  } = useQuery({
    queryKey: ['fetchUserAssignments', selectedUser],
    queryFn: () => GmSecServiceInstance.getScreenAccessList(selectedUser),
    enabled: !!selectedUser
  });

  // Set users and projects when data is fetched
  useEffect(() => {
    if (usersData) {
      setUsers((usersData?.tableData as TUser[]) || []);
    }
  }, [usersData]);

  useEffect(() => {
    if (projectsData) {
      setProjects((projectsData?.tableData as TAssignedProject[]) || []);
    }
  }, [projectsData]);

  useEffect(() => {
    if (userAssignmentsData) {
      const data = userAssignmentsData as unknown as TScreenaccess[];
      setUserAssignments(data || []);
    }
  }, [userAssignmentsData]);

  // Mutation to add projects to the user
  const addProjectsMutation = useMutation({
    mutationFn: async (payload: TUserAssigned) => {
      return GmSecServiceInstance.addscreenAccess(payload);
    },
    onSuccess: async () => {
      // Refresh user assignments after a successful add
      const updatedAssignments = await GmSecServiceInstance.getScreenAccessList(selectedUser);
      setUserAssignments(updatedAssignments as TScreenaccess[]);

      // Clear the selected projects after adding them
      setSelectedProjects([]);
    },
    onError: (error) => {
      console.error('Error adding projects', error);
      setErrorMessage('There was an error adding the projects.');
    }
  });

  // Mutation to delete a project from the user assignments
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectCode: string) => {
      return GmSecServiceInstance.deleteScreenAccess(selectedUser, projectCode);
    },
    onSuccess: (data, variables) => {
      // Optimistically update the assignments list
      setUserAssignments((prev) => prev.filter((assignment) => assignment.project_code !== variables));
    },
    onError: (error) => {
      console.error('Error deleting project', error);
      setErrorMessage('There was an error deleting the project.');
    }
  });

  const handleAddProjects = async () => {
    try {
      // Check for duplicate projects before adding
      const duplicateProjects = selectedProjects.filter((project) =>
        userAssignments.some((assignment) => assignment.project_code === project.project_code)
      );

      if (duplicateProjects.length > 0) {
        setErrorMessage(
          `The following project(s) are already assigned to this user: ${duplicateProjects.map((p) => p.project_name).join(', ')}`
        );
        setTimeout(() => {
          setErrorMessage('');
        }, 500);
        return;
      }

      // Add the selected projects to the user
      for (const project of selectedProjects) {
        const payload: TUserAssigned = {
          user_id: selectedUser,
          project_code: project.project_code
        };
        addProjectsMutation.mutate(payload); // Use mutation instead of direct API call
      }
    } catch (error) {
      console.error('Error adding projects', error);
    }
  };

  const handleDeleteProject = (projectCode: string) => {
    setProjectToDelete(projectCode);
    setOpenConfirmDialog(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete);
      setOpenConfirmDialog(false);
      setProjectToDelete(null);
    }
  };

  const handleProjectSelection = (projectCode: string) => {
    const project = projects.find((p) => p.project_code === projectCode);

    if (project) {
      // Check if the project is already assigned
      if (userAssignments.some((assignment) => assignment.project_code === project.project_code)) {
        setErrorMessage('This project is already assigned.');
        setTimeout(() => {
          setErrorMessage('');
        }, 500);
      } else if (!selectedProjects.some((p) => p.project_code === project.project_code)) {
        setSelectedProjects((prev) => [...prev, project]);
        setErrorMessage('');
      } else {
        setErrorMessage('This project is already selected.');
        setTimeout(() => {
          setErrorMessage('');
        }, 500);
      }
    }
    setSelectedProjectCode(projectCode);
  };

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    setSelectedProjects([]);
    setSelectedProjectCode('');
    setErrorMessage('');

    // Fetch projects for the selected user
    if (userId) {
      SecSerivceInstance.getMasters(app, 'projects', undefined, undefined)
        .then((response) => {
          setProjects((response?.tableData as TAssignedProject[]) || []);
        })
        .catch((error) => {
          console.error('Error fetching projects', error);
          setProjects([]);
        });
    } else {
      setProjects([]);
    }
  };

  return (
    <Box
      className="screen-access-container"
      p={4}
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      minHeight="120vh"
      overflow="hidden"
    >
      <Box className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md" maxHeight="85vh" overflow="auto">
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Project Assignments
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
            <InputLabel>Select Project</InputLabel>
            {projectsError && (
              <Typography color="error" gutterBottom>
                Error fetching projects
              </Typography>
            )}
            {projectsLoading && <CircularProgress color="primary" />}
            {/* Project Selection */}
            <Select value={selectedProjectCode} onChange={(e) => handleProjectSelection(e.target.value as string)} label="Select Project">
              {projects.map((project) => (
                <MenuItem key={project.project_code} value={project.project_code}>
                  {project.project_name}
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
        {/* Display Selected Projects */}
        {selectedProjects.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Selected Projects
            </Typography>
            <List>
              {selectedProjects.map((project) => (
                <ListItem
                  key={project.project_code}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => setSelectedProjects((prev) => prev.filter((p) => p.project_code !== project.project_code))}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemText primary={project.project_name} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {/* Display User Assigned Projects */}
        {userAssignments.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Assigned Projects
            </Typography>
            <List>
              {userAssignments.map((assignment) => (
                <ListItem
                  key={assignment.project_code}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteProject(assignment.project_code)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemText primary={assignment.project_name} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {/* Add Projects Button */}
        <Box mt={4} display="flex" justifyContent="flex-start">
          <Button variant="contained" color="primary" fullWidth onClick={handleAddProjects}>
            Add Projects to User
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
          <DialogContentText id="alert-dialog-description">Do you want to revoke access to this project?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteProject} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScreenAccessPage;
