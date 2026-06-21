import { DeleteOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import { Autocomplete, Button, List, ListItem, ListItemButton, ListItemText, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import ProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';
import { ISearch } from 'components/filters/SearchFilter';
import AddTransactionDocumentForm from 'components/forms/accounts/transaction/AddTransactionDocumentForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import UniversalDelete from 'components/popup/UniversalDelete';
import UniversalDialog from 'components/popup/UniversalDialog';
import { default as TransactionDocumentReport } from 'components/reports/accounts/ageing/periodwise/TransactionDocumentReport';
import useAuth from 'hooks/useAuth';
import { TFyPeriod, TTransactionDocumentReport, TTransactionDocumentView } from 'pages/accounts/transaction/types/transaction.types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { useReactToPrint } from 'react-to-print';
import transactionsServiceInstance from 'service/Finance/Accounts/service.transaction';
import { default as FinanceSerivceInstance } from 'service/Finance/service.finance';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { filter, transactionDocumentType } from 'utils/constants';
import { getPathNameList } from 'utils/functions';

//-----------test----------
type TreportData = {
  reportName: string;
};
const TransactionDocument = ({ doc_type }: { doc_type: string }) => {
  //-----------------constants-----------------
  const contentRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>; // Reference for the content to print
  const handlePrint = useReactToPrint({
    contentRef,
    pageStyle: `
      @media print {
          .page-break {
            display: block;
            page-break-after: always;
          }
        }
          @page {
          @bottom-right {
            content: counter(page) ' of ' counter(pages);
          }
        }
      `,
    onAfterPrint: () => {
      setSelectedReport(''); // Reset selected report after printing
      togglePrintData(); // Toggle print data popup
    }
  });

  const [defaultFilter, setDefaultFilter] = useState<ISearch>(filter); // Default filter state
  const reportData: TreportData[] = [{ reportName: 'document_report' }]; // Report data
  const { permissions, user_permission } = useAuth(); // User permissions
  const location = useLocation(); // Current location
  const pathNameList = getPathNameList(location.pathname); // Path name list
  const { app } = useSelector((state: any) => state.menuSelectionSlice); // App state from Redux
  const transactionDocumentReport = [
    [{ field_name: 'doc_no', field_value: '', operator: 'exactmatch' }],
    [{ field_name: 'doc_type', field_value: '', operator: 'exactmatch' }]
  ];
  const columns = useMemo<ColDef[]>(
    () => [
      {
        headerName: '',
        field: 'select',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left',
        sortable: false,
        filter: false
      },
      {
        headerName: 'Doc No',
        field: 'doc_no',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Account Name',
        field: 'ac_name',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Account Payee',
        field: 'ac_payee',
        sortable: true,
        filter: true,
        hide: !(transactionDocumentType.CHEQUE_PAYMENT === doc_type)
      },
      {
        headerName: 'Cheque Bank',
        field: 'cheque_bank',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Div Code',
        field: 'div_code',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Cancel Status',
        field: 'canceled',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Actions',
        field: 'actions',
        sortable: false,
        filter: false,
        width: 150,
        cellRenderer: (params: any) => {
          const row = params.data;
          const actionButtons: TAvailableActionButtons[] = row.canceled === 'Y' ? ['edit', 'print'] : ['edit', 'print', 'cancel'];
          return (
            <ActionButtonsGroup
              handleActions={(action) => handleActions(action, { original: row })}
              buttons={actionButtons}
              canceled={row.canceled}
            />
          );
        }
      }
    ],
    [doc_type]
  );

  //-----------------States--------------------
  const [, setToggleFilter] = useState<boolean | null>(null); // Toggle filter state
  const [filterData, setFilterData] = useState<ISearch>(filter); // Filter data state
  const [selectedRows, setSelectedRows] = useState<any[]>([]); // Selected rows state
  const [gridApi, setGridApi] = useState<any>(null); // Grid API state
  const [paginationData, ] = useState({ page: 0, rowsPerPage: 10 }); // Pagination data state
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false); // Delete popup state
  const [selectedReport, setSelectedReport] = useState<string>(''); // Selected report state
  const [fyPeriod, setFyPeriod] = useState<string>(); // Fiscal year period state
  const [paymentFormPopup, setPaymentFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullScreen: true
    },
    title: <FormattedMessage id="Add Document" />,
    data: { doc_no: '', div_code: '', isEditMode: false, canceled: '' }
  });
  const [printPopup, setPrintPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Print Data" />,
    data: { doc_no: null as unknown as number, doc_type: '' }
  });
  const [printDataPopup, setPrintDataPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Print Report" />,
    data: {}
  });

  //-----------------useMemo--------------------
  const reportFilter = useMemo(() => {
    switch (selectedReport) {
      case 'document_report':
        transactionDocumentReport[0][0].field_value = printPopup.data.doc_no;
        transactionDocumentReport[1][0].field_value = printPopup.data.doc_type;
        return transactionDocumentReport;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport]);

  //------------useQuery--------
  const { data: selectedReportData } = useQuery({
    queryKey: ['single_report_data', selectedReport],
    queryFn: () => transactionsServiceInstance.getTransactionDocumentReport(selectedReport, { search: reportFilter ?? [] }),
    enabled: selectedReport.length > 0
  });
  const {
    data: documentData,
    // isFetching: isdocumentDataFetching,
    refetch: refetchdocumentData
  } = useQuery({
    queryKey: ['document_data', filterData, paginationData],
    queryFn: () => FinanceSerivceInstance.getMasters(app, 'doc', paginationData, filterData),
    enabled:
      !!fyPeriod &&
      filterData.search.length > 0 &&
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  const { data: fyDetails } = useQuery({
    queryKey: ['fy_period'],
    queryFn: async () => {
      const response = await FinanceSerivceInstance.getMasters('finance', 'fy_period');
      if (response) {
        return {
          tableData: response.tableData as TFyPeriod[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 };
    }
  });
  const { data: companyInfo } = useQuery({
    queryKey: ['company_info'],
    queryFn: () => transactionsServiceInstance.getCompanyInfo()
  });

  //------------------handlers-----------------
  // Handler for AG Grid ready event
  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  // Handler for selection changes in AG Grid
  const onSelectionChanged = (params: any) => {
    const selectedNodes = params.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node: any) => node.data);
    setSelectedRows(selectedData);
  };

  // Handler for changing pagination
  // const handleChangePagination = (page: number, rowsPerPage: number) => {
  //   setPaginationData({ page, rowsPerPage });
  // };

  // Handler for changing sorting
  const handleSortingChange = (params: any) => {
    const sortModel = params.api.getSortModel();
    if (sortModel.length > 0) {
      setFilterData((prevData) => ({
        ...prevData,
        sort: { field_name: sortModel[0].colId, desc: sortModel[0].sort === 'desc' }
      }));
    }
  };

  // Handler for filtering data in AG Grid
  const handleFilterChange = (params: any) => {
    const filterModel = params.api.getFilterModel();
    const filters: any[] = [];

    Object.keys(filterModel).forEach((field) => {
      if (filterModel[field].filter) {
        filters.push([
          {
            field_name: field,
            field_value: filterModel[field].filter,
            operator: 'contains'
          }
        ]);
      }
    });

    setFilterData((prevData) => ({
      ...prevData,
      search: [...filters, ...(filter?.search ?? [])]
    }));
  };

  // Handler for performing actions on a row
  const handleActions = (actionType: string, row: { original: TTransactionDocumentView }) => {
    const { div_code, doc_no, canceled } = row.original;
    actionType === 'edit' && toggleDcoumentPopup(undefined, true, doc_no, div_code, canceled);
    actionType === 'print' && handlePrintDocument(row);
    actionType === 'cancel' && handleCancelDcoument(row);
  };

  // Handler for toggling print data popup
  const togglePrintData = (refetchData?: boolean) => {
    setSelectedReport('');
    setPrintDataPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        data: {}
      };
    });
  };

  // Handler for printing a document
  const handlePrintDocument = (row: { original: TTransactionDocumentView }) => {
    setPrintPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Print Document" />,
        data: { doc_no: row.original.doc_no, doc_type: row.original.doc_type }
      };
    });
  };

  // Handler for printing a report
  const handlePrintReport = () => {
    setPrintDataPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Print Data" />,
        data: {}
      };
    });
  };

  // Handler for toggling print popup
  const togglePrintPopup = (refetchData?: boolean) => {
    if (printPopup.action.open === true && refetchData) {
      refetchdocumentData();
    }
    setPrintPopup((prev) => {
      return { ...prev, data: { isEditMode: false }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // Handler for closing delete popup
  const handleCloseDelete = () => {
    setDeletePopup(false);
  };

  // Handler for deleting a document
  const handleDeleteDocument = async () => {
    const selectedDocNos = selectedRows.map((row) => row.doc_no);
    await transactionsServiceInstance.deleteDocument(selectedDocNos, doc_type);
    setSelectedRows([]);
    refetchdocumentData();
    handleCloseDelete();
  };

  // Handler for canceling a document
  const handleCancelDcoument = async (row: { original: TTransactionDocumentView }) => {
    await transactionsServiceInstance.cancelDocument({ doc_no: row.original.doc_no, doc_type: row.original.doc_type });
    refetchdocumentData();
  };

  // Handler for toggling document popup
  const toggleDcoumentPopup = (refetchData?: boolean, isEditMode?: boolean, doc_no?: number, div_code?: string, canceled?: string) => {
    if (!!paymentFormPopup.action.open && refetchData) {
      refetchdocumentData();
    }
    setPaymentFormPopup((prev) => {
      return {
        title: <FormattedMessage id={isEditMode ? 'Edit Document' : 'Add Document'} />,
        data: { isEditMode: !!isEditMode, doc_no, div_code, canceled },
        action: { ...prev.action, open: !prev.action.open }
      };
    });
  };

  // Handler for changing fiscal year period
  const handleFyPeriodChange = (event: React.SyntheticEvent, value: TFyPeriod | null) => {
    if (!!value && !!value?.fy_period) setFyPeriod(value?.fy_period);
  };

  // Function to render the report based on the selected report
  const renderReport = () => {
    switch (selectedReport) {
      case 'document_report':
        return (
          <TransactionDocumentReport
            handlePrint={handlePrint}
            contentRef={contentRef}
            data={selectedReportData as TTransactionDocumentReport}
          />
        );
    }
  };

  // Handler for exporting data
  // const handleExportData = async () => {
  //   const response = await transactionsServiceInstance.exportData();
  //   if (response) {
  //     refetchdocumentData();
  //     return response;
  //   }
  //   return false;
  // };

  //----------UI Component----------
  // Custom filter component
  const customFilter = (
    <div className="flex p-2  justify-between  w-full">
      <Autocomplete
        className="pt-1"
        id="fy_period"
        value={
          !!fyPeriod ? fyDetails?.tableData?.find((eachFyPeriod) => eachFyPeriod.fy_period === fyPeriod) : ({ fy_period: '' } as TFyPeriod)
        }
        disableClearable
        onChange={handleFyPeriodChange}
        size="small"
        options={fyDetails?.tableData ?? []}
        autoHighlight
        getOptionLabel={(option) => option?.fy_period}
        isOptionEqualToValue={(option) => option.fy_period === fyPeriod}
        renderInput={(params) => (
          <TextField
            {...params}
            inputProps={{
              ...params.inputProps
            }}
          />
        )}
      />
      <div className="flex p-2  justify-end space-x-2 w-full">
        <Button
          size="extraSmall"
          variant="outlined"
          onClick={() => setDeletePopup(true)}
          color="error"
          hidden={!selectedRows.length}
          startIcon={<DeleteOutlined />}
        >
          <FormattedMessage id="Delete" />
        </Button>
        <Button startIcon={<PlusOutlined />} variant="contained" size="small" onClick={() => toggleDcoumentPopup()}>
          <FormattedMessage id="Add Document" />
        </Button>
      </div>
    </div>
  );

  //----------useEffect--------
  // Effect to reset toggle filter state
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  // Effect to set fiscal year period from company info
  useEffect(() => {
    if (companyInfo) {
      setFyPeriod(companyInfo.ac_fy_period);
    }
  }, [companyInfo]);

  // Effect to handle printing report when selected report data is available
  useEffect(() => {
    if (selectedReport.length > 0 && selectedReportData) {
      handlePrintReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport, selectedReportData]);

  // Effect to set default filter based on fiscal year period and document type
  useEffect(() => {
    if (!!fyPeriod && !!doc_type) {
      setDefaultFilter((prev) => ({
        sort: prev.sort,
        search: [
          [...(fyPeriod !== 'All' ? [{ field_name: 'fy_period', field_value: fyPeriod, operator: 'exactmatch' }] : [])],
          [{ field_name: 'doc_type', field_value: doc_type, operator: 'exactmatch' }]
        ]
      }));
    }
  }, [doc_type, fyPeriod]);

  // Effect to update filter data based on default filter
  useEffect(() => {
    if (defaultFilter.search.length > 0) {
      setFilterData((prevData) => {
        return {
          ...prevData,
          search: defaultFilter?.search
        };
      });
    }
  }, [defaultFilter]);
  return (
    <>
      {customFilter}

      <CustomAgGrid
        rowData={documentData?.tableData || []}
        columnDefs={columns}
        onGridReady={onGridReady}
        onSortChanged={handleSortingChange}
        onFilterChanged={handleFilterChange}
        paginationPageSize={paginationData.rowsPerPage}
        height="425px"
        pagination={true}
        paginationPageSizeSelector={[10, 25, 50, 100]}
      />

      {/* Add selection changed handler */}
      {gridApi && gridApi.addEventListener('selectionChanged', onSelectionChanged)}

      {/* UniversalDialog for payment form popup */}
      {!!paymentFormPopup && !!paymentFormPopup.action.open && (
        <UniversalDialog
          action={{ ...paymentFormPopup.action }} // Dialog action configuration
          onClose={toggleDcoumentPopup} // Handler for closing the dialog
          title={paymentFormPopup.title} // Dialog title
          hasPrimaryButton={false} // Disable primary button
        >
          <AddTransactionDocumentForm
            onClose={toggleDcoumentPopup} // Handler for closing the form
            isEdit={paymentFormPopup?.data?.isEditMode} // Edit mode flag
            doc_no={paymentFormPopup.data.doc_no} // Document number
            div_code={paymentFormPopup.data.div_code} // Division code
            canceled={paymentFormPopup.data.canceled} // Canceled status
            doc_type={doc_type} // Document type
          />
        </UniversalDialog>
      )}

      {/* Hidden div for rendering the report */}
      <div className="hidden">{renderReport()} </div>

      {/* UniversalDialog for print popup */}
      {!!printPopup && printPopup.action.open && (
        <UniversalDialog action={{ ...printPopup.action }} onClose={togglePrintPopup} title={printPopup.title} hasPrimaryButton={false}>
          <List>
            {reportData.map((item) => {
              return (
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary={item.reportName} />
                    <PrinterOutlined className="hover:text-blue-900" onClick={() => setSelectedReport(item.reportName)} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </UniversalDialog>
      )}

      {/* UniversalDialog for print data popup */}
      {!!printDataPopup && !!printDataPopup.action.open && (
        <UniversalDialog
          action={{ ...printDataPopup.action }} // Dialog action configuration
          onClose={togglePrintData} // Handler for closing the dialog
          title={printDataPopup.title} // Dialog title
          hasPrimaryButton={false} // Disable primary button
        >
          {!selectedReportData ? (
            <ProductPlaceholder /> // Placeholder component if no report data
          ) : (
            <TransactionDocumentReport
              handlePrint={handlePrint} // Handler for printing the report
              contentRef={contentRef} // Reference for the content to print
              data={selectedReportData as TTransactionDocumentReport} // Report data
            />
          )}
        </UniversalDialog>
      )}

      {/* UniversalDelete for delete confirmation */}
      {openDeletePopup === true && (
        <UniversalDelete
          open={openDeletePopup} // Open state of the delete popup
          handleClose={handleCloseDelete} // Handler for closing the delete popup
          title={selectedRows.length} // Title showing the number of selected rows
          handleDelete={handleDeleteDocument} // Handler for deleting the document
        />
      )}
    </>
  );
};

export default TransactionDocument;
