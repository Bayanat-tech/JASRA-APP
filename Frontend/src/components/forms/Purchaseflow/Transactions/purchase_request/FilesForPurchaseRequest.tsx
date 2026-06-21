import { FileOutlined, InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Grid, Stack, Typography, DialogContent } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { useEffect, useState } from 'react';
import FileUploadServiceInstance from 'service/services.files';
import { useSelector } from 'store';
import { TFile } from 'types/types.file';
import MediaList from 'components/MediaList';
import { FormattedMessage } from 'react-intl';

const FilesForPurchaseRequest = ({
  existingFilesData,
  filesData,
  setFilesData,
  module,
  code,
  handleUploadPopup,
  deleteFlag,
  viewFlag,
  level,
  request_number // Add the request_number prop
}: {
  existingFilesData: any[];
  filesData: TFile[];
  setFilesData: React.Dispatch<React.SetStateAction<TFile[]>>;
  module?: string;
  code?: string;
  handleUploadPopup?: () => void;
  viewFlag?: boolean;
  deleteFlag?: boolean;
  level?: number;
  request_number: string; // Add the request_number prop type
}) => {
  //------------------------constants---------------
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false); // State to manage file uploading status
  const { app } = useSelector((state) => state.menuSelectionSlice); // Get the current app from the Redux store
  const { user } = useAuth(); // Get the current user from the auth hook
  const [localFilesData, setLocalFilesData] = useState<TFile[]>(filesData); // Local state for files data

  //---------------handlers-------------
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setIsFileUploading(true); // Set file uploading status to true
      const FilesData = Object.values(event.target.files); // Convert file list to array
      await Promise.all(
        FilesData.map(async (eachFile) => {
          const response = await FileUploadServiceInstance.uploadFile(eachFile); // Upload each file
          const tempModule = !!module && module.length > 0 ? module : app; // Determine the module
          if (response && response.data) {
            setFilesData((prevData) => [
              ...prevData,
              {
                created_by: user?.loginid,
                updated_by: user?.loginid,
                aws_file_locn: response.data,
                extensions: eachFile.type.split('/')[1],
                company_code: user?.company_code as string,
                org_file_name: eachFile.name,
                modules: tempModule,
                flow_level: !!level ? level : 0,
                request_number: tempModule.slice(0, 3).toUpperCase() + code
              }
            ]); // Update files data state
          }
        })
      );

      setIsFileUploading(false); // Set file uploading status to false
    }
  };

  const handleFileEdit = async () => {
    console.log('this is files data', filesData);
    filesData.map(async (eachFile) => {
      await FileUploadServiceInstance.editFile(eachFile.aws_file_locn as string, eachFile.user_file_name as string); // Upload each file
    });
    handleUploadPopup && handleUploadPopup();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        content: file,
        company_code: user?.company_code as string,
        extensions: file.type.split('/')[1],
        org_file_name: file.name,
        aws_file_locn: '',
        modules: module || app,
        flow_level: level || 0,
        request_number: (module || app).slice(0, 3).toUpperCase() + code
      }));
      setLocalFilesData([...localFilesData, ...newFiles]);
    }
  };

  //--------------------------useEffects-----------------
  useEffect(() => {
    if (!!existingFilesData && existingFilesData.length > 0) setFilesData(existingFilesData); // Set existing files data if available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingFilesData]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        {/* Hidden file input for uploading files */}
        <input style={{ display: 'none' }} id="upload-file" type="file" onChange={handleFileUpload} />
        <label htmlFor="upload-file">
          <Button
            variant="dashed"
            color="primary"
            component="span"
            startIcon={isFileUploading ? <LoadingOutlined /> : <FileOutlined />}
            disabled={isFileUploading} // Disable button while uploading
          >
            Upload
          </Button>
          <DialogContent>
            <input type="file" multiple onChange={handleFileChange} />
            <ul>
              {localFilesData.map((file, index) => (
                <li key={index}>{file.org_file_name}</li>
              ))}
            </ul>
          </DialogContent>
        </label>
      </div>
      <div>
        {!!filesData && filesData.length > 0 ? (
          // Display media list if files are available
          <MediaList deleteFlag={deleteFlag} viewFlag={viewFlag} mediaData={filesData} setFilesData={setFilesData} />
        ) : (
          // Display placeholder if no files are available
          <div className="w-full flex items-center justify-center h-96">
            <Stack className="mt-4">
              <InboxOutlined style={{ width: 50, height: 20, transform: 'scale(3)', color: 'GrayText' }} />
              <Typography color={'GrayText'}>No Data</Typography>
            </Stack>
          </div>
        )}
      </div>
      <Grid item xs={12} className="flex justify-end">
        <Button type="submit" variant="contained" onClick={() => handleFileEdit()}>
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </div>
  );
};

export default FilesForPurchaseRequest;
