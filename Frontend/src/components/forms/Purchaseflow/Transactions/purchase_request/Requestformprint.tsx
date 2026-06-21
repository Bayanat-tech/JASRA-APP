import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper
} from '@mui/material';

import React, { JSX, useState } from 'react';
import SentbackRollSection from './SentbackRollSection';
import { Typography } from '@mui/material';
import { TPurchaserequestPf } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';

interface RequestFormProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (purchaseRequestData: TPurchaserequestPf) => void;
  onReject: (purchaseRequestData: TPurchaserequestPf) => void;
  onSentBack: (purchaseRequestData: TPurchaserequestPf) => void;
  onBack: () => void;
  initialData?: TPurchaserequestPf;
  loading?: boolean;
}

const PurchaseRequestFormprint: React.FC<RequestFormProps> = ({
  open,
  onClose,
  onConfirm,
  onReject,
  onSentBack,
  onBack,
  initialData,
  loading = false
}) => {
  //const requestDate = initialData?.request_date ? new Date(initialData.request_date) : null;
  //const isValidDate = requestDate instanceof Date && !isNaN(requestDate.getTime());
  //const formattedDate = isValidDate ? requestDate.toLocaleDateString() : 'Invalid Date';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel] = useState<number | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleUpdateRequest = async (
    action: string,
    l_flow_level: number,
    actionFunction: (data: TPurchaserequestPf) => void,
    setModalComponent?: React.Dispatch<React.SetStateAction<JSX.Element | null>> // Optional parameter
  ) => {
    if (window.opener) {
      window.opener.postMessage({ type: 'SET_LAST_ACTION', action }, '*');
    } else {
      console.error('Parent window (opener) not available');
    }

    const purchaseRequestData = initialData!;
    console.log('inside handleupdaterequest', purchaseRequestData.Termscondition);
    try {
      console.log('sandeep1', action);
      purchaseRequestData.last_action = action;
      console.log('actionddd', action);
      if (l_flow_level > 0) {
        purchaseRequestData.flow_level_running = l_flow_level;
      }
      console.log('need by date', purchaseRequestData.need_by_date);
      await GmPfServiceInstance.updatepurchaserequest(purchaseRequestData);
      console.log('sandeep2');
      if (!purchaseRequestData.request_number) {
        console.error('Request number is undefined.');
        return false;
      }
      console.log('sandeep3');
      if (action === 'SUBMITTED' && purchaseRequestData.type_of_pr !== 'Non Chargeable') {
        console.log('sandeep4');
        const result = await GmPfServiceInstance.CheckBudgetStatus(purchaseRequestData.request_number, purchaseRequestData.company_code);
        console.log('result', result);

        if (result === 'EXCEED') {
          console.log('sandeep5');

          const imgElement = document.createElement('img');
          imgElement.src = 'https://i.postimg.cc/sgV9VCx5/ober-budget.jpg';
          imgElement.alt = 'Exceeded';
          document.body.appendChild(imgElement);
        }
      }

      actionFunction(purchaseRequestData);
      window.close();
    } catch (error) {
      console.error('Error updating purchase request:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPDF = () => {
    const content = document.getElementById('print-content');
    if (content) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Purchase Request</title></head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      {/* HEADER*/}
      <Box display="flex" justifyContent="space-between" padding={1} bgcolor="#f4f4f4" borderRadius={2} mb={1}>
        <Box display="flex" alignItems="center">
          <img src="https://i.postimg.cc/KcfVmVSc/The-Maintainers.png" alt="Logo" style={{ width: 100, height: 65, marginRight: 8 }} />
        </Box>
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Typography variant="h6" fontWeight="bold" fontSize="1rem">
            Purchase Request Form
          </Typography>
          <Typography variant="body2">View Only</Typography>
        </Box>
      </Box>

      <DialogContent>
        <Box display="flex" flexDirection="column" flexGrow={1}>
          <Box display="flex" alignItems="center">
            <FormControlLabel
              control={<Checkbox size="small" checked={false} disabled />}
              label="Service Request"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />

            <FormControlLabel
              control={<Checkbox size="small" checked={false} disabled />}
              label="GOODS/MATERIAL REQUEST"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            />

            <Typography sx={{ fontSize: '0.75rem' }}>
              <strong>DATE REQUESTED:</strong>{' '}
              {initialData?.request_date ? new Date(initialData.request_date).toLocaleDateString() : 'Invalid Date'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem' }}>
              <strong color="red">S/N:</strong> {initialData?.request_number}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            {/* Gap between project name and project code*/}

            <Box display="flex" alignItems="center" justifyContent="space-between">
              {/* Gap for Project + Need By Update */}
              <Box display="flex" flexDirection="column" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.75rem' }}>
                  <strong>Project Name:</strong> {initialData?.project_name}
                </Typography>
                <Typography variant="body2" color="green" sx={{ fontSize: '0.75rem' }}>
                  (Please state if request is not project related)
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.75rem' }}>
                  <strong>NEED BY UPDATE:</strong> {initialData?.project_name}
                </Typography>
                <Typography variant="body2" color="green" sx={{ fontSize: '0.75rem' }}>
                  (if urgent please Complete justification box)
                </Typography>
              </Box>
            </Box>

            <Box id="print-content" display="flex" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.75rem' }}>
                <strong>Project Code:</strong> {initialData?.project_code}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem' }}>
                <strong>W/O Number:</strong> {initialData?.wo_number}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between">
            {/* First Section: Type of Contract + AMC Service Status + Covered by Contract + Checked Store */}
            <Box padding={1} justifyContent="space-between">
              <Box display="flex" flexDirection="column">
                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Type of Contract:</strong> {initialData?.type_of_contract}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>AMC Service Status:</strong> {initialData?.amc_service_status}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Covered by Contract:</strong> {initialData?.covered_by_contract_yes}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Checked Store:</strong> {initialData?.checked_store_yes}
                </Typography>
              </Box>
            </Box>

            {/* Second Section: Type of Material Supply + Service Type + Flag Sharing Cost and Need by Date */}
            <Box padding={1} justifyContent="space-between">
              <Box display="flex" flexDirection="column">
                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}> Type of Material Supply:</strong> {initialData?.type_of_material_supply}
                </Typography>

                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Service Type:</strong> {initialData?.service_type}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Flag Sharing Cost:</strong> {initialData?.flag_sharing_cost}
                </Typography>
                {/* NEED TO CHANGE VAR*/}
                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Need by Date:</strong> {initialData?.company_code}
                </Typography>
              </Box>
            </Box>

            {/* Third Section: Covered by Contract and Checked Store */}
            <Box padding={1} justifyContent="space-between">
              <Box display="flex" flexDirection="column">
                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Contract Type:</strong> {initialData?.contract_soft_hard}
                </Typography>

                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Type of PR:</strong> {initialData?.type_of_pr}
                </Typography>

                <Typography sx={{ fontSize: '0.75rem', color: 'blue' }}>
                  <strong style={{ color: 'black' }}>Budgeted:</strong> {initialData?.budgeted_yes}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="h1" mt={0.5} sx={{ fontSize: '0.85rem', color: 'navy' }}>
              JUSTIFICATION/OTHER COMMENTS
            </Typography>
            <Box border={1} borderRadius={2} padding={1} mt={0.5}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '0.75rem' }}></Typography>
              <Typography variant="body1" color="textSecondary" mt={0.5} sx={{ fontSize: '0.75rem' }}>
                {initialData?.description}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" mt={0.5} gap={0.5} justifyContent="space-between">
            {/* Materials Section */}
            <Box border={1} borderRadius={1} padding={1} mb={0} justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                Materials
              </Typography>
              <Box display="flex" flexDirection="column">
                {/* First Line - Mechanical, Electrical */}
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                  <FormControlLabel
                    control={<Checkbox size="small" checked={initialData?.material_mechanical === 'Y'} disabled />}
                    label="Mechanical"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                  />
                  <FormControlLabel
                    control={<Checkbox size="small" checked={initialData?.material_electrical === 'Y'} disabled />}
                    label="Electrical"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                  />
                </Box>

                {/* Second Line - Plumbing, Tools, Civil */}
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                  <FormControlLabel
                    control={<Checkbox size="small" checked={initialData?.material_plumbing === 'Y'} disabled />}
                    label="Plumbing"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                  />
                  <FormControlLabel
                    control={<Checkbox size="small" checked={initialData?.material_tools === 'Y'} disabled />}
                    label="Tools"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                  />
                  <FormControlLabel
                    control={<Checkbox size="small" checked={initialData?.material_civil === 'Y'} disabled />}
                    label="Civil"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                  />
                </Box>

                {/* Third Line - AC, Cleaning, Other */}
                <Box display="flex" flexDirection="row" justifyContent="space-between">
                  <FormControlLabel
                    control={<Checkbox size="small" checked={initialData?.material_ac === 'Y'} disabled />}
                    label="AC"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                  />
                  <FormControlLabel
                    control={<Checkbox size="small" checked={initialData?.material_cleaning === 'Y'} disabled />}
                    label="Cleaning"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                  />
                  <FormControlLabel
                    control={<Checkbox size="small" checked={initialData?.material_other === 'Y'} disabled />}
                    label="Other"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Services Section */}
            <Box border={1} borderRadius={1} padding={1} mb={0} justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                Services
              </Typography>
              <Box display="flex" flexDirection="row">
                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.services_temp_staff === 'Y'} disabled />}
                  label="Temp Staff"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />
                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.services_rentals === 'Y'} disabled />}
                  label="Rentals"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />
              </Box>

              <Box display="flex" flexDirection="row">
                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.services_subcon_conslt === 'Y'} disabled />}
                  label="Subcon/Conslt"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />
                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.services_other === 'Y'} disabled />}
                  label="Other"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />
              </Box>
            </Box>

            {/* Other Section */}
            <Box border={1} borderRadius={1} padding={1} mb={0}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                Other
              </Typography>
              <Box display="flex" flexDirection="row">
                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.other_stationery === 'Y'} disabled />}
                  label="Stationery"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />

                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.other_it === 'Y'} disabled />}
                  label="IT"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />
              </Box>

              <Box display="flex" flexDirection="row" justifyContent="space-between">
                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.other_new_uniform_ppe === 'Y'} disabled />}
                  label="New Uniform/PPE"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />
                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.other_rplcmt_uniform === 'Y'} disabled />}
                  label="Replacement Uniform/PPE"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />
              </Box>
              <Box display="flex" flexDirection="row" justifyContent="space-between">
                <FormControlLabel
                  control={<Checkbox size="small" checked={initialData?.other_other === 'Y'} disabled />}
                  label="Other"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.70rem' } }}
                />
              </Box>
            </Box>
          </Box>

          <Box id="print-Table" display="flex" flexDirection="column">
            <Typography variant="h6" sx={{ fontSize: '1rem', marginTop: 1 }}>
              Items
            </Typography>

            {/* Table */}
            <TableContainer component={Paper} sx={{ marginTop: 0 }}>
              <Table
                size="small"
                sx={{
                  '& .MuiTableCell-root': {
                    fontSize: '10.5px'
                  }
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <strong>#SR</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Item Code</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Description</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Unit of measure</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>QTY.</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Unit Cost</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Amount</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {initialData?.items?.map((item, index) => {
                    const qty = item.item_l_qty ?? 0;
                    const unitCost = item.upp ?? 0;
                    const amount = qty * unitCost;
                    return (
                      <TableRow key={index}>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{item.cost_code}</TableCell>
                        <TableCell align="center">{item.addl_item_desc}</TableCell>
                        <TableCell align="center">{item.l_uom}</TableCell>
                        <TableCell align="center">{qty}</TableCell>
                        <TableCell align="center">{unitCost}</TableCell>
                        <TableCell align="center">{amount.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {/* Footer for total amount */}
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6} align="right">
                      <strong>Total Amount</strong>
                    </TableCell>
                    <TableCell align="center">
                      {/* Calculate the total amount */}
                      {initialData?.items
                        ?.reduce((total, item) => {
                          const qty = item.item_l_qty ?? 0;
                          const unitCost = item.upp ?? 0;
                          return total + qty * unitCost;
                        }, 0)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>

          {/* Footer */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              marginTop: 1,
              padding: 1,
              borderBottom: '1px solid black',
              marginBottom: 0
            }}
          >
            {/* Requested By */}
            <Box textAlign="center">
              <Typography sx={{ fontSize: '0.60rem', fontWeight: 'bold' }}>REQUESTED BY</Typography>
              <Box sx={{ borderBottom: '1px solid black' }} />
              <Typography sx={{ fontSize: '0.50rem', color: '#777', marginTop: 1 }}>...........................</Typography>{' '}
              <Typography sx={{ fontSize: '0.50rem', color: '#777' }}>(Name & Sign)</Typography>
            </Box>

            {/* Approved By (Line Manager) */}
            <Box textAlign="center">
              <Typography sx={{ fontSize: '0.60rem', fontWeight: 'bold' }}>APPROVED BY (LINE MANAGER)</Typography>
              <Box sx={{ borderBottom: '1px solid black' }} />
              <Typography sx={{ fontSize: '0.50rem', color: '#777', marginTop: 1 }}>...........................</Typography>{' '}
              <Typography sx={{ fontSize: '0.50rem', color: '#777' }}>(Name & Sign)</Typography>
            </Box>

            {/* Approved By (Project Manager/HOD) */}
            <Box textAlign="center">
              <Typography sx={{ fontSize: '0.60rem', fontWeight: 'bold' }}>APPROVED BY (PROJECT MANAGER/HOD)</Typography>
              <Box sx={{ borderBottom: '1px solid black' }} />
              <Typography sx={{ fontSize: '0.50rem', color: '#777', marginTop: 1 }}>...........................</Typography>{' '}
              <Typography sx={{ fontSize: '0.50rem', color: '#777' }}>(Name & Sign)</Typography>
            </Box>

            {/* Final Approval Per DOA */}
            <Box textAlign="center">
              <Typography sx={{ fontSize: '0.60rem', fontWeight: 'bold' }}>FINAL APPROVAL PER DOA</Typography>
              <Box sx={{ borderBottom: '1px solid black' }} />
              <Typography sx={{ fontSize: '0.50rem', color: '#777', marginTop: 1 }}>...........................</Typography>{' '}
              <Typography sx={{ fontSize: '0.50rem', color: '#777' }}>(Name & Sign)</Typography>
            </Box>

            {/* Recevied By*/}
            <Box textAlign="center" border={1} padding={1}>
              <Typography sx={{ fontSize: '0.60rem', fontWeight: 'bold' }}>Recevied By</Typography>
              <Box sx={{ borderBottom: '1px solid black', marginTop: 1.5 }} />
              <Typography sx={{ fontSize: '0.60rem', fontWeight: 'bold' }}>Procurment Department</Typography>
              <Box sx={{ borderBottom: '1px solid black', marginTop: 0 }} />
              <Typography sx={{ fontSize: '0.50rem', textAlign: 'left' }}>Name:</Typography>
              <Typography sx={{ fontSize: '0.50rem', textAlign: 'left' }}>Sign:</Typography>
              <Typography sx={{ fontSize: '0.50rem', textAlign: 'left' }}>Date:</Typography>
            </Box>
          </Box>
          {/*  with Tel and Email */}
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ fontSize: '0.60rem' }}>Tel: +97444040800</Typography>
            <Typography sx={{ fontSize: '0.60rem' }}>Email: info@the-maintainers.com</Typography>
          </Box>
          {/*   FAX and Website */}
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ fontSize: '0.60rem' }}>Fax: +9744040801</Typography>
            <Typography sx={{ fontSize: '0.60rem' }}>Website:www.the-maintainers.com</Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'flex-end' }}>
        {/* Back Button */}
        <Button
          onClick={onBack}
          color="secondary"
          disabled={loading}
          sx={{
            padding: '4px 12px',
            fontSize: '0.75rem',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            '&:hover': { backgroundColor: '#e0e0e0' },
            '&:active': { backgroundColor: '#d0d0d0' },
            '&:disabled': { backgroundColor: '#cccccc', color: '#888' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Back'}
        </Button>

        {/* Sent Back Button */}
        <Button
          onClick={async () => {
            await handleUpdateRequest('SENTBACK', 0, onSentBack);
            onBack();
          }}
          disabled={loading}
          sx={{
            padding: '4px 12px',
            fontSize: '0.75rem',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': { backgroundColor: '#1565c0' },
            '&:active': { backgroundColor: '#0d47a1' },
            '&:disabled': { backgroundColor: '#b0bec5', color: '#607d8b' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sent Back'}
        </Button>

        {/* Confirm Button */}
        <Button
          onClick={async () => {
            await handleUpdateRequest('SUBMITTED', 0, onConfirm);
            onBack();
          }}
          disabled={loading}
          sx={{
            padding: '4px 12px',
            fontSize: '0.75rem',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#388e3c',
            color: 'white',
            '&:hover': { backgroundColor: '#2c6b2f' },
            '&:active': { backgroundColor: '#1b5e20' },
            '&:disabled': { backgroundColor: '#81c784', color: '#4caf50' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirm'}
        </Button>

        {/* Reject Button */}
        <Button
          onClick={async () => {
            await handleUpdateRequest('REJECTED', 0, onReject);
            onBack();
          }}
          color="error"
          disabled={loading}
          sx={{
            padding: '4px 12px',
            fontSize: '0.75rem',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#d32f2f',
            color: 'white',
            '&:hover': { backgroundColor: '#c62828' },
            '&:active': { backgroundColor: '#b71c1c' },
            '&:disabled': { backgroundColor: '#e57373', color: '#f44336' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Reject'}
        </Button>

        {/* Print Button */}
        <Button
          onClick={handlePrint}
          sx={{
            padding: '4px 12px',
            fontSize: '0.75rem',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#2196f3',
            color: 'white',
            '&:hover': { backgroundColor: '#1976d2' },
            '&:active': { backgroundColor: '#1565c0' },
            '&:disabled': { backgroundColor: '#90caf9', color: '#64b5f6' }
          }}
        >
          Print
        </Button>

        {/* Save as PDF Button */}
        <Button
          onClick={handleSaveAsPDF}
          sx={{
            padding: '4px 12px',
            fontSize: '0.75rem',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#4caf50',
            color: 'white',
            '&:hover': { backgroundColor: '#388e3c' },
            '&:active': { backgroundColor: '#2c6b2f' },
            '&:disabled': { backgroundColor: '#a5d6a7', color: '#81c784' }
          }}
        >
          Save as PDF
        </Button>

        {/* Close Button */}
        <Button
          onClick={onClose}
          sx={{
            padding: '4px 12px',
            fontSize: '0.75rem',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#f44336',
            color: 'white',
            '&:hover': { backgroundColor: '#e53935' },
            '&:active': { backgroundColor: '#d32f2f' },
            '&:disabled': { backgroundColor: '#ef9a9a', color: '#e57373' }
          }}
        >
          Close
        </Button>
        <div>
          <button
            onClick={async () => {
              console.log(initialData?.flow_level_running); // Log the current flow level
              handleOpenModal(); // Open the modal
            }}
          >
            SentBack1
          </button>

          {isModalOpen && (
            <SentbackRollSection
              onClose={async (newFlowLevel: number) => {
                if (newFlowLevel > 0) {
                  // Update the initialData with the new flow level

                  // Call handleUpdateRequest with the action, flow level, and action function
                  await handleUpdateRequest('SENTBACK', newFlowLevel, onSentBack);

                  // Trigger onBack after the update
                  onBack();
                }

                // Close the modal
                setIsModalOpen(false);
              }}
              flowLevel={initialData?.flow_level_running || 0} // Pass the current flow level to the child component
            />
          )}

          {selectedLevel !== null && <p>Selected Flow Level: {initialData?.flow_level_running}</p>}
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseRequestFormprint;
