import React, { useEffect, useState } from 'react';
import DynamicReportView from './DynamicReportView';
import WmsServiceInstance from 'service/wms/service.wms';

const StockDetailReport: React.FC = () => {
  const [reportId, setReportId] = useState<string>('');

  useEffect(() => {
    const fetchReportId = async () => {
      const response = await WmsServiceInstance.getAllDynamicReports(undefined, null, 'Stock Report', 'STOCK DETAIL REPORT');
      if (response?.data?.[0]?.reportid) {
        setReportId(response.data[0].reportid);
      }
    };
    fetchReportId();
  }, []);

  return reportId ? <DynamicReportView reportId={reportId} /> : null;
};

export default StockDetailReport;
