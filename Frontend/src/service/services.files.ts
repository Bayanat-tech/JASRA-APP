import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class FileUploadService {
  uploadFile = async (file: Blob | File, filename?: string) => {
    try {
      const chatFileUpload = new FormData();
      chatFileUpload.append(`file`, file);
      const response: IApiResponse<any> = await axiosServices.post('api/files/upload', chatFileUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Uploaded successfully`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `The media was not uploaded.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  uploadFilePf = async (file: Blob | File, request_number: string, type: string) => {
    try {
      const chatFileUpload = new FormData();
      chatFileUpload.append(`file`, file);
      chatFileUpload.append('request_number', request_number);
      chatFileUpload.append('type', type);

      const response: IApiResponse<any> = await axiosServices.post('api/files/uploadFilePf', chatFileUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Uploaded successfully`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `The media was not uploaded.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  uploadFileVendor = async (file: Blob | File, request_number: string, type: string) => {
    try {
      const chatFileUpload = new FormData();
      chatFileUpload.append(`file`, file);
      chatFileUpload.append('doc_no', request_number);
      chatFileUpload.append('type', type);
      chatFileUpload.append('modules', 'vendor'); // Always pass modules=vendor

      const response: IApiResponse<any> = await axiosServices.post('api/files/uploadVendorAttachment', chatFileUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Uploaded successfully`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `The media was not uploaded.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  getFile = async (request_number?: string, modules?: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.get(
        `api/files/${request_number}${modules === 'IMPORT' ? '?modules=IMPORT' : ''}`
      );
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  getPurchaseRequestFiles = async (request_number: string, modules?: string, type?: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.get(
        `api/files/purchaseRequest/${request_number}${modules ? `?modules=${modules}` : ''}${type ? `&type=${type}` : ''}`
      );
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  editFile = async (aws_file_locn: string, user_file_name: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.put(`api/files/editFiles?user_file_name=${user_file_name}`, {
        aws_file_locn
      });
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  editPFFile = async (aws_file_locn: string, user_file_name: string, request_number: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.put(`api/files/editPFFile`, {
        aws_file_locn,
        user_file_name,
        request_number // Include request_number in the payload
      });
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  deleteFile = async (request_no: string, sr_no: number) => {
    try {
      const response: IApiResponse<any> = await axiosServices.get(`api/files/delete/${request_no}/${sr_no}`);
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  deleteFilePf = async (request_number: string, sr_no: number, aws_file_locn: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.delete(`api/files/deletePF/${request_number}/${sr_no}`, {
        data: { aws_file_locn }
      });
      if (response) {
        dispatch(
          openSnackbar({
            open: true,
            message: `File deleted successfully.`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `Failed to delete the file.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  exportFile = (master: string) => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/files/export?master=${master}`)
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${master}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            resolve(true);
          } else {
            reject(response);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  getVendorFiles = async (request_number: string, sr_no: number) => {
    try {
      console.log('Request Params:', { request_number, sr_no }); // Debug log
      const response: IApiResponse<any> = await axiosServices.get(`api/files/vendor/${request_number}?sr_no=${sr_no}`);
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };
  getFilesBySrNo = async (request_number: string, sr_no: number) => {
    try {
      console.log('Get Files by SR_NO Params:', { request_number, sr_no });
      const response: IApiResponse<any> = await axiosServices.get(`api/files/getFilesBySrNo/${request_number}/${sr_no}`);
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  // Get all files for a request (all SR_NOs)
  getAllVendorFiles = async (request_number: string) => {
    try {
      console.log('Get All Vendor Files Params:', { request_number });
      const response: IApiResponse<any> = await axiosServices.get(`api/files/getAllVendorFiles/${request_number}`);
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  downloadAllAttachments = async (request_number: string) => {
    try {
      console.log('Downloading all attachments for:', request_number);

      // Create download URL
      const downloadUrl = `/api/files/downloadAllAttachments/${request_number}`;

      // Test if the endpoint exists and is accessible
      console.log('Testing download URL:', downloadUrl);

      // Method 1: Using fetch with better error handling
      const response = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include' // Include cookies for authentication
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Download endpoint not found. Please check backend implementation.');
        } else if (response.status === 500) {
          throw new Error('Server error while generating ZIP file.');
        } else {
          throw new Error(`Download failed with status: ${response.status}`);
        }
      }

      // Get the blob from response
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Empty ZIP file received. No attachments found or failed to generate.');
      }

      console.log('Blob size:', blob.size, 'bytes');

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attachments_${request_number}.zip`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up URL object
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      // Show success notification
      dispatch(
        openSnackbar({
          open: true,
          message: 'Download started successfully',
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );

      return true;
    } catch (error: any) {
      console.error('Error downloading all attachments:', error);

      // Show detailed error message
      let errorMessage = 'Failed to download attachments';
      if (error.message) {
        errorMessage = error.message;
      }

      dispatch(
        openSnackbar({
          open: true,
          message: errorMessage,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );

      throw error;
    }
  };

  // Download attachments for specific SR_NO as ZIP
  downloadAttachmentsBySrNo = async (request_number: string, sr_no: number) => {
    try {
      console.log('Downloading attachments for request:', request_number, 'SR_NO:', sr_no);

      // Create download URL
      const downloadUrl = `/api/files/downloadAttachmentsBySrNo/${request_number}/${sr_no}`;

      console.log('Download URL:', downloadUrl);

      // Method 1: Using fetch with better error handling
      const response = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include'
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No attachments found for SR_NO ${sr_no}`);
        } else if (response.status === 500) {
          throw new Error('Server error while generating ZIP file');
        } else {
          throw new Error(`Download failed with status: ${response.status}`);
        }
      }

      // Get the blob from response
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Empty ZIP file received');
      }

      console.log('Blob size:', blob.size, 'bytes');

      // Determine filename prefix
      const fileNamePrefix = sr_no === 0 ? 'global' : `SR${sr_no}`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileNamePrefix}_attachments_${request_number}.zip`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up URL object
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      // Show success notification
      dispatch(
        openSnackbar({
          open: true,
          message: `Download started for ${sr_no === 0 ? 'Global Attachments' : `SR ${sr_no}`}`,
          variant: 'alert',
          alert: {
            color: 'success'
          },
          close: true
        })
      );

      return true;
    } catch (error: any) {
      console.error('Error downloading attachments by SR_NO:', error);

      let errorMessage = 'Failed to download attachments';
      if (error.message) {
        errorMessage = error.message;
      }

      dispatch(
        openSnackbar({
          open: true,
          message: errorMessage,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );

      throw error;
    }
  };

  downloadAllAttachmentsWithAxios = async (request_number: string) => {
    try {
      console.log('Downloading all attachments with axios for:', request_number);

      const response = await axiosServices.get(`/api/files/downloadAllAttachments/${request_number}`, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Download progress: ${percentCompleted}%`);
        }
      });

      console.log('Axios response status:', response.status);

      if (response.status === 200) {
        const contentType = typeof response.headers['content-type'] === 'string' ? response.headers['content-type'] : undefined;

        const blob = new Blob([response.data], {
          type: contentType
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attachments_${request_number}.zip`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(url);

        dispatch(
          openSnackbar({
            open: true,
            message: 'Download started successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );

        return true;
      } else {
        throw new Error(`Download failed with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error in downloadAllAttachmentsWithAxios:', error);

      let errorMessage = 'Failed to download attachments';
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error response:', error.response.status, error.response.data);
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Check if backend is running.';
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
      }

      dispatch(
        openSnackbar({
          open: true,
          message: errorMessage,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );

      throw error;
    }
  };

  // Download single file
  downloadSingleFile = async (file: any) => {
    const { request_number, sr_no, attachment_sr_no, user_file_name, org_file_name, aws_file_locn } = file;

    const fileName = user_file_name || org_file_name;

    try {
      // Create download URL for single file
      let downloadUrl = `/api/files/downloadSingleFile/${request_number}`;

      // Add optional parameters if they exist
      if (sr_no !== undefined && sr_no !== null) {
        downloadUrl += `/${sr_no}`;
        if (attachment_sr_no !== undefined && attachment_sr_no !== null) {
          downloadUrl += `/${attachment_sr_no}`;
        }
      }

      // Create hidden anchor element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;

      // Optional: Open in new tab for direct viewing
      link.target = '_blank';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Downloaded single file: ${fileName}`);
    } catch (error) {
      console.error('Error downloading single file:', error);

      // Fallback: Try to open AWS URL directly
      if (aws_file_locn) {
        window.open(aws_file_locn, '_blank');
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Failed to download file',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
      }
      throw error;
    }
  };

  // Alternative: Download single file using axios (for better error handling)
  downloadSingleFileWithAxios = async (file: any) => {
    try {
      const { request_number, sr_no, attachment_sr_no, user_file_name, org_file_name } = file;

      const fileName = user_file_name || org_file_name;

      // Build the download URL
      let downloadUrl = `/api/files/downloadSingleFile/${request_number}`;
      if (sr_no !== undefined && sr_no !== null) {
        downloadUrl += `/${sr_no}`;
        if (attachment_sr_no !== undefined && attachment_sr_no !== null) {
          downloadUrl += `/${attachment_sr_no}`;
        }
      }

      // Use axios to download with better error handling
      const response = await axiosServices.get(downloadUrl, {
        responseType: 'blob'
      });

      if (response.status === 200) {
        // Create blob from response with strict content-type check
        const contentType = typeof response.headers['content-type'] === 'string' ? response.headers['content-type'] : undefined;

        const blob = new Blob([response.data], {
          type: contentType
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(url);

        console.log(`Downloaded single file via axios: ${fileName}`);
      } else {
        throw new Error('Failed to download file');
      }
    } catch (error) {
      console.error('Error in downloadSingleFileWithAxios:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to download file',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
      throw error;
    }
  };

  // Get download statistics for a request
  getDownloadStats = async (request_number: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.get(`/api/files/getDownloadStats/${request_number}`);

      if (response) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error getting download stats:', error);
      // Don't show error for stats - return default
      return {
        total_files: 0,
        global_files: 0,
        item_files: 0,
        unique_sr_nos: 0
      };
    }
  };

  editVendorFile = async (
    aws_file_locn: string,
    user_file_name: string,
    request_number: string,
    sr_no?: number, // Optional: for specific files
    attachment_sr_no?: number // Optional: for specific attachments
  ) => {
    try {
      const payload: any = {
        aws_file_locn,
        user_file_name,
        request_number
      };

      // Add optional parameters if provided
      if (sr_no !== undefined) {
        payload.sr_no = sr_no;
      }

      if (attachment_sr_no !== undefined) {
        payload.attachment_sr_no = attachment_sr_no;
      }

      const response: IApiResponse<any> = await axiosServices.put(`api/files/editVendorFile`, payload);

      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  // deleteFileVendorAttachment = async (request_number: string, sr_no: number) => {
  //   try {
  //     const response: IApiResponse<any> = await axiosServices.delete(`api/files/deleteVendorAttachment/${request_number}/${sr_no}`);
  //     if (response) {
  //       dispatch(
  //         openSnackbar({
  //           open: true,
  //           message: `File deleted successfully.`,
  //           variant: 'alert',
  //           alert: {
  //             color: 'success'
  //           },
  //           close: true
  //         })
  //       );
  //       return response.data;
  //     }
  //   } catch (error) {
  //     dispatch(
  //       openSnackbar({
  //         open: true,
  //         message: `Failed to delete the file.`,
  //         variant: 'alert',
  //         alert: {
  //           color: 'error'
  //         },
  //         close: true
  //       })
  //     );
  //   }
  // };
  deleteFileVendorAttachment = async (request_number: string, sr_no: number, attachment_sr_no?: number) => {
    try {
      // Build URL based on whether attachment_sr_no is provided
      let url = `api/files/deleteVendorAttachment/${request_number}/${sr_no}`;
      if (attachment_sr_no !== undefined) {
        url += `/${attachment_sr_no}`;
      }

      const response: IApiResponse<any> = await axiosServices.delete(url);

      if (response) {
        dispatch(
          openSnackbar({
            open: true,
            message: `File deleted successfully.`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `Failed to delete the file.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };
  uploadEmployeeAttachment = async (file: Blob | File, request_number: string, type: string) => {
    try {
      const chatFileUpload = new FormData();
      chatFileUpload.append(`file`, file);
      chatFileUpload.append('request_number', request_number);
      chatFileUpload.append('type', type);
      chatFileUpload.append('modules', 'vendor'); // Always pass modules=vendor

      const response: IApiResponse<any> = await axiosServices.post('api/files/uploadEmployeeAttachment', chatFileUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Uploaded successfully`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `The media was not uploaded.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  getEmployeeFiles = async (request_number: string, modules: string = 'hr') => {
    try {
      console.log('Request Params:', { request_number, modules });

      const encodedRequestNumber = encodeURIComponent(request_number);

      const response: IApiResponse<any> = await axiosServices.get(`api/files/employees/${encodedRequestNumber}?modules=${modules}`);

      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  editEmployeeFile = async (aws_file_locn: string, user_file_name: string, request_number: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.put(`api/files/editEmployeeFile`, {
        aws_file_locn,
        user_file_name,
        request_number // Include request_number in the payload
      });
      if (response) {
        return response.data.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };

  deleteEmployeeAttachment = async (request_number: string, sr_no: number) => {
    try {
      const response: IApiResponse<any> = await axiosServices.delete(`api/files/deleteEmployeeFiles/${request_number}/${sr_no}`);
      if (response) {
        dispatch(
          openSnackbar({
            open: true,
            message: `File deleted successfully.`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `Failed to delete the file.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
    }
  };
}

const FileUploadServiceInstance = new FileUploadService();
export default FileUploadServiceInstance;
