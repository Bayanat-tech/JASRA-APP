import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { Box, Button, Modal, Typography } from '@mui/material';
import { Empty, Table } from 'antd';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';
import PurchaseReportDesign from 'pages/Report/components/PurchaseReportDesign';
import ReportDialogPage from 'pages/Report/ReportDialogPage';

interface PoListProps {
  requestNumber: string;
  PoOpen: boolean;
  setPoOpen: (open: boolean) => void;
  POdata: any[];
  div_code?: string;
}

const PoList = ({ PoOpen, setPoOpen, POdata, requestNumber, div_code }: PoListProps) => {
  const [selectedPO, setSelectedPO] = useState<string>('');
  const [showReport, setShowReport] = useState(false);

  const [handleReportOpen, setHandleReportOpen] = useState({
    open: false,
    poNumber: '',
    divCode: ''
  });

  const handlePDF = (poNumber?: string) => {
    if (poNumber) {
      setSelectedPO(poNumber);
      setPoOpen(false);
      setShowReport(true);
    }
  };

  const handleReportClose = () => {
    setShowReport(false);
    setSelectedPO('');
    setPoOpen(true);
  };

  const MyTable = () => {
    const columns = [
      {
        title: () => <span className="flex justify-center">PO Number</span>,
        dataIndex: 'po_number',
        key: 'po_number',
        render: (po_number?: string) => <span className="flex justify-center">{po_number ? po_number.replace(/\//g, '$') : 'N/A'}</span>
      },
      {
        title: () => <span className="flex justify-center">PO Date</span>,
        dataIndex: 'po_date',
        key: 'po_date',
        render: (dateString: string) => (
          <span className="flex justify-center">{dateString ? format(parseISO(dateString), 'dd-MM-yyyy HH:mm:ss') : 'N/A'}</span>
        )
      },
      {
        title: () => <span className="flex justify-center">Status</span>,
        dataIndex: 'status',
        key: 'status',
        render: (text: string) => <span className="flex justify-center">{text}</span>
      },
      {
        title: () => <span className="flex justify-center">Supplier</span>,
        dataIndex: 'supplier',
        key: 'supplier',
        render: (text: string) => <span className="flex justify-center">{text}</span>
      },
      {
        title: () => <span className="flex justify-center">Action</span>,
        key: 'action',
        render: (_: any, record: any) => (
          <>
          <Button size="small" onClick={() => handlePDF(record.po_number)}>
            <EyeOutlined />
          </Button>
          <Button size="small" onClick={() => setHandleReportOpen({ open: true, poNumber: record.po_number, divCode: div_code || '' })}>
            <EyeOutlined /> 2
          </Button>  
          </>
        )
      }
    ];

    return (
      <Table
        size="middle"
        columns={columns}
        dataSource={POdata}
        pagination={false}
        className="
              mt-2
              [&_.ant-table]:rounded-none
              [&_.ant-table-container]:rounded-none
              [&_.ant-table-thead>tr>th]:rounded-none
              [&_.ant-table-thead>tr>th]:bg-[#062888]
              [&_.ant-table-thead>tr>th]:text-white
              [&_.ant-table-thead>tr>th]:font-medium
              [&_.ant-table-tbody>tr>td]:rounded-none
              [&_.ant-table-cell]:rounded-none
              [&_.ant-table-cell-fix-left]:before:!bg-blue-100
            "
      />
    );
  };

  return (
    <>
      <Modal open={PoOpen} onClose={() => setPoOpen(false)} style={{ zIndex: 1300 }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '1200px',
            height: '80vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5" className="font-bold text-base">
              Purchase Order List for {requestNumber}
            </Typography>
            <Button variant="contained" size="small" startIcon={<ArrowLeftOutlined />} onClick={() => setPoOpen(false)}>
              Back
            </Button>
            {/* Line */}
          </div>
          {POdata.length > 0 ? (
            <div>
              <MyTable />
            </div>
          ) : (
            <Empty />
          )}
        </Box>
      </Modal>

      {/* Render PurchaseOrderReport directly without wrapping in another Modal */}
      {showReport && selectedPO && (
        <PurchaseOrderReport
          poNumber={selectedPO.replace(/\//g, '$')}
          div_code={div_code || ''} // Provide a default value for div_code
          onClose={handleReportClose}
        />
      )}

      {handleReportOpen.open && (
        <ReportDialogPage
        Report={PurchaseReportDesign}
        required_values={{ divCode: handleReportOpen.divCode, refDocNo: handleReportOpen.poNumber }}
        title="Purchase Order"
        onClose={() => setHandleReportOpen({ open: false, poNumber: '', divCode: '' })}
      />
      )}
      
    </>
  );
};

export default PoList;
