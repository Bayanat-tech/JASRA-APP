import { FileOutlined, InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Grid, Stack, Typography, Tooltip } from '@mui/material';
import { ImExit } from 'react-icons/im';
import useAuth from 'hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import FileUploadServiceInstance from 'service/services.files';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useSelector } from 'store';
import { TFile } from 'types/types.file';
import MediaListPf from 'components/MediaListPf';
import { message } from 'antd';

const FilesForPurchaseRequest = ({
  isViewMode,
  existingFilesData,
  filesData,
  setFilesData,
  module,
  code,
  handleUploadPopup,
  deleteFlag,
  viewFlag,
  level,
  request_number,
  type,
  onClose
}: {
  isViewMode?: boolean;
  existingFilesData: any;
  filesData: TFile[];
  setFilesData: React.Dispatch<React.SetStateAction<TFile[]>>;
  module?: string;
  code?: string;
  handleUploadPopup?: () => void;
  viewFlag?: boolean;
  deleteFlag?: boolean;
  level?: number;
  request_number: string;
  type?: string;
  onClose: () => void;
}) => {
  //------------------------constants---------------
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const isEditingFileName = useRef(false);

  //---------------handlers-------------
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const duplicateFiles: string[] = [];
      const newFiles = Array.from(event.target.files).filter((eachFile) => {
        const isDuplicate =
          filesData.some((file) => file.org_file_name === eachFile.name && file.request_number === request_number) ||
          existingFilesData.some(
            (file: { org_file_name: string; request_number: string }) =>
              file.org_file_name === eachFile.name && file.request_number === request_number
          );
        if (isDuplicate) {
          duplicateFiles.push(eachFile.name);
        }
        return !isDuplicate;
      });

      if (duplicateFiles.length > 0) {
        message.warning(`The following files already exist: ${duplicateFiles.join(', ')}`);
      }

      const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
      const incoming = Array.from(event.target.files);
      const oversized = incoming.filter((f) => f.size > MAX_BYTES).map((f) => f.name);
      if (oversized.length > 0) {
        window.alert(`These file(s) exceed 5 MB and were skipped:\n${oversized.join('\n')}`);
      }

      const newFile = incoming.filter((f) => f.size <= MAX_BYTES);
      if (newFile.length === 0) return;

      if (newFiles.length > 0) {
        setIsFileUploading(true);
        const FilesData = await Promise.all(
          newFiles.map(async (eachFile) => {
            const response = await FileUploadServiceInstance.uploadFilePf(eachFile, request_number, type || 'Purchase_Request');
            const tempModule = !!module && module.length > 0 ? module : app;
            if (response && response.data) {
              const fileData = {
                created_by: user?.loginid,
                updated_by: user?.loginid,
                aws_file_locn: response.data,
                extensions: eachFile.type.split('/')[1],
                company_code: user?.company_code as string,
                org_file_name: eachFile.name,
                user_file_name: eachFile.name,
                modules: tempModule,
                flow_level: !!level ? level : 0,
                request_number: request_number
              } as TFile;

              const saveResponse = await GmPfServiceInstance.saveFile(request_number, [fileData]);

              if (saveResponse && Array.isArray(saveResponse)) {
                const updatedFile = saveResponse.find((updated) => updated.aws_file_locn === fileData.aws_file_locn);
                if (updatedFile) {
                  fileData.sr_no = updatedFile.sr_no;
                }
              }

              return fileData;
            }
            return null;
          })
        );

        const validFilesData = FilesData.filter((file): file is TFile => file !== null);
        setFilesData((prevData) => [...prevData, ...validFilesData]);

        setHasChanges(true);
        setIsFileUploading(false);

        if (handleUploadPopup) {
          handleUploadPopup();
        }
      }
    }
  };

  const handleFileNameChange = (index: number, newName: string) => {
    setFilesData((prev) => prev.map((item, i) => (i === index ? { ...item, user_file_name: newName } : item)));
    setHasChanges(true);
  };

  const handleEditDialogState = (isOpen: boolean) => {
    isEditingFileName.current = isOpen;
  };

  //--------------------------useEffects-----------------
  useEffect(() => {
    console.log('Raw existingFilesData:', existingFilesData);

    if (existingFilesData) {
      let dataToProcess: any[] = [];

      if (existingFilesData.success !== undefined && existingFilesData.data) {
        console.log('Processing full API response');
        dataToProcess = existingFilesData.data;
      } else if (Array.isArray(existingFilesData)) {
        console.log('Processing array data');
        dataToProcess = existingFilesData;
      }

      if (dataToProcess.length > 0) {
        const formattedFiles = dataToProcess.map((item: any) => ({
          company_code: item.companyCode || item.company_code,
          request_number: item.requestNumber || item.request_number,
          sr_no: item.srNo || item.sr_no,
          file_name: item.fileName || item.file_name,
          org_file_name: item.orgFileName || item.org_file_name,
          aws_file_locn: item.awsFileLocn || item.aws_file_locn,
          flow_level: item.flowLevel || item.flow_level,
          modules: item.modules,
          updated_at: item.updatedAt || item.updated_at,
          updated_by: item.updatedBy || item.updated_by,
          created_by: item.createdBy || item.created_by,
          created_at: item.createdAt || item.created_at,
          extensions: item.extensions,
          user_file_name: item.userFileName || item.user_file_name,
          type: item.type
        }));

        console.log('Formatted filesData:', formattedFiles);
        setFilesData(formattedFiles);
      } else {
        console.log('No files data to process');
        setFilesData([]);
      }
    }
  }, [existingFilesData, setFilesData]);

  useEffect(() => {
    console.log('Current filesData state:', filesData);
  }, [filesData]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges || isFileUploading) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges, isFileUploading]);

  useEffect(() => {
    console.log(`Form type: ${type}`);
  }, [type]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <input
          style={{ display: 'none' }}
          id="upload-file"
          type="file"
          multiple
          onChange={(e) => {
            handleFileUpload(e);
          }}
        />
        <label htmlFor="upload-file">
          {!isViewMode && (
            <Button
              variant="dashed"
              color="primary"
              component="span"
              startIcon={isFileUploading ? <LoadingOutlined /> : <FileOutlined />}
              disabled={isFileUploading}
            >
              Upload
            </Button>
          )}
        </label>
      </div>
      <div>
        {filesData && filesData.length > 0 ? (
          <MediaListPf
            isViewMode={isViewMode}
            deleteFlag={deleteFlag}
            viewFlag={viewFlag}
            mediaData={filesData}
            setFilesData={setFilesData}
            onFileNameChange={(index, newName) => handleFileNameChange(index, newName)}
            onEditDialogStateChange={handleEditDialogState}
          />
        ) : (
          <div className="w-full flex items-center justify-center h-96">
            <Stack className="mt-4">
              <InboxOutlined style={{ width: 50, height: 20, transform: 'scale(3)', color: 'GrayText' }} />
              <Typography color={'GrayText'}>No Data</Typography>
            </Stack>
          </div>
        )}
      </div>
      <Grid item xs={12} className="flex justify-end">
        <Tooltip title="Exit">
          <Button size="large" color="primary" onClick={onClose}>
            <ImExit />
          </Button>
        </Tooltip>
      </Grid>
    </div>
  );
};

export default FilesForPurchaseRequest;
