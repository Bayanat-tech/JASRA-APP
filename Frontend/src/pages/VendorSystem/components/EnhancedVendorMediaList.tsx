// import React, { useState, useMemo } from 'react';
// import {
//     IconButton,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     TextField,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogTitle,
//     Button,
//     Tooltip,
//     Grid,
//     TablePagination,
//     Accordion,
//     AccordionSummary,
//     AccordionDetails,
//     Typography,
//     Chip,
//     Box,
//     Paper,
//     CircularProgress
// } from '@mui/material';
// import {
//     DeleteOutlined,
//     EditOutlined,
//     VisibilityOutlined,
//     ExpandMore,
//     Download,
//     Folder
// } from '@mui/icons-material';
// import { ImExit } from 'react-icons/im';
// import FileUploadServiceInstance from 'service/services.files';
// import { useIntl } from 'react-intl';

// interface EnhancedVendorMediaListProps {
//     filesData: any[];
//     setFilesData: React.Dispatch<React.SetStateAction<any[]>>;
//     isViewMode: boolean;
//     onClose: () => void;
//     hideEditDelete?: boolean;
//     mode?: 'specific' | 'all' | 'global';
//     srNo?: number;
//     activeTab?: number;
// }

// const EnhancedVendorMediaList: React.FC<EnhancedVendorMediaListProps> = ({
//     filesData,
//     setFilesData,
//     isViewMode,
//     onClose,
//     hideEditDelete = false,
//     mode = 'global',
//     srNo,
//     activeTab = 0
// }) => {
//     const [editDialogOpen, setEditDialogOpen] = useState(false);
//     const [currentFile, setCurrentFile] = useState<any>(null);
//     const [editedFileName, setEditedFileName] = useState('');
//     const [page, setPage] = useState(0);
//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [downloadingGroup, setDownloadingGroup] = useState<string | null>(null);
//     const intl = useIntl();

//     const normalizedFiles = useMemo(() => {
//         const fd: any = filesData as any;
//         const looksLikeFileArray = (arr: any[]): boolean => {
//             if (!Array.isArray(arr) || arr.length === 0) return false;
//             const sample = arr.find(Boolean) || arr[0];
//             if (!sample || typeof sample !== 'object') return false;
//             return Boolean(
//                 sample.awsFileLocn ||
//                 sample.aws_file_locn ||
//                 sample.orgFileName ||
//                 sample.org_file_name ||
//                 sample.attachmentSrNo ||
//                 sample.attachment_sr_no
//             );
//         };
//         const findArrayInObject = (obj: any): any[] | null => {
//             if (!obj || typeof obj !== 'object') return null;
//             for (const key of Object.keys(obj)) {
//                 const val = obj[key];
//                 if (Array.isArray(val) && looksLikeFileArray(val)) return val;
//                 if (val && typeof val === 'object') {
//                     const nested = findArrayInObject(val);
//                     if (Array.isArray(nested) && looksLikeFileArray(nested)) return nested;
//                 }
//             }
//             return null;
//         };

//         let rawFiles: any[] = [];

//         if (Array.isArray(fd)) {
//             rawFiles = fd;
//         } else if (fd?.data?.allFiles && Array.isArray(fd.data.allFiles)) {
//             rawFiles = fd.data.allFiles;
//         } else if (fd?.allFiles && Array.isArray(fd.allFiles)) {
//             rawFiles = fd.allFiles;
//         } else if (fd?.data?.groupedBySrNo && typeof fd.data.groupedBySrNo === 'object') {
//             rawFiles = Object.values(fd.data.groupedBySrNo).flat();
//         } else if (fd?.groupedBySrNo && typeof fd.groupedBySrNo === 'object') {
//             rawFiles = Object.values(fd.groupedBySrNo).flat();
//         } else {
//             const found = findArrayInObject(fd);
//             rawFiles = Array.isArray(found) ? found : [];
//         }

//         return (rawFiles || []).map((f: any) => {
//             const sr = f.srNo ?? f.sr_no ?? f.SR_NO ?? 0;
//             const attachment = f.attachmentSrNo ?? f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachment_sr_no ?? undefined;
//             const org = f.orgFileName ?? f.org_file_name ?? f.orgfileName ?? f.org_file_name ?? '';
//             const user = f.userFileName ?? f.user_file_name ?? f.userFileName ?? f.user_file_name ?? '';
//             const aws = f.awsFileLocn ?? f.aws_file_locn ?? f.awsFileLocn ?? f.aws_file_locn ?? '';
//             const req = f.requestNumber ?? f.request_number ?? f.requestNumber ?? f.request_number ?? '';
//             return {
//                 ...f,
//                 sr_no: sr,
//                 attachmentSrNo: attachment,
//                 orgFileName: org,
//                 userFileName: user,
//                 aws_file_locn: aws,
//                 request_number: req
//             };
//         });
//     }, [filesData]);

//     const groupedFiles = useMemo(() => {
//         if (mode !== 'all' || activeTab !== 1) return null;

//         const groups: Record<number | string, any[]> = {};

//         normalizedFiles.forEach(file => {
//             const srNo = file.sr_no ?? 0;
//             const key = srNo === 0 ? 'Global' : `SR_${srNo}`;

//             if (!groups[key]) {
//                 groups[key] = [];
//             }
//             groups[key].push(file);
//         });

//         const sortedGroups: Record<string, any[]> = {};
//         Object.keys(groups)
//             .sort((a, b) => {
//                 if (a === 'Global') return -1;
//                 if (b === 'Global') return 1;
//                 const srA = parseInt(a.replace('SR_', ''));
//                 const srB = parseInt(b.replace('SR_', ''));
//                 return srA - srB;
//             })
//             .forEach(key => {
//                 sortedGroups[key] = groups[key];
//             });

//         return sortedGroups;
//     }, [normalizedFiles, mode, activeTab]);

