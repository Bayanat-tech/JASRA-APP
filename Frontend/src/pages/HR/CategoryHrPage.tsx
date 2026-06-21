import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddCategoryForm from 'components/forms/HR/AddCategoryHrForm';
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
import { TCategory } from './type/AddCategoryHr.types';

const CategoryHrPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [categoryFormPopup, setCategoryFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Category',
    data: { existingData: {}, isEditMode: false }
  });

  const columns = useMemo<ColumnDef<TCategory>[]>(
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
        accessorFn: (row: TCategory) => row.category_code,
        id: 'category_code',
        header: () => <span>Category Code</span>
      },
      {
        accessorFn: (row: TCategory) => row.category_name,
        id: 'category_name',
        header: () => <span>Category Name</span>
      },
      {
        accessorFn: (row: TCategory) => row.category_short_name,
        id: 'category_short_name',
        header: () => <span>Category Short Name</span>
      },
      {
        accessorFn: (row: TCategory) => row.remarks,
        id: 'remarks',
        header: () => <span>Remarks</span>
      },
      {
        accessorFn: (row: TCategory) => row.status,
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
    data: CategoryData,
    isFetching: isCategoryFetchLoading,
    refetch: refetchCategoryData
  } = useQuery({
    queryKey: ['Category_data', searchData, paginationData],
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

  const handleEditCategory = (existingData: TCategory) => {
    setCategoryFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: 'Edit Category',
      data: { existingData, isEditMode: true }
    }));
  };

  const toggleCategoryPopup = (refetchData?: boolean) => {
    if (categoryFormPopup.action.open === true && refetchData) {
      refetchCategoryData();
    }
    setCategoryFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: TCategory) => {
    if (actionType === 'edit') handleEditCategory(rowOriginal);
    // if (actionType === 'delete') handleDeleteCategory();
  };

  const handleDeleteCategory = async () => {
    console.log(rowSelection);

    const confirmDelete = window.confirm('Are you sure you want to delete the selected categories?');
    if (confirmDelete) {
      await HrServiceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
      setRowSelection({});
      refetchCategoryData();
    }
  };

  //------------------useEffect----------------
  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Button
          variant="outlined"
          onClick={handleDeleteCategory}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleCategoryPopup()}>
          Category
        </Button>
      </div>
      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="category_code"
        data={CategoryData?.tableData || []}
        columns={columns}
        count={CategoryData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isCategoryFetchLoading}
        toggleFilter={toggleFilter}
        hasPagination={true}
      />
      {!!categoryFormPopup && categoryFormPopup.action.open && (
        <UniversalDialog
          action={{ ...categoryFormPopup.action }}
          onClose={toggleCategoryPopup}
          title={categoryFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddCategoryForm
            onClose={toggleCategoryPopup}
            isEditMode={categoryFormPopup?.data?.isEditMode}
            existingData={categoryFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default CategoryHrPage;
