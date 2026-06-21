import React, { useEffect, useState } from 'react';
import { Button, Typography, Grid, TextField, Tab, Tabs, Tooltip, ButtonGroup } from '@mui/material';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { TPurchaseOrder as OriginalTPurchaseOrder, TItemPurchaseOrder } from 'pages/Purchasefolder/type/purchaseorder_pf-types';
import { dispatch } from 'store';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';
import { ImExit } from 'react-icons/im';
import { BiDetail } from 'react-icons/bi';
import UniversalDialog from 'components/popup/UniversalDialog';
import POModifyRemarks from './Pomodifyremarks';
import useAuth from 'hooks/useAuth';
import { showAlert } from 'store/CustomAlert/alertSlice';
import CustomAlert from 'components/@extended/CustomAlert';
import { openBackdrop, closeBackdrop } from 'store/reducers/backdropSlice';

// Extend TPurchaseOrder to include service_rm_flag
type TServiceRmFlag = {
  po_mod_final_rate: number;
  type: string;
  value: number | string;
}[];
type TPurchaseOrder = OriginalTPurchaseOrder & {
  service_rm_flag?: TServiceRmFlag;
};
interface PomodifyFormProps {
  request_number: string;
  onExit: () => void;
  open: boolean;
}

const PomodifyForm: React.FC<PomodifyFormProps> = ({ request_number, onExit, open }) => {
  const [purchaseRequestData, setPurchaseRequestData] = useState<TPurchaseOrder | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modifiedData, setModifiedData] = useState<TPurchaseOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [remarksText, setRemarksText] = useState('');
  const { user } = useAuth();
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
      setIsModalOpen(true);
    } else {
      console.error('Request number is not available or purchaseRequestData is null.');
    }
  };
  const handleItemChange = (index: number, name: keyof TItemPurchaseOrder, value: string | number) => {
    setPurchaseRequestData((prevData) => {
      if (!prevData) return null;

      const updatedItems = [...prevData.items];
      const updatedFlags = [...(prevData.service_rm_flag || [])];

      if (index < 0 || index >= updatedItems.length) return prevData;

      // Update items
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value
      };

      if (name === 'po_mod_final_rate') {
        const rate = Number(value);
        const qty = updatedItems[index].allocated_approved_quantity || 0;

        updatedItems[index].po_mod_amount = Number((rate * qty).toFixed(2));

        // Also update in service_rm_flag if exists
        if (updatedFlags[index]) {
          updatedFlags[index].po_mod_final_rate = rate;
        }
      }

      return {
        ...prevData,
        items: updatedItems,
        service_rm_flag: updatedFlags
      };
    });
  };

  // if (loading) return <CircularProgress />;

  useEffect(() => {
    if (loading) {
      dispatch(openBackdrop());
    } else {
      dispatch(closeBackdrop());
    }
  }, [loading]);

  if (loading) return null;
  if (!purchaseRequestData) return <Typography>No data available for this request.</Typography>;

  // Extract values from the purchase request data
  const { ref_doc_no, doc_date, supplier, supp_name, delvr_term, payment_terms, remarks, project_name, items } = purchaseRequestData;

  // Handle Tab Change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const MyGrid = () => {
    const gridRef = React.useRef<AgGridReact>(null);

    // Update totalRow to show separate totals
    const totalRow = React.useMemo(
      () => [
        {
          addl_item_desc: 'Total',
          item_p_qty: null,
          p_uom: null,
          l_uom: null,
          allocated_approved_quantity: null,
          item_rate: null,
          discount_amount: null,
          final_rate: null,
          // Show amount total
          amount: items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2),
          po_mod_final_rate: null,
          // Show po_mod_amount total
          po_mod_amount: items.reduce((sum, item) => sum + (Number(item.po_mod_amount) || 0), 0).toFixed(2)
        }
      ],
      [items]
    );

    const columnDefs = React.useMemo<ColDef<any>[]>(
      () => [
        {
          field: 'addl_item_desc',
          headerName: 'Description',
          cellStyle: { backgroundColor: 'lightGrey' },
          width: 245
        },
        {
          field: 'item_p_qty',
          headerName: 'Primary Qty.',
          cellStyle: { backgroundColor: 'lightGrey' },
          width: 120
        },
        {
          field: 'p_uom',
          headerName: 'Primary UOM',
          cellStyle: { backgroundColor: 'lightGrey' },
          width: 120
        },
        {
          field: 'l_uom',
          headerName: 'Lowest UOM',
          cellStyle: { backgroundColor: 'lightGrey' },
          width: 120
        },
        {
          field: 'allocated_approved_quantity',
          headerName: 'Quantity',
          cellStyle: { backgroundColor: 'lightGrey' },
          width: 120
        },
        {
          field: 'item_rate',
          headerName: 'Rate',
          cellStyle: { backgroundColor: 'lightGrey' },
          width: 90
        },
        {
          field: 'discount_amount',
          headerName: 'Discount',
          cellStyle: { backgroundColor: 'lightGrey' },
          width: 120
        },
        {
          field: 'final_rate',
          headerName: 'Final Rate',
          cellStyle: { backgroundColor: 'lightGrey' },
          width: 120
        },
        {
          field: 'amount',
          headerName: 'Amt.',
          cellStyle: (params) => ({
            backgroundColor: 'lightGrey',
            fontWeight: params.node?.rowPinned === 'bottom' ? 'bold' : 'normal'
          }),
          width: 100,
          valueFormatter: (params) => {
            if (params.node?.rowPinned === 'bottom') {
              return Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            if (params.value != null) {
              return Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return '';
          }
        },
        {
          field: 'po_mod_final_rate',
          headerName: 'PO Mod Rate',
          width: 120,
          type: 'numericColumn',
          editable: (params) => {
            const serviceRmFlag = params.data.service_rm_flag;
            return serviceRmFlag === 'Service' || serviceRmFlag === 'RM' || serviceRmFlag === 'Material';
          },
          cellStyle: (params) => {
            const serviceRmFlag = params.data.service_rm_flag;
            return {
              backgroundColor: serviceRmFlag === 'Service' || serviceRmFlag === 'RM' || serviceRmFlag === 'Material' ? 'white' : 'lightGrey'
            };
          },
          cellRenderer: (params: { value: any }) => {
            return params.value !== null && params.value !== undefined
              ? Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '';
          },
          valueParser: (params: any) => {
            const parsedValue = parseFloat(params.newValue);
            return isNaN(parsedValue) ? 0 : parseFloat(parsedValue.toFixed(2));
          },
          valueFormatter: (params: { value: any }) => {
            return params.value !== null && params.value !== undefined
              ? Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00';
          },
          onCellValueChanged: (params: any) => {
            if (params.node && params.node.rowIndex !== null) {
              handleItemChange(params.node.rowIndex, 'po_mod_final_rate', params.newValue);
            }
          },
          cellEditor: 'agNumberCellEditor',
          cellEditorParams: {
            precision: 2,
            min: 0,
            step: 0.01
          }
        },
        {
          field: 'po_mod_amount',
          headerName: 'PO Mod Amount',
          cellStyle: (params) => ({
            backgroundColor: 'lightGrey',
            fontWeight: params.node?.rowPinned === 'bottom' ? 'bold' : 'normal'
          }),
          width: 130,
          valueFormatter: (params: any) => {
            if (params.node?.rowPinned === 'bottom') {
              if (params.value === null) return '';
              return Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            if (params.value != null) {
              return Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return '';
          }
        }
      ],
      []
    );

    return (
      <>
        <div className="ag-theme-alpine ag-theme-alpine-mytable" style={{ maxHeight: 400, overflow: 'auto' }}>
          <CustomAlert />
          <AgGridReact
            ref={gridRef}
            rowData={items}
            columnDefs={columnDefs}
            defaultColDef={{ resizable: true, sortable: true, filter: true }}
            domLayout="autoHeight"
            animateRows={true}
            rowHeight={20}
            headerHeight={25}
            pinnedBottomRowData={totalRow}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            marginTop: '10px',
            borderRadius: '4px'
          }}
        >
          <div>
            {/* <strong>Total:</strong> {Number(totalRow[0].po_mod_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
          </div>
        </div>
      </>
    );
  };

  console.log('purchaseRequestData', purchaseRequestData);

  return (
    <UniversalDialog
      action={{ open, fullWidth: true, maxWidth: false }}
      onClose={onExit}
      title="Purchase Order Modify"
      hasPrimaryButton={false}
    // sx={{ '& .MuiDialogTitle-root': { display: 'none' } }}
    >
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
            <MyGrid />
          </>
        )}
        <div className="flex justify-between mt-2">
          <>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                const items = purchaseRequestData?.items ?? [];

                if (!items.length) {
                  alert('Update PO Modify Rate');
                  return;
                }

                // Add new validation for PO Mod Amount
                const hasInvalidAmount = items.some((item) => {
                  const poModAmount = Number(item.po_mod_amount) || 0;
                  const originalAmount = Number(item.amount) || 0;
                  return poModAmount > originalAmount;
                });

                if (hasInvalidAmount) {
                  dispatch(
                    showAlert({
                      severity: 'error',
                      message: 'PO Modification amount cannot be greater than original amount',
                      open: true
                    })
                  );
                  return;
                }

                // Filter out 'Addl Desc' items
                const filteredItems = items.filter((item) => {
                  const itemType = (item.type || '').toString().toLowerCase().trim();
                  const serviceFlag = (item.service_rm_flag || '').toString().toLowerCase().trim();
                  return itemType !== 'addl desc' && serviceFlag !== 'addl desc';
                });

                // Check if any item has zero or no PO mod rate (excluding Addl Desc)
                const hasZeroOrNoModRate = filteredItems.some((item) => {
                  const serviceFlag = (item.service_rm_flag || '').toString().toLowerCase().trim();
                  return serviceFlag !== 'addl desc' && (!item.po_mod_final_rate || Number(item.po_mod_final_rate) === 0);
                });

                if (hasZeroOrNoModRate) {
                  dispatch(
                    showAlert({
                      severity: 'error',
                      message: 'Please enter a Valid Modification Rate for all items',
                      open: true
                    })
                  );
                  return;
                }

                // Check if any item has zero PO mod amount
                const hasZeroModAmount = filteredItems.some(
                  (item) => Number(item.po_mod_amount) === 0 && Number(item.po_mod_final_rate) > 0
                );

                if (hasZeroModAmount) {
                  dispatch(
                    showAlert({
                      severity: 'error',
                      message: 'PO Modification amount cannot be zero when rate is specified',
                      open: true
                    })
                  );
                  return;
                }

                // Check Service items
                const serviceItems = filteredItems.filter((item) => (item.type || '').toString().toLowerCase().trim() === 'service');
                const hasServiceItems = serviceItems.length > 0;
                const hasServiceWithRate = serviceItems.some((item) => Number(item.po_mod_final_rate) > 0);

                // Check RM/Material items
                const rmItems = filteredItems.filter((item) => {
                  const type = (item.type || '').toString().toLowerCase().trim();
                  return type === 'rm' || type === 'material';
                });
                const hasRMItems = rmItems.length > 0;
                const hasRMWithRate = rmItems.some((item) => Number(item.po_mod_final_rate) > 0);

                if (hasServiceItems && !hasServiceWithRate) {
                  dispatch(
                    showAlert({
                      severity: 'error',
                      message: 'Please enter the Modification Rate for Service items',
                      open: true
                    })
                  );
                  return;
                }

                if (hasRMItems && !hasRMWithRate) {
                  dispatch(
                    showAlert({
                      severity: 'error',
                      message: 'Please enter the Modification Rate for Material items',
                      open: true
                    })
                  );
                  return;
                }

                // If we have both types, both should have rates
                if (hasServiceItems && hasRMItems && (!hasServiceWithRate || !hasRMWithRate)) {
                  dispatch(
                    showAlert({
                      severity: 'error',
                      message: 'Please enter the Modification Rate for both Service and Material items',
                      open: true
                    })
                  );
                  return;
                }

                // ✅ Passed validation
                setIsDialogOpen(true);
              }}
            >
              Submit
            </Button>

            <UniversalDialog
              title={'Reason for Revision of Purchase Order'}
              fullWidth
              onClose={() => {
                setIsDialogOpen(false);
                setRemarksText('');
              }}
              action={{ open: isDialogOpen }}
              hasPrimaryButton={false}
              disablePrimaryButton={false}
            >
              <POModifyRemarks
                purchaseRequestData={purchaseRequestData}
                setPurchaseRequestData={(data) => {
                  if (data) {
                    setPurchaseRequestData((prev) => ({
                      ...prev!,
                      ...data
                    }));
                  } else {
                    setPurchaseRequestData(null);
                  }
                  setRemarksText('');
                }}
                setLoading={setLoading}
                setIsModalOpen={setIsDialogOpen}
                setModifiedData={setModifiedData}
                remarksText={remarksText}
                setRemarksText={setRemarksText}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setRemarksText('');
                  onExit(); // This will close the PO modify form modal
                }}
                closeParentModal={onExit} // Add this line
                GmPfServiceInstance={{
                  updatepurchaserorder: (data: any) => GmPfServiceInstance.updatepurchaserorder(data as TPurchaseOrder),
                  updateReasonForPO: (refDocNo: string, company_code: string, remarks: string) =>
                    GmPfServiceInstance.updateReasonForPO(remarks, refDocNo, user?.company_code ?? '', user?.loginid ?? '')
                }}
              />
            </UniversalDialog>
          </>
          <ButtonGroup variant="outlined" size="small" aria-label="Basic button group">
            <Tooltip title="PO Details">
              <Button onClick={handleConfirmPO}>
                <BiDetail />
              </Button>
            </Tooltip>
            <Tooltip title="Exit">
              <Button onClick={onExit}>
                <ImExit />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </div>

        {/* Conditionally render ConfirmPO Modal */}
        {isModalOpen && modifiedData && (
          <PurchaseOrderReport
            poNumber={modifiedData.request_number}
            div_code={modifiedData.div_code || ''} // Provide a default value for div_code
            onClose={() => {
              setIsModalOpen(false);
              setModifiedData(null);
            }}
          />
        )}
      </div>
    </UniversalDialog>
  );
};

export default PomodifyForm;
