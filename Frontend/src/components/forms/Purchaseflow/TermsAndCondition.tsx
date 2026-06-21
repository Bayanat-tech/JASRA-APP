import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import useAuth from 'hooks/useAuth';
import { TPurchaserequestPf, TPrTermCondition } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import { useQuery } from '@tanstack/react-query';
import PfServiceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
import React from 'react';
import { ColDef } from 'ag-grid-community';

interface TermsAndConditionProps {
  isViewMode: boolean;
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

const TermsAndCondition = ({ Purhasedata, tabIndex, TermsConditions, setTermsConditions, isViewMode }: TermsAndConditionProps) => {
  const [loading, setLoading] = useState(true);

  const initialized = useRef(false);

  const removeDuplicateSuppliers = (terms: TPrTermCondition[]) => {
    return terms.filter((value, index, self) => index === self.findIndex((t) => t.tsupplier === value.tsupplier));
  };

  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();
const { data: supplierList } = useQuery<SupplierListResponse>({
  queryKey: ['supplier_data', app],

  queryFn: async () => {
    if (!app) return { tableData: [], count: 0 };

    const response = await PfServiceInstance.proc_build_dynamic_sql({
      parameter: "ddSupplier",          // 🔥 replaced division → ddsupplier
      loginid: user?.loginid ?? "",
      code1: user?.company_code ?? "",
      code2: "NULL",
      code3: "NULL",
      code4: "NULL",
      number1: 0,
      number2: 0,
      number3: 0,
      number4: 0,
      date1: null,
      date2: null,
      date3: null,
      date4: null,
    });

    // ✔ FIX: response is array → convert into expected shape
    const tableData = Array.isArray(response)
      ? (response as SupplierOption[])
      : [];

    const count = tableData.length;

    return { tableData, count };
  },

  enabled: !!app,
});


  useEffect(() => {
    if (tabIndex === 2 && !initialized.current) {
      const itemSuppliers = Purhasedata.items.map((item) => item.supplier);

      const filteredTermsConditions = TermsConditions.filter(
        (term) => itemSuppliers.includes(term.tsupplier) && term.tsupplier.trim() !== ''
      );

      const missingSuppliers = Purhasedata.items
        .filter((item) => (item.supplier ?? '').trim() !== '' && !TermsConditions.some((term) => term.tsupplier === item.supplier))
        .map((item) => ({
          tsupplier: item.supplier,
          remarks: '',
          dlvr_term: '',
          payment_terms: '',
          quatation_reference: '',
          delivery_address: ''
        }));

      const allTermsConditions = [...filteredTermsConditions, ...missingSuppliers];
      const uniqueTermsConditions = removeDuplicateSuppliers(allTermsConditions).filter((term) => term.tsupplier.trim() !== '');

      setTermsConditions(uniqueTermsConditions);
      initialized.current = true;
      setLoading(false);
    }
  }, [Purhasedata.items, tabIndex, TermsConditions, setTermsConditions]);

  const handleInputChange = React.useCallback(
    (field: keyof TPrTermCondition, value: string, index: number) => {
      setTermsConditions((prevTermsConditions) => {
        return prevTermsConditions.map((term, i) => {
          if (i === index) {
            return {
              ...term,
              [field]: value
            };
          }
          return term;
        });
      });
    },
    [setTermsConditions]
  );

  const gridRef = React.useRef<AgGridReact>(null);

  // AG Grid column definitions with your requested configuration
  const columnDefs = React.useMemo<ColDef<any>[]>(
    () => [
      {
        field: 'tsupplier',
        headerName: 'Supplier',
        editable: false,
        cellStyle: () => ({
          backgroundColor: 'lightGrey'
        }),
        cellRenderer: (params: any) => {
          const supplierName =
            supplierList?.tableData?.find((supplier) => supplier.supp_code === params.value)?.supp_name || 'Supplier not found';
          return <>{supplierName}</>;
        },
        valueFormatter: (params: { value: any }) => params.value || ''
      },
      {
        field: 'remarks',
        headerName: 'Warranty',
        editable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          rows: 4,
          cols: 50
        },
        cellStyle: { whiteSpace: 'normal' },
        autoHeight: true,
        valueFormatter: (params: { value: any }) => params.value || '',
        valueParser: (params: { newValue: string }) => params.newValue.trim(),
        onCellValueChanged: (params: import('ag-grid-community').NewValueParams) => {
          if (params.node) {
            handleInputChange('remarks', params.newValue, params.node.rowIndex || 0);
          }
        }
      },
      {
        field: 'dlvr_term',
        headerName: 'Delivery Terms',
        editable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          rows: 4,
          cols: 50
        },
        cellStyle: { whiteSpace: 'normal' },
        autoHeight: true,
        valueFormatter: (params: { value: any }) => params.value || '',
        valueParser: (params: { newValue: string }) => params.newValue.trim(),
        onCellValueChanged: (params: import('ag-grid-community').NewValueParams) => {
          if (params.node) {
            handleInputChange('dlvr_term', params.newValue, params.node.rowIndex || 0);
          }
        }
      },
      {
        field: 'payment_terms',
        headerName: 'Payment Terms',
        editable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          rows: 4,
          cols: 50
        },
        cellStyle: { whiteSpace: 'normal' },
        autoHeight: true,
        valueFormatter: (params: { value: any }) => params.value || '',
        valueParser: (params: { newValue: string }) => params.newValue.trim(),
        onCellValueChanged: (params: import('ag-grid-community').NewValueParams) => {
          if (params.node) {
            handleInputChange('payment_terms', params.newValue, params.node.rowIndex || 0);
          }
        }
      },
      {
        field: 'quatation_reference',
        headerName: 'Quotation Reference',
        editable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          rows: 4,
          cols: 50
        },
        cellStyle: { whiteSpace: 'normal' },
        autoHeight: true,
        valueFormatter: (params: { value: any }) => params.value || '',
        valueParser: (params: { newValue: string }) => params.newValue.trim(),
        onCellValueChanged: (params: import('ag-grid-community').NewValueParams) => {
          if (params.node) {
            handleInputChange('quatation_reference', params.newValue, params.node.rowIndex || 0);
          }
        }
      },
      {
        field: 'delivery_address',
        headerName: 'Delivery Address',
        editable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          rows: 4,
          cols: 50
        },
        cellStyle: { whiteSpace: 'normal' },
        autoHeight: true,
        valueFormatter: (params: { value: any }) => params.value || '',
        valueParser: (params: { newValue: string }) => params.newValue.trim(),
        onCellValueChanged: (params: import('ag-grid-community').NewValueParams) => {
          if (params.node) {
            handleInputChange('delivery_address', params.newValue, params.node.rowIndex || 0);
          }
        }
      }
    ],
    [supplierList?.tableData, handleInputChange]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <div className="ag-theme-alpine ag-theme-alpine-mytable " style={{ maxHeight: 400, overflow: 'auto' }}>
        <AgGridReact
          ref={gridRef}
          rowData={TermsConditions.filter((term) => term.tsupplier)}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, sortable: true, filter: true }}
          domLayout="autoHeight"
          animateRows={true}
          rowHeight={20}
          headerHeight={25}
          suppressClickEdit={isViewMode}
        />
      </div>
    </>
  );
};

export default TermsAndCondition;
