import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddBankWmsForm from 'components/forms/HR/AddBankHrForm';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import HrServiceInstance from 'service/Service.hr';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TBank } from './type/Bank-hr.types';

const BankWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [BankFormPopup, setBankFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Bank',
    data: { existingData: {}, isEditMode: false }
  });

  // First need to add TBank in WMS/TYPES
  const columns = useMemo<ColumnDef<TBank>[]>(
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
        //second add all the col names + use Query

        accessorFn: (row) => row.bank_code,
        id: 'bank_code',
        header: () => <span>Bank Code</span>
      },
      {
        accessorFn: (row) => row.bank_name,
        id: 'bank_name',
        header: () => <span>Bank Name</span>
      },
      {
        accessorFn: (row) => row.company_code,
        id: 'company_code',
        header: () => <span>Company Code</span>
      },
      {
        accessorFn: (row) => row.bank_short_name,
        id: 'bank_short_name',
        header: () => <span>Bank Short Name</span>
      },
      {
        accessorFn: (row) => row.bank_addr1,
        id: 'bank_addr1',
        header: () => <span>Address</span>
      },
      {
        accessorFn: (row) => row.phone,
        id: 'phone',
        header: () => <span>Tel No</span>
      },

      {
        accessorFn: (row) => row.email,
        id: 'email',
        header: () => <span>Email</span>
      },
      {
        accessorFn: (row) => row.remarks,
        id: 'remarks',
        header: () => <span>Remarks</span>
      },

      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => <span>Status</span>
      },

      {
        id: 'actions',
        header: () => <span>Actions</span>,
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
    data: bank_data,
    isFetching: isBankFetchLoading,
    refetch: refetchBankData
  } = useQuery({
    queryKey: ['bank_data', searchData, paginationData],
    queryFn: () => HrServiceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditBank = (existingData: TBank) => {
    setBankFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Bank',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleBankPopup = (refetchData?: boolean) => {
    if (BankFormPopup.action.open === true && refetchData) {
      refetchBankData();
    }
    setBankFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TBank) => {
    actionType === 'edit' && handleEditBank(rowOriginal);
  };

  const handleDeleteBank = async () => {
    console.log('called', rowSelection);

    await HrServiceInstance.deleteMasters('hr', 'bank', Object.keys(rowSelection));
    setRowSelection({});
    refetchBankData();
  };

  //------------------useEffect----------------

  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        {
          // Delete Button
          <Button
            variant="outlined"
            onClick={handleDeleteBank}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }

        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleBankPopup()}>
          Add Bank
        </Button>
      </div>

      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="bank_code"
        data={bank_data?.tableData || []}
        columns={columns}
        count={bank_data?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isBankFetchLoading}
        toggleFilter={toggleFilter}
      />

      {BankFormPopup.action.open === true && (
        <UniversalDialog
          action={{ ...BankFormPopup.action }}
          onClose={toggleBankPopup}
          title={BankFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddBankWmsForm
            onClose={toggleBankPopup}
            isEditMode={BankFormPopup?.data?.isEditMode}
            existingData={BankFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default BankWmsPage;
