import { DeleteOutlined, EditOutlined, EyeFilled } from '@ant-design/icons';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  TablePagination
} from '@mui/material';
//import { ImExit } from 'react-icons/im'; // Add ImExit icon import
import { useState } from 'react';
import FileUploadServiceInstance from 'service/services.files';
import { TFile } from 'types/types.file';

const MediaListPf = ({
  isViewMode,
  mediaData,
  setFilesData,
  deleteFlag,
  viewFlag,
  onFileNameChange, // Add a prop to notify changes
  onEditDialogStateChange, // Add a prop to notify edit dialog state
  onClose // Add onClose prop for Exit button
}: {
  isViewMode?: boolean;
  mediaData: TFile[];
  setFilesData: React.Dispatch<React.SetStateAction<TFile[]>>;
  deleteFlag?: boolean;
  viewFlag?: boolean;
  onFileNameChange?: (index: number, newName: string) => void; // Update prop to pass index and newName
  onEditDialogStateChange?: (isOpen: boolean) => void; // New prop for edit dialog state
  onClose?: (exit: boolean) => void; // New prop for Exit button
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
  const [editedFileName, setEditedFileName] = useState('');
  const [isUpdateEnabled, setIsUpdateEnabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar
  const [confirmOpen, setConfirmOpen] = useState(false); // confirmation dialog state
  const [confirmPayload, setConfirmPayload] = useState<{
    index: number;
    sr_no?: number;
    request_number?: string;
    aws_file_locn?: string;
  } | null>(null);
  const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false); // deletion snackbar
  const [page, setPage] = useState(0); // Add state for current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Add state for rows per page

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage); // Update current page
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Update rows per page
    setPage(0); // Reset to the first page
  };

  const paginatedData = mediaData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage); // Paginate data

  const handleEditClick = (index: number) => {
    setCurrentFileIndex(index);
    setEditedFileName(mediaData[index].user_file_name || '');
    setIsUpdateEnabled(false);
    setEditDialogOpen(true);
    onEditDialogStateChange && onEditDialogStateChange(true); // Notify parent that edit dialog is open
  };

  const handleUpdate = async () => {
    if (currentFileIndex !== null) {
      const fileToUpdate = mediaData[currentFileIndex];
      await FileUploadServiceInstance.editPFFile(fileToUpdate.aws_file_locn ?? '', editedFileName, fileToUpdate.request_number ?? ''); // Pass request_number
      setFilesData((prev) => prev.map((file, i) => (i === currentFileIndex ? { ...file, user_file_name: editedFileName } : file)));
      onFileNameChange && onFileNameChange(currentFileIndex, editedFileName);
      setEditDialogOpen(false);
      onEditDialogStateChange && onEditDialogStateChange(false); // Notify parent that edit dialog is closed
      setSnackbarOpen(true); // Show success message
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    onEditDialogStateChange && onEditDialogStateChange(false); // Notify parent that edit dialog is closed
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // const handleExitClick = () => {
  //   setEditDialogOpen(false); // Close the edit dialog
  //   onEditDialogStateChange && onEditDialogStateChange(false); // Notify parent that the dialog is closed
  //   onClose && onClose(true); // Notify parent if needed
  // };

  //----------------handlers----------------
  const handleDelete = (index: number, sr_no?: number, request_number?: string, aws_file_locn?: string) => {
    // Open confirmation dialog with payload
    setConfirmPayload({ index, sr_no, request_number, aws_file_locn });
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!confirmPayload) return;
    const { index, sr_no, request_number, aws_file_locn } = confirmPayload;
    try {
      if (sr_no !== undefined && sr_no !== null && !!request_number && !!aws_file_locn) {
        await FileUploadServiceInstance.deleteFilePf(request_number, sr_no, aws_file_locn);
      }

      setFilesData((prevFiles) => prevFiles.filter((eachFile: TFile, eachFileIndex: number) => eachFileIndex !== index));
      setDeleteSnackbarOpen(true);
    } catch (error) {
      // show error notification using existing Snackbar pattern or a new one
      setDeleteSnackbarOpen(true);
      console.error('Failed to delete file:', error);
    } finally {
      setConfirmOpen(false);
      setConfirmPayload(null);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell className="text-left">Sr.No.</TableCell>
              <TableCell className="text-left">Original File Name</TableCell>
              <TableCell className="text-left">User File Name</TableCell>
              <TableCell className="text-left">Upload By</TableCell>
              <TableCell className="text-center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((eachFile, index) => (
              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={index}>
                <TableCell className="text-left" component="th" scope="row">
                  {eachFile.sr_no}
                </TableCell>
                <TableCell className="text-left">{eachFile.org_file_name}</TableCell>
                <TableCell className="text-left">{eachFile.user_file_name}</TableCell>
                <TableCell className="text-left">{eachFile.updated_by}</TableCell>
                <TableCell className="text-center">
                  {viewFlag !== false && (
                    <IconButton size="medium" color="info" LinkComponent={'a'} href={eachFile.aws_file_locn} target="_blank">
                      <EyeFilled />
                    </IconButton>
                  )}
                  <IconButton disabled={isViewMode} size="medium" color="primary" onClick={() => handleEditClick(index)}>
                    <EditOutlined />
                  </IconButton>
                  {deleteFlag !== false && (
                    <IconButton
                      disabled={isViewMode}
                      size="medium"
                      color="error"
                      onClick={() => handleDelete(index, eachFile.sr_no, eachFile?.request_number ?? '', eachFile.aws_file_locn ?? '')}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination and Exit Button Container */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem' }}>
        <TablePagination
          rowsPerPageOptions={[10, 15, 25]}
          component="div"
          count={mediaData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Edit File Name</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User File Name"
            value={editedFileName}
            onChange={(e) => {
              setEditedFileName(e.target.value);
              setIsUpdateEnabled(e.target.value !== mediaData[currentFileIndex!].user_file_name);
            }}
            sx={{
              marginTop: 2,
              '& .MuiInputLabel-root': { fontWeight: 'bold', fontSize: '1rem' },
              '& .MuiInputBase-root': { fontSize: '1rem' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
          <Button onClick={handleCloseEditDialog} color="secondary" variant="outlined" sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary" variant="contained" disabled={!isUpdateEnabled} sx={{ minWidth: 100 }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success message */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          File name updated successfully!
        </Alert>
      </Snackbar>

      {/* Confirmation dialog for deletion */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this file? This will remove the record and delete the file from the storage bucket.
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
          <Button onClick={() => { setConfirmOpen(false); setConfirmPayload(null); }} color="secondary" variant="outlined" sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button onClick={performDelete} color="error" variant="contained" sx={{ minWidth: 100 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for delete success/error */}
      <Snackbar open={deleteSnackbarOpen} autoHideDuration={3000} onClose={() => setDeleteSnackbarOpen(false)}>
        <Alert onClose={() => setDeleteSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          File deleted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default MediaListPf;
