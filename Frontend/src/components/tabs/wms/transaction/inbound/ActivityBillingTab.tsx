import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton, Typography } from '@mui/material';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import WmsSerivceInstance from 'service/wms/service.wms';


const ActivityBillingTab = ({ prin_code }: { prin_code: string }) => {
  const sql_string = `
    SELECT * FROM MS_ACTIVITY_BILLING 
    WHERE PRIN_CODE = '001' AND JOBTYPE = 'INB'
  `;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['activity_billing', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled: !!prin_code
  });

  // Pill renderer matching InboundJobWmsPage style
  const YesNoPill = ({ value }: { value: string }) => {
    if (value === 'Y') {
      return (
        <span
          style={{
            background: '#E8F5E9',
            color: '#2E7D32',
            borderRadius: '8px',
            padding: '1px 10px',
            fontSize: '0.55rem',
            fontWeight: 600,
            display: 'inline-block',
            border: '0.5px solid #2E7D32',
            minWidth: 36,
            textAlign: 'center',
            lineHeight: 1.4
          }}
        >
          Yes
        </span>
      );
    }
    if (value === 'N') {
      return (
        <span
          style={{
            background: '#FFEBEE',
            color: '#C62828',
            borderRadius: '8px',
            padding: '1px 10px',
            fontSize: '0.55rem',
            fontWeight: 600,
            display: 'inline-block',
            border: '0.5px solid #C62828',
            minWidth: 36,
            textAlign: 'center',
            lineHeight: 1.4
          }}
        >
          No
        </span>
      );
    }
    return value ?? '';
  };

  // JobType pill renderer
  const JobTypePill = ({ value }: { value: string }) => {
    let bg = '#E3F2FD', color = '#1565C0', border = '#1565C0', label = value;
    if (value === 'INB') {
      bg = '#E3F2FD'; color = '#1565C0'; border = '#1565C0'; label = 'Inbound';
    } else if (value === 'OUB') {
      bg = '#FFF3E0'; color = '#E65100'; border = '#E65100'; label = 'Outbound';
    } else if (value) {
      label = value;
    }
    return (
      <span
        style={{
          background: bg,
          color,
          borderRadius: '8px',
          padding: '1px 10px',
          fontSize: '0.55rem',
          fontWeight: 600,
          display: 'inline-block',
          border: `0.5px solid ${border}`,
          minWidth: 36,
          textAlign: 'center',
          lineHeight: 1.4
        }}
      >
        {label}
      </span>
    );
  };

  // Generate ag-Grid column definitions with consistent styles
  const columns = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    const excludeFields = [
      'WIP_CODE', 'COST', 'INCOME_CODE', 'VALIDATE_FLAG', 'CUST_CODE', 'START_POINT', 'END_POINT',
      'CUSTOMER_TYPE', 'VTYPE_CODE', 'updated_by', 'created_by', 'BILL_DUP', 'COST_DUP', 'EDIT_USER', 'SERIAL_NO2', 'MOC', 'UOC', 'updated_at', 'created_at', 'PRIN_CODE', 'MOC1', 'MOC2'
    ];
    const pillFields = ['FREEZE_FLAG', 'MANDATORY_FLAG', 'INB_SHOW', 'OUB_SHOW'];
    return Object.keys(data[0])
      .filter((key) => !excludeFields.includes(key))
      .map((key) => ({
        field: key,
        headerName: key.replace(/_/g, ' ').toUpperCase(),
        minWidth: 120,
        flex: 1,
        resizable: true,
        sortable: true,
        filter: true,
        cellRenderer: (params: any) =>
          pillFields.includes(key)
            ? <YesNoPill value={params.value} />
            : key === 'JOBTYPE'
              ? <JobTypePill value={params.value} />
              : params.value ?? '',
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }
      }));
  }, [data]);

  if (isLoading) return <Skeleton height={300} />;
  if (isError) return <Typography color="error">Failed to load activity billing data.</Typography>;
  if (!data || !Array.isArray(data) || data.length === 0) return <Typography>No activity billing records found.</Typography>;

  return (
    <div style={{ height: 480, width: '100%' }}>
      <CustomAgGrid
        rowData={data.map((row: any, idx: number) => ({ id: idx, ...row }))}
        columnDefs={columns}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50]}
        height="100%"
        editable={false}
        rowSelection="single"
        getRowId={(params: any) => params.data?.id?.toString() ?? Math.random().toString()}
        rowHeight={20}
        headerHeight={30}
      />
    </div>
  );
};

export default ActivityBillingTab;
