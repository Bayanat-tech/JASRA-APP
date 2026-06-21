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
import { useIntl } from 'react-intl';

const VendorMediaList = ({
  filesData,
  setFilesData,
  isViewMode,
  onClose,
  hideEditDelete = false
}: {
  filesData: any[];
  setFilesData: React.Dispatch<React.SetStateAction<any[]>>;
  isViewMode: boolean;
  onClose: () => void;
  hideEditDelete?: boolean;
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
  const [editedFileName, setEditedFileName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const intl = useIntl();

  const handleEditClick = (index: number) => {
    setCurrentFileIndex(index);
    setEditedFileName(filesData[index].user_file_name || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (currentFileIndex !== null) {
      const fileToUpdate = filesData[currentFileIndex];
      await FileUploadServiceInstance.editVendorFile(fileToUpdate.aws_file_locn ?? '', editedFileName, fileToUpdate.request_number ?? '');
      setFilesData((prev) => prev.map((file, i) => (i === currentFileIndex ? { ...file, user_file_name: editedFileName } : file)));
      setEditDialogOpen(false);
    }
  };

  const handleDelete = async (file: any) => {
    try {
      // Support different key names returned by APIs
      const attachmentNo = file.attachment_sr_no ?? file.attachmentSrNo ?? file.attachmentSrno ?? file.ATTACHMENT_SR_NO ?? undefined;

      // Call API with attachment_sr_no when available
      await FileUploadServiceInstance.deleteFileVendorAttachment(file.request_number, file.sr_no, attachmentNo);

      // Remove only the matching attachment (match sr_no + attachment_sr_no when available)
      setFilesData((prev) =>
        prev.filter((f: any) => {
          const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachmentSrno ?? f.ATTACHMENT_SR_NO ?? undefined;
          const fSr = f.sr_no ?? f.srNo ?? f.SR_NO;
          const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;

          // If attachment number is known, match both sr and attachment
          if (attachmentNo !== undefined && attachmentNo !== null) {
            return !(fSr === fileSr && String(fAttach) === String(attachmentNo));
          }
          // Otherwise fallback to removing by sr_no only
          return !(fSr === fileSr);
        })
      );
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
              <TableCell sx={{ width: '10%', fontWeight: 'bold', textAlign: 'center' }}>
                {intl.formatMessage({ id: 'SrNo' }) || 'Sr. No.'}
              </TableCell>
              <TableCell sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>
                {intl.formatMessage({ id: 'OriginalFileName' }) || 'Original File Name'}
              </TableCell>
              <TableCell sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>
                {intl.formatMessage({ id: 'UserFileName' }) || 'User File Name'}
              </TableCell>
              <TableCell sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}>
                {intl.formatMessage({ id: 'Actions' }) || 'Actions'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((file, index) => (
              <TableRow key={index}>
                <TableCell sx={{ textAlign: 'center' }}>{file.sr_no}</TableCell>
                <TableCell sx={{ textAlign: 'center', wordBreak: 'break-word' }}>{file.org_file_name}</TableCell>
                <TableCell sx={{ textAlign: 'center', wordBreak: 'break-word' }}>{file.user_file_name}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <IconButton href={file.aws_file_locn} target="_blank">
                    <VisibilityOutlined />
                  </IconButton>
                  {/* Conditionally render Edit and Delete buttons */}
                  {!hideEditDelete && (
                    <>
                      <IconButton onClick={() => handleEditClick(index)} disabled={isViewMode}>
                        <EditOutlined />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(file)} disabled={isViewMode}>
                        <DeleteOutlined />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
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
        <Tooltip title={intl.formatMessage({ id: 'Exit' }) || 'Exit'}>
          <Button size="large" color="primary" onClick={onClose}>
            <ImExit />
          </Button>
        </Tooltip>
      </Grid>
    </>
  );
};

export default VendorMediaList;
