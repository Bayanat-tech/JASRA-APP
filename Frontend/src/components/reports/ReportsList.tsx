import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import reportsService from 'services/reportsService';
// Import Bold Report Viewer components
const ReportsList: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const response = await reportsService.getAllReports();
      setReports(response.data?.reports || []);
    };

    fetchReports();
  }, []);

  return (
    <List>
      {reports.map((report) => (
        <ListItem key={report.id} button>
          <ListItemText primary={report.name} secondary={report.path} />
        </ListItem>
      ))}
    </List>
  );
};

export default ReportsList;
