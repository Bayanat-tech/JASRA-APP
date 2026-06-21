import { useEffect, useState, useRef } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter
} from '@mui/material';

import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { TPurchaseOrder } from 'pages/Purchasefolder/type/purchaseorder_pf-types';

//Main Report Theme
import { ThemeProvider } from '@mui/material/styles';
import reporttheme from 'themes/theme/reporttheme';

const ConfirmPO = ({
  request_number,
  action,
  onClose,
  purchaseRequestData: passedData
}: {
  request_number: string;
  action: string; // 'Cancel' or other actions like approve/reject/confirm
  onClose: () => void;
  purchaseRequestData?: TPurchaseOrder; // Optional prop for passed data
}) => {
  const [purchaseRequestDataState, setPurchaseRequestDataState] = useState<TPurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(true); // Initial state is true
  const [isActionDisabled, setIsActionDisabled] = useState(false); // Initially enabled
  const [isSubmitVisible, setIsSubmitVisible] = useState(true); // Initially visible

  const handleUpdateRequest = async (action: string) => {
    try {
      setLoading(true);
      setIsActionDisabled(true); // Disable the buttons
      const dataToUpdate = purchaseRequestDataState || passedData;
      if (!dataToUpdate) {
        alert('No purchase request data available to update.');
        return;
      }

      // Set last_action using action parameter
      dataToUpdate.last_action = action;

      // Log data for debugging
      console.log('Payload being sent:', dataToUpdate);

      // API Call
      const response = await GmPfServiceInstance.updatepurchaserorder(dataToUpdate);
      if (action === 'Pomodify') {
        setIsSubmitVisible(false); // Hide Submit button after the action
      }

      console.log('Update successful:', response);
      //alert('Purchase order updated successfully!');

      // Hide Confirm button when Cancel action is processed
      if (action === 'Cancel') {
        setIsConfirmVisible(false);
      }
      onClose(); // <-- Add this line to close the component
    } catch (error) {
      console.error('Error updating purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (passedData) {
      // If data is passed, set it directly
      setPurchaseRequestDataState(passedData);
    } else {
      // If no data is passed, fetch it from the API
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await GmPfServiceInstance.getPONumber(request_number);
          if (!response || !response.items) {
            console.error('Invalid purchase order data structure');
            setPurchaseRequestDataState(null);
            return;
          }
          setPurchaseRequestDataState(response);
        } catch (error) {
          console.error('Error fetching purchase order:', error);
          setPurchaseRequestDataState(null);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [request_number, passedData]);

  // Declare the type of printRef explicitly as a reference to a div element
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    if (printRef.current) {
      // Hide DialogActions if they exist
      const dialogActions = document.querySelector('.MuiDialogActions-root');
      if (dialogActions) {
        (dialogActions as HTMLElement).style.display = 'none';
      }

      const header = document.querySelector('.MuiDialogTitle-root');
      if (header) {
        (header as HTMLElement).style.display = 'none';
        (header as HTMLElement).style.margin = '0';
        (header as HTMLElement).style.padding = '0';
        (header as HTMLElement).style.height = '0';
      }

      const printStyles = `
  @media print {
    
    .MuiDialogTitle-root {
      display: none !important;
      margin: 0 !important;
      padding: 0 !important;
      height: 0 !important;
      visibility: hidden !important;
    }

    /* Hide all body elements except for the dialog content */
    body > *:not(.MuiDialog-root) {
      display: none !important;
    }

    .MuiDialogContent-root > * {
      margin-bottom: 0 !important;
    }

    .MuiDialogContent-root {
      padding: 0 !important;
      margin: 0 !important;
    }

    @page { 
      size: A4;
      margin: 4.7mm; 
      size: 100% !important;
      transform: scale(1); 
      transform-origin: top left;

      @top-left { 
        content: ""; 
        text-align: left;
        padding-left: 0mm; 
      } 

      @top-right {
        content: ""; 
        text-align: right;
        padding-right: 0mm; 
      }

 
      @bottom-right {
        right: 0mm;
        font-size: 12px;
        text-align: right;
        content: "Page " counter(page) " of " counter(pages);
      }
       
    
    }
  }
`;

      // Create and append the print style tag
      const styleTag = document.createElement('style');
      styleTag.innerHTML = printStyles;
      document.head.appendChild(styleTag);

      // Trigger the print dialog
      window.print();

      document.head.removeChild(styleTag);

      if (dialogActions) {
        (dialogActions as HTMLElement).style.display = 'block';
      }
      if (header) {
        (header as HTMLElement).style.display = 'block';
        (header as HTMLElement).style.margin = '';
        (header as HTMLElement).style.padding = '';
        (header as HTMLElement).style.height = '';
      }
    }
  };

  if (loading) return <CircularProgress />; // Loading spinner
  if (!purchaseRequestDataState) return <Typography>No data available for this request.</Typography>; // No data available

  const {
    ref_doc_no,
    doc_date,
    supplier,
    supp_name,
    delvr_term,
    payment_terms,
    remarks,
    project_name,
    items,
    wo_number,
    supp_addr1,
    supp_telno1,
    supp_faxno1,
    supp_email1,
    po_cancel,
    po_confirm
  } = purchaseRequestDataState;

  const totalAmount = items?.reduce((total, item) => {
    const qty = item.allocated_approved_quantity ?? item.po_mod_appr_qty;
    const amount = item.po_mod_final_rate ?? item.final_rate;
    return total + (qty * amount || 0);
  }, 0);

  return (
    <ThemeProvider theme={reporttheme}>
      <Dialog open={true} onClose={onClose} fullWidth maxWidth="md" ref={printRef}>
        {/*Main Body*/}
        <DialogContent>
          {/* Check if po_cancel is 'Y', and if so, display the image canceled */}
          {po_cancel === 'Y' && (
            <Box
              sx={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <img
                src="https://i.postimg.cc/XqCP9Lzq/PO-CANCEL-removebg.png"
                alt="Cancelled"
                style={{
                  width: '70%',
                  height: 'auto'
                }}
              />
            </Box>
          )}

          {po_confirm === 'N' || po_confirm === null ? (
            <Box
              sx={{
                position: 'absolute', // Positioning it absolutely
                top: '40%', // Centers the image vertically
                left: '50%', // Centers the image horizontally
                transform: 'translate(-50%, -50%)', // Offsets the image by its own size to perfectly center it
                zIndex: 10 // Ensure it appears in front of other content
              }}
            >
              <img
                src="https://i.postimg.cc/j2tfhd8f/draft.png"
                alt="Draft"
                style={{
                  width: '70%', // Adjust this to make the image smaller
                  height: 'auto' // Keeps the aspect ratio intact
                }}
              />
            </Box>
          ) : null}

          {/* HEADER */}
          {/* Logo Section */}
          <Box display="flex" width="60%">
            <img src="https://i.postimg.cc/GpfLWwf5/DIV-ID-10.jpg" alt="logo" />
          </Box>
          {/* TITLE*/}
          <Box>
            <Typography variant="h1">PURCHASE ORDER</Typography>
          </Box>

          {/*MAIN BODY*/}
          {/* Supplier Details + Purchase Order No*/}
          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>Supplier Details: {supp_name}</strong>
            </Typography>

            <Typography>
              <strong>Purchase Order No: {ref_doc_no?.replace(/\$/g, '/')}</strong>
            </Typography>
          </Box>

          {/* Supplier Number + Date*/}
          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>Supplier Number: {supplier}</strong>
            </Typography>

            <Typography>
              {/*En-GB for dd/mm/yyyy format */}
              <strong>Date: {new Date(doc_date).toLocaleDateString('en-GB')}</strong>
            </Typography>
          </Box>

          {/* Supplier Name + Buyer*/}
          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>{supp_name}</strong>
            </Typography>

            <Typography>
              <strong>Buyer: {supp_name}</strong>
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>{supp_name}</strong>
            </Typography>
          </Box>

          {/*"CR# + Delivery address"*/}
          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>
                CR#: {wo_number},{supp_addr1}
              </strong>
            </Typography>

            <Typography>
              <strong>Delivery Address: {delvr_term}</strong>
            </Typography>
          </Box>

          {/*"Tel + Delivery address Name"*/}
          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>TEL- +{supp_telno1}</strong>
            </Typography>

            <Typography>
              <strong>{delvr_term}</strong>
            </Typography>
          </Box>

          {/*"Fax + Delivery address mobile No"*/}
          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>FAX- +{supp_faxno1}</strong>
            </Typography>

            <Typography>
              <strong>{delvr_term}</strong>
            </Typography>
          </Box>

          {/*"Suuplier Email + MR. NO"*/}
          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>{supp_email1}</strong>
            </Typography>

            <Typography>
              <strong>MR. No: {delvr_term}</strong>
            </Typography>
          </Box>

          {/*"Supplier Mobile + WO No:"*/}
          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>Mobile: {supp_telno1}</strong>
            </Typography>
            <Typography>
              <strong>WO No.: {wo_number}</strong>
            </Typography>
          </Box>

          {/* Table For Payment Term, Delivery Term & Project */}
          <Box id="Table" display="flex" flexDirection="column">
            <TableContainer sx={{ marginTop: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e8f0f2' }}>
                    <TableCell>
                      <strong>PAYMENT TERM</strong>
                    </TableCell>
                    <TableCell>
                      <strong>DELIVERY TERM</strong>
                    </TableCell>
                    <TableCell>
                      <strong>PROJECT</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <TableRow>
                    <TableCell>{payment_terms}</TableCell>
                    <TableCell>{delvr_term}</TableCell>
                    <TableCell>{project_name}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Remarks */}
          <Box display="flex">
            <Typography sx={{ marginTop: 0.5 }}>
              <strong>{remarks}</strong>
            </Typography>
          </Box>

          {/* Table For Items and Calculate Total Amount */}

          <Box id="Table2" display="flex" flexDirection="column">
            <TableContainer sx={{ marginTop: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e8f0f2' }}>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <strong>ITEM NO.</strong>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <strong>GL CODE</strong>
                    </TableCell>
                    <TableCell>
                      <strong>DESCRIPTION</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Unit of Measure</strong>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <strong>QTY</strong>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <strong>UNIT PRICE(QR)</strong>
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#f0f8ff', textAlign: 'right' }}>
                      <strong>AMOUNT(QR)</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                {/*"Scope of Work Row"*/}
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'left', fontWeight: 'bold' }}>
                    {/*"Need to change Var"*/}
                    <Typography variant="h6">
                      <strong>Scope of Work:- {remarks}</strong>
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableBody>
                  {items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{ textAlign: 'right' }}
                        style={{ visibility: item.item_desp || item.addl_item_desc ? 'visible' : 'hidden' }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Typography style={{ visibility: Number(item.cost_code) !== 0 ? 'visible' : 'hidden' }}>
                          {item.cost_code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          style={{
                            visibility:
                              item.service_rm_flag === 'RM'
                                ? item.item_desp
                                  ? 'visible'
                                  : 'hidden'
                                : item.addl_item_desc
                                ? 'visible'
                                : 'hidden'
                          }}
                        >
                          {item.service_rm_flag === 'RM' ? item.item_desp : item.addl_item_desc}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography style={{ visibility: item.l_uom ? 'visible' : 'hidden' }}>{item.l_uom}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Typography style={{ visibility: Number(item.allocated_approved_quantity) !== 0 ? 'visible' : 'hidden' }}>
                          {item.allocated_approved_quantity}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: 'right' }}
                        style={{
                          visibility: Number(item.final_rate) !== 0 ? 'visible' : 'hidden'
                        }}
                      >
                        {item.po_mod_final_rate != null && item.po_mod_final_rate !== 0 ? item.po_mod_final_rate : item.final_rate}
                      </TableCell>

                      <TableCell
                        sx={{ backgroundColor: '#f0f8ff', textAlign: 'right' }}
                        style={{
                          visibility: Number(item.allocated_approved_quantity) !== 0 ? 'visible' : 'hidden'
                        }}
                      >
                        {(item.allocated_approved_quantity * (item.po_mod_final_rate ?? item.final_rate) || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'right', fontWeight: 'bold', color: '#1f1f1f' }}>
                      Total:
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: 'right', fontWeight: 'bold', color: '#1f1f1f' }}
                      style={{ visibility: Number(totalAmount) !== 0 ? 'visible' : 'hidden' }}
                    >
                      {totalAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>

          {/* Note Body*/}
          <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 1 }}>
            <Typography variant="h6">
              <strong>
                Above is as per attached quotation Ref: {ref_doc_no.replace(/\$/g, '/')} Dated{' '}
                {new Date(doc_date).toLocaleDateString('en-GB')}
              </strong>
            </Typography>
            <Typography sx={{ paddingLeft: 3, marginBottom: 0.1 }}>
              1.Our order number is to be quoted on all relevant Invoices & Delivery Notes. Your Invoice to be submitted against the actual
              Delivery/services to our Head Office within seven days from the date of invoice supported with relevant Delivery Note or Job
              Completion Report or Service Report or attendance sheet whichever is applicable with all Original copies.
            </Typography>
            <Typography sx={{ paddingLeft: 3, marginBottom: 0.1 }}>
              2. Notify Procurement Dept. immediately if you are unable to ship/deliver as specified.
            </Typography>
            <Typography sx={{ paddingLeft: 3 }}>3. Send all correspondence to: procurement@the-maintainers.com</Typography>
            <Typography sx={{ paddingLeft: 3 }}>Procurement Department</Typography>
            <Typography sx={{ paddingLeft: 3 }}>P.O. Box: 201325, 11th Floor Lusail Marina Tower No.50 Lusail-Qatar</Typography>
            <Typography sx={{ paddingLeft: 3 }}>Phone: 8974 4404 0800 Fax : +974 4404 0801</Typography>
            <Typography sx={{ paddingLeft: 3 }}>Fax : +974 4404 0801</Typography>
          </Box>
          {/* Table for Sign */}
          <TableContainer sx={{ marginTop: 0 }}>
            <Table size="small" sx={{ borderCollapse: 'collapse' }}>
              <TableBody>
                <TableRow>
                  {/* First Column: For Supplier and Terms */}
                  <TableCell sx={{ verticalAlign: 'top', textAlign: 'left', border: '1px solid black' }}>
                    <Box>
                      <Typography>For Supplier:</Typography>
                      <Typography>I have read & agreed to all terms and conditions.</Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography>_________________________</Typography>
                          <Typography>Sign</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography>_________________________</Typography>
                          <Typography>Date</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Second Column: For THE MAINTAINERS */}
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Box>
                      <Typography>For THE MAINTAINERS:</Typography>
                      <Typography>I have read & agreed to all terms and conditions.</Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 0 }}>
                        <Box>
                          <Typography>_________________________</Typography>
                          <Typography>Sign</Typography>
                        </Box>
                        <Box>
                          <Typography>_________________________</Typography>
                          <Typography>Date</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table for website */}
          <TableContainer sx={{ marginTop: 0 }}>
            <Table size="small" sx={{ borderCollapse: 'collapse' }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Box>
                      <Typography variant="h6">The Maintainers Toll Free Number: 800-8050</Typography>
                      <Typography variant="h6">Website: the-maintaine.com</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* footer Section */}
          <img
            src="https://i.postimg.cc/6q0DNC3p/ISO.png"
            alt="Logo"
            style={{
              width: '100%',
              maxHeight: 100,
              objectFit: 'fill',
              alignContent: 'center'
            }}
          />
        </DialogContent>

        <DialogActions sx={{ width: '100%', justifyContent: 'space-between' }}>
          {/* Left Side Buttons */}
          <Box>
            {action === 'Confirm' && isConfirmVisible && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleUpdateRequest('Confirm')}
                disabled={isActionDisabled} // Disable button when action is in progress
              >
                Confirm
              </Button>
            )}
          </Box>

          {/* 
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => handleUpdateRequest('Cancel')}
          disabled={isActionDisabled} // Disable button when action is in progress
        >
          Cancel
        </Button>
        */}

          {/* Right Side Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="primary" onClick={handlePrint}>
              PDF
            </Button>

            {action === 'Cancel' && isConfirmVisible && (
              <Button variant="contained" color="primary" onClick={() => handleUpdateRequest('Cancel')}>
                Confirm
              </Button>
            )}

            {action === 'Pomodify' && isSubmitVisible && (
              <Button variant="contained" color="primary" onClick={() => handleUpdateRequest('Pomodify')}>
                Submit
              </Button>
            )}

            <Button variant="contained" color="primary" onClick={onClose}>
              Back
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default ConfirmPO;
