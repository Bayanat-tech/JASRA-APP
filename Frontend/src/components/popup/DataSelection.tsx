import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
// import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
// import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import useColumn from 'hooks/useColumns';
import { TPickingItemPreference } from 'pages/WMS/Transaction/outbound/types/pickingDetails.types';
import { TProduct } from 'pages/WMS/types/product-wms.types';
import { useEffect, useState, useMemo } from 'react';
import financeSerivceInstance from 'service/Finance/service.finance';
import WmsSerivceInstance from 'service/wms/service.wms';
import pickingServiceInstance from 'service/wms/transaction/outbound/service.pickingDetailsWms';
import { TPair } from 'types/common';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from './UniversalDialog';
import { TAcPayee, TBankTransaction } from 'types/columns.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TAccountChildren } from 'pages/Finance/types/acTree.types';
import { TExpenseSubType, TExpenseType, TTax } from 'pages/accounts/transaction/types/transaction.types';
import { TDepartment } from 'pages/WMS/types/department-wms.types';
import { TJobInboundWms } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
import { SelectOutlined } from '@ant-design/icons';
// import React from 'react';

const rowsPerPageOptions = [10, 20, 50, 100, 500, 1000, 10000];

// Import necessary components and hooks from various libraries
const DataSelection = ({
  selectedItem,
  handleSelection,
  filter,
  prinCode
}: {
  selectedItem: { label: string; value: string };
  handleSelection: any;
  filter: ISearch;
  prinCode?: string;
}) => {
  //--------------constants----------
  // const [, setRowSelection] = useState<RowSelectionState>({}); // State to manage row selection
  const [selectedRowData, setSelectedRowData] = useState<any>(null); // <-- add this line
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null); // Add this for radio button state
  const [filterData] = useState<ISearch>(filter); // State to manage filter data
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage:100 });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [itemFormPopup, setItemFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: ''
  }); // State to manage item form popup
  const column = useColumn(selectedItem.value); // Get columns based on selected item

  //-----------------handlers---------------
  const fetchData = async () => {
    let response;
    switch (selectedItem.value) {
      case 'product': {
        // Filter products by principal code if provided
        const sql_string = prinCode 
          ? `SELECT * FROM MS_PRODUCT WHERE PRIN_CODE = '${prinCode}'`
          : 'SELECT * FROM MS_PRODUCT';
        response = await WmsSerivceInstance.executeRawSql(sql_string);

        if (response)
          return {
            tableData: response as TProduct[],
            count: (response as TProduct[]).length
          };
        break;
      }
      case 'order_no':
      case 'cust_code':
      case 'prod_code': {
        response = await pickingServiceInstance.getPickingPreferenceData(selectedItem.value, paginationData, filterData);
        if (response)
          return {
            tableData: response.tableData as TPickingItemPreference[],
            count: response.count
          };
        break;
      }
      case 'account': {
        response = await financeSerivceInstance.getMasters('finance', selectedItem.value, paginationData, filterData);
        if (response)
          return {
            tableData: response.tableData as TAccountChildren[],
            count: response.count
          };
        break;
      }
      case 'bank': {
        response = await financeSerivceInstance.getMasters('finance', selectedItem.value, paginationData, filterData);
        if (response)
          return {
            tableData: response.tableData as TBankTransaction[],
            count: response.count
          };
        break;
      }
      case 'ac_payee': {
        response = await financeSerivceInstance.getMasters('finance', selectedItem.value, paginationData, filterData);
        if (response)
          return {
            tableData: response.tableData as TAcPayee[],
            count: response.count
          };
        break;
      }
      case 'division': {
        response = await WmsSerivceInstance.getMasters('wms', 'division', paginationData, filterData);

        if (response)
          return {
            tableData: response.tableData as TDivision[],
            count: response.count
          };
        break;
      }
      case 'currency': {
        response = await WmsSerivceInstance.getMasters('wms', 'currency', paginationData, filterData);

        if (response)
          return {
            tableData: response.tableData as TCurrency[],
            count: response.count
          };
        break;
      }
      case 'ac_code_search': {
        response = await financeSerivceInstance.getMasters('finance', 'ac_code_search', paginationData, filterData);

        if (response)
          return {
            tableData: response.tableData as TAccountChildren[],
            count: response.count
          };
        break;
      }
      case 'tax': {
        response = await WmsSerivceInstance.getMasters('finance', 'tax', paginationData, filterData);

        if (response)
          return {
            tableData: response.tableData as TTax[],
            count: response.count
          };
        break;
      }
      case 'department': {
        response = await WmsSerivceInstance.getMasters('wms', 'department', paginationData, filterData);

        if (response)
          return {
            tableData: response.tableData as TDepartment[],
            count: response.count
          };
        break;
      }
      case 'job_detail': {
        response = await WmsSerivceInstance.getMasters('finance', 'job_no', paginationData, filterData);

        if (response)
          return {
            tableData: response.tableData as TJobInboundWms[],
            count: response.count
          };
        break;
      }
      case 'expense_type': {
        response = await WmsSerivceInstance.getMasters('finance', 'expense_type', paginationData, filterData);

        if (response)
          return {
            tableData: response.tableData as TExpenseType[],
            count: response.count
          };
        break;
      }
      case 'expense_sub_type': {
        response = await WmsSerivceInstance.getMasters('finance', 'expense_sub_type', paginationData, filterData);

        if (response)
          return {
            tableData: response.tableData as TExpenseSubType[],
            count: response.count
          };
        break;
      }
    }
    return { tableData: [], count: 0 };
  };

  //-----------------useQuery---------------
  const { data } = useQuery({
    queryKey: ['list_data', filterData, paginationData, selectedItem.value],
    queryFn: async () => await fetchData()
  });

  //-------------handlers---------------
  // const handleChangePagination = (page: number, rowsPerPage: number) => {
  //   setPaginationData({ page, rowsPerPage }); // Update pagination data
  // };

  // const handleFilterChange = (value: ISearch['search']) => {
  //   setFilterData((prevData) => {
  //     return {
  //       ...prevData,
  //       search: [...filter.search, ...value] // Update filter data
  //     };
  //   });
  // };

  // const handleSortingChange = (sorting: SortingState) => {
  //   setFilterData((prevData) => {
  //     return {
  //       ...prevData,
  //       sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true } // Update sorting data
  //     };
  //   });
  // };

  const toggleItemPopup = () => {
    setItemFormPopup((prev) => {
      return {
        ...prev,
        title: selectedItem.label + ' Selection',
        action: { ...prev.action, open: !prev.action.open } // Toggle item form popup
      };
    });
  };

  const handleSelect = () => {
    const row = selectedRowData;
    switch (selectedItem.value) {
      case 'order_no':
      case 'prod_code':
      case 'cust_code':
        handleSelection([
          ...filter.search,
          [{ field_name: selectedItem.value, field_value: row?.[selectedItem.value], operator: 'contains' }]
        ] as ISearch['search']);
        return;
      case 'product':
        // Handle snake_case field names from API
        const prodCode = row?.PROD_CODE || row?.prod_code || row?.prodCode || '';
        const prodName = row?.PROD_NAME || row?.prod_name || row?.prodName || '';
        const pUom = row?.P_UOM || row?.p_uom || row?.pUom || '';
        const lUom = row?.L_UOM || row?.l_uom || row?.lUom || '';
        const uomCount = row?.UOM_COUNT || row?.uom_count || row?.uomCount || 1;
        const uppp = row?.UPPP || row?.uppp || 1;
        const upp = row?.UPP || row?.upp || 1;
        
        handleSelection({
          label: prodName,
          value: prodCode,
          prodCode: prodCode,
          prodName: prodName,
          uom_count: uomCount,
          uppp: uppp,
          p_uom: pUom,
          l_uom: lUom,
          upp: upp
        });
        return;
      case 'account':
        handleSelection({
          label: row?.ac_name ?? '',
          value: row?.ac_code ?? ''
        } as TPair<''>);
        return;
      case 'bank':
        handleSelection({
          label: row?.ac_name ?? '',
          value: row?.ac_code ?? ''
        } as TPair<''>);
        return;
      case 'ac_payee':
        handleSelection({
          label: row?.ac_payee ?? '',
          value: row?.ac_payee ?? ''
        } as TPair<''>);
        return;
      case 'division':
        handleSelection({
          label: row?.div_name ?? '',
          value: row?.div_code ?? ''
        } as TPair<''>);
        return;
      case 'currency':
        handleSelection({
          label: row?.curr_name ?? '',
          value: row?.curr_code ?? '',
          ex_rate: row?.ex_rate ?? ''
        } as TPair<'ex_rate'>);
        return;
      case 'ac_code_search':
        handleSelection({
          label: row?.ac_name ?? '',
          value: row?.ac_code ?? ''
        } as TPair<''>);
        return;
      case 'tax':
        handleSelection({
          label: row?.tx_compntcat_code ?? '',
          value: row?.tx_compntcat_code ?? ''
        } as TPair<''>);
        return;
      case 'department':
        handleSelection({
          label: row?.dept_name ?? '',
          value: row?.dept_code ?? ''
        } as TPair<''>);
        return;
      case 'job_detail':
        handleSelection({
          label: row?.job_no,
          value: row?.job_no,
          doc_ref: row?.doc_ref,
          dept_code: row?.dept_code
        } as TPair<'doc_ref' | 'dept_code'>);
        return;
      case 'expense_type':
        handleSelection({
          label: row?.exp_description ?? '',
          value: row?.exp_code ?? ''
        } as TPair<''>);
        return;
      case 'expense_sub_type':
        handleSelection({
          label: row?.exp_subtype_description ?? '',
          value: row?.exp_subtype_code ?? ''
        } as TPair<''>);
        return;
    }
  };

  //----------------useEffect----------
  useEffect(() => {
    if (!!data && !itemFormPopup.action.open) {
      return toggleItemPopup(); // Toggle item form popup if data is available and popup is not open
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    setToggleFilter(null as any); // Reset filter toggle state
  }, []);

  // Memoize columns for ag-grid
  const agGridColumns = useMemo(() => {
    if (!column) return [];
    // Special case for 'product' selection: set custom headers
    if (selectedItem.value === 'product') {
      return [
        {
          headerName: '',
          field: 'radio',
          maxWidth: 50,
          resizable: false,
          sortable: false,
          filter: false,
          cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          cellRenderer: (params: any) => {
            const isSelected = selectedRowId === params.data.PROD_CODE;
            return (
              <div
                onClick={() => {
                  setSelectedRowId(params.data.PROD_CODE);
                  setSelectedRowData(params.data);
                }}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  width: '100%'
                }}
              >
                <input 
                  type="radio" 
                  name="row-selection" 
                  checked={isSelected} 
                  readOnly 
                  style={{ pointerEvents: 'none', margin: 0 }} 
                />
              </div>
            );
          }
        },
        {
          field: 'product',
          headerName: 'Product',
          minWidth: 250,
          flex: 2,
          resizable: true,
          sortable: true,
          cellRenderer: (params: any) => {
            return <span>{`${params.data.PROD_CODE} - ${params.data.PROD_NAME}`}</span>;
          }
        },
        {
          field: 'L_UOM',
          headerName: 'L_UOM',
          minWidth: 120,
          flex: 1,
          resizable: true,
          sortable: true
        },
        {
          field: 'P_UOM',
          headerName: 'P_UOM',
          minWidth: 120,
          flex: 1,
          resizable: true,
          sortable: true
        },
        {
          field: 'UPP',
          headerName: 'UPP',
          minWidth: 120,
          flex: 1,
          resizable: true,
          sortable: true
        },
        {
          field: 'UPPP',
          headerName: 'UPPP',
          minWidth: 120,
          flex: 1,
          resizable: true,
          sortable: true
        },
        {
          field: 'BARCODE',
          headerName: 'Barcode',
          minWidth: 120,
          flex: 1,
          resizable: true,
          sortable: true
        }
      ];
    }
    // If useColumn already returns ag-grid columns, just return as is.
    // Otherwise, map to ag-grid format:
    return column.map((col: any, idx: number) => ({
      ...(idx === 0 ? { 
        headerName: '',
        field: 'radio',
        maxWidth: 50,
        resizable: false,
        sortable: false,
        filter: false,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        cellRenderer: (params: any) => {
          const rowId = params.data[Object.keys(params.data)[0]]; // Use first field as unique identifier
          const isSelected = selectedRowId === rowId;
          return (
            <div
              onClick={() => {
                setSelectedRowId(rowId);
                setSelectedRowData(params.data);
              }}
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                width: '100%'
              }}
            >
              <input 
                type="radio" 
                name="row-selection" 
                checked={isSelected} 
                readOnly 
                style={{ pointerEvents: 'none', margin: 0 }} 
              />
            </div>
          );
        }
      } : {}),
      field: col.accessorKey || col.id || col.field,
      headerName: col.header || col.Header || col.headerName,
      minWidth: 120,
      flex: 1,
      resizable: true,
      sortable: true,
      cellRenderer: idx === 0 ? undefined : (params: any) => {
        // Try to render value, fallback to empty string
        return <span>{params.value ?? ''}</span>;
      }
    }));
  }, [column, selectedItem.value, selectedRowId]);

  // Handler for ag-grid row selection
  const handleAgGridSelectionChanged = (selectedRows: any[]) => {
    if (selectedRows.length > 0) {
      const selected = selectedRows[0];
      setSelectedRowData(selected);
      // Set appropriate ID based on selection type
      if (selectedItem.value === 'product') {
        setSelectedRowId(selected.PROD_CODE);
      } else {
        setSelectedRowId(selected[Object.keys(selected)[0]]);
      }
    } else {
      setSelectedRowData(null);
      setSelectedRowId(null);
    }
  };

  // Handler for ag-grid pagination change
  const handleAgGridPaginationChanged = (params: any) => {
    // ag-grid's pagination API
    const api = params.api;
    const currentPage = api.paginationGetCurrentPage();
    const pageSize = api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  };

  return (
    <div>
      {/* Check if itemFormPopup is defined and open */}
      {!!itemFormPopup && !!itemFormPopup.action.open && (
        <UniversalDialog
          action={{ ...itemFormPopup.action }}
          onClose={toggleItemPopup}
          title={itemFormPopup.title}
          hasPrimaryButton={false}
        >
          <div className="space-y-1">
            <div className="flex justify-end ">
              {/* Button to select the item */}
              <Button
                className="w-1"
                variant="contained"
                size="small"
                disabled={!selectedRowData} // <-- disable if no row selected
                onClick={handleSelect} // Handler to select the item
              >
                <SelectOutlined />
                Select
              </Button>
            </div>
            {/* CustomAgGrid component to display data */}
            
            <CustomAgGrid
              rowData={data?.tableData || []}
              columnDefs={agGridColumns}
              rowSelection="single"
              onSelectionChanged={handleAgGridSelectionChanged}
              paginationPageSize={paginationData.rowsPerPage}
              paginationPageSizeSelector={rowsPerPageOptions}
              height="350px"
              editable={false}
              rowHeight={20}
              headerHeight={30}
              onPaginationChanged={handleAgGridPaginationChanged}
            />
          </div>
        </UniversalDialog>
      )}
    </div>
  );
};

export default DataSelection;