import React from 'react';

// Bold Reports style

// Bold Reports scripts
import '@boldreports/javascript-reporting-controls/Content/v2.0/tailwind-light/bold.report-viewer.min.css';

import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min';

import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.widgets.min';

import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min';

import '@boldreports/react-reporting-components/Scripts/bold.reports.react.min';

import { BoldReportViewerComponent } from '@boldreports/react-reporting-components';

// Type declarations
declare global {
  interface CustomWindow {
    currentItem?: { categoryName: string; name: string };
    info?: { serviceUrl: string; serverUrl: string; token: string };
  }
  interface Window extends CustomWindow {}
}

const viewerStyle: React.CSSProperties = { height: '750px', width: '100%' };

const View: React.FC = () => {
  const currentItem = window.currentItem;
  const serverDetails = window.info;

  if (!currentItem || !serverDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div style={viewerStyle}>
      <BoldReportViewerComponent
        id="reportviewer-container"
        reportServiceUrl={serverDetails.serviceUrl}
        reportServerUrl={serverDetails.serverUrl}
        serviceAuthorizationToken={serverDetails.token}
        reportPath={`/${currentItem.categoryName}/${currentItem.name}`}
      />
    </div>
  );
};

export default View;
