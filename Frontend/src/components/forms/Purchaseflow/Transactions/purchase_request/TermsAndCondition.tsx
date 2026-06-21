import { useState, useEffect } from 'react';
import { Grid, TextField, Box, CircularProgress, Typography, Snackbar, Alert } from '@mui/material';
import { TPurchaserequestPf, TPrTermCondition } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import Autocomplete from '@mui/material/Autocomplete';
import { useQuery } from '@tanstack/react-query';
import PfServiceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';

interface TermsAndConditionProps {
  Purhasedata: TPurchaserequestPf;
  tabIndex: number;
  TermsConditions: TPrTermCondition[];
  setTermsConditions: React.Dispatch<React.SetStateAction<TPrTermCondition[]>>;
}
interface SupplierListResponse {
  tableData: SupplierOption[];
  count: number;
}

interface SupplierOption {
  supp_code: string;
  supp_name: string;
}
const TermsAndCondition = ({ Purhasedata, tabIndex, TermsConditions, setTermsConditions }: TermsAndConditionProps) => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true); // Flag to track first-time load

  const removeDuplicateSuppliers = (terms: TPrTermCondition[]) => {
    return terms.filter((value, index, self) => index === self.findIndex((t) => t.tsupplier === value.tsupplier));
  };
  const { app } = useSelector((state) => state.menuSelectionSlice);

  const {
    data: supplierList,
    isLoading: supplierLoading,
    error: supplierError
  } = useQuery<SupplierListResponse>({
    queryKey: ['supplier_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };
      console.log('Before Supplier2 data');
      const response = await PfServiceInstance.getMasters(app, 'ddsupplier');
      console.log('after Supplierxxx data');
      return response ? { tableData: response.tableData as SupplierOption[], count: response.count } : { tableData: [], count: 0 };
    },
    enabled: !!app
  });

  useEffect(() => {
    console.log('TermsConditions received in TermsAndCondition component:', TermsConditions);

    if (tabIndex === 2) {
      if (isFirstLoad && TermsConditions.length === 0) {
        const itemSuppliers = Purhasedata.items.map((item) => item.supplier);

        // Filter existing terms for suppliers present in items
        const filteredTermsConditions = TermsConditions.filter((term) => itemSuppliers.includes(term.tsupplier));

        // Create terms for suppliers without existing entries
        const missingSuppliers = Purhasedata.items
          .filter((item) => !TermsConditions.some((term) => term.tsupplier === item.supplier))
          .map((item) => ({
            tsupplier: item.supplier,
            remarks: '',
            dlvr_term: '',
            payment_terms: '',
            quatation_reference: '',
            delivery_address: ''
          }));

        const allTermsConditions = [...filteredTermsConditions, ...missingSuppliers];
        const uniqueTermsConditions = removeDuplicateSuppliers(allTermsConditions);

        // Set terms conditions only for the first load
        setTermsConditions(uniqueTermsConditions);
        setIsFirstLoad(false); // Mark first load as complete
      } else {
        // Apply filtering logic after the first load
        const itemSuppliers = Purhasedata.items.map((item) => item.supplier);

        // Filter existing terms for suppliers present in items
        const filteredTermsConditions = TermsConditions.filter((term) => itemSuppliers.includes(term.tsupplier));

        // Create terms for suppliers without existing entries
        const missingSuppliers = Purhasedata.items
          .filter((item) => !TermsConditions.some((term) => term.tsupplier === item.supplier))
          .map((item) => ({
            tsupplier: item.supplier,
            remarks: '',
            dlvr_term: '',
            payment_terms: '',
            quatation_reference: '',
            delivery_address: ''
          }));

        const allTermsConditions = [...filteredTermsConditions, ...missingSuppliers];
        const uniqueTermsConditions = removeDuplicateSuppliers(allTermsConditions);

        // Set terms conditions only after first load
        setTermsConditions(uniqueTermsConditions);
      }

      setLoading(false);
    }
  }, [TermsConditions, Purhasedata, tabIndex, setTermsConditions, isFirstLoad]);

  const handleInputChange = (field: keyof TPrTermCondition, value: string, index: number) => {
    setTermsConditions((prevTermsConditions) => {
      if (index < 0 || index >= prevTermsConditions.length) return prevTermsConditions;

      const updatedTerms = [...prevTermsConditions];
      updatedTerms[index] = { ...updatedTerms[index], [field]: value };

      return updatedTerms;
    });

    setMessage('Terms and conditions updated successfully!');
  };

  const handleCloseMessage = () => setMessage(null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '16px', maxWidth: '100%', overflowX: 'auto' }}>
      <Box sx={{ marginBottom: '16px' }}>
        <Typography variant="h6">Total Records: {TermsConditions.length}</Typography>
      </Box>

      {/* Check if TermsConditions data is available and render it */}
      {TermsConditions.length > 0 ? (
        <Box sx={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'auto' }}>
          {TermsConditions.map((term, index) => (
            <Box key={term.tsupplier} sx={{ marginBottom: '16px' }}>
              <Grid container spacing={2} sx={{ flexDirection: 'row', padding: '0' }}>
                <Grid item xs={1.6}>
                  {supplierLoading ? (
                    <TextField label="Loading..." fullWidth disabled />
                  ) : supplierError ? (
                    <TextField label="Error loading Suppliers" fullWidth error />
                  ) : (
                    <Autocomplete
                      id={`supplier_${index}`}
                      size="small"
                      options={supplierList?.tableData || []}
                      getOptionLabel={(option) => option.supp_name || ''}
                      value={supplierList?.tableData?.find((supplier) => supplier.supp_code === term.tsupplier) || null}
                      renderInput={(params) => <TextField {...params} label="Select Supplier" variant="outlined" fullWidth />}
                      noOptionsText="No Supplier available"
                      disabled // Read-only field
                    />
                  )}
                </Grid>
                ;
                <Grid item xs={12} md={2} sx={{ padding: '8px' }}>
                  <TextField
                    label="Remarks"
                    size="small"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={term.remarks || ''}
                    onChange={(e) => handleInputChange('remarks', e.target.value, index)}
                  />
                </Grid>
                <Grid item xs={12} md={2} sx={{ padding: '8px' }}>
                  <TextField
                    label="Delivery Term"
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={term.dlvr_term || ''}
                    onChange={(e) => handleInputChange('dlvr_term', e.target.value, index)}
                  />
                </Grid>
                <Grid item xs={12} md={2} sx={{ padding: '8px' }}>
                  <TextField
                    label="Payment Terms"
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={term.payment_terms || ''}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value, index)}
                  />
                </Grid>
                <Grid item xs={12} md={2} sx={{ padding: '8px' }}>
                  <TextField
                    label="Quotation Reference"
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={term.quatation_reference || ''}
                    onChange={(e) => handleInputChange('quatation_reference', e.target.value, index)}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ padding: '16px', border: '1px dashed #ccc', marginTop: '16px' }}>
          <Typography variant="body2" color="textSecondary">
            No terms and conditions available.
          </Typography>
        </Box>
      )}

      <Snackbar open={!!message} autoHideDuration={3000} onClose={handleCloseMessage}>
        <Alert onClose={handleCloseMessage} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TermsAndCondition;
