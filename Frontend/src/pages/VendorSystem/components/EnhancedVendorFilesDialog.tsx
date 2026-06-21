// import React, { useState } from 'react';
// import EnhancedVendorFilesManager from './EnhancedVendorFilesManager';
// import UniversalDialog from 'components/popup/UniversalDialog';

// import { Button, ButtonGroup, Tooltip, Box, Typography } from '@mui/material';
// import { Download, AttachFile, List } from '@mui/icons-material';

// interface EnhancedVendorFilesDialogProps {
//     requestNumber: string;
//     srNo?: number;
//     isViewMode: boolean;
//     onClose: () => void;
//     hideUploadButton?: boolean;
//     hideEditDelete?: boolean;
//     showAllAttachments?: boolean;
//     title?: string;
// }

// const EnhancedVendorFilesDialog: React.FC<EnhancedVendorFilesDialogProps> = ({
//     requestNumber,
//     srNo,
//     isViewMode,
//     onClose,
//     hideUploadButton = false,
//     hideEditDelete = false,
//     showAllAttachments = false,
//     title = 'Attachments'
// }) => {
//     const [filesData, setFilesData] = useState<any[]>([]);
//     const [mode, setMode] = useState<'specific' | 'all' | 'global'>(
//         srNo ? 'specific' : showAllAttachments ? 'all' : 'global'
//     );


//     // Function to download all attachments as ZIP
//     const handleDownloadAll = async () => {
//         try {
//             // This endpoint needs to be implemented in your backend
//             const response = await fetch(`/api/files/downloadAllAttachments/${requestNumber}`);
//             if (response.ok) {
//                 const blob = await response.blob();
//                 const url = window.URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = `attachments_${requestNumber}.zip`;
//                 document.body.appendChild(a);
//                 a.click();
//                 window.URL.revokeObjectURL(url);
//                 document.body.removeChild(a);
//             } else {
//                 console.error('Failed to download attachments');
//             }
//         } catch (error) {
//             console.error('Error downloading all attachments:', error);
//         }
//     };

//     // Function to download specific SR_NO attachments
//     const handleDownloadBySrNo = async () => {
//         if (srNo !== undefined) {
//             try {
//                 const response = await fetch(`/api/files/downloadAttachmentsBySrNo/${requestNumber}/${srNo}`);
//                 if (response.ok) {
//                     const blob = await response.blob();
//                     const url = window.URL.createObjectURL(blob);
//                     const a = document.createElement('a');
//                     a.href = url;
//                     a.download = `attachments_${requestNumber}_SR${srNo}.zip`;
//                     document.body.appendChild(a);
//                     a.click();
//                     window.URL.revokeObjectURL(url);
//                     document.body.removeChild(a);
//                 }
//             } catch (error) {
//                 console.error('Error downloading attachments:', error);
//             }
//         }
//     };

//     return (
//         <UniversalDialog
//             action={{
//                 open: true,
//                 fullWidth: true,
//                 maxWidth: 'lg'
//             }}
//             onClose={onClose}
//             title={
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
//                     <Typography variant="h6">
//                         {title}
//                     </Typography>
//                     <ButtonGroup variant="outlined" size="small">
//                         {!srNo && !showAllAttachments && (
//                             <>
//                                 <Button
//                                     onClick={() => setMode('global')}
//                                     variant={mode === 'global' ? 'contained' : 'outlined'}
//                                     startIcon={<AttachFile />}
//                                 >
//                                     Global
//                                 </Button>
//                                 <Button
//                                     onClick={() => setMode('all')}
//                                     variant={mode === 'all' ? 'contained' : 'outlined'}
//                                     startIcon={<List />}
//                                 >
//                                     View All
//                                 </Button>
//                             </>
//                         )}
//                         {mode === 'all' && (
//                             <Tooltip title="Download All Attachments as ZIP">
//                                 <Button onClick={handleDownloadAll} startIcon={<Download />}>
//                                     Download All
//                                 </Button>
//                             </Tooltip>
//                         )}
//                         {mode === 'specific' && srNo && (
//                             <Tooltip title={`Download Attachments for SR ${srNo}`}>
//                                 <Button onClick={handleDownloadBySrNo} startIcon={<Download />}>
//                                     Download
//                                 </Button>
//                             </Tooltip>
//                         )}
//                     </ButtonGroup>
//                 </Box>
//             }
//             hasPrimaryButton={false}
//         >
//             <EnhancedVendorFilesManager
//                 requestNumber={requestNumber}
//                 srNo={srNo}
//                 isViewMode={isViewMode}
//                 filesData={filesData}
//                 setFilesData={setFilesData}
//                 onClose={onClose}
//                 hideUploadButton={hideUploadButton}
//                 hideEditDelete={hideEditDelete}
//                 mode={mode}
//             />
//         </UniversalDialog>
//     );
// };

// export default EnhancedVendorFilesDialog;

import React, { useState } from 'react';
import EnhancedVendorFilesManager from './EnhancedVendorFilesManager';
import UniversalDialog from 'components/popup/UniversalDialog';

