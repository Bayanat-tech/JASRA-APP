declare global {
  const createReactClass: typeof createReactClass;
}

declare module '@boldreports/react-reporting-components' {
  import * as React from 'react';

  export interface BoldReportViewerProps {
    id: string;
    reportServiceUrl: string;
    reportServerUrl: string;
    serviceAuthorizationToken: string;
    reportPath: string;
  }

  export interface BoldReportDesignerProps {
    id: string;
    create?: () => void;
    serviceUrl: string;
    reportServerUrl: string;
    serviceAuthorizationToken: string;
  }

  export const BoldReportViewerComponent: React.FC<BoldReportViewerProps>;
  export const BoldReportDesignerComponent: React.FC<BoldReportDesignerProps>;
}

declare module '@boldreports/react-reporting-components/Scripts/bold.reports.react.min' {
  export * from '@boldreports/react-reporting-components';
}

declare module '@boldreports/javascript-reporting-controls/Content/v2.0/tailwind-light/bold.report-viewer.min.css';
declare module '@boldreports/javascript-reporting-controls/Scripts/bold.report-designer.min';
declare module '@boldreports/javascript-reporting-controls/Scripts/data-visualization/*';
declare module '*.css';

interface JQuery {
  boldReportDesigner(): any;
  data(key: 'boldReportDesigner'): any;
}
