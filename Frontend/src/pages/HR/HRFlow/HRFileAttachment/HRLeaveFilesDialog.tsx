import { useState } from 'react';
import HRLeaveFileManager from './HRLeaveFileManager';
import UniversalDialog from 'components/popup/UniversalDialog';

const HRLeaveFilesDialog = ({
  LeavePage,
  requestNumber,
  isViewMode,
  onClose
}: {
  LeavePage?: boolean;
  requestNumber: string;
  isViewMode: boolean;
  onClose: () => void;
}) => {
  const [filesData, setFilesData] = useState<any[]>([]);

  return (
    <UniversalDialog
      action={{ open: true, fullWidth: true, maxWidth: 'md' }}
      onClose={onClose}
      title="Upload Files"
      hasPrimaryButton={false}
    >
      <HRLeaveFileManager
        LeavePage={LeavePage}
        requestNumber={requestNumber}
        isViewMode={isViewMode}
        filesData={filesData}
        setFilesData={setFilesData}
        onClose={onClose}
      />
    </UniversalDialog>
  );
};

export default HRLeaveFilesDialog;