import { Button, ButtonGroup, Box, Typography, } from '@mui/material';
import { AttachFile, List } from '@mui/icons-material';
// import DownloadService from 'service/services.download';

interface EnhancedVendorFilesDialogProps {
    requestNumber: string;
    srNo?: number;
    isViewMode: boolean;
    onClose: () => void;
    hideUploadButton?: boolean;
    hideEditDelete?: boolean;
    showAllAttachments?: boolean;
    title?: string;
}

const EnhancedVendorFilesDialog: React.FC<EnhancedVendorFilesDialogProps> = ({
    requestNumber,
    srNo,
    isViewMode,
    onClose,
    hideUploadButton = false,
    hideEditDelete = false,
    showAllAttachments = false,
    title = 'Attachments'
}) => {
    const [filesData, setFilesData] = useState<any[]>([]);
    const [mode, setMode] = useState<'specific' | 'all' | 'global'>(
        srNo ? 'specific' : showAllAttachments ? 'all' : 'global'
    );
    // const [isDownloading, setIsDownloading] = useState(false);

    // ENHANCED: Download all files directly from OCI
    // const handleDownloadAll = async () => {
    //     if (filesData.length === 0) {
    //         console.warn('No files to download');
    //         return;
    //     }

    //     setIsDownloading(true);

    //     try {
    //         // Use our enhanced download service
    //         DownloadService.downloadAllFiles(filesData);
    //     } catch (error) {
    //         console.error('Error downloading all files:', error);
    //     } finally {
    //         // Reset after a delay to allow download to start
    //         setTimeout(() => {
    //             setIsDownloading(false);
    //         }, 1000);
    //     }
    // };

    // ENHANCED: Download specific SR_NO files
    // const handleDownloadBySrNo = async () => {
    //     if (!srNo || filesData.length === 0) {
    //         console.warn(`No files found for SR_NO: ${srNo}`);
    //         return;
    //     }

    //     setIsDownloading(true);

    //     try {
    //         // Filter files for this SR_NO
    //         const srNoFiles = filesData.filter(file =>
    //             (file.srNo || file.sr_no) === srNo
    //         );

    //         if (srNoFiles.length === 0) {
    //             console.warn(`No files found for SR_NO: ${srNo}`);
    //             return;
    //         }

    //         DownloadService.downloadGroup(srNoFiles, `SR_${srNo}`);
    //     } catch (error) {
    //         console.error('Error downloading files:', error);
    //     } finally {
    //         setTimeout(() => {
    //             setIsDownloading(false);
    //         }, 1000);
    //     }
    // };

    // Handle mode change with file data reset if needed
    const handleModeChange = (newMode: 'specific' | 'all' | 'global') => {
        setMode(newMode);
        // Optionally reset filesData when changing modes
        // if (mode !== newMode) {
        //     setFilesData([]);
        // }
    };

    return (
        <UniversalDialog
            action={{
                open: true,
                fullWidth: true,
                maxWidth: 'lg'
            }}
            onClose={onClose}
            title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                    <ButtonGroup variant="outlined" size="small">
                        {!srNo && !showAllAttachments && (
                            <>
                                <Button
                                    onClick={() => handleModeChange('global')}
                                    variant={mode === 'global' ? 'contained' : 'outlined'}
                                    startIcon={<AttachFile />}
                                >
                                    Global
                                </Button>
                                <Button
                                    onClick={() => handleModeChange('all')}
                                    variant={mode === 'all' ? 'contained' : 'outlined'}
                                    startIcon={<List />}
                                >
                                    View All
                                </Button>
                            </>
                        )}
                        {/* {mode === 'all' && (
                            <Tooltip title="Download All Attachments">
                                <Button
                                    onClick={handleDownloadAll}
                                    startIcon={isDownloading ? <CircularProgress size={20} /> : <Download />}
                                    disabled={filesData.length === 0 || isDownloading}
                                >
                                    {isDownloading ? 'Downloading...' : 'Download All'}
                                </Button>
                            </Tooltip>
                        )} */}
                        {/* {mode === 'specific' && srNo && (
                            <Tooltip title={`Download Attachments for SR ${srNo}`}>
                                <Button
                                    onClick={handleDownloadBySrNo}
                                    startIcon={isDownloading ? <CircularProgress size={20} /> : <Download />}
                                    disabled={filesData.length === 0 || isDownloading}
                                >
                                    {isDownloading ? 'Downloading...' : 'Download'}
                                </Button>
                            </Tooltip>
                        )} */}
                    </ButtonGroup>
                </Box>
            }
            hasPrimaryButton={false}
        >
            <EnhancedVendorFilesManager
                requestNumber={requestNumber}
                srNo={srNo}
                isViewMode={isViewMode}
                filesData={filesData}
                setFilesData={setFilesData}
                onClose={onClose}
                hideUploadButton={hideUploadButton}
                hideEditDelete={hideEditDelete}
                mode={mode}
            />
        </UniversalDialog>
    );
};

export default EnhancedVendorFilesDialog;