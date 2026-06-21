import React, { useEffect, useState } from 'react';
import reportsService from 'services/reportsService';

// Import initialization before anything else
import '../utils/boldReportsInit';
import '@boldreports/react-reporting-components/Scripts/bold.reports.react.min';
import type { BoldReportDesignerComponent as BoldReportDesignerComponentType } from '@boldreports/react-reporting-components';

declare const BoldReportDesignerComponent: typeof BoldReportDesignerComponentType;

const designerStyle: React.CSSProperties = { height: '750px', width: '100%' };
const controlId = 'reportdesigner-container';

interface DesignerInstance {
  showImportData: boolean;
  newServerReport: (name: string, datasetName?: string) => void;
  newReport: (title: string) => void;
  openReport: (path: string) => void;
}

const getDesigner = (): DesignerInstance => {
  const element = document.getElementById(controlId);
  if (!element) throw new Error('Designer element not found');
  // Access jQuery from window
  const $element = (window as any).jQuery(element);
  return $element.data('boldReportDesigner');
};

const Design: React.FC = () => {
  const [serverDetails, setServerDetails] = useState<any>(null);
  const isEditReport = window.currentItem != null;

  useEffect(() => {
    const initializeDesigner = async () => {
      await reportsService.authorize();
      const settings = await reportsService.getDesignerSettings();
      setServerDetails(settings);
    };

    initializeDesigner();
  }, []);

  const controlInitialized = () => {
    const designer = getDesigner();
    designer.showImportData = true;

    if (isEditReport && window.currentItem) {
      openServerReport(window.currentItem.name, window.currentItem.categoryName);
    } else {
      const currentItem = window.currentItem;
      const hasDataSet = currentItem?.datasetName && currentItem.datasetName.length > 0;
      const hasCategory = (currentItem?.categoryName?.length ?? 0) > 0;

      if (hasDataSet && currentItem) {
        designer.newServerReport(currentItem.name, currentItem.datasetName);
      } else if (hasCategory && currentItem) {
        designer.newServerReport(currentItem.name);
      } else {
        newUntitledReport();
      }
    }
  };

  const newUntitledReport = () => {
    const designer = getDesigner();
    designer.newReport('Untitled');
  };

  const openServerReport = (name: string, category: string) => {
    const designer = getDesigner();

    if (window.currentItem) {
      window.currentItem.categoryName = category;
      window.currentItem.name = name;
    } else {
      window.currentItem = {
        name,
        categoryName: category
      };
    }

    designer.openReport(`/${category}/${name}`);
  };

  return (
    <div style={designerStyle}>
      {serverDetails && (
        <BoldReportDesignerComponent
          id={controlId}
          create={controlInitialized}
          serviceUrl={serverDetails.serviceUrl}
          reportServerUrl={serverDetails.serverUrl}
          serviceAuthorizationToken={serverDetails.token}
        />
      )}
    </div>
  );
};

export default Design;
