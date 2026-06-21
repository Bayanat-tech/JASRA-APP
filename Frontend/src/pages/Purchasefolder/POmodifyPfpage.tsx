// import { PlusOutlined } from '@ant-design/icons';
// import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
//import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
// import UniversalDialog from 'components/popup/UniversalDialog';
//import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
// import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import PomodifyForm from 'components/forms/Purchaseflow/ModifyPoPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVPurchaserequestheader } from './type/purchaserequestheader_pf-types';
import { ColDef } from 'ag-grid-community';
import CustomAgGrid from 'components/grid/CustomAgGrid';
//import { TCostmaster } from './type/costmaster-pf-types';

const POmodifyPfPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [searchData] = useState<ISearch>();


  // const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
  //   action: {
  //     open: false,
  //     fullWidth: true,
  //     maxWidth: false
  //   },
  //   title: 'Purchase Request',
  //   data: { existingData: {}, isEditMode: false, request_number: undefined } // Initialize request_number
  // });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Document Number',
        field: 'document_number',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Request Date',
        field: 'request_date',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Project Name',
        field: 'project_name',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Supplier',
        field: 'supplier',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Actions',
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );


  //----------- useQuery--------------
  const children = permissions?.[app.toUpperCase()]?.children || {}; // Ensure it's always an object

  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());

  console.log('Resolved Module Key:', moduleKey);

  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  console.log('Resolved Serial Number:', serialNumber);

  const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  console.log('Permission Check:', permissionCheck);


  const { data: PurchaserequestheaderData, refetch: refetchPurchaserequestheaderData } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData],
    queryFn: () => PfSerivceInstance.getMasters('pf', 'po_modify_rate_change', undefined, searchData),
    enabled: permissionCheck // Enable query only if user has permissions
  });


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestNumber, setSelectedRequestNumber] = useState<string | undefined>();

  const handleEditPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    setSelectedRequestNumber(existingData.request_number);
    setIsModalOpen(true);
  };

  const handleFormExit = () => {
    setIsModalOpen(false);
    refetchPurchaserequestheaderData();
  };

  // const togglePurchaserequestheaderPopup = (refetchData?: boolean) => {
  //   if (PurchaserequestheaderFormPopup.action.open && refetchData) {
  //     refetchPurchaserequestheaderData();
  //   }
  //   setPurchaserequestheaderFormPopup((prev) => ({
  //     ...prev,
  //     data: { isEditMode: false, existingData: {}, request_number: undefined }, // Reset request_number
  //     action: { ...prev.action, open: !prev.action.open }
  //   }));
  // };

  const handleActions = (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    if (actionType === 'edit') handleEditPurchaserequestheader(rowOriginal);
  };


  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">

      </div>

      <CustomAgGrid
        rowData={PurchaserequestheaderData?.tableData || []}
        columnDefs={columnDefs}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        paginationPageSize={1000}
        pagination={true}
        height="500px"
      />
      {selectedRequestNumber && (
        <PomodifyForm
          request_number={selectedRequestNumber}
          onExit={handleFormExit}
          open={isModalOpen}
        />
      )}
    </div>
  );
};

export default POmodifyPfPage;
