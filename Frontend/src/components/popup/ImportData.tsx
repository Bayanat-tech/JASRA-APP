import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import * as XLSX from 'xlsx';
import FileUploadServiceInstance from 'service/services.files';
import { useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

// Import necessary components and hooks from various libraries
const ImportData = ({
  handleImportData,
  handleToggleImportDataPopup
}: {
  handleImportData: (values: unknown[]) => Promise<boolean>;
  handleToggleImportDataPopup: () => void;
}) => {
  //-----------------constants---------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  let pathname = location.pathname.split('/');

  //-----------------handlers---------------

  const handleFileChange = async (event: any) => {
    setIsSubmitting(true);
    const file = event.target.files[0];
    if (!file) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Please select a file.',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );

      setIsSubmitting(false);
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();

    try {
      let jsonData: any;

      // Handle CSV file
      if (fileExtension === 'csv') {
        const text = await file.arrayBuffer();
        const workbook = XLSX.read(text, { type: 'string' });

        // Convert to array of arrays and remove the first row
        jsonData = XLSX.utils
          .sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
            header: 1, // Returns an array of arrays
            raw: false,
            dateNF: dayjs().format('YYYY-MM-DDTHH:MM:SS.SSSZ')
          })
          .slice(1); // Removes the first row
      }

      // Handle Excel file
      else if (fileExtension === 'xlsx') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });

        // Convert to array of arrays and remove the first row
        jsonData = XLSX.utils
          .sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
            header: 1, // Returns an array of arrays
            raw: false,
            dateNF: dayjs().format('YYYY-MM-DDTHH:MM:SS.SSSZ')
          })
          .slice(1); // Removes the first row

        // Format dates if necessary
        jsonData = jsonData.map((row: any[]) =>
          row.map((cell) => (cell instanceof Date ? dayjs(cell).format('YYYY-MM-DDTHH:MM:SS.SSSZ') : cell))
        );
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Invalid file format. Please upload a CSV or Excel file.',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            close: true
          })
        );
        setIsSubmitting(false);
        return;
      }

      // Send data to the backend
      console.log('this is json data-=====>>>', jsonData);
      const response = await handleImportData(jsonData);
      if (response) {
        handleToggleImportDataPopup();
      }
      setIsSubmitting(false);
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Error uploading file:' + error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
      return;
    }
  };

  //----------------useQuery------------
  const { data: sampleFileData } = useQuery({
    queryKey: ['files_data', location],
    queryFn: () => FileUploadServiceInstance.getFile(pathname[pathname.length - 1], 'IMPORT')
  });

  //------download sample file -----------
  const downloadSampleFile = (url: any, filename: any) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'downloaded_file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pathname = location.pathname.split('/');
  }, [location]);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        width: '100%'
      }}
    >
      <div className="gap-5 flex justify-between ">
        <div>
          <input accept=".csv,.xlsx" type="file" id="import-button" style={{ display: 'none' }} onChange={handleFileChange} />
          <label htmlFor="import-button">
            <Button
              disabled={isSubmitting}
              variant="contained"
              color="primary"
              component="span"
              startIcon={<UploadFileIcon />}
              sx={{
                padding: '12px 24px',
                textTransform: 'none',
                fontSize: '16px',
                backgroundColor: '#082a89',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
            >
              Upload
            </Button>
          </label>
        </div>
        {!!sampleFileData && (
          <Button
            variant="text"
            color="customBlue"
            component="span"
            startIcon={<CloudDownloadIcon />}
            sx={{
              textTransform: 'none'
            }}
            onClick={() => {
              if (!!sampleFileData) {
                downloadSampleFile(sampleFileData[0]?.aws_file_locn, `${pathname[pathname.length - 1]}_sample_file.xlsx`);
              }
            }}
          >
            Sample File
          </Button>
        )}
      </div>
      <Typography variant="caption" sx={{ marginTop: 1, color: 'text.secondary' }}>
        Only CSV,XLSX files are supported.
      </Typography>
    </Box>
  );
};

export default ImportData;
