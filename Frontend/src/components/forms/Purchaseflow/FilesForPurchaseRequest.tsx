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
  const fileInputRef = useRef<HTMLInputElement>(null);

  //---------------handlers-------------
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    try {
      const incoming = Array.from(event.target.files);

      // Check file sizes (max 5 MB)
      const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
      const oversized = incoming.filter((f) => f.size > MAX_BYTES).map((f) => f.name);
      if (oversized.length > 0) {
        message.error(`These file(s) exceed 5 MB and were skipped: ${oversized.join(', ')}`);
      }

      const sizeValidFiles = incoming.filter((f) => f.size <= MAX_BYTES);
      if (sizeValidFiles.length === 0) return;

      // Deduplicate within the newly selected batch itself
      const seenInBatch = new Set<string>();
      const uniqueBatchFiles: File[] = [];
      for (const file of sizeValidFiles) {
        if (!seenInBatch.has(file.name)) {
          seenInBatch.add(file.name);
          uniqueBatchFiles.push(file);
        }
      }

      // Check duplicates against existing files in filesData and existingFilesData
      const duplicateFiles: string[] = [];
      const filesToUpload = uniqueBatchFiles.filter((eachFile) => {
        const isDuplicate =
          filesData.some((file: any) => {
            const existingName = file.org_file_name || file.orgFileName;
            const existingReq = file.request_number || file.requestNumber;
            return existingName === eachFile.name && (!existingReq || existingReq === request_number);
          }) ||
          (Array.isArray(existingFilesData) &&
            existingFilesData.some((file: any) => {
              const existingName = file.org_file_name || file.orgFileName;
              const existingReq = file.request_number || file.requestNumber;
              return existingName === eachFile.name && (!existingReq || existingReq === request_number);
            }));

        if (isDuplicate) {
          duplicateFiles.push(eachFile.name);
        }
        return !isDuplicate;
      });

      if (duplicateFiles.length > 0) {
        message.warning(`The following files already exist and were skipped: ${duplicateFiles.join(', ')}`);
      }

      if (filesToUpload.length === 0) return;

      setIsFileUploading(true);

      const tempModule = !!module && module.length > 0 ? module : app;

      // 1. Upload files to S3 / OCI in parallel
      const uploadResults = await Promise.all(
        filesToUpload.map(async (eachFile) => {
          try {
            const response = await FileUploadServiceInstance.uploadFilePf(eachFile, request_number, type || 'Purchase_Request');

            if (response && response.data) {
              // Extract clean extension (max 5 chars for Oracle VARCHAR2(5))
              const extFromName = eachFile.name.split('.').pop()?.toLowerCase() || '';
              const cleanExt = extFromName.slice(0, 5);

              const fileData: TFile = {
                created_by: user?.loginid,
                updated_by: user?.loginid,
                aws_file_locn: response.data,
                extensions: cleanExt,
                company_code: (user?.company_code as string) || '',
                org_file_name: eachFile.name,
                user_file_name: eachFile.name.slice(0, 75),
                modules: tempModule,
                flow_level: !!level ? level : 0,
                request_number: request_number
              };
              return fileData;
            }
            return null;
          } catch (uploadError) {
            console.error(`Failed to upload ${eachFile.name}:`, uploadError);
            return null;
          }
        })
      );

      const validUploadedFiles = uploadResults.filter((file): file is TFile => file !== null);

      if (validUploadedFiles.length === 0) {
        message.error('None of the selected files could be uploaded.');
        return;
      }

      // 2. Save metadata to Oracle DB in a SINGLE batch call
      const saveResponse = await GmPfServiceInstance.saveFile(request_number, validUploadedFiles);

      // Extract successful and duplicate records from response
      const successfulRecords =
        saveResponse?.data?.successfulRecords || saveResponse?.successfulRecords || (Array.isArray(saveResponse) ? saveResponse : []);

      const backendDuplicateRecords = saveResponse?.data?.duplicateRecords || saveResponse?.duplicateRecords || [];

      if (backendDuplicateRecords.length > 0) {
        message.warning(`Database skipped existing files: ${backendDuplicateRecords.join(', ')}`);
      }

      // Map generated SR_NO back to each file
      const finalFilesWithSrNo: TFile[] = validUploadedFiles.map((file) => {
        const matched = Array.isArray(successfulRecords)
          ? successfulRecords.find(
              (rec: any) => (rec.aws_file_locn && rec.aws_file_locn === file.aws_file_locn) || rec.org_file_name === file.org_file_name
            )
          : undefined;

        return {
          ...file,
          sr_no: matched?.sr_no !== undefined ? matched.sr_no : file.sr_no
        };
      });

      setFilesData((prevData) => [...prevData, ...finalFilesWithSrNo]);
      setHasChanges(true);
      message.success(`${finalFilesWithSrNo.length} file(s) attached successfully.`);
    } catch (error) {
      console.error('Error during multi-file upload:', error);
      message.error('An error occurred during file upload.');
    } finally {
      setIsFileUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
    if (existingFilesData) {
      let dataToProcess: any[] = [];

      if (existingFilesData.success !== undefined && existingFilesData.data) {
        dataToProcess = existingFilesData.data;
      } else if (Array.isArray(existingFilesData)) {
        dataToProcess = existingFilesData;
      }

      if (dataToProcess.length > 0) {
        const needsFormatting = dataToProcess.some((item: any) => item.orgFileName || item.awsFileLocn || item.requestNumber);

        if (needsFormatting) {
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

          setFilesData(formattedFiles);
        }
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
          ref={fileInputRef}
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