//     // Statistics (use normalizedFiles)
//     const stats = useMemo(() => {
//         const totalFiles = normalizedFiles.length;
//         const globalFiles = normalizedFiles.filter((f) => (f.sr_no ?? 0) === 0).length;
//         const itemFiles = totalFiles - globalFiles;
//         const uniqueSrNos = [...new Set(normalizedFiles.map((f) => f.sr_no).filter((sr) => sr !== 0))];

//         return {
//             totalFiles,
//             globalFiles,
//             itemFiles,
//             uniqueItems: uniqueSrNos.length
//         };
//     }, [normalizedFiles]);

//     const handleEditClick = (file: any) => {
//         setCurrentFile(file);
//         setEditedFileName(file.user_file_name || file.org_file_name || '');
//         setEditDialogOpen(true);
//     };

//     const handleUpdate = async () => {
//         if (!currentFile) return;
//         try {
//             const res: any = await FileUploadServiceInstance.editVendorFile(
//                 currentFile.aws_file_locn,
//                 editedFileName,
//                 currentFile.request_number,
//                 currentFile.sr_no,
//                 currentFile.attachment_sr_no
//             );

//             let updatedRecord: any = null;
//             if (res) {
//                 if (Array.isArray(res.data) && res.data.length > 0) updatedRecord = res.data[0];
//                 else if (res.data && typeof res.data === 'object') updatedRecord = res.data;
//                 else if (Array.isArray(res.successfulRecords) && res.successfulRecords.length > 0) updatedRecord = res.successfulRecords[0];
//                 else if (Array.isArray(res)) updatedRecord = res[0];
//             }

//             setFilesData(prevState => {
//                 const fd: any = prevState as any;
//                 const prevArr: any[] = Array.isArray(fd)
//                     ? fd
//                     : (fd?.data?.allFiles && Array.isArray(fd.data.allFiles) ? fd.data.allFiles
//                         : (fd?.allFiles && Array.isArray(fd.allFiles) ? fd.allFiles
//                             : (fd?.data?.groupedBySrNo ? Object.values(fd.data.groupedBySrNo).flat() : (fd?.groupedBySrNo ? Object.values(fd.groupedBySrNo).flat() : []))));

//                 const newArr = prevArr.map((file: any) => {
//                     const fileAttach = file.attachmentSrNo ?? file.attachment_sr_no ?? file.attachmentSrNo;
//                     const currentAttach = currentFile.attachmentSrNo ?? currentFile.attachment_sr_no ?? currentFile.attachmentSrNo;
//                     const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO ?? 0;
//                     const currentSr = currentFile.sr_no ?? currentFile.srNo ?? currentFile.SR_NO ?? 0;
//                     const fileReq = file.request_number ?? file.requestNumber ?? '';
//                     const currentReq = currentFile.request_number ?? currentFile.requestNumber ?? '';

//                     const isMatch = fileAttach === currentAttach && fileSr === currentSr && fileReq === currentReq;
//                     if (!isMatch) return file;

//                     if (updatedRecord) {
//                         // normalize updatedRecord keys
//                         const org = updatedRecord.orgFileName ?? updatedRecord.org_file_name ?? updatedRecord.orgFileName ?? file.orgFileName ?? file.org_file_name;
//                         const user = updatedRecord.userFileName ?? updatedRecord.user_file_name ?? updatedRecord.userFileName ?? editedFileName;
//                         const aws = updatedRecord.awsFileLocn ?? updatedRecord.aws_file_locn ?? file.aws_file_locn;
//                         return {
//                             ...file,
//                             ...updatedRecord,
//                             orgFileName: org,
//                             org_file_name: org,
//                             userFileName: user,
//                             user_file_name: user,
//                             aws_file_locn: aws
//                         };
//                     }

//                     // fallback: just update the name locally
//                     return {
//                         ...file,
//                         user_file_name: editedFileName,
//                         userFileName: editedFileName
//                     };
//                 });

//                 return newArr;
//             });

//             setEditDialogOpen(false);
//         } catch (error) {
//             console.error('Error updating file:', error);
//         }
//     };

//     const handleDelete = async (file: any) => {
//         if (!window.confirm('Are you sure you want to delete this file?')) return;

//         try {
//             // support multiple possible attachment id keys
//             const attachmentNo = file.attachment_sr_no ?? file.attachmentSrNo ?? file.attachmentSrno ?? file.attachment ?? undefined;

//             // call backend with attachment serial when available
//             await FileUploadServiceInstance.deleteFileVendorAttachment(file.request_number, file.sr_no, attachmentNo);

//             // update state defensively: support array or API-wrapped shapes
//             setFilesData((prev: any) => {
//                 // if plain array
//                 if (Array.isArray(prev)) {
//                     return prev.filter((f: any) => {
//                         const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachmentSrno ?? f.attachment;
//                         const fSr = f.sr_no ?? f.srNo ?? f.SR_NO;
//                         const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;
//                         const fReq = f.request_number ?? f.requestNumber;
//                         const fileReq = file.request_number ?? file.requestNumber;

//                         if (attachmentNo !== undefined && attachmentNo !== null) {
//                             return !(String(fAttach) === String(attachmentNo) && fSr === fileSr && fReq === fileReq);
//                         }
//                         return !(fSr === fileSr && fReq === fileReq);
//                     });
//                 }

//                 // if response wrapped in { data: { allFiles: [...] } }
//                 const fd: any = prev || {};
//                 if (fd?.data?.allFiles && Array.isArray(fd.data.allFiles)) {
//                     const filtered = fd.data.allFiles.filter((f: any) => {
//                         const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachment;
//                         const fSr = f.sr_no ?? f.srNo ?? f.SR_NO;
//                         const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;
//                         const fReq = f.request_number ?? f.requestNumber;
//                         const fileReq = file.request_number ?? file.requestNumber;
//                         if (attachmentNo !== undefined && attachmentNo !== null) {
//                             return !(String(fAttach) === String(attachmentNo) && fSr === fileSr && fReq === fileReq);
//                         }
//                         return !(fSr === fileSr && fReq === fileReq);
//                     });
//                     return { ...fd, data: { ...fd.data, allFiles: filtered } };
//                 }

//                 // if top-level allFiles
//                 if (fd?.allFiles && Array.isArray(fd.allFiles)) {
//                     const filtered = fd.allFiles.filter((f: any) => {
//                         const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachment;
//                         const fSr = f.sr_no ?? f.srNo ?? f.SR_NO;
//                         const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;
//                         const fReq = f.request_number ?? f.requestNumber;
//                         const fileReq = file.request_number ?? file.requestNumber;
//                         if (attachmentNo !== undefined && attachmentNo !== null) {
//                             return !(String(fAttach) === String(attachmentNo) && fSr === fileSr && fReq === fileReq);
//                         }
//                         return !(fSr === fileSr && fReq === fileReq);
//                     });
//                     return { ...fd, allFiles: filtered };
//                 }


//                 if (fd?.data?.groupedBySrNo && typeof fd.data.groupedBySrNo === 'object') {
//                     const grouped = { ...fd.data.groupedBySrNo };
//                     Object.keys(grouped).forEach((k) => {
//                         grouped[k] = grouped[k].filter((f: any) => {
//                             const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachment;
//                             const fSr = f.srNo ?? f.sr_no ?? f.SR_NO;
//                             const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;
//                             const fReq = f.requestNumber ?? f.request_number;
//                             const fileReq = file.request_number ?? file.requestNumber;
//                             if (attachmentNo !== undefined && attachmentNo !== null) {
//                                 return !(String(fAttach) === String(attachmentNo) && fSr === fileSr && fReq === fileReq);
//                             }
//                             return !(fSr === fileSr && fReq === fileReq);
//                         });
//                     });
//                     return { ...fd, data: { ...fd.data, groupedBySrNo: grouped } };
//                 }

//                 return prev;
//             });
//         } catch (error) {
//             console.error('Error deleting file:', error);
//         }
//     };

//     // SIMPLE: Single file download using window.open
//     const handleDownload = (file: any) => {
//         const { request_number, sr_no, attachment_sr_no } = file;

//         // Build the single file download URL
//         let downloadUrl = `/api/files/downloadSingleFile/${request_number}`;

//         // Add optional parameters
//         if (sr_no !== undefined && sr_no !== null) {
//             downloadUrl += `/${sr_no}`;
//             if (attachment_sr_no !== undefined && attachment_sr_no !== null) {
//                 downloadUrl += `/${attachment_sr_no}`;
//             }
//         }

//         // Open in new tab - browser handles everything
//         window.open(downloadUrl, '_blank');
//     };

//     // SIMPLE: Group download using window.open
//     const handleDownloadGroup = (srNoKey: string) => {
//         const requestNumberForDownload = normalizedFiles[0]?.request_number || filesData[0]?.request_number;
//         if (!requestNumberForDownload) return;

//         setDownloadingGroup(srNoKey);

//         if (srNoKey === 'Global') {
//             // Download global attachments
//             window.open(`/api/files/downloadAttachmentsBySrNo/${requestNumberForDownload}/0`, '_blank');
//         } else {
//             const srNo = parseInt(srNoKey.replace('SR_', ''));
//             window.open(`/api/files/downloadAttachmentsBySrNo/${requestNumberForDownload}/${srNo}`, '_blank');
//         }

//         // Reset downloading state after a short delay
//         setTimeout(() => {
//             setDownloadingGroup(null);
//         }, 1000);
//     };

//     // Render statistics panel
//     const renderStatsPanel = () => (
//         <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
//                 <Chip
//                     label={`Total Files: ${stats.totalFiles}`}
//                     color="primary"
//                     variant="outlined"
//                 />
//                 <Chip
//                     label={`Global Attachments: ${stats.globalFiles}`}
//                     color="secondary"
//                     variant="outlined"
//                 />
//                 <Chip
//                     label={`Item Attachments: ${stats.itemFiles}`}
//                     color="success"
//                     variant="outlined"
//                 />
//                 <Chip
//                     label={`Items with Attachments: ${stats.uniqueItems}`}
//                     color="warning"
//                     variant="outlined"
//                 />
//             </Box>
//         </Paper>
//     );

//     // Render table for a group of files
//     const renderFileTable = (files: any[], showSrNo = false) => (
//         <TableContainer sx={{ maxHeight: 420, overflow: 'auto' }}>
//             <Table size="small" stickyHeader sx={{ minWidth: 650, fontSize: '0.75rem' }}>
//                 <TableHead>
//                     <TableRow>
//                         {showSrNo && (
//                             <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>
//                                 {intl.formatMessage({ id: 'SrNo' }) || 'Sr No'}
//                             </TableCell>
//                         )}
//                         <TableCell sx={{ fontWeight: 'bold', width: '80px', textAlign: 'center' }}>
//                             {intl.formatMessage({ id: 'SrNo' }) || 'Sr No'}
//                         </TableCell>
//                         <TableCell sx={{ fontWeight: 'bold', width: '100px', textAlign: 'center' }}>
//                             {intl.formatMessage({ id: 'AttachNo' }) || 'Attach No'}
//                         </TableCell>
//                         <TableCell sx={{ fontWeight: 'bold' }}>
//                             {intl.formatMessage({ id: 'File Name' }) || 'File Name'}
//                         </TableCell>
//                         <TableCell sx={{ fontWeight: 'bold' }}>
//                             {intl.formatMessage({ id: 'USER FILE NAME' }) || 'User File Name'}
//                         </TableCell>
//                         <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>
//                             {intl.formatMessage({ id: 'Actions' }) || 'Actions'}
//                         </TableCell>
//                     </TableRow>
//                 </TableHead>
//                 <TableBody>
//                     {files.map((file, index) => (
//                         <TableRow key={index} hover sx={{ height: 34 }}>
//                             {showSrNo && (
//                                 <TableCell sx={{ padding: '6px 8px', fontSize: '0.75rem', textAlign: 'center' }}>{file.sr_no}</TableCell>
//                             )}
//                             <TableCell sx={{ padding: '6px 8px', fontSize: '0.75rem', textAlign: 'center' }}>{file.sr_no ?? 'N/A'}</TableCell>
//                             <TableCell sx={{ padding: '6px 8px', fontSize: '0.75rem', textAlign: 'center' }}>{file.attachmentSrNo ?? 'N/A'}</TableCell>
//                             <TableCell sx={{ padding: '6px 8px', fontSize: '0.75rem', textAlign: 'center', maxWidth: 240 }}>
//                                 <Typography variant="body2" noWrap align="center" sx={{ fontSize: '0.75rem' }}>
//                                     {file.orgFileName || file.org_file_name || file.orgFileName}
//                                 </Typography>
//                             </TableCell>
//                             <TableCell sx={{ padding: '6px 8px', fontSize: '0.75rem', textAlign: 'center', maxWidth: 240 }}>
//                                 <Typography variant="body2" noWrap align="center" sx={{ fontSize: '0.75rem' }}>
//                                     {file.userFileName || file.user_file_name || file.userFileName}
//                                 </Typography>
//                             </TableCell>
//                             <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                     <Tooltip title="Download">
//                                         <IconButton size="small" onClick={() => handleDownload(file)}>
//                                             <VisibilityOutlined fontSize="small" />
//                                         </IconButton>
//                                     </Tooltip>
//                                     {!hideEditDelete && !isViewMode && (
//                                         <>
//                                             <Tooltip title="Edit">
//                                                 <IconButton size="small" onClick={() => handleEditClick(file)}>
//                                                     <EditOutlined fontSize="small" />
//                                                 </IconButton>
//                                             </Tooltip>
//                                             <Tooltip title="Delete">
//                                                 <IconButton size="small" onClick={() => handleDelete(file)}>
//                                                     <DeleteOutlined fontSize="small" />
//                                                 </IconButton>
//                                             </Tooltip>
//                                         </>
//                                     )}
//                                 </Box>
//                             </TableCell>
//                         </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//         </TableContainer>
//     );

//     // Flat view (all files in one table)
//     const renderFlatView = () => (
//         <>
//             {mode === 'all' && renderStatsPanel()}

//             {normalizedFiles.length === 0 ? (
//                 <Box sx={{ p: 4, textAlign: 'center' }}>
//                     <Typography color="textSecondary">
//                         No attachments found
//                     </Typography>
//                 </Box>
//             ) : (
//                 <>
//                     {renderFileTable(normalizedFiles, mode === 'all')}

//                     {normalizedFiles.length > rowsPerPage && (
//                         <TablePagination
//                             rowsPerPageOptions={[10, 25, 50, 100]}
//                             component="div"
//                             count={normalizedFiles.length}
//                             rowsPerPage={rowsPerPage}
//                             page={page}
//                             onPageChange={(e, newPage) => setPage(newPage)}
//                             onRowsPerPageChange={(e) => {
//                                 setRowsPerPage(parseInt(e.target.value, 10));
//                                 setPage(0);
//                             }}
//                             size="small"
//                         />
//                     )}
//                 </>
//             )}
//         </>
//     );

//     const renderGroupedView = () => (
//         <>
//             {renderStatsPanel()}

//             {Object.keys(groupedFiles || {}).length === 0 ? (
//                 <Box sx={{ p: 4, textAlign: 'center' }}>
//                     <Typography color="textSecondary">
//                         No attachments found
//                     </Typography>
//                 </Box>
//             ) : (
//                 <>
//                     {Object.entries(groupedFiles || {}).map(([srNoKey, files]) => (
//                         <Accordion key={srNoKey} defaultExpanded>
//                             <AccordionSummary expandIcon={<ExpandMore />}>
//                                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
//                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                                         <Folder color="action" />
//                                         <Typography>
//                                             {srNoKey === 'Global'
//                                                 ? 'Global Attachments'
//                                                 : `Serial No: ${srNoKey.replace('SR_', '')}`}
//                                         </Typography>
//                                         <Chip
//                                             label={`${files.length} file${files.length !== 1 ? 's' : ''}`}
//                                             size="small"
//                                             color="primary"
//                                         />
//                                     </Box>
//                                     <Tooltip title={`Download all ${srNoKey} attachments`}>
//                                         <IconButton
//                                             size="small"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleDownloadGroup(srNoKey);
//                                             }}
//                                             disabled={downloadingGroup === srNoKey}
//                                         >
//                                             {downloadingGroup === srNoKey ? (
//                                                 <CircularProgress size={20} />
//                                             ) : (
//                                                 <Download fontSize="small" />
//                                             )}
//                                         </IconButton>
//                                     </Tooltip>
//                                 </Box>
//                             </AccordionSummary>
//                             <AccordionDetails>
//                                 {renderFileTable(files, srNoKey !== 'Global')}
//                             </AccordionDetails>
//                         </Accordion>
//                     ))}
//                 </>
//             )}
//         </>
//     );

//     return (
//         <>
//             {/* Render appropriate view based on mode and activeTab */}
//             {mode === 'all' && activeTab === 1 && groupedFiles ? renderGroupedView() : renderFlatView()}

//             {/* Edit Dialog */}
//             <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
//                 <DialogTitle>Edit File Name</DialogTitle>
//                 <DialogContent>
//                     <TextField
//                         fullWidth
//                         value={editedFileName}
//                         onChange={(e) => setEditedFileName(e.target.value)}
//                         autoFocus
//                         margin="dense"
//                     />
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
//                     <Button onClick={handleUpdate} color="primary" variant="contained">
//                         Update
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             {/* Exit Button */}
//             <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
//                 <Tooltip title={intl.formatMessage({ id: 'Exit' }) || 'Exit'}>
//                     <Button
//                         onClick={onClose}
//                         variant="outlined"
//                         startIcon={<ImExit />}
//                     >
//                         {intl.formatMessage({ id: 'Exit' }) || 'Exit'}
//                     </Button>
//                 </Tooltip>
//             </Grid>
//         </>
//     );
// };

// export default EnhancedVendorMediaList;

import React, { useState, useMemo } from 'react';
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
    TablePagination,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Chip,
    Box,
    Paper,
    CircularProgress
} from '@mui/material';
import {
    DeleteOutlined,
    EditOutlined,
    VisibilityOutlined,
    ExpandMore,
    Download,
    Folder
} from '@mui/icons-material';
import { ImExit } from 'react-icons/im';
import FileUploadServiceInstance from 'service/services.files';
import { useIntl } from 'react-intl';
import DownloadService from 'service/services.download';

interface EnhancedVendorMediaListProps {
    filesData: any[];
    setFilesData: React.Dispatch<React.SetStateAction<any[]>>;
    isViewMode: boolean;
    onClose: () => void;
    hideEditDelete?: boolean;
    mode?: 'specific' | 'all' | 'global';
    srNo?: number;
    activeTab?: number;
}

const EnhancedVendorMediaList: React.FC<EnhancedVendorMediaListProps> = ({
    filesData,
    setFilesData,
    isViewMode,
    onClose,
    hideEditDelete = false,
    mode = 'global',
    srNo,
    activeTab = 0
}) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentFile, setCurrentFile] = useState<any>(null);
    const [editedFileName, setEditedFileName] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [downloadingGroup, setDownloadingGroup] = useState<string | null>(null);
    const intl = useIntl();

    const normalizedFiles = useMemo(() => {
        const fd: any = filesData as any;
        const looksLikeFileArray = (arr: any[]): boolean => {
            if (!Array.isArray(arr) || arr.length === 0) return false;
            const sample = arr.find(Boolean) || arr[0];
            if (!sample || typeof sample !== 'object') return false;
            return Boolean(
                sample.awsFileLocn ||
                sample.aws_file_locn ||
                sample.orgFileName ||
                sample.org_file_name ||
                sample.attachmentSrNo ||
                sample.attachment_sr_no
            );
        };
        const findArrayInObject = (obj: any): any[] | null => {
            if (!obj || typeof obj !== 'object') return null;
            for (const key of Object.keys(obj)) {
                const val = obj[key];
                if (Array.isArray(val) && looksLikeFileArray(val)) return val;
                if (val && typeof val === 'object') {
                    const nested = findArrayInObject(val);
                    if (Array.isArray(nested) && looksLikeFileArray(nested)) return nested;
                }
            }
            return null;
        };

        let rawFiles: any[] = [];

        if (Array.isArray(fd)) {
            rawFiles = fd;
        } else if (fd?.data?.allFiles && Array.isArray(fd.data.allFiles)) {
            rawFiles = fd.data.allFiles;
        } else if (fd?.allFiles && Array.isArray(fd.allFiles)) {
            rawFiles = fd.allFiles;
        } else if (fd?.data?.groupedBySrNo && typeof fd.data.groupedBySrNo === 'object') {
            rawFiles = Object.values(fd.data.groupedBySrNo).flat();
        } else if (fd?.groupedBySrNo && typeof fd.groupedBySrNo === 'object') {
            rawFiles = Object.values(fd.groupedBySrNo).flat();
        } else {
            const found = findArrayInObject(fd);
            rawFiles = Array.isArray(found) ? found : [];
        }

        return (rawFiles || []).map((f: any) => {
            const sr = f.srNo ?? f.sr_no ?? f.SR_NO ?? 0;
            const attachment = f.attachmentSrNo ?? f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachment_sr_no ?? undefined;
            const org = f.orgFileName ?? f.org_file_name ?? f.orgfileName ?? f.org_file_name ?? '';
            const user = f.userFileName ?? f.user_file_name ?? f.userFileName ?? f.user_file_name ?? '';
            const aws = f.awsFileLocn ?? f.aws_file_locn ?? f.awsFileLocn ?? f.aws_file_locn ?? '';
            const req = f.requestNumber ?? f.request_number ?? f.requestNumber ?? f.request_number ?? '';
            return {
                ...f,
                sr_no: sr,
                attachmentSrNo: attachment,
                orgFileName: org,
                userFileName: user,
                aws_file_locn: aws,
                request_number: req
            };
        });
    }, [filesData]);

    const groupedFiles = useMemo(() => {
        if (mode !== 'all' || activeTab !== 1) return null;

        const groups: Record<number | string, any[]> = {};

        normalizedFiles.forEach(file => {
            const srNo = file.sr_no ?? 0;
            const key = srNo === 0 ? 'Global' : `SR_${srNo}`;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(file);
        });

        const sortedGroups: Record<string, any[]> = {};
        Object.keys(groups)
            .sort((a, b) => {
                if (a === 'Global') return -1;
                if (b === 'Global') return 1;
                const srA = parseInt(a.replace('SR_', ''));
                const srB = parseInt(b.replace('SR_', ''));
                return srA - srB;
            })
            .forEach(key => {
                sortedGroups[key] = groups[key];
            });

        return sortedGroups;
    }, [normalizedFiles, mode, activeTab]);

    // Statistics (use normalizedFiles)
    const stats = useMemo(() => {
        const totalFiles = normalizedFiles.length;
        const globalFiles = normalizedFiles.filter((f) => (f.sr_no ?? 0) === 0).length;
        const itemFiles = totalFiles - globalFiles;
        const uniqueSrNos = [...new Set(normalizedFiles.map((f) => f.sr_no).filter((sr) => sr !== 0))];

        return {
            totalFiles,
            globalFiles,
            itemFiles,
            uniqueItems: uniqueSrNos.length
        };
    }, [normalizedFiles]);

    const handleEditClick = (file: any) => {
        setCurrentFile(file);
        setEditedFileName(file.user_file_name || file.org_file_name || '');
        setEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!currentFile) return;
        try {
            const res: any = await FileUploadServiceInstance.editVendorFile(
                currentFile.aws_file_locn,
                editedFileName,
                currentFile.request_number,
                currentFile.sr_no,
                currentFile.attachment_sr_no
            );

            let updatedRecord: any = null;
            if (res) {
                if (Array.isArray(res.data) && res.data.length > 0) updatedRecord = res.data[0];
                else if (res.data && typeof res.data === 'object') updatedRecord = res.data;
                else if (Array.isArray(res.successfulRecords) && res.successfulRecords.length > 0) updatedRecord = res.successfulRecords[0];
                else if (Array.isArray(res)) updatedRecord = res[0];
            }

            setFilesData(prevState => {
                const fd: any = prevState as any;
                const prevArr: any[] = Array.isArray(fd)
                    ? fd
                    : (fd?.data?.allFiles && Array.isArray(fd.data.allFiles) ? fd.data.allFiles
                        : (fd?.allFiles && Array.isArray(fd.allFiles) ? fd.allFiles
                            : (fd?.data?.groupedBySrNo ? Object.values(fd.data.groupedBySrNo).flat() : (fd?.groupedBySrNo ? Object.values(fd.groupedBySrNo).flat() : []))));

                const newArr = prevArr.map((file: any) => {
                    const fileAttach = file.attachmentSrNo ?? file.attachment_sr_no ?? file.attachmentSrNo;
                    const currentAttach = currentFile.attachmentSrNo ?? currentFile.attachment_sr_no ?? currentFile.attachmentSrNo;
                    const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO ?? 0;
                    const currentSr = currentFile.sr_no ?? currentFile.srNo ?? currentFile.SR_NO ?? 0;
                    const fileReq = file.request_number ?? file.requestNumber ?? '';
                    const currentReq = currentFile.request_number ?? currentFile.requestNumber ?? '';

                    const isMatch = fileAttach === currentAttach && fileSr === currentSr && fileReq === currentReq;
                    if (!isMatch) return file;

                    if (updatedRecord) {
                        // normalize updatedRecord keys
                        const org = updatedRecord.orgFileName ?? updatedRecord.org_file_name ?? updatedRecord.orgFileName ?? file.orgFileName ?? file.org_file_name;
                        const user = updatedRecord.userFileName ?? updatedRecord.user_file_name ?? updatedRecord.userFileName ?? editedFileName;
                        const aws = updatedRecord.awsFileLocn ?? updatedRecord.aws_file_locn ?? file.aws_file_locn;
                        return {
                            ...file,
                            ...updatedRecord,
                            orgFileName: org,
                            org_file_name: org,
                            userFileName: user,
                            user_file_name: user,
                            aws_file_locn: aws
                        };
                    }

                    // fallback: just update the name locally
                    return {
                        ...file,
                        user_file_name: editedFileName,
                        userFileName: editedFileName
                    };
                });

                return newArr;
            });

            setEditDialogOpen(false);
        } catch (error) {
            console.error('Error updating file:', error);
        }
    };

    const handleDelete = async (file: any) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            // support multiple possible attachment id keys
            const attachmentNo = file.attachment_sr_no ?? file.attachmentSrNo ?? file.attachmentSrno ?? file.attachment ?? undefined;

            // call backend with attachment serial when available
            await FileUploadServiceInstance.deleteFileVendorAttachment(file.request_number, file.sr_no, attachmentNo);

            // update state defensively: support array or API-wrapped shapes
            setFilesData((prev: any) => {
                // if plain array
                if (Array.isArray(prev)) {
                    return prev.filter((f: any) => {
                        const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachmentSrno ?? f.attachment;
                        const fSr = f.sr_no ?? f.srNo ?? f.SR_NO;
                        const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;
                        const fReq = f.request_number ?? f.requestNumber;
                        const fileReq = file.request_number ?? file.requestNumber;

                        if (attachmentNo !== undefined && attachmentNo !== null) {
                            return !(String(fAttach) === String(attachmentNo) && fSr === fileSr && fReq === fileReq);
                        }
                        return !(fSr === fileSr && fReq === fileReq);
                    });
                }

                // if response wrapped in { data: { allFiles: [...] } }
                const fd: any = prev || {};
                if (fd?.data?.allFiles && Array.isArray(fd.data.allFiles)) {
                    const filtered = fd.data.allFiles.filter((f: any) => {
                        const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachment;
                        const fSr = f.sr_no ?? f.srNo ?? f.SR_NO;
                        const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;
                        const fReq = f.request_number ?? f.requestNumber;
                        const fileReq = file.request_number ?? file.requestNumber;
                        if (attachmentNo !== undefined && attachmentNo !== null) {
                            return !(String(fAttach) === String(attachmentNo) && fSr === fileSr && fReq === fileReq);
                        }
                        return !(fSr === fileSr && fReq === fileReq);
                    });
                    return { ...fd, data: { ...fd.data, allFiles: filtered } };
                }

                // if top-level allFiles
                if (fd?.allFiles && Array.isArray(fd.allFiles)) {
                    const filtered = fd.allFiles.filter((f: any) => {
                        const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachment;
                        const fSr = f.sr_no ?? f.srNo ?? f.SR_NO;
                        const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;
                        const fReq = f.request_number ?? f.requestNumber;
                        const fileReq = file.request_number ?? file.requestNumber;
                        if (attachmentNo !== undefined && attachmentNo !== null) {
                            return !(String(fAttach) === String(attachmentNo) && fSr === fileSr && fReq === fileReq);
                        }
                        return !(fSr === fileSr && fReq === fileReq);
                    });
                    return { ...fd, allFiles: filtered };
                }


                if (fd?.data?.groupedBySrNo && typeof fd.data.groupedBySrNo === 'object') {
                    const grouped = { ...fd.data.groupedBySrNo };
                    Object.keys(grouped).forEach((k) => {
                        grouped[k] = grouped[k].filter((f: any) => {
                            const fAttach = f.attachment_sr_no ?? f.attachmentSrNo ?? f.attachment;
                            const fSr = f.srNo ?? f.sr_no ?? f.SR_NO;
                            const fileSr = file.sr_no ?? file.srNo ?? file.SR_NO;
                            const fReq = f.requestNumber ?? f.request_number;
                            const fileReq = file.request_number ?? file.requestNumber;
                            if (attachmentNo !== undefined && attachmentNo !== null) {
                                return !(String(fAttach) === String(attachmentNo) && fSr === fileSr && fReq === fileReq);
                            }
                            return !(fSr === fileSr && fReq === fileReq);
                        });
                    });
                    return { ...fd, data: { ...fd.data, groupedBySrNo: grouped } };
                }

                return prev;
            });
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    // ENHANCED: Single file download using direct OCI URL
    const handleDownload = (file: any) => {
        DownloadService.downloadFile(file);
    };

    // ENHANCED: View file in new tab (for viewable files)
    const handleViewFile = (file: any) => {
        if (DownloadService.isViewableInBrowser(file)) {
            DownloadService.viewFile(file);
        } else {
            // If not viewable, download it
            handleDownload(file);
        }
    };

    // ENHANCED: Group download using direct OCI URLs
    const handleDownloadGroup = (srNoKey: string) => {
        if (!groupedFiles || !groupedFiles[srNoKey]) return;

        const files = groupedFiles[srNoKey];

        // Show downloading indicator
        setDownloadingGroup(srNoKey);

        // Download all files in the group
        DownloadService.downloadGroup(files, srNoKey);

        // Reset indicator after delay
        setTimeout(() => {
            setDownloadingGroup(null);
        }, files.length * 500 + 1000);
    };

    // NEW: Download all files
    // const handleDownloadAll = () => {
    //     if (normalizedFiles.length === 0) return;

    //     // Download all files organized by SR_NO
    //     DownloadService.downloadAllFiles(normalizedFiles);
    // };

    // Render statistics panel
    const renderStatsPanel = () => (
        <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Chip
                    label={`Total Files: ${stats.totalFiles}`}
                    color="primary"
                    variant="outlined"
                />
                <Chip
                    label={`Global Attachments: ${stats.globalFiles}`}
                    color="secondary"
                    variant="outlined"
                />
                <Chip
                    label={`Item Attachments: ${stats.itemFiles}`}
                    color="success"
                    variant="outlined"
                />
                <Chip
                    label={`Items with Attachments: ${stats.uniqueItems}`}
                    color="warning"
                    variant="outlined"
                />
            </Box>
        </Paper>
    );

    // Render table for a group of files
    // Render table for a group of files with compact styling
    const renderFileTable = (files: any[], showSrNo = false) => (
        <TableContainer sx={{
            maxHeight: 420,
            overflow: 'auto',
            // Remove extra padding and margins
            padding: 0,
            margin: 0,
            // Make borders more compact
            '& .MuiTable-root': {
                borderCollapse: 'collapse',
            }
        }}>
            <Table
                size="small"
                stickyHeader
                sx={{
                    minWidth: 400, // Reduced from 650
                    // Compact font and spacing
                    fontSize: '0.7rem',
                    '& .MuiTableCell-root': {
                        padding: '2px 4px', // Minimal padding
                        lineHeight: '1.2',
                        border: '1px solid #e0e0e0', // Thinner borders
                    },
                    // KEEP ORIGINAL DARK HEADER COLOR - Remove the light background
                    '& .MuiTableHead-root .MuiTableCell-root': {
                        padding: '3px 4px', // Slightly more for header
                        backgroundColor: 'inherit', // Keep original dark color
                        color: 'inherit', // Keep original text color
                        fontWeight: 600,
                        fontSize: '0.7rem',
                    },
                    '& .MuiTableRow-root': {
                        height: 28, // Reduced row height from 34
                    },
                    '& .MuiTableRow-hover:hover': {
                        backgroundColor: '#f5f5f5',
                    },
                    // Remove extra spacing in cells
                    '& .MuiTableCell-body': {
                        maxHeight: 28,
                        overflow: 'hidden',
                    }
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell sx={{
                            width: '60px', // Reduced from 80px
                            textAlign: 'center',
                            padding: '3px 2px !important',
                            // Keep original dark header styling
                            backgroundColor: 'inherit',
                            color: 'inherit',
                            fontWeight: 'bold',
                        }}>
                            {intl.formatMessage({ id: 'SrNo' }) || 'Sr No'}
                        </TableCell>
                        <TableCell sx={{
                            width: '80px', // Reduced from 100px
                            textAlign: 'center',
                            padding: '3px 2px !important',
                            // Keep original dark header styling
                            backgroundColor: 'inherit',
                            color: 'inherit',
                            fontWeight: 'bold',
                        }}>
                            {intl.formatMessage({ id: 'AttachNo' }) || 'Attach No'}
                        </TableCell>
                        <TableCell sx={{
                            padding: '3px 4px !important',
                            minWidth: '150px',
                            // Keep original dark header styling
                            backgroundColor: 'inherit',
                            color: 'inherit',
                            fontWeight: 'bold',
                        }}>
                            {intl.formatMessage({ id: 'File Name' }) || 'File Name'}
                        </TableCell>
                        <TableCell sx={{
                            padding: '3px 4px !important',
                            minWidth: '150px',
                            // Keep original dark header styling
                            backgroundColor: 'inherit',
                            color: 'inherit',
                            fontWeight: 'bold',
                        }}>
                            {intl.formatMessage({ id: 'USER FILE NAME' }) || 'User File Name'}
                        </TableCell>
                        <TableCell sx={{
                            width: '140px', // Reduced from 200px
                            padding: '3px 2px !important',
                            // Keep original dark header styling
                            backgroundColor: 'inherit',
                            color: 'inherit',
                            fontWeight: 'bold',
                        }}>
                            {intl.formatMessage({ id: 'Actions' }) || 'Actions'}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map((file, index) => (
                        <TableRow
                            key={index}
                            hover
                            sx={{
                                height: 28, // Compact row height
                                '&:last-child td': {
                                    borderBottom: '1px solid #e0e0e0',
                                }
                            }}
                        >
                            <TableCell sx={{
                                padding: '2px 2px !important',
                                fontSize: '0.7rem',
                                textAlign: 'center'
                            }}>
                                {file.sr_no ?? 'N/A'}
                            </TableCell>
                            <TableCell sx={{
                                padding: '2px 2px !important',
                                fontSize: '0.7rem',
                                textAlign: 'center'
                            }}>
                                {file.attachmentSrNo ?? 'N/A'}
                            </TableCell>
                            <TableCell sx={{
                                padding: '2px 4px !important',
                                fontSize: '0.7rem',
                                textAlign: 'center',
                                maxWidth: 180, // Reduced from 240
                            }}>
                                <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                        fontSize: '0.7rem',
                                        margin: 0,
                                        padding: 0,
                                        lineHeight: '1.2',
                                    }}
                                >
                                    {file.orgFileName || file.org_file_name || file.orgFileName}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{
                                padding: '2px 4px !important',
                                fontSize: '0.7rem',
                                textAlign: 'center',
                                maxWidth: 180,
                            }}>
                                <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                        fontSize: '0.7rem',
                                        margin: 0,
                                        padding: 0,
                                        lineHeight: '1.2',
                                    }}
                                >
                                    {file.userFileName || file.user_file_name || file.userFileName}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{
                                padding: '1px 2px !important',
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 0.5, // Reduced from 1
                                    '& .MuiIconButton-root': {
                                        padding: '2px', // Minimal button padding
                                        '& svg': {
                                            fontSize: '0.8rem', // Smaller icons
                                        }
                                    }
                                }}>
                                    <Tooltip title="Download">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDownload(file)}
                                            sx={{ minWidth: 'auto' }}
                                        >
                                            <Download fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>

                                    {/* Show view button for viewable files */}
                                    {DownloadService.isViewableInBrowser(file) && (
                                        <Tooltip title="View">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewFile(file)}
                                                sx={{ minWidth: 'auto' }}
                                            >
                                                <VisibilityOutlined fontSize="inherit" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {!hideEditDelete && !isViewMode && (
                                        <>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditClick(file)}
                                                    sx={{ minWidth: 'auto' }}
                                                >
                                                    <EditOutlined fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(file)}
                                                    sx={{ minWidth: 'auto' }}
                                                >
                                                    <DeleteOutlined fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
    // Flat view (all files in one table)
    const renderFlatView = () => (
        <>
            {mode === 'all' && renderStatsPanel()}

            {normalizedFiles.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        No attachments found
                    </Typography>
                </Box>
            ) : (
                <>
                    {renderFileTable(normalizedFiles, mode === 'all')}

                    {normalizedFiles.length > rowsPerPage && (
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={normalizedFiles.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            size="small"
                        />
                    )}
                </>
            )}
        </>
    );

    const renderGroupedView = () => (
        <>
            {renderStatsPanel()}

            {Object.keys(groupedFiles || {}).length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                        No attachments found
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Add Download All button for grouped view */}
                    {/* <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleDownloadAll}
                            disabled={normalizedFiles.length === 0}
                            size="small"
                        >
                            Download All Files
                        </Button>
                    </Box> */}

                    {Object.entries(groupedFiles || {}).map(([srNoKey, files]) => (
                        <Accordion key={srNoKey} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Folder color="action" />
                                        <Typography>
                                            {srNoKey === 'Global'
                                                ? 'Global Attachments'
                                                : `Serial No: ${srNoKey.replace('SR_', '')}`}
                                        </Typography>
                                        <Chip
                                            label={`${files.length} file${files.length !== 1 ? 's' : ''}`}
                                            size="small"
                                            color="primary"
                                        />
                                    </Box>
                                    <Tooltip title={`Download all ${srNoKey} attachments`}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadGroup(srNoKey);
                                            }}
                                            disabled={downloadingGroup === srNoKey}
                                        >
                                            {downloadingGroup === srNoKey ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <Download fontSize="small" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {renderFileTable(files, srNoKey !== 'Global')}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </>
            )}
        </>
    );
    return (
        <>
            {/* Render appropriate view based on mode and activeTab */}
            {mode === 'all' && activeTab === 1 && groupedFiles ? renderGroupedView() : renderFlatView()}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Edit File Name</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        value={editedFileName}
                        onChange={(e) => setEditedFileName(e.target.value)}
                        autoFocus
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} color="primary" variant="contained">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Exit Button */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Tooltip title={intl.formatMessage({ id: 'Exit' }) || 'Exit'}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        startIcon={<ImExit />}
                    >
                        {intl.formatMessage({ id: 'Exit' }) || 'Exit'}
                    </Button>
                </Tooltip>
            </Grid>
        </>
    );
};

export default EnhancedVendorMediaList;