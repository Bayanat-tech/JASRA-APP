// // controllers/download.controller.ts
// import { Request, Response } from 'express';
// import archiver from 'archiver';
// import axios from 'axios';
// import { oracleDb } from '../database/connection';


// // Helper to download file from AWS/S3
// const downloadFileFromAws = async (url: string): Promise<Buffer> => {
//   try {
//     const response = await axios({
//       method: 'GET',
//       url: url,
//       responseType: 'arraybuffer',
//       timeout: 30000 // 30 seconds timeout
//     });
//     return Buffer.from(response.data, 'binary');
//   } catch (error) {
//     console.error('Error downloading from AWS:', url, error);
//     throw error;
//   }
// };

// // GET /api/files/downloadAllAttachments/:request_number
// export const downloadAllAttachments = async (req: Request, res: Response): Promise<void> => {
//   let archive: archiver.Archiver | null = null;
  
//   try {
//     const { request_number } = req.params;
    
//     if (!request_number) {
//       res.status(400).json({
//         success: false,
//         message: "request_number is required",
//       });
//       return;
//     }

//     console.log(`Downloading all attachments for request: ${request_number}`);

    
//     const query = `
//       SELECT 
//         SR_NO,
//         ATTACHMENT_SR_NO,
//         ORG_FILE_NAME,
//         AWS_FILE_LOCN,
//         USER_FILE_NAME
//       FROM UPLOADED_FILES_DLTS_VENDOR 
//       WHERE REQUEST_NUMBER = :request_number
//       ORDER BY SR_NO ASC, ATTACHMENT_SR_NO ASC
//     `;
    
//     const result = await oracleDb.query(query, {
//       request_number: { val: request_number }
//     });
    
//     const files = result.rows || [];
    
//     if (files.length === 0) {
//       res.status(404).json({
//         success: false,
//         message: "No attachments found for this request",
//       });
//       return;
//     }

//     console.log(`Found ${files.length} files for request ${request_number}`);

//     // Set headers for ZIP download
//     res.setHeader('Content-Type', 'application/zip');
//     res.setHeader('Content-Disposition', `attachment; filename="attachments_${request_number}.zip"`);
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '0');
    
//     // Create ZIP archive
//     archive = archiver('zip', {
//       zlib: { level: 9 } // Maximum compression
//     });
    
//     // Handle archive errors
//     archive.on('error', (err: Error) => {
//       console.error('Archive error:', err);
//       if (!res.headersSent) {
//         res.status(500).json({
//           success: false,
//           message: "Failed to create ZIP archive",
//           error: err.message
//         });
//       }
//     });
    
//     // Handle warnings
//     archive.on('warning', (err: any) => {
//       if (err && (err as any).code === 'ENOENT') {
//         console.warn('Archive warning:', err);
//       } else {
//         console.error('Archive warning:', err);
//       }
//     });
    
//     // Pipe archive to response
//     archive.pipe(res);
    
//     // Track successful downloads
//     let successfulDownloads = 0;
//     let failedDownloads = 0;
    
//     // Process files in batches to avoid overwhelming memory
//     const batchSize = 5;
//     for (let i = 0; i < files.length; i += batchSize) {
//       const batch = files.slice(i, i + batchSize);
//     interface UploadedFileRow {
//       SR_NO?: number;
//       ATTACHMENT_SR_NO?: number;
//       ORG_FILE_NAME?: string;
//       AWS_FILE_LOCN: string;
//       USER_FILE_NAME?: string;
//     }

//     const promises: Promise<void>[] = batch.map(async (file: UploadedFileRow): Promise<void> => {
//       try {
//         const awsUrl: string = file.AWS_FILE_LOCN;
//         const fileName: string = file.USER_FILE_NAME || file.ORG_FILE_NAME || 'unnamed';
//         const srNo: number = file.SR_NO || 0;
//         const attachmentNo: number = file.ATTACHMENT_SR_NO || 1;
        
//         // Create folder structure: Global or SR_XX folder
//         const folderName: string = srNo === 0 ? 'Global' : `SR_${srNo}`;
//         const filePathInZip: string = `${folderName}/${attachmentNo}_${fileName}`;
        
//         // Download file from AWS
//         const fileBuffer: Buffer = await downloadFileFromAws(awsUrl);
        
//         // Add file to archive
//         archive!.append(fileBuffer, { name: filePathInZip });
        
//         successfulDownloads++;
//         console.log(`✓ Added: ${filePathInZip}`);
        
//       } catch (error) {
//         failedDownloads++;
//         console.error(`✗ Failed: ${file.ORG_FILE_NAME}`, error);
        
//         // Add error text file to archive
//         const errorMessage: string = `Failed to download: ${file.ORG_FILE_NAME}\nURL: ${file.AWS_FILE_LOCN}\nError: ${error instanceof Error ? error.message : String(error)}`;
//         archive!.append(errorMessage, { 
//         name: `ERRORS/${file.ORG_FILE_NAME}_error.txt` 
//         });
//       }
//     });
      
//       await Promise.all(promises);
//     }
    
//     // Add summary file
//     const summary = `
//       Download Summary - Request ${request_number}
//       =========================================
//       Total Files in Database: ${files.length}
//       Successfully Downloaded: ${successfulDownloads}
//       Failed Downloads: ${failedDownloads}
//       ZIP Created: ${new Date().toISOString()}
//     `;
    
//     archive.append(summary, { name: 'DOWNLOAD_SUMMARY.txt' });
    
//     // Finalize archive
//     await archive.finalize();
    
//     console.log(`✓ ZIP created for request ${request_number}: ${successfulDownloads} files`);
    
//   } catch (error) {
//     console.error('Error in downloadAllAttachments:', error);
    
//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         message: "Failed to download attachments",
//         error: error instanceof Error ? error.message : String(error),
//       });
//     }
    
//     // If archive exists, destroy it
//     if (archive) {
//       archive.abort();
//     }
//   }
// };

// // GET /api/files/downloadAttachmentsBySrNo/:request_number/:sr_no
// export const downloadAttachmentsBySrNo = async (req: Request, res: Response): Promise<void> => {
//   let archive: archiver.Archiver | null = null;
  
//   try {
//     const { request_number, sr_no } = req.params;
    
//     if (!request_number || !sr_no) {
//       res.status(400).json({
//         success: false,
//         message: "request_number and sr_no are required",
//       });
//       return;
//     }

//     const srNoInt = parseInt(sr_no);
    
//     console.log(`Downloading attachments for request: ${request_number}, SR_NO: ${sr_no}`);

//     // Get files for specific SR_NO
//     const query = `
//       SELECT 
//         SR_NO,
//         ATTACHMENT_SR_NO,
//         ORG_FILE_NAME,
//         AWS_FILE_LOCN,
//         USER_FILE_NAME
//       FROM UPLOADED_FILES_DLTS_VENDOR 
//       WHERE REQUEST_NUMBER = :request_number
//         AND SR_NO = :sr_no
//       ORDER BY ATTACHMENT_SR_NO ASC
//     `;
    
//     const result = await oracleDb.query(query, {
//       request_number: { val: request_number },
//       sr_no: { val: srNoInt }
//     });
    
//     const files = result.rows || [];
    
//     if (files.length === 0) {
//       res.status(404).json({
//         success: false,
//         message: `No attachments found for SR_NO ${sr_no}`,
//       });
//       return;
//     }

//     console.log(`Found ${files.length} files for SR_NO ${sr_no}`);

//     // Set headers for ZIP download
//     res.setHeader('Content-Type', 'application/zip');
//     const fileNamePrefix = srNoInt === 0 ? 'global' : `SR${sr_no}`;
//     res.setHeader('Content-Disposition', `attachment; filename="${fileNamePrefix}_attachments_${request_number}.zip"`);
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
//     // Create ZIP archive
//     archive = archiver('zip', {
//       zlib: { level: 9 }
//     });
    
//     archive.on('error', (err: Error) => {
//       console.error('Archive error:', err);
//       if (!res.headersSent) {
//         res.status(500).json({
//           success: false,
//           message: "Failed to create ZIP archive",
//           error: err.message
//         });
//       }
//     });
    
//     archive.pipe(res);
    
//     // Process files
//     let successfulDownloads = 0;
    
//     for (const file of files) {
//       try {
//         const awsUrl = file.AWS_FILE_LOCN;
//         const fileName = file.USER_FILE_NAME || file.ORG_FILE_NAME;
//         const attachmentNo = file.ATTACHMENT_SR_NO || 1;
        
//         // File path in ZIP: attachmentNo_filename
//         const filePathInZip = `${attachmentNo}_${fileName}`;
        
//         // Download file from AWS
//         const fileBuffer = await downloadFileFromAws(awsUrl);
        
//         // Add file to archive
//         archive.append(fileBuffer, { name: filePathInZip });
        
//         successfulDownloads++;
//         console.log(`✓ Added: ${filePathInZip}`);
        
//       } catch (error) {
//         console.error(`✗ Failed: ${file.ORG_FILE_NAME}`, error);
        
//         // Add error file
//         const errorMessage = `Failed to download: ${file.ORG_FILE_NAME}\nError: ${error instanceof Error ? error.message : String(error)}`;
//         archive.append(errorMessage, { 
//           name: `${file.ORG_FILE_NAME}_error.txt` 
//         });
//       }
//     }
    
//     // Add summary
//     const summary = `
//       Download Summary - Request ${request_number}, SR_NO: ${sr_no}
//       ======================================================
//       Total Files: ${files.length}
//       Downloaded: ${successfulDownloads}
//       Failed: ${files.length - successfulDownloads}
//       ZIP Created: ${new Date().toISOString()}
//     `;
    
//     archive.append(summary, { name: 'SUMMARY.txt' });
    
//     // Finalize archive
//     await archive.finalize();
    
//     console.log(`✓ ZIP created for SR_NO ${sr_no}: ${successfulDownloads} files`);
    
//   } catch (error) {
//     console.error('Error in downloadAttachmentsBySrNo:', error);
    
//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         message: "Failed to download attachments",
//         error: error instanceof Error ? error.message : String(error),
//       });
//     }
    
//     if (archive) {
//       archive.abort();
//     }
//   }
// };

// // GET /api/files/downloadSingleFile/:request_number/:sr_no?/:attachment_sr_no?
// export const downloadSingleFile = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { request_number, sr_no, attachment_sr_no } = req.params;
    
//     if (!request_number) {
//       res.status(400).json({
//         success: false,
//         message: "request_number is required",
//       });
//       return;
//     }

//     console.log(`Downloading single file - Request: ${request_number}, SR: ${sr_no || 'N/A'}, Attachment: ${attachment_sr_no || 'N/A'}`);

//     // Build query based on parameters
//     let query = `
//       SELECT 
//         ORG_FILE_NAME,
//         AWS_FILE_LOCN,
//         USER_FILE_NAME,
//         EXTENSIONS
//       FROM UPLOADED_FILES_DLTS_VENDOR 
//       WHERE REQUEST_NUMBER = :request_number
//     `;
    
//     const params: any = {
//       request_number: { val: request_number }
//     };
    
//     if (sr_no && sr_no !== 'undefined') {
//       query += ` AND SR_NO = :sr_no`;
//       params.sr_no = { val: parseInt(sr_no) };
//     }
    
//     if (attachment_sr_no && attachment_sr_no !== 'undefined') {
//       query += ` AND ATTACHMENT_SR_NO = :attachment_sr_no`;
//       params.attachment_sr_no = { val: parseInt(attachment_sr_no) };
//     }
    
//     query += ` FETCH FIRST 1 ROW ONLY`;
    
//     const result = await oracleDb.query(query, params);
    
//     const file = result.rows?.[0];
    
//     if (!file) {
//       res.status(404).json({
//         success: false,
//         message: "File not found",
//       });
//       return;
//     }

//     // Download file from AWS
//     const fileBuffer = await downloadFileFromAws(file.AWS_FILE_LOCN);
//     const fileName = file.USER_FILE_NAME || file.ORG_FILE_NAME;
    
//     // Determine content type
//     let contentType = 'application/octet-stream';
//     const extension = file.EXTENSIONS || fileName.split('.').pop()?.toLowerCase();
    
//     const mimeTypes: Record<string, string> = {
//       'pdf': 'application/pdf',
//       'jpg': 'image/jpeg',
//       'jpeg': 'image/jpeg',
//       'png': 'image/png',
//       'gif': 'image/gif',
//       'txt': 'text/plain',
//       'doc': 'application/msword',
//       'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'xls': 'application/vnd.ms-excel',
//       'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       'zip': 'application/zip',
//       'rar': 'application/x-rar-compressed'
//     };
    
//     if (extension && mimeTypes[extension]) {
//       contentType = mimeTypes[extension];
//     }
    
//     // Set headers for file download
//     res.setHeader('Content-Type', contentType);
//     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//     res.setHeader('Content-Length', fileBuffer.length);
//     res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
//     // Send file
//     res.send(fileBuffer);
    
//     console.log(`✓ File sent: ${fileName}`);
    
//   } catch (error) {
//     console.error('Error in downloadSingleFile:', error);
    
//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         message: "Failed to download file",
//         error: error instanceof Error ? error.message : String(error),
//       });
//     }
//   }
// };

// // GET /api/files/getDownloadStats/:request_number
// export const getDownloadStats = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { request_number } = req.params;
    
//     if (!request_number) {
//       res.status(400).json({
//         success: false,
//         message: "request_number is required",
//       });
//       return;
//     }

//     // Get file statistics
//     const query = `
//       SELECT 
//         COUNT(*) as total_files,
//         COUNT(CASE WHEN SR_NO = 0 THEN 1 END) as global_files,
//         COUNT(CASE WHEN SR_NO > 0 THEN 1 END) as item_files,
//         COUNT(DISTINCT SR_NO) as unique_sr_nos
//       FROM UPLOADED_FILES_DLTS_VENDOR 
//       WHERE REQUEST_NUMBER = :request_number
//     `;
    
//     const result = await oracleDb.query(query, {
//       request_number: { val: request_number }
//     });
    
//     const stats = result.rows?.[0] || {
//       total_files: 0,
//       global_files: 0,
//       item_files: 0,
//       unique_sr_nos: 0
//     };
    
//     res.status(200).json({
//       success: true,
//       data: stats
//     });
    
//   } catch (error) {
//     console.error('Error in getDownloadStats:', error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get download statistics",
//       error: error instanceof Error ? error.message : String(error),
//     });
//   }
// };