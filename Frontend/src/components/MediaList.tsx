import { DeleteOutlined, EyeFilled } from '@ant-design/icons';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import FileUploadServiceInstance from 'service/services.files';
import { TFile } from 'types/types.file';

const MediaList = ({
  mediaData,
  setFilesData,
  deleteFlag,
  viewFlag
}: {
  mediaData: TFile[];
  setFilesData: React.Dispatch<React.SetStateAction<TFile[]>>;
  deleteFlag?: boolean;
  viewFlag?: boolean;
}) => {
  //----------------handlers----------------
  const handleDelete = async (index: number, sr_no?: number, request_number?: string) => {
    if (sr_no !== undefined && sr_no !== null && !!request_number) {
      await FileUploadServiceInstance.deleteFile(request_number, sr_no);
    }
    setFilesData((prevFiles) => prevFiles.filter((eachFile: TFile, eachFileIndex: number) => eachFileIndex !== index));
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell className="text-center">Sr. No.</TableCell>
            <TableCell className="text-center">Original File Name</TableCell>
            <TableCell className="text-center">File Name</TableCell>
            <TableCell className="text-center">Upload By</TableCell>
            <TableCell className="text-center">Delete</TableCell>
            <TableCell className="text-center">View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mediaData?.map((eachFile, index) => (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={index}>
              <TableCell className="text-center" component="th" scope="row">
                {eachFile.sr_no}
              </TableCell>
              <TableCell className="text-center">{eachFile.org_file_name}</TableCell>

              <TableCell className="text-center">
                <TextField
                  size="small"
                  onChange={(e) =>
                    setFilesData((prev) => prev.map((item, i) => (i === index ? { ...item, user_file_name: e.target.value } : item)))
                  }
                  id="prin_lic_type"
                  name="prin_lic_type"
                  fullWidth
                  value={eachFile.user_file_name}
                />
              </TableCell>
              <TableCell className="text-center">{eachFile.updated_by}</TableCell>
              <TableCell className="text-center">
                {' '}
                {deleteFlag === false ? null : (
                  <IconButton size="medium" color="error">
                    <DeleteOutlined onClick={() => handleDelete(index, eachFile.sr_no, eachFile?.request_number ?? '')} />
                  </IconButton>
                )}
              </TableCell>
              <TableCell className="text-center">
                {' '}
                {viewFlag === false ? null : (
                  <IconButton size="medium" color="info" LinkComponent={'a'} href={eachFile.aws_file_locn} target="_blank">
                    <EyeFilled />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MediaList;
