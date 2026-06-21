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

const viewerStyle: React.CSSProperties = { height: '750px', width: '100%' };

const SELECT_FIELDS = new Set(['budgeted_yes', 'checked_store_yes', 'flag_sharing_cost', 'covered_by_contract_yes']);

interface PfReportViewProps {
  reportPath: string;
  parameters?: Record<string, string | number | boolean | null | undefined>;
}

const PfReportView: React.FC<PfReportViewProps> = ({ reportPath, parameters }) => {
  const [reportSettings, setReportSettings] = useState<any>(null);

  const formatParameterValue = (name: string, value: any): string => {
    if (SELECT_FIELDS.has(name.toLowerCase()) && value === 'N/A') {
      return '';
    }
    return value?.toString() || '';
  };

  useEffect(() => {
    const initializeReport = async () => {
      if (!reportPath) {
        throw new Error('Report path is required');
      }
      const settings = await ReportService.getPfReportSettings(reportPath);
      setReportSettings(settings);
    };

    initializeReport();
  }, [reportPath]);

  if (!reportSettings) {
    return <div>Loading...</div>;
  }


  const viewerProps = {
    id: 'pf-report-viewer',
    reportServiceUrl: reportSettings.serviceUrl,
    reportServerUrl: reportSettings.serverUrl,
    serviceAuthorizationToken: reportSettings.token,
    reportPath: reportSettings.reportPath,
    ...(parameters &&
      Object.keys(parameters).length > 0 && {
      parameters: Object.entries(parameters).map(([name, value]) => ({
        name,
        labels: [formatParameterValue(name, value)],
        values: [formatParameterValue(name, value)]
      }))
    })
  };

  return (
    <div style={viewerStyle}>
      <BoldReportViewerComponent {...viewerProps} />
    </div>
  );
};

export default PfReportView;
