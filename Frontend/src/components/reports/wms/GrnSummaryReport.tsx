import React, { useEffect, useState } from 'react';
import DynamicReportView from './DynamicReportView';
import WmsServiceInstance from 'service/wms/service.wms';

const GrnSummaryReport: React.FC = () => {
  const [reportId, setReportId] = useState<string>('');

  useEffect(() => {
    const fetchReportId = async () => {
      const response = await WmsServiceInstance.getAllDynamicReports(undefined, null, 'Summary Report', 'GRN SUMMARY REPORT');
      if (response?.data?.[0]?.reportid) {
        setReportId(response.data[0].reportid);
      }
    };
    fetchReportId();
  }, []);

  return reportId ? <DynamicReportView reportId={reportId} /> : null;
};

export default GrnSummaryReport;
