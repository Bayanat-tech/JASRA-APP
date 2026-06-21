import { useEffect, useState } from 'react';
import FileUploadServiceInstance from 'service/services.files';
import VendorMediaList from './VendorMediaList';
import VendorServiceInstance from '../services/service.vendor';
import { Button } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { useSelector } from 'store';
import { TFile } from 'types/types.file';
import { useIntl } from 'react-intl';

// Define the API response type
type ApiFileResponse = {
  companyCode: string;
  requestNumber: string;
  srNo: number;
  fileName: string | null;
  orgFileName: string;
  awsFileLocn: string;
  flowLevel: number | null;
  modules: string;
  updatedAt: string;
  updatedBy: string;
  createdBy: string;
  createdAt: string;
  extensions: string;
  userFileName: string;
  type: string | null;
  fileTransfer: string | null;
};

// Mapping function to convert API response to TFile
const mapApiFileToTFile = (apiFile: ApiFileResponse): TFile => {
  return {
    company_code: apiFile.companyCode,
    request_number: apiFile.requestNumber,
    sr_no: apiFile.srNo,
    file_name: apiFile.fileName || undefined,
    org_file_name: apiFile.orgFileName,
    aws_file_locn: apiFile.awsFileLocn,
    flow_level: apiFile.flowLevel || undefined,
    modules: apiFile.modules,
    updated_at: apiFile.updatedAt ? new Date(apiFile.updatedAt) : undefined,
    updated_by: apiFile.updatedBy,
    created_by: apiFile.createdBy,
    created_at: apiFile.createdAt ? new Date(apiFile.createdAt) : undefined,
    extensions: apiFile.extensions,
    user_file_name: apiFile.userFileName,
  };
};

const VendorFilesManager = ({
  requestNumber,
  isViewMode,
  filesData,
  setFilesData,
  onClose,
  hideUploadButton = true,
  hideEditDelete = false
}: {
  requestNumber: string;
  isViewMode: boolean;
  filesData: TFile[];
  setFilesData: React.Dispatch<React.SetStateAction<TFile[]>>;
  onClose: () => void;
  hideUploadButton?: boolean;
  hideEditDelete?: boolean;
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const intl = useIntl();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await FileUploadServiceInstance.getVendorFiles(requestNumber, 0);

        // Check if response has the expected structure
        if (response && response.success && Array.isArray(response.data)) {
          const mappedFiles = response.data.map(mapApiFileToTFile);
          setFilesData(mappedFiles);
        } else if (Array.isArray(response)) {
          // If response is directly an array (backward compatibility)
          const mappedFiles = response.map(mapApiFileToTFile);
          setFilesData(mappedFiles);
        } else {
          console.error('Invalid file data format:', response);
          setFilesData([]);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        setFilesData([]);
      }
    };

    if (requestNumber) {
      fetchFiles();
    }
  }, [requestNumber, setFilesData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setIsUploading(true);

      try {
        const uploadedFiles = await Promise.all(
          newFiles.map(async (file) => {
            try {
              const response = await FileUploadServiceInstance.uploadFileVendor(file, requestNumber, 'Vendor');
              if (response?.data) {
                const fileData: TFile = {
                  created_by: user?.loginid,
                  updated_by: user?.loginid,
                  aws_file_locn: response.data,
                  extensions: file.type.split('/')[1],
                  company_code: user?.company_code as string,
                  org_file_name: file.name,
                  user_file_name: file.name,
                  modules: app,
                  flow_level: 0,
                  request_number: requestNumber
                };

                try {
                  const saveResponse = await VendorServiceInstance.saveFile(requestNumber, [fileData]);
                  if (Array.isArray(saveResponse) && saveResponse.length > 0) {
                    const updatedFile = saveResponse.find((updated) => updated.aws_file_locn === fileData.aws_file_locn);
                    if (updatedFile?.sr_no) {
                      fileData.sr_no = updatedFile.sr_no;
                    }
                  }
                  return fileData;
                } catch (saveError) {
                  console.error('Error saving file:', saveError);
                  return null;
                }
              }
              return null;
            } catch (uploadError) {
              console.error('Error uploading file:', uploadError);
              return null;
            }
          })
        );

        const validFiles = uploadedFiles.filter((file): file is TFile => file !== null);
        setFilesData((prev) => [...prev, ...validFiles]);
      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div>
      {/* show upload only when NOT view mode and caller allows upload */}
      {!isViewMode && !hideUploadButton && (
        <>
          <input
            type="file"
            id="upload-file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            multiple
          />
          <label htmlFor="upload-file">
            <Button
              variant="contained"
              component="span"
              disabled={isUploading}
            >
              {isUploading
                ? (intl.formatMessage({ id: 'Uploading' }) || 'Uploading...')
                : (intl.formatMessage({ id: 'UploadFiles' }) || 'Upload Files')}
            </Button>
          </label>
        </>
      )}
      <VendorMediaList
        filesData={filesData}
        setFilesData={setFilesData}
        isViewMode={isViewMode}
        onClose={onClose}
        hideEditDelete={hideEditDelete}
      />
    </div>
  );
};

export default VendorFilesManager;