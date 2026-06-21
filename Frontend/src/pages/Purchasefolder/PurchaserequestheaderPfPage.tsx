import React, { useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress, Typography, Grid, TextField, Tab, Tabs, Tooltip } from '@mui/material';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { TPurchaseOrder, TItemPurchaseOrder } from 'pages/Purchasefolder/type/purchaseorder_pf-types';
import { InputNumber, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { InfoCircleOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';

interface PomodifyFormProps {
  request_number: string; // Request number passed as prop
  onExit: () => void; // Callback function to handle form exit
}

interface DebouncedNumericInputProps {
  value: number;
  onChange: (value: number) => void;
  delay?: number;
  [key: string]: any;
}

const PomodifyForm: React.FC<PomodifyFormProps> = ({ request_number, onExit }) => {
  const [purchaseRequestData, setPurchaseRequestData] = useState<TPurchaseOrder | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // Track active tab
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [modifiedData, setModifiedData] = useState<TPurchaseOrder | null>(null); // Track user-entered data

  // Fetch Purchase Order Data when component mounts or request_number changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await GmPfServiceInstance.getPONumber(request_number);
        if (!response || !response.items) {
          console.error('Invalid purchase order data structure');
          setPurchaseRequestData(null);
          return;
        }
        setPurchaseRequestData(response);
      } catch (error) {
        console.error('Error fetching purchase order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [request_number]);

  const handleConfirmPO = () => {
    if (purchaseRequestData?.request_number) {
      setModifiedData(purchaseRequestData);
      setIsModalOpen(true); // This will trigger the modal to open
    } else {
      console.error('Request number is not available or purchaseRequestData is null.');
    }
  };

  const handleItemChange = (index: number, name: keyof TItemPurchaseOrder, value: string | number) => {
    setPurchaseRequestData((prevData) => {
      // Ensure `prevData` is not null
      if (!prevData) {
        console.error('Purchase request data is null.');
        return null;
      }

      // Clone the current items array
      const updatedItems = [...prevData.items];

      // Validate index
      if (index < 0 || index >= updatedItems.length) {
        console.error('Index out of bounds:', index);
        return prevData; // Return the previous state unchanged
      }

      // Update the specific item
      updatedItems[index] = {
        ...updatedItems[index], // Copy the existing item
        [name]: value // Set the specific field
      };

      // If `po_mod_final_rate` is updated, recalculate `po_mod_amount`
      if (name === 'po_mod_final_rate') {
        // Calculate with proper rounding
        const calculatedAmount = Number(
          (updatedItems[index].po_mod_final_rate * updatedItems[index].allocated_approved_quantity).toFixed(2)
        );

        updatedItems[index].po_mod_amount = calculatedAmount;
      }

      // Return the updated state
      return {
        ...prevData, // Spread other fields
        items: updatedItems // Update the items array
      };
    });
  };

  // Loading and error states
  if (loading) return <CircularProgress />;
  if (!purchaseRequestData) return <Typography>No data available for this request.</Typography>;

  // Extract values from the purchase request data
  const { ref_doc_no, doc_date, supplier, supp_name, delvr_term, payment_terms, remarks, project_name, items } = purchaseRequestData;

  // Handle Tab Change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const debounced = (...args: Parameters<F>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
    debounced.flush = () => {
      clearTimeout(timeoutId);
      func();
    };
    debounced.cancel = () => {
      clearTimeout(timeoutId);
    };
    return debounced;
  };

  const MyAntTable = () => {
    const DebouncedItemRate: React.FC<DebouncedNumericInputProps> = ({ value, onChange, delay = 1500, ...props }) => {
      const [inputValue, setInputValue] = useState<number>(Math.max(0, value || 0));
      const debouncedOnChange = useMemo(() => debounce(onChange, delay), [onChange, delay]);

      useEffect(() => {
        setInputValue(Math.max(0, value || 0));
      }, [value]);

      const handleChange = (rawValue: string | number | null) => {
        // const cleaned = typeof rawValue === 'string' ? rawValue.replace(/[^0-9.]/g, '') : String(rawValue || 0);
        const cleaned = (rawValue ?? 0).toString().replace(/[^0-9.]/g, '');

        const numValue = Math.max(0, parseFloat(parseFloat(cleaned).toFixed(2)));

        setInputValue(numValue);
        debouncedOnChange(numValue);
      };

      useEffect(() => () => debouncedOnChange.cancel(), [debouncedOnChange]);

      return (
        <InputNumber
          controls={false}
          value={inputValue}
          onChange={handleChange}
          min={0}
          step={0.01}
          precision={2}
          formatter={(value) =>
            new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(value as number)
          }
          parser={(value) => parseFloat((value ?? '').toString().replace(/,/g, '') || '0')}
          className="text-right"
          style={{ textAlign: 'right' }}
          decimalSeparator="."
          inputMode="decimal"
          variant="borderless"
          {...props}
        />
      );
    };

    const columns: ColumnsType<TItemPurchaseOrder> = [
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <div className="text-center">
              <div>Description</div>
            </div>
          </div>
        ),
        dataIndex: 'addl_item_desc',
        key: 'addl_item_desc',
        render: (text: string, record: any) => <span className="flex justify-end">{text}</span>
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <Tooltip title="Primary Quantity" placement="top">
              <div className="flex flex-col items-center justify-center px-1 py-1 gap-1 cursor-pointer">
                <div className="text-center">
                  <div>Primary</div>
                  <div> </div>
                </div>
                <InfoCircleOutlined className="text-xs" />
              </div>
            </Tooltip>
          </div>
        ),
        dataIndex: 'item_p_qty',
        key: 'item_p_qty',
        render: (text: number, record: any) => <span className="flex justify-end">{text}</span>
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <Tooltip title="Primary Unit of Measurement" placement="top">
              <div className="flex flex-col items-center justify-center px-1 py-1 gap-1 cursor-pointer">
                <div className="text-center">
                  <div>Primary</div>
                  <div>UOM</div>
                </div>
                <InfoCircleOutlined className="text-xs" />
              </div>
            </Tooltip>
          </div>
        ),
        dataIndex: 'p_uom',
        key: 'p_uom',
        render: (text: string, record: any) => <span className="flex justify-end">{text}</span>
      },

      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <Tooltip title="Lowest Unit of Measurement" placement="top">
              <div className="flex flex-col items-center justify-center px-1 py-1 gap-1 cursor-pointer">
                <div className="text-center">
                  <div>Lowest</div>
                  <div>UOM</div>
                </div>
                <InfoCircleOutlined className="text-xs" />
              </div>
            </Tooltip>
          </div>
        ),
        dataIndex: 'l_uom',
        key: 'l_uom',
        render: (text: string, record: any) => <span className="flex justify-end">{text}</span>
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <div className="text-center">
              <div>Quantity</div>
            </div>
          </div>
        ),
        dataIndex: 'allocated_approved_quantity',
        key: 'allocated_approved_quantity',
        render: (text: number, record: any) => <span className="flex justify-end">{text}</span>
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <div className="text-center">
              <div>Rate</div>
            </div>
          </div>
        ),
        dataIndex: 'item_rate',
        key: 'item_rate',
        render: (text: number, record: any) => <span className="flex justify-end">{text}</span>
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <div className="text-center">
              <div>Discount</div>
            </div>
          </div>
        ),
        dataIndex: 'discount_amount',
        key: 'discount_amount',
        render: (text: number, record: any) => <span className="flex justify-end">{text}</span>
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <div className="text-center">
              <div>Final Rate</div>
            </div>
          </div>
        ),
        dataIndex: 'final_rate',
        key: 'final_rate',
        render: (text: number, record: any) => <span className="flex justify-end">{text}</span>
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <div className="text-center">
              <div>Amount</div>
            </div>
          </div>
        ),
        dataIndex: 'amount',
        key: 'amount',
        render: (text: number, record: any) => <span className="flex justify-end">{text}</span>
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <Tooltip title="Purchase Order Modified Final Rate" placement="top">
              <div className="flex flex-col items-center justify-center px-1 py-1 gap-1 cursor-pointer">
                <div className="text-center">
                  <div>PO Mod Rate</div>
                </div>
                <InfoCircleOutlined className="text-xs" />
              </div>
            </Tooltip>
          </div>
        ),
        dataIndex: 'po_mod_final_rate',
        key: 'po_mod_final_rate',
        render: (text: number, record: any, index: number) => (
          <div className="w-full text-right">
            <DebouncedItemRate
              value={text || 0}
              onChange={(newValue) => {
                console.log(`Row ${index} final value:`, newValue);
                handleItemChange(index, 'po_mod_final_rate', newValue);
              }}
              delay={500}
              className="!text-right w-full" // Tailwind important modifier
              style={{ textAlign: 'right' }}
            />
          </div>
        )
      },
      {
        title: () => (
          <div className="flex flex-row justify-center items-center gap-1">
            <Tooltip title="Purchase Order Modified Amount" placement="top">
              <div className="flex flex-col items-center justify-center px-1 py-1 gap-1 cursor-pointer">
                <div className="text-center">
                  <div>PO Mod Amount</div>
                </div>
                <InfoCircleOutlined className="text-xs" />
              </div>
            </Tooltip>
          </div>
        ),
        dataIndex: 'po_mod_amount',
        key: 'po_mod_amount',
        render: (text: number, record: any) => <span className="flex justify-end">{text}</span>
      }
    ];

    return (
      <Table
        dataSource={items}
        pagination={false}
        size="small"
        columns={columns.map((col) => ({
          ...col,
          align: col.align as 'left' | 'right' | 'center'
        }))}
        rowKey="key"
        bordered={true}
        className="
        mt-2
        [&_.ant-table]:rounded-none
        [&_.ant-table-thead>tr>th]:rounded-none
        [&_.ant-table-thead>tr>th]:bg-[#0B3040]
        [&_.ant-table-thead>tr>th]:text-white
        [&_.ant-table-thead>tr>th]:font-medium
        [&_.ant-table-cell-fix-left]:before:!bg-blue-100
      "
      />
    );
  };

  const MyGrid = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const gridRef = React.useRef<AgGridReact>(null);

    const columnDefs = React.useMemo<ColDef<any>[]>(
      () => [
        {
          field: 'addl_item_desc',
          headerName: 'Description'
        },
        {
          field: 'item_p_qty',
          headerName: 'Primary Quantity'
        },
        {
          field: 'p_uom',
          headerName: 'Primary UOM'
        },
        {
          field: 'l_uom',
          headerName: 'Lowest UOM'
        },
        {
          field: 'allocated_approved_quantity',
          headerName: 'Quantity'
        },
        {
          field: 'item_rate',
          headerName: 'Rate'
        },
        {
          field: 'discount_amount',
          headerName: 'Discount'
        },
        {
          field: 'final_rate',
          headerName: 'Final Rate'
        },
        {
          field: 'amount',
          headerName: 'Amount'
        },
        {
          field: 'po_mod_final_rate',
          headerName: 'PO Mod Rate'
        },
        {
          field: 'po_mod_amount',
          headerName: 'PO Mod Amount'
        }
      ],
      []
    );

    return (
      <div className="ag-theme-alpine ag-theme-alpine-mytable " style={{ maxHeight: 400, overflow: 'auto' }}>
        <AgGridReact
          ref={gridRef}
          rowData={items}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, sortable: true, filter: true }}
          domLayout="autoHeight"
          animateRows={true}
          rowHeight={20}
          headerHeight={25}
        />
      </div>
    );
  };

  console.log('purchaseRequestData', purchaseRequestData);

  return (
    <div style={{ minHeight: '90vh', overflowY: 'auto' }}>
      {/* Tabs for organization */}
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="Tabs">
        <Tab label="Tab 1 - Header Information" />
        <Tab label="Tab 2 - Item Information" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={1} sx={{ padding: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="PO No"
              size="small"
              disabled
              value={(ref_doc_no ?? '').replace(/\$/g, '/') || '0'}
              fullWidth
              onChange={(e) => setPurchaseRequestData({ ...purchaseRequestData, ref_doc_no: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Date"
              size="small"
              type="date"
              disabled
              value={new Date(doc_date).toLocaleDateString('en-CA')}
              fullWidth
              onChange={(e) => setPurchaseRequestData({ ...purchaseRequestData, doc_date: new Date(e.target.value) })}
              sx={{ marginBottom: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Supplier Code"
              size="small"
              disabled
              value={supplier}
              fullWidth
              onChange={(e) => setPurchaseRequestData({ ...purchaseRequestData, supplier: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Supplier Name"
              size="small"
              disabled
              value={supp_name}
              fullWidth
              onChange={(e) => setPurchaseRequestData({ ...purchaseRequestData, supp_name: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Delivery Terms"
              size="small"
              disabled
              value={delvr_term}
              fullWidth
              onChange={(e) => setPurchaseRequestData({ ...purchaseRequestData, delvr_term: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Payment Terms"
              size="small"
              disabled
              value={payment_terms}
              fullWidth
              onChange={(e) => setPurchaseRequestData({ ...purchaseRequestData, payment_terms: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Remarks"
              size="small"
              value={remarks}
              fullWidth
              multiline
              rows={2}
              onChange={(e) => setPurchaseRequestData({ ...purchaseRequestData, remarks: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Project Name"
              size="small"
              disabled
              value={project_name}
              fullWidth
              onChange={(e) => setPurchaseRequestData({ ...purchaseRequestData, project_name: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
          </Grid>
        </Grid>
      )}

      {/* Tab 2 - Item Information */}
      {activeTab === 1 && (
        <>
          <MyAntTable />
          <MyGrid />
        </>
      )}
      <div className="flex flex-wrap md:justify-right space-x-2 mt-6">
        <Button size="small" variant="contained" onClick={handleConfirmPO}>
          Submit
        </Button>
        <Button size="small" variant="contained" onClick={onExit}>
          Exit
        </Button>
      </div>

      {/* Conditionally render ConfirmPO Modal */}
      {isModalOpen && modifiedData && <PurchaseOrderReport poNumber={modifiedData.request_number} />}
    </div>
  );
};

export default PomodifyForm;
