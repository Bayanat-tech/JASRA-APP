import React from 'react';
import PfReportView from '../../PfReportView';

const CustomersReport: React.FC = () => {
  // Example with parameters if needed
  const parameters = {
    // Add parameters here if needed
    // CompanyCode: 'ABC123'
  };

  return <PfReportView reportPath="6ef8e242-7f73-4f18-8238-83f0e8a187cf" parameters={parameters} />;
};

export default CustomersReport;
