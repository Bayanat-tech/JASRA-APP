import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, ThemeProvider, IconButton } from '@mui/material';
import { ImExit } from 'react-icons/im';
import '@boldreports/javascript-reporting-controls/Content/v2.0/tailwind-light/bold.report-viewer.min.css';
import 'assets/css/boldreport-custom.css';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.widgets.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min';
import '@boldreports/react-reporting-components/Scripts/bold.reports.react.min';
import ReportService from 'services/reportsService';
import reporttheme from 'themes/theme/reporttheme';

declare const BoldReportViewerComponent: any;

interface WmsReportViewProps {
  reportId: string;
  parameters?: Record<string, string | number | boolean | null | undefined>;
  onClose?: () => void;
}

const WmsReportView: React.FC<WmsReportViewProps> = ({ reportId, parameters, onClose }) => {
  const [reportSettings, setReportSettings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeReport = async () => {
      try {
        if (!reportId) throw new Error('Report ID is required');

        setLoading(true);
        setError(null);
        const settings = await ReportService.getPfReportSettings(reportId);
        if (!settings) throw new Error('Failed to get report settings');
        setReportSettings(settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    initializeReport();
  }, [reportId]);

  const reportParameters = parameters
    ? Object.entries(parameters)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([name, value]) => ({
          name,
          labels: [value?.toString() || ''],
          values: [value?.toString() || '']
        }))
    : [];

  const viewerProps = {
    id: 'wms-report-viewer',
    reportServiceUrl: reportSettings?.serviceUrl,
    reportServerUrl: reportSettings?.serverUrl,
    serviceAuthorizationToken: reportSettings?.token,
    reportPath: reportSettings?.reportPath,
    ...(reportParameters.length > 0 && { parameters: reportParameters })
  };

  // Ensure graceful handling of missing report settings
  const reportContent = loading ? (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : error ? (
    <div className="text-red-500 text-center p-4">
      <h3 className="font-bold text-lg">Report Error</h3>
      <p>{error}</p>
      <p className="mt-2 text-sm">Report ID: {reportId}</p>
    </div>
  ) : !reportSettings ? (
    <div className="flex items-center justify-center h-full">
      <p>Report configuration not available</p>
    </div>
  ) : (
    <div className="w-full h-full" style={{ height: 'calc(100% - 40px)' }}>
      <BoldReportViewerComponent {...viewerProps} />
    </div>
  );

  return (
    <ThemeProvider theme={reporttheme}>
      <Dialog
        open={true}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: 'none',
            minHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }
        }}
      >
        <DialogContent
          sx={{
            flex: 1,
            overflow: 'hidden',
            p: 0,
            position: 'relative'
          }}
        >
          {reportContent}

          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: '#082a89',
              '&:hover': {
                backgroundColor: '#1675f2'
              },
              color: 'white',
              padding: '6px',
              width: '32px',
              height: '32px',
              zIndex: 2
            }}
          >
            <ImExit size={16} />
          </IconButton>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default WmsReportView;
