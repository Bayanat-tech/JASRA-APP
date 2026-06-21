import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
//import ImportData from 'components/popup/ImportData';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import { useEffect, useMemo, useState } from 'react';
import WmsSerivceInstance from 'service/wms/service.wms';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ToOrder } from 'pages/WMS/Transaction/outbound/types/OrderEntry_wms.types';
import { FormattedMessage } from 'react-intl';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import UniversalDelete from 'components/popup/UniversalDelete';
import OrderEntryServiceInstance from 'service/wms/transaction/outbound/service.orderentryWms';
import NewOrder from 'components/forms/Wms/Transaction/Outbound/NewOrder';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const OrderEntryWmsTab = ({ job_no, prin_code }: { job_no: string; prin_code: string }) => {
  //--------------constants----------
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterData, setFilterData] = useState<ISearch>(filter);
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false);
  // const [isImportDataPopupOpen, setIsImportDataPopupOpen] = useState(false);

  const handleImportData = async (values: unknown[]): Promise<boolean> => {
    try {
      if (!Array.isArray(values) || values.length === 0) {
        console.error('No data to upload.');
        return false;
      }

      // You can use `values` directly here
      console.log('Importing data:', values);

      // TODO: Add your API call or processing logic here

      return true;
    } catch (error) {
      console.error('Error while importing data:', error);
      return false;
    }
  };

  const [orderEntryFormPopup, setorderEntryFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Order Entry" />,
    data: { existingData: {}, isEditMode: false }
  });
  const columns = useMemo<ColumnDef<ToOrder>[]>(
    () => [
      {
        id: 'select-col',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
        )
      },
      {
        accessorFn: (row) => row.cust_code,
        id: 'cust_code',
        header: () => <FormattedMessage id="Customer Code" />
      },
      // {
      //   accessorFn: (row) => row.cust_name,
      //   id: 'cust_name',
      //   header: () => <FormattedMessage id="Customer Name" />
      // },
      {
        accessorFn: (row) => row.order_no,
        id: 'order_no',
        header: () => <FormattedMessage id="Order No" />
      },
      {
        accessorFn: (row) => row.order_date,
        id: 'order_date',
        header: () => <FormattedMessage id="Order Date" />
      },
      {
        accessorFn: (row) => row.curr_code,
        id: 'curr_code',
        header: () => <FormattedMessage id="Currency" />
      },
      {
        accessorFn: (row) => row.ex_rate,
        id: 'ex_rate',
        header: () => <FormattedMessage id="Ex Rate" />
      },
      {
        accessorFn: (row) => row.order_due_date,
        id: 'order_due_date',
        header: () => <FormattedMessage id="Order Due Date" />
      },
      {
        id: 'actions',
        enableHiding: true,
        header: () => <FormattedMessage id="Actions" />,

        cell: ({ row }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  //----------- useQuery--------------
  const {
    data: OrderEntryData,
    isFetching: isPackingFetchLoading,
    refetch: refetchOrderEntryData
  } = useQuery({
    queryKey: ['order_entry', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters('wms', 'order_entry', paginationData, filterData, job_no, prin_code),
    enabled: !!job_no
  });
  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleCloseDelete = () => {
    setDeletePopup(false);
  };

  const handleEditOrderEntry = (existingData: ToOrder) => {
    setorderEntryFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Order Entry" />,

        data: { existingData, isEditMode: true },
        isEditMode: true
      };
    });
  };

  const handleDelete = async () => {
    const indexToBeDeleted = Object.keys(rowSelection);
    const deleteData = (OrderEntryData?.tableData as ToOrder[])
      .filter((_, eachIndex) => indexToBeDeleted.includes(eachIndex.toString()))
      .map((item) => ({
        prin_code: item.prin_code as string,
        job_no: item.job_no as string,
        order_no: item.order_no as string
      }));
    console.log(deleteData);
    setRowSelection({});
    setDeletePopup(false);
    refetchOrderEntryData();
  };
  const togglePackingPopup = (refetchData?: boolean) => {
    if (orderEntryFormPopup.action.open === true && refetchData) {
      refetchOrderEntryData();
    }
    setorderEntryFormPopup((prev) => {
      return {
        ...prev,
        title: <FormattedMessage id="Add Order Entry" />,
        data: { isEditMode: false, existingData: { prin_code, job_no } },
        action: { ...prev.action, open: !prev.action.open }
      };
    });
  };

  const handleActions = (actionType: string, rowOriginal: ToOrder) => {
    actionType === 'edit' && handleEditOrderEntry(rowOriginal);
  };

  const handleFilterChange = (value: ISearch['search']) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        search: value
      };
    });
  };
  const handleSortingChange = (sorting: SortingState) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
      };
    });
  };

  /* const handleImportData = async (values: ToOrder[]) => {
    const response = await OrderEntryServiceInstance.addBulkData(values);
    if (response) {
      refetchOrderEntryData();
      return response;
    }
    return false;
  };*/

  const handleExportData = async () => {
    const response = await OrderEntryServiceInstance.exportData(filterData);
    if (response) {
      refetchOrderEntryData();
      return response;
    }
    return false;
  };
  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);
  //---------custom-filter------
  const customFilter = (
    <div className="flex justify-end space-x-2 w-full p-2">
      <Button
        size="extraSmall"
        variant="outlined"
        onClick={() => setDeletePopup(true)}
        color="error"
        hidden={!Object.keys(rowSelection).length}
        startIcon={<DeleteOutlined />}
      >
        <FormattedMessage id="Delete" />
      </Button>
      <Button startIcon={<PlusOutlined />} size="small" variant="contained" onClick={() => togglePackingPopup()}>
        <FormattedMessage id="Add Order Entry" />
      </Button>
    </div>
  );
  return (
    <div className="flex flex-col space-y-2">
      <CustomDataTable
        customFilter={customFilter}
        data={OrderEntryData?.tableData || []}
        columns={columns}
        isDataLoading={isPackingFetchLoading}
        //--------------filter---------
        toggleFilter={toggleFilter}
        handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
        //-----------export----------
        tableActions={['import', 'export', 'print']}
        handleImportData={handleImportData}
        handleExportData={handleExportData}
        //-----------delete----------
        row_id="id"
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        //-----------pagination----------
        count={OrderEntryData?.count}
        hasPagination={true}
        onPaginationChange={handleChangePagination}
      />
      {!!orderEntryFormPopup && orderEntryFormPopup.action.open && (
        <UniversalDialog
          action={{ ...orderEntryFormPopup.action }}
          onClose={togglePackingPopup}
          title={orderEntryFormPopup.title}
          hasPrimaryButton={false}
        >
          {/* <AddOrderEntryForm
            job_no={job_no}
            packdet_no={orderEntryFormPopup?.data.existingData.packdet_no}
            prin_code={prin_code}
            onClose={togglePackingPopup}
            isEditMode={orderEntryFormPopup?.data?.isEditMode}
          /> */}
          <NewOrder
            data={orderEntryFormPopup?.data}
            title={typeof orderEntryFormPopup.title === 'string' ? orderEntryFormPopup.title : undefined}
            isEditMode={orderEntryFormPopup?.data?.isEditMode}
          />
        </UniversalDialog>
      )}
      {openDeletePopup === true && (
        <UniversalDelete
          open={openDeletePopup}
          handleClose={handleCloseDelete}
          title={Object.keys(rowSelection).length}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default OrderEntryWmsTab;
