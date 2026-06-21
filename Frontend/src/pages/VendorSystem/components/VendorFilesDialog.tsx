import { useState } from 'react';
import VendorFilesManager from './VendorFilesManager';
import UniversalDialog from 'components/popup/UniversalDialog';
import { useIntl } from 'react-intl';

const VendorFilesDialog = ({ requestNumber, isViewMode, onClose, hideUploadButton = true, hideEditDelete = false  }: { requestNumber: string; isViewMode: boolean; onClose: () => void ; hideUploadButton?: boolean;  hideEditDelete?: boolean;}) => {
  const [filesData, setFilesData] = useState<any[]>([]);
     const intl = useIntl();

  return (
    <UniversalDialog
      action={{ open: true, fullWidth: true, maxWidth: 'md' }}
      onClose={onClose}
       title={intl.formatMessage({ id: 'Upload Files' }) || 'UploadFiles'} 
      hasPrimaryButton={false}
    >
      <VendorFilesManager
        requestNumber={requestNumber}
        isViewMode={isViewMode}
        filesData={filesData}
        setFilesData={setFilesData}
        onClose={onClose}
        hideUploadButton={hideUploadButton}
        hideEditDelete={hideEditDelete} 
      />
    </UniversalDialog>
  );
};

export default VendorFilesDialog;
