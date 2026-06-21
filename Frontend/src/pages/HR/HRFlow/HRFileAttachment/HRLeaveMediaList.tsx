import {
  IconButton,
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
  Tooltip,
  Grid,
  TablePagination
} from '@mui/material';
import { DeleteOutlined, EditOutlined, VisibilityOutlined } from '@mui/icons-material';
import { ImExit } from 'react-icons/im';
import { useState } from 'react';
import FileUploadServiceInstance from 'service/services.files';

const HRLeaveMediaList = ({
  filesData,
  setFilesData,
  isViewMode,
  onClose
}: {
  filesData: any[];
  setFilesData: React.Dispatch<React.SetStateAction<any[]>>;
  isViewMode: boolean;
  onClose: () => void;
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
  const [editedFileName, setEditedFileName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Helper to normalize fields (support snake_case and camelCase)
  const getSrNo = (file: any) => file.sr_no ?? file.srNo;
  const getOrgFileName = (file: any) => file.org_file_name ?? file.orgFileName;
  const getUserFileName = (file: any) => file.user_file_name ?? file.userFileName;
  const getAwsLoc = (file: any) => file.aws_file_locn ?? file.awsFileLocn;
  const getRequestNumber = (file: any) => file.request_number ?? file.requestNumber;

  const handleEditClick = (index: number) => {
    setCurrentFileIndex(index);
    const file = filesData[index];
    setEditedFileName(getUserFileName(file) || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (currentFileIndex !== null) {
      const fileToUpdate = filesData[currentFileIndex];
      const awsLoc = getAwsLoc(fileToUpdate) ?? '';
      const reqNo = getRequestNumber(fileToUpdate) ?? '';


      // call API with normalized values
      await FileUploadServiceInstance.editEmployeeFile(awsLoc, editedFileName, reqNo);

      // update both snake_case and camelCase keys in state so UI reflects changes immediately
      setFilesData((prev) =>
        prev.map((file, i) =>
          i === currentFileIndex
            ? {
              ...file,
              user_file_name: editedFileName,
              userFileName: editedFileName,
              // keep other fields intact
            }
            : file
        )
      );
      setEditDialogOpen(false);
    }
  };
  const handleDelete = async (file: any) => {
    try {
      const reqNo = getRequestNumber(file) ?? '';
      const srNo = getSrNo(file);

      // call API with normalized params
      await FileUploadServiceInstance.deleteEmployeeAttachment(reqNo, srNo);
      setFilesData((prev) => prev.filter((f) => (getSrNo(f) !== srNo)));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '10%', fontWeight: 'bold', textAlign: 'center' }}>Sr. No.</TableCell>
              <TableCell sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>Original File Name</TableCell>
              <TableCell sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>User File Name</TableCell>
              <TableCell sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((file, index) => {
              const sr = getSrNo(file);
              const org = getOrgFileName(file);
              const user = getUserFileName(file);
              const aws = getAwsLoc(file);

              return (
                <TableRow key={index}>
                  <TableCell sx={{ textAlign: 'center' }}>{sr}</TableCell>
                  <TableCell sx={{ textAlign: 'center', wordBreak: 'break-word' }}>{org}</TableCell>
                  <TableCell sx={{ textAlign: 'center', wordBreak: 'break-word' }}>{user}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton href={aws} target="_blank">
                      <VisibilityOutlined />
                    </IconButton>
                    <IconButton onClick={() => handleEditClick(index)} disabled={isViewMode}>
                      <EditOutlined />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(file)} disabled={isViewMode}>
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filesData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit File Name</DialogTitle>
        <DialogContent>
          <TextField fullWidth value={editedFileName} onChange={(e) => setEditedFileName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Button */}
      <Grid item xs={12} className="flex justify-end" sx={{ marginTop: 2 }}>
        <Tooltip title="Exit">
          <Button size="large" color="primary" onClick={onClose}>
            <ImExit />
          </Button>
        </Tooltip>
      </Grid>
    </>
  );
};

export default HRLeaveMediaList;
