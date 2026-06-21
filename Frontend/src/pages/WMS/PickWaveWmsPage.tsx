import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { FormattedMessage } from 'react-intl';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import pickwaveServiceInstance from 'service/GM/service.pickwave_wms';

// import Pick Wave Table
import { TPickWave } from './types/PickWave-wms.types';

//import pickwave Form
import AddPickWaveWmsForm from 'components/forms/AddPickWaveWmsForm';

const PickWaveWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [PickWaveFormPopup, setPickWaveFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add PickWave" />,
    data: { existingData: {}, isEditMode: false }
  });

  // First need to add TpickWave in WMS/TYPES
  const columns = useMemo<ColumnDef<TPickWave>[]>(
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

        accessorFn: (row) => row.wave_code,
        id: 'wave_code',
        header: () => <span>Wave Code</span>
      },
      {
        accessorFn: (row) => row.wave_name,
        id: 'wave_name',
        header: () => <span>Wave Name</span>
      },
      {
        accessorFn: (row) => row.company_code,
        id: 'company_code',
        header: () => <span>Company Code</span>
      },
      {
        accessorFn: (row) => row.indicator,
        id: 'indicator',
        header: () => <span>Indicator</span>
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
    data: pickwave_data,
    isFetching: isPickWaveFetchLoading,
    refetch: refetchPickWaveData
  } = useQuery({
    queryKey: ['pickwave_data', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
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

  const handleEditPickWave = (existingData: TPickWave) => {
    setPickWaveFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Pick Wave',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const togglePickWavePopup = (refetchData?: boolean) => {
    if (PickWaveFormPopup.action.open === true && refetchData) {
      refetchPickWaveData();
    }
    setPickWaveFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TPickWave) => {
    actionType === 'edit' && handleEditPickWave(rowOriginal);
  };

  const handleDeletePickWave = async () => {
    await pickwaveServiceInstance.deletePickWave(Object.keys(rowSelection));
    console.log('called', rowSelection);

    await WmsSerivceInstance.deleteMasters('wms', 'PickWave', Object.keys(rowSelection));
    setRowSelection({});
    refetchPickWaveData();
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
            onClick={handleDeletePickWave}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }

        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => togglePickWavePopup()}>
          Pick Wave
        </Button>
      </div>

      <CustomDataTable
        tableActions={['export', 'import']}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="wave_code"
        data={pickwave_data?.tableData || []}
        columns={columns}
        count={pickwave_data?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isPickWaveFetchLoading}
        toggleFilter={toggleFilter}
      />

      {PickWaveFormPopup.action.open === true && (
        <UniversalDialog
          action={{ ...PickWaveFormPopup.action }}
          onClose={togglePickWavePopup}
          title={PickWaveFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddPickWaveWmsForm
            onClose={togglePickWavePopup}
            isEditMode={PickWaveFormPopup?.data?.isEditMode}
            existingData={PickWaveFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default PickWaveWmsPage;
