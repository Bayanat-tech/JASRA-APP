import { DeleteOutlined } from '@ant-design/icons';
import AddIcon from '@mui/icons-material/Add';
import { Checkbox } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddBillingActivityWmsForm from 'components/forms/AddBillingActivityWms';
import PasswordForm from 'components/forms/common/PasswordForm';
import PopulateBillingActivityForm from 'components/forms/PopulateBillingActivityForm';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';
import ActivityServiceInstance from 'service/GM/services.activity_wms';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TBillingActivity } from './types/billingActivity-wms.types';
import { TPrincipalWms } from './types/principal-wms.types';

const ActivityBillingPage = () => {
  const location = useLocation();
  const filter: ISearch = {
    sort: { field_name: 'updated_at', desc: true },
    search: [[]]
  };

  // State for Add Activity Form Popup
  const [addActivityFormPopup, setActivityFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Add Billing Activity',
    data: { existingData: {}, isEditMode: false }
  });

  // Toggle Add Activity Form Popup
  const toggleActivityPopup = (refetchData?: boolean) => {
    if (addActivityFormPopup.action.open === true && refetchData) {
      refetchActivityBillingData();
    }
    setActivityFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // Handle Add Activity Form
  const handleAddActivityForm = () => {
    setActivityFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // State for Populate Form Popup
  const [populateFormPopup, setPopulateFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Populate Activities',
    data: { existingData: {}, isEditMode: false }
  });

  // Toggle Populate Form Popup
  const togglePopulatePopup = (refetchData?: boolean) => {
    if (populateFormPopup.action.open === true && refetchData) {
      refetchActivityBillingData();
    }
    setPopulateFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // Handle Populate Form
  const handlePopulateForm = () => {
    setPopulateFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // State for Delete Password Form Popup
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [passwordDeleteFormPopup, setPasswordDeleteFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'xs'
    },
    title: 'Enter Password'
  });
  const [password, setPassword] = useState<string>('');

  // Toggle Delete Password Form Popup
  const toggleDeletePasswordPopup = () => {
    setPasswordDeleteFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // Handle Delete Password Form
  const handleDeletePasswordForm = () => {
    setPasswordDeleteFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // For Activity Billing Table
  const { permissions, user_permission } = useAuth();
  const [filterData, setFilterData] = useState<ISearch>(filter);

  const pathNameList = getPathNameList(location.pathname);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Handle Actions for Edit
  const handleActions = (actionType: string, rowOriginal: TBillingActivity) => {
    actionType === 'edit' && handleEditActivityBilling(rowOriginal);
  };

  const [prinCode, setPrinCode] = useState<string>('');

  // Handle Edit Activity Billing
  const handleEditActivityBilling = (existingData: TBillingActivity) => {
    setActivityFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Billing Activity',
        data: { existingData, isEditMode: true }
      };
    });
  };

  // Handle Pagination Change
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  // Table Columns Definition
  const columns = useMemo<ColumnDef<TBillingActivity>[]>(
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
        accessorFn: (row) => row.prin_name,
        id: 'prin_name',
        header: () => <FormattedMessage id="Principal Name" />
      },
      {
        accessorFn: (row) => row.act_code,
        id: 'act_code',
        header: () => <FormattedMessage id="Activity Code" />
      },
      {
        accessorFn: (row) => row.activity,
        id: 'activity',
        header: () => <FormattedMessage id="Activity" />
      },
      {
        accessorFn: (row) => row.jobtype,
        id: 'job_type',
        header: () => <FormattedMessage id="Job Type" />
      },
      {
        id: 'actions',
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

  //------------------useQuery----------------
  const {
    data: activityBillingData,
    isFetching: isActivityFetchLoading,
    refetch: refetchActivityBillingData
  } = useQuery({
    queryKey: ['activity_billing_data', filterData, paginationData, prinCode],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData, prinCode),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  const { data: principalList } = useQuery({
    queryKey: ['principal_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'principal');
      if (response) {
        return {
          tableData: response.tableData as TPrincipalWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 };
    }
  });

  // Handle Delete
  const handleDelete = async () => {
    setIsDelete(true);
    const indexToBeDeleted = Object.keys(rowSelection);
    const deleteData = (activityBillingData?.tableData as TBillingActivity[]).filter((_, eachIndex) =>
      indexToBeDeleted.includes(eachIndex.toString())
    );

    await ActivityServiceInstance.deleteActivity(deleteData);
    setRowSelection({});
    refetchActivityBillingData();
    setIsDelete(false);
    handleDeletePasswordForm();
  };

  // Handle Filter Change
  const handleFilterChange = (value: ISearch['search']) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        search: value
      };
    });
  };

  // Handle Sorting Change
  const handleSortingChange = (sorting: SortingState) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
      };
    });
  };

  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  // Custom Filter Component
  const customFilter = (
    <div className="w-full flex justify-between p-2">
      <Autocomplete
        size="small"
        value={
          !!prinCode
            ? principalList?.tableData.find((eachPrincipal) => eachPrincipal.prin_code === prinCode)
            : ({ prin_name: '' } as TPrincipalWms)
        }
        onChange={(event, value: TPrincipalWms | null) => {
          if (value) {
            setPrinCode(value?.prin_code as string);
          }
        }}
        disablePortal
        getOptionLabel={(option) => option.prin_name}
        options={principalList?.tableData ?? []}
        sx={{ width: 300 }}
        renderInput={(params: any) => <TextField {...params} label="Principal" autoFocus />}
      />
      <div className="flex space-x-2">
        <Button
          size="extraSmall"
          variant="outlined"
          onClick={handleDeletePasswordForm}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          <FormattedMessage id="Delete" />
        </Button>
        <Button
          size="extraSmall"
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleAddActivityForm}
          disabled={prinCode === '' ? true : false}
        >
          <FormattedMessage id="Add Activity" />
        </Button>
        <Button
          size="extraSmall"
          variant="contained"
          color="warning"
          onClick={handlePopulateForm}
          disabled={prinCode === '' ? true : false}
        >
          <FormattedMessage id="Populate Activities" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Table */}
      <div className="w-full mt-2">
        <CustomDataTable
          customFilter={customFilter}
          data={activityBillingData?.tableData || []}
          columns={columns}
          isDataLoading={isActivityFetchLoading}
          //--------------filter---------
          toggleFilter={toggleFilter}
          handleFilterChange={handleFilterChange}
          handleSortingChange={handleSortingChange}
          //-----------export----------
          tableActions={['print']}
          //-----------delete----------
          row_id="id"
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          //-----------pagination----------
          count={activityBillingData?.count}
          hasPagination={true}
          onPaginationChange={handleChangePagination}
        />
      </div>
      {/* Add Activity Dialogue Box */}
      {!!addActivityFormPopup && addActivityFormPopup.action.open && (
        <UniversalDialog
          action={{ ...addActivityFormPopup.action }}
          onClose={toggleActivityPopup}
          title={addActivityFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddBillingActivityWmsForm
            onClose={toggleActivityPopup}
            isEditMode={addActivityFormPopup?.data?.isEditMode}
            existingData={addActivityFormPopup.data.existingData}
            prin_code={prinCode}
          />
        </UniversalDialog>
      )}
      {/* Populate Activity Dialogue Box */}
      {!!populateFormPopup && populateFormPopup.action.open && (
        <UniversalDialog
          action={{ ...populateFormPopup.action }}
          onClose={togglePopulatePopup}
          title={<FormattedMessage id="Populate Activities" />}
          hasPrimaryButton={false}
        >
          <PopulateBillingActivityForm
            onClose={togglePopulatePopup}
            isEditMode={populateFormPopup?.data?.isEditMode}
            existingData={populateFormPopup.data.existingData}
            prin_code={prinCode}
          />
        </UniversalDialog>
      )}
      {/* Delete Password Form Popup */}
      {!!passwordDeleteFormPopup && passwordDeleteFormPopup.action.open && (
        <UniversalDialog
          action={{ ...passwordDeleteFormPopup.action }}
          onClose={() => toggleDeletePasswordPopup()}
          title={<FormattedMessage id="Enter Password" />}
          primaryButonTitle="Submit"
          onSave={handleDelete}
          disablePrimaryButton={password === '' || isDelete === true}
        >
          <PasswordForm password={password} setPassword={setPassword} />
        </UniversalDialog>
      )}
    </div>
  );
};

export default ActivityBillingPage;
