import React, { useState, useEffect, useMemo, FC } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, TextField, MenuItem, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@mui/system';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import AddPurchaserequestPfForm from 'components/forms/Purchaseflow/AddPurchaserequestPfForm';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
//import StatusChip from 'types/StatusChip';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVPurchaserequestheader } from './type/purchaserequestheader_pf-types';
import AddBudgetrequestPfForm from 'components/forms/Purchaseflow/AddBudgetrequestPfForm';

import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

interface POCancelProps {
  costUser: string | null;
}

export const SentBackPopup: FC<{
  request_number: string;
  flowLevel: number;
  onClose: () => void;
  onLevelChange: (level: number) => void;
  onRemarksChange: (remarks: string) => void;
}> = ({ request_number, flowLevel, onClose, onLevelChange, onRemarksChange }) => {
  interface Role {
    role_name: string;
    flow_level: number;
  }
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await PfSerivceInstance.getSentbackrolls(app);
        if (Array.isArray(data) && data.length > 0) {
          const filteredRoles = data
            .filter((role) => role.flow_level < flowLevel && role.role_name)
            .map((role) => ({
              role_name: role.role_name,
              flow_level: role.flow_level
            }));
          setRoles(filteredRoles);
          if (filteredRoles.length > 0) {
            const highestRole = filteredRoles.reduce((max, role) => (role.flow_level > max.flow_level ? role : max));
            setSelectedRole(highestRole.role_name);
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, [app, flowLevel]);

  const handleOk = async () => {
    if (!remarks.trim()) {
      alert('Remarks cannot be empty');
      return;
    }
    const selected = roles.find((role) => role.role_name === selectedRole);
    if (selected) {
      const COMPANY_CODE = user?.company_code || '';
      const loginid = user?.loginid || '';
      await GmPfServiceInstance.updatecancelrejectsentback(
        'SENTBACK',
        request_number,
        COMPANY_CODE,
        loginid,
        selected.flow_level.toString(),
        remarks,
        'N'
      );
      onLevelChange(selected.flow_level);
      onRemarksChange(remarks);
      onClose();
      // refetchPurchaserequestheaderData();
    }
  };

  return (
    <div>
      <TextField label="Request Number" value={request_number} fullWidth disabled style={{ marginBottom: '20px' }} />
      <TextField
        label="Level"
        select
        fullWidth
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        style={{ marginBottom: '20px' }}
      >
        {roles.map((role) => (
          <MenuItem key={role.role_name} value={role.role_name}>
            {role.role_name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Remarks"
        fullWidth
        multiline
        rows={4}
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <div style={{ marginTop: '20px' }}>
        <Button onClick={handleOk} disabled={!selectedRole} variant="contained" color="primary" style={{ marginRight: '10px' }}>
          OK
        </Button>
        <Button onClick={onClose} variant="contained" color="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
};

const POCancel: FC<POCancelProps> = ({ costUser }) => {
  //--------------constants----------
  const { permissions, user } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
 
 const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Purchase Request',
    data: { existingData: {}, isEditMode: false, request_number: '' } // Default request_number
  });
  const [rejectPopup, setRejectPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Reject Request',
    data: { request_number: '', remarks: '' }
  });
  const [sentBackPopup, setSentBackPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Send Back Request',
    data: { request_number: '', remarks: '', level: '' }
  });
  const [cancelPopup, setCancelPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Cancel Request',
    data: { request_number: '', remarks: '' }
  });
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [createPR, setCreatePR] = useState<boolean>(false);

  const columns = useMemo<ColumnDef<TVPurchaserequestheader>[]>(
    () => [
      {
        accessorFn: (row) => (row.document_number ? row.document_number.replace(/\$/g, '/') : ''),
        id: 'document_number',
        header: () => <span>Document Number</span>
      },
      {
        accessorFn: (row) => row.request_date,
        id: 'request_date',
        header: () => <span>Request Date</span>
      },
      {
        accessorFn: (row) => row.project_name,
        id: 'project_name',
        header: () => <span>Project Name</span>
      },

      {
        accessorFn: (row) => row.description,
        id: 'description',
        header: () => <span>Flow Code</span>
      },

      {
        accessorFn: (row) => row.amount,
        id: 'Amount',
        header: () => <span>Amount</span>,
        cell: (info) => <div style={{ textAlign: 'right' }}>{info.getValue() as React.ReactNode}</div>
      },

      {
        id: 'actions',
        header: () => <span>Actions</span>,
        cell: ({ row }) => {
          const actionButtons: TAvailableActionButtons[] = row.original.document_type === 'PO' ? ['view', 'cancel'] : ['view', 'cancel'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  console.log('s', searchData);
  //----------- useQuery--------------

  const children = permissions?.[app.toUpperCase()]?.children || {};

  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());

  console.log('Resolved Module Key:', moduleKey);

  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  console.log('Resolved Serial Number:', serialNumber);

  // const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber as string);
  // console.log('Permission Check:', permissionCheck);

  // const isQueryEnabled = Boolean(permissionCheck); // ✅ Ensures strict boolean value
  // console.log('Final Enabled Value:', isQueryEnabled);

  const {
    data: PurchaserequestheaderData,
    isFetching: isPurchaserequestheaderFetchLoading,
    refetch: refetchPurchaserequestheaderData
  } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData, paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, 'po_cancel', paginationData, searchData)
    // enabled: isQueryEnabled,
  });
  console.log('pur', PurchaserequestheaderData);
  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      data: {
        isEditMode: true,
        request_number: existingData.request_number,
        title
      }
    }));
  };

  const togglePurchaserequestheaderPopup = () => {
    setPurchaserequestheaderFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {}, request_number: '' },
      action: { ...prev.action, open: !prev.action.open }
    }));

    if (PurchaserequestheaderFormPopup.action.open) {
      refetchPurchaserequestheaderData();
    }
  };

  const handleRejectPopupOpen = (request_number: string) => {
    setRejectPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: { request_number, remarks: '' }
    }));
  };

  const handleRejectPopupClose = () => {
    setRejectPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '' }
    }));
  };

  const handleRejectRemarksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setRejectPopup((prev) => ({
      ...prev,
      data: { ...prev.data, remarks: value }
    }));
  };

  const handleRejectSubmit = async () => {
    const { request_number, remarks } = rejectPopup.data;
    if (!remarks.trim()) {
      alert('Remarks cannot be empty');
      return;
    }
    const COMPANY_CODE = user?.company_code || '';
    const loginid = user?.loginid || '';
    await GmPfServiceInstance.updatecancelrejectsentback('REJECTED', request_number, COMPANY_CODE, loginid, '0', remarks, 'N');
    handleRejectPopupClose();
    refetchPurchaserequestheaderData();
  };

  const handleSentBackPopupOpen = (request_number: string, flow_level: number) => {
    setSentBackPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: { request_number, remarks: '', level: flow_level }
    }));
  };

  const handleSentBackPopupClose = () => {
    setSentBackPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '', level: '' }
    }));
  };

  const handleCancelPopupOpen = (request_number: string) => {
    setCancelPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: { request_number, remarks: '' }
    }));
  };

  const handleCancelPopupClose = () => {
    setCancelPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '' }
    }));
  };

  const handleCancelRemarksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCancelPopup((prev) => ({
      ...prev,
      data: { ...prev.data, remarks: value }
    }));
  };

  const handleCancelSubmit = async () => {
    const { request_number, remarks } = cancelPopup.data;
    if (!remarks.trim()) {
      alert('Remarks cannot be empty');
      return;
    }
    const COMPANY_CODE = user?.company_code || '';
    const loginid = user?.loginid || '';
    const createPRValue = createPR ? 'Y' : 'N';
    await GmPfServiceInstance.updatecancelrejectsentback('CANCELLED', request_number, COMPANY_CODE, loginid, '0', remarks, createPRValue);
    handleCancelPopupClose();
    refetchPurchaserequestheaderData();
  };

  const handleActions = async (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    const REQUEST_NUMBER = rowOriginal.request_number;
    const FLOW_LEVEL = rowOriginal.flow_level_running;

    switch (actionType) {
      case 'view':
        handleEditPurchaserequestheader(rowOriginal);
        break;
      case 'reject':
        handleRejectPopupOpen(REQUEST_NUMBER);
        break;
      case 'sentback':
        handleSentBackPopupOpen(REQUEST_NUMBER, Number(FLOW_LEVEL));
        break;
      case 'cancel':
        handleCancelPopupOpen(REQUEST_NUMBER);
        break;
    }
  };

  const handleDeletePurchaserequestheader = async () => {
    await PfSerivceInstance.deleteMasters('pf', 'purchaserequestheader', Object.keys(rowSelection));
    setRowSelection({});
    refetchPurchaserequestheaderData();
  };

  //------------------useEffect----------------

  useEffect(() => {
    setToggleFilter(null as any);
    return () => {};
  }, []);

  //----------------Filter and sorting ----------------
  const handleFilterChange = (value: ISearch['search']) => {
    setSearchData((prevData) => {
      return {
        ...prevData,
        search: value
      };
    });
  };

  const handleSortingChange = (sorting: SortingState) => {
    setSearchData((prevData) => {
      return {
        ...prevData,
        sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
      };
    });
  };

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    setSearchData((prevData) => ({
      ...prevData,
      search: [[{ field_name: 'global', field_value: value }]] as ISearch['search']
    }));
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            //style={{ marginBottom: '20px' }}
          />
        </Box>
        <Button
          variant="outlined"
          onClick={handleDeletePurchaserequestheader}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
      </div>
      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="request_number"
        data={PurchaserequestheaderData?.tableData || []}
        columns={columns}
        count={PurchaserequestheaderData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isPurchaserequestheaderFetchLoading}
        toggleFilter={toggleFilter}
        handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
        hasPagination={true}
      />
      {PurchaserequestheaderFormPopup.action.open &&
        (costUser === 'YES' &&
        (PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.startsWith('BUDGET') ||
          !PurchaserequestheaderFormPopup.data.isEditMode) ? (
          <UniversalDialog
            action={{ ...PurchaserequestheaderFormPopup.action }}
            onClose={togglePurchaserequestheaderPopup}
            title={PurchaserequestheaderFormPopup.title}
            hasPrimaryButton={false}
          >
            <AddBudgetrequestPfForm
              request_number={PurchaserequestheaderFormPopup.data.request_number}
              onClose={togglePurchaserequestheaderPopup}
              isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
              existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
            />
          </UniversalDialog>
        ) : // For other users, open the corresponding form based on the request_number
        PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.includes('PO$') ? (
          <PurchaseOrderReport poNumber={PurchaserequestheaderFormPopup.data.request_number} onClose={togglePurchaserequestheaderPopup} />
        ) : (
          <UniversalDialog
            action={{ ...PurchaserequestheaderFormPopup.action }}
            onClose={togglePurchaserequestheaderPopup}
            title={PurchaserequestheaderFormPopup.title}
            hasPrimaryButton={false}
          >
            <AddPurchaserequestPfForm
              request_number={PurchaserequestheaderFormPopup.data.request_number}
              onClose={togglePurchaserequestheaderPopup}
              isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
              isViewMode={PurchaserequestheaderFormPopup.data.isViewMode}
              existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
            />
          </UniversalDialog>
        ))}
      {rejectPopup.action.open && (
        <UniversalDialog
          action={{ ...rejectPopup.action }}
          onClose={handleRejectPopupClose}
          title={rejectPopup.title}
          hasPrimaryButton={true}
          primaryButonTitle="Submit"
          onSave={handleRejectSubmit}
        >
          <TextField label="Remarks" value={rejectPopup.data.remarks} onChange={handleRejectRemarksChange} fullWidth multiline rows={4} />
        </UniversalDialog>
      )}
      {sentBackPopup.action.open && (
        <UniversalDialog
          action={{ ...sentBackPopup.action }}
          onClose={handleSentBackPopupClose}
          title={sentBackPopup.title}
          hasPrimaryButton={false}
        >
          <SentBackPopup
            request_number={sentBackPopup.data.request_number}
            flowLevel={sentBackPopup.data.level}
            onClose={handleSentBackPopupClose}
            onLevelChange={(level) => setSentBackPopup((prev) => ({ ...prev, data: { ...prev.data, level } }))}
            onRemarksChange={(remarks) => setSentBackPopup((prev) => ({ ...prev, data: { ...prev.data, remarks } }))}
          />
        </UniversalDialog>
      )}
      {cancelPopup.action.open && (
        <UniversalDialog
          action={{ ...cancelPopup.action }}
          onClose={handleCancelPopupClose}
          title={cancelPopup.title}
          hasPrimaryButton={true}
          primaryButonTitle="Submit"
          onSave={handleCancelSubmit}
        >
          <div>
            <TextField label="Remarks" value={cancelPopup.data.remarks} onChange={handleCancelRemarksChange} fullWidth multiline rows={4} />
            <FormControlLabel control={<Checkbox checked={createPR} onChange={(e) => setCreatePR(e.target.checked)} />} label="Create PR" />
          </div>
        </UniversalDialog>
      )}
    </div>
  );
};

export default POCancel;
// function refetchPurchaserequestheaderData() {
//   throw new Error('Function not implemented.');
// }
