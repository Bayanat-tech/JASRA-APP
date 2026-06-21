import React from 'react';
import PfReportView from './PfReportView';

interface BaseReportProps {
  reportPath: string;
}

const BaseReport: React.FC<BaseReportProps> = ({ reportPath }) => {
  return <PfReportView reportPath={reportPath} />;
};

export default BaseReport;
