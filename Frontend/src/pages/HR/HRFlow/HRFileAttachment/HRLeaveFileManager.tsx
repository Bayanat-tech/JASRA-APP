import { useEffect, useState, useRef } from 'react';
import FileUploadServiceInstance from 'service/services.files';
import HRLeaveMediaList from './HRLeaveMediaList';
import { Button } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { useSelector } from 'store';
import { TFile } from 'types/types.file';
import HrServiceInstance from 'service/Service.hr';

const HRLeaveFileManager = ({
  LeavePage,
  requestNumber,
  isViewMode,
  filesData,
  setFilesData,
  onClose
}: {
  LeavePage?: boolean;
  requestNumber: string;
  isViewMode: boolean;
  filesData: TFile[];
  setFilesData: React.Dispatch<React.SetStateAction<TFile[]>>;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await FileUploadServiceInstance.getEmployeeFiles(requestNumber, 'hr');
        setFilesData(response || []);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [requestNumber, setFilesData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !user?.loginid || !user?.company_code) {
      console.error('Missing required data for file upload');
      return;
    }

    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
    const incoming = Array.from(event.target.files);
    const oversized = incoming.filter(f => f.size > MAX_BYTES).map(f => f.name);
    if (oversized.length > 0) {
      window.alert(`These file(s) exceed 2 MB and were skipped:\n${oversized.join('\n')}`);
    }

    const newFiles = incoming.filter(f => f.size <= MAX_BYTES);
    if (newFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedFiles = await Promise.all(
        newFiles.map(async (file) => {
          try {
            const response = await FileUploadServiceInstance.uploadEmployeeAttachment(file, requestNumber, 'Employees');
            if (!response?.data) {
              console.error('Upload failed for file:', file.name);
              return null;
            }
            const fileData: TFile = {
              created_by: user.loginid,
              updated_by: user.loginid,
              aws_file_locn: response.data,
              extensions: file.type.split('/')[1] || file.name.split('.').pop() || '',
              company_code: user.company_code,
              org_file_name: file.name,
              user_file_name: file.name,
              modules: app,
              flow_level: 0,
              request_number: requestNumber
            };
            // Save the file immediately after upload
            const saveResponse = await HrServiceInstance.saveFile(requestNumber, [fileData]);
            if (saveResponse && Array.isArray(saveResponse)) {
              const updatedFile = saveResponse.find((updated) => updated.aws_file_locn === fileData.aws_file_locn);
              if (updatedFile) {
                fileData.sr_no = updatedFile.sr_no;
              }
            }
            return fileData;
          } catch (fileError) {
            console.error(`Error uploading file ${file.name}:`, fileError);
            return null;
          }
        })
      );

      const validFiles = uploadedFiles.filter((file): file is TFile => file !== null);
      setFilesData((prev) => [...prev, ...validFiles]);

    } catch (error) {
      console.error('Error during file upload process:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          style={{ display: 'none' }}
          accept="*/*"
        />

        {/* Button that triggers file input */}
        <Button
          variant="contained"
          onClick={handleButtonClick}
          disabled={isUploading || !LeavePage}
          sx={{ mb: 1 }}
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </>

      <HRLeaveMediaList
        filesData={filesData}
        setFilesData={setFilesData}
        isViewMode={isViewMode}
        onClose={onClose}
      />
    </div>
  );
};

export default HRLeaveFileManager;