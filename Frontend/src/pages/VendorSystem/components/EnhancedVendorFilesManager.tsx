import React, { useEffect, useState } from 'react';
import FileUploadServiceInstance from 'service/services.files';
import EnhancedVendorMediaList from './EnhancedVendorMediaList';
import VendorServiceInstance from '../services/service.vendor';
import { Button, Tabs, Tab, Box, Alert } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { useSelector } from 'store';
import { TFile } from 'types/types.file';
import { useIntl } from 'react-intl';

interface EnhancedVendorFilesManagerProps {
    requestNumber: string;
    srNo?: number;
    isViewMode: boolean;
    filesData: any[];
    setFilesData: React.Dispatch<React.SetStateAction<any[]>>;
    onClose: () => void;
    hideUploadButton?: boolean;
    hideEditDelete?: boolean;
    mode?: 'specific' | 'all' | 'global';
}

const EnhancedVendorFilesManager: React.FC<EnhancedVendorFilesManagerProps> = ({
    requestNumber,
    srNo,
    isViewMode,
    filesData,
    setFilesData,
    onClose,
    hideUploadButton = false,
    hideEditDelete = false,
    mode = 'global'
}) => {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { app } = useSelector((state) => state.menuSelectionSlice);
    const intl = useIntl();
    const [activeTab, setActiveTab] = useState(0);

    // In EnhancedVendorFilesManager.tsx
    useEffect(() => {
        const fetchFiles = async () => {
            if (!requestNumber) {
                setError('Request number is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                let response;
                let files: any[] = [];

                if (mode === 'specific' && srNo !== undefined) {
                    response = await FileUploadServiceInstance.getFilesBySrNo(requestNumber, srNo);

                    if (response && response.success && Array.isArray(response.data)) {
                        files = response.data;
                    } else if (Array.isArray(response)) {
                        files = response;
                    }

                } else if (mode === 'all') {
                    response = await FileUploadServiceInstance.getAllVendorFiles(requestNumber);

                    console.log("getAllVendorFiles response:", response);

                    // handle common shapes
                    if (response && response.success && response.data) {
                        if (response.data.allFiles && Array.isArray(response.data.allFiles)) {
                            files = response.data.allFiles;
                        } else if (response.data && Array.isArray(response.data)) {
                            files = response.data;
                        } else if (response.data.groupedBySrNo && typeof response.data.groupedBySrNo === 'object') {
                            files = Object.values(response.data.groupedBySrNo).flat();
                        }
                    } else if (Array.isArray(response)) {
                        files = response;
                    } else if (response && response.allFiles && Array.isArray(response.allFiles)) {
                        files = response.allFiles;
                    } else if (response && response.groupedBySrNo && typeof response.groupedBySrNo === 'object') {
                        files = Object.values(response.groupedBySrNo).flat();
                    }

                } else {
                    response = await FileUploadServiceInstance.getVendorFiles(requestNumber, 0);

                    if (response && response.success && Array.isArray(response.data)) {
                        files = response.data;
                    } else if (Array.isArray(response)) {
                        files = response;
                    } else if (response?.data && Array.isArray(response.data)) {
                        files = response.data;
                    }
                }

                if (!Array.isArray(files) || files.length === 0) {
                    const fd: any = response as any;
                    const findArray = (obj: any): any[] | null => {
                        if (!obj || typeof obj !== 'object') return null;
                        for (const k of Object.keys(obj)) {
                            const v = obj[k];
                            if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') return v;
                            if (v && typeof v === 'object') {
                                const nested = findArray(v);
                                if (Array.isArray(nested) && nested.length > 0) return nested;
                            }
                        }
                        return null;
                    };
                    const found = findArray(fd);
                    if (Array.isArray(found)) files = found;
                }
                files = Array.isArray(files) ? files : [];

                console.log("Setting filesData (normalized):", files);
                setFilesData(files);

            } catch (error: any) {
                console.error('Error fetching files:', error);
                setError(error.message || 'Failed to fetch files');
                setFilesData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [requestNumber, srNo, mode, setFilesData]);
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
        const incoming = Array.from(event.target.files);

        const oversized = incoming.filter(f => f.size > MAX_BYTES).map(f => f.name);
        if (oversized.length > 0) {
            setError(`File(s) exceed 2 MB and were skipped: ${oversized.join(', ')}`);
        } else {
            setError(null);
        }

        const newFiles = incoming.filter(f => f.size <= MAX_BYTES);
        if (newFiles.length === 0) {
            // nothing valid to upload
            event.target.value = '';
            return;
        }

        setIsUploading(true);

        try {
            const uploadedFiles = await Promise.all(
                newFiles.map(async (file) => {
                    try {
                        const uploadResponse = await FileUploadServiceInstance.uploadFileVendor(
                            file,
                            requestNumber,
                            'Vendor'
                        );

                        if (!uploadResponse?.data) {
                            throw new Error('Upload failed');
                        }

                        // 2. Prepare file data for database
                        const fileData: TFile = {
                            created_by: user?.loginid || '',
                            updated_by: user?.loginid || '',
                            aws_file_locn: uploadResponse.data,
                            extensions: file.type.split('/')[1] || file.name.split('.').pop() || '',
                            company_code: user?.company_code as string,
                            org_file_name: file.name,
                            user_file_name: file.name,
                            modules: app,
                            flow_level: 0,
                            request_number: requestNumber,
                            sr_no: srNo || 0,
                            attachment_sr_no: undefined
                        };

                        // 3. Save file metadata to database
                        const saveResponse = await VendorServiceInstance.saveFile(requestNumber, [fileData]);

                        if (saveResponse?.data?.successfulRecords && saveResponse.data.successfulRecords.length > 0) {
                            const savedFile = saveResponse.data.successfulRecords[0];
                            return {
                                ...fileData,
                                sr_no: savedFile.sr_no,
                                attachment_sr_no: savedFile.attachment_sr_no
                            };
                        }

                        return fileData;
                    } catch (error) {
                        console.error('Error processing file:', file.name, error);
                        return null;
                    }
                })
            );

            // Filter out failed uploads
            const validFiles = uploadedFiles.filter((file): file is any => file !== null);

            // Update files data
            setFilesData(prev => [...prev, ...validFiles]);

            // Show success message
            if (validFiles.length > 0) {
                // You might want to dispatch a success alert here
                console.log(`Successfully uploaded ${validFiles.length} file(s)`);
            }

        } catch (error) {
            console.error('Error in file upload process:', error);
            setError('Failed to upload files. Please try again.');
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    if (loading) {
        return <Box sx={{ p: 3, textAlign: 'center' }}>Loading attachments...</Box>;
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button onClick={onClose}>Close</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {mode === 'all' && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant="fullWidth"
                    >
                        <Tab label="All Files" />
                        <Tab label="Grouped by Serial Number" />
                    </Tabs>
                </Box>
            )}

            {/* Upload button (if allowed) */}
            {!isViewMode && !hideUploadButton && (
                <Box sx={{ mb: 2 }}>
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
                            disabled={isUploading || !requestNumber}
                            fullWidth
                        >
                            {isUploading
                                ? (intl.formatMessage({ id: 'Uploading' }) || 'Uploading...')
                                : (intl.formatMessage({ id: 'UploadFiles' }) || 'Upload Files')}
                        </Button>
                    </label>
                    {srNo !== undefined && srNo !== 0 && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                            Files will be attached to Serial No: {srNo}
                        </Alert>
                    )}
                </Box>
            )}

            {/* File list */}
            <EnhancedVendorMediaList
                filesData={filesData}
                setFilesData={setFilesData}
                isViewMode={isViewMode}
                onClose={onClose}
                hideEditDelete={hideEditDelete}
                mode={mode}
                srNo={srNo}
                activeTab={activeTab}
            />
        </Box>
    );
};

export default EnhancedVendorFilesManager;