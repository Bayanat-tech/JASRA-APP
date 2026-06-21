import React, { useEffect, useState } from 'react';
import '@boldreports/javascript-reporting-controls/Content/v2.0/tailwind-light/bold.report-viewer.min.css';
import 'assets/css/boldreport-custom.css';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.widgets.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min';
import '@boldreports/react-reporting-components/Scripts/bold.reports.react.min';
import ReportService from 'services/reportsService';
import type { BoldReportViewerComponent as BoldReportViewerComponentType } from '@boldreports/react-reporting-components';

declare const BoldReportViewerComponent: typeof BoldReportViewerComponentType;

const viewerStyle: React.CSSProperties = { height: '620px', width: '100%' };

interface DynamicReportViewProps {
  reportId: string;
  parameters?: Record<string, string | number | boolean | null | undefined>;
}

const DynamicReportView: React.FC<DynamicReportViewProps> = ({ reportId, parameters }) => {
  const [reportSettings, setReportSettings] = useState<any>(null);

  useEffect(() => {
    const initializeReport = async () => {
      if (!reportId) {
        throw new Error('Report ID is required');
      }
      const settings = await ReportService.getPfReportSettings(reportId);
      setReportSettings(settings);
    };

    initializeReport();
  }, [reportId]);

  if (!reportSettings) {
    return <div>Loading...</div>;
  }

  const viewerProps = {
    id: 'dynamic-report-viewer',
    reportServiceUrl: reportSettings.serviceUrl,
    reportServerUrl: reportSettings.serverUrl,
    serviceAuthorizationToken: reportSettings.token,
    reportPath: reportSettings.reportPath,
    ...(parameters &&
      Object.keys(parameters).length > 0 && {
        parameters: Object.entries(parameters).map(([name, value]) => ({
          name,
          labels: [value?.toString() || ''],
          values: [value?.toString() || '']
        }))
      })
  };

  return (
    <div style={viewerStyle}>
      <BoldReportViewerComponent {...viewerProps} />
    </div>
  );
};

export default DynamicReportView;
