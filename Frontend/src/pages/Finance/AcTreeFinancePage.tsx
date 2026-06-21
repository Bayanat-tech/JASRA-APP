// Importing necessary components and hooks from various libraries
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import {
  Autocomplete,
  Box,
  Breadcrumbs,
  FilterOptionsState,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useEventCallback
} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import { TransitionProps } from '@mui/material/transitions';
// eslint-disable-next-line no-restricted-imports
import { useTreeItem2Utils } from '@mui/x-tree-view/hooks/useTreeItem2Utils/useTreeItem2Utils';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem2, TreeItem2Label, TreeItem2Props } from '@mui/x-tree-view/TreeItem2';
import { UseTreeItem2LabelSlotOwnProps } from '@mui/x-tree-view/useTreeItem2';
import { useQuery } from '@tanstack/react-query';
import CustomTooltip from 'components/CustomTooltip';
import AddAccountChildrenFinanceForm from 'components/forms/Finance/AddAccountChildrenFinanceForm';
import AddLevelFourFinanceForm from 'components/forms/Finance/AddLevelFourFinanceForm';
import AddLevelThreeFinanceForm from 'components/forms/Finance/AddLevelThreeFinanceForm';
import UniversalDelete from 'components/popup/UniversalDelete';
import UniversalDialog from 'components/popup/UniversalDialog';
import { matchSorter } from 'match-sorter';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import AcTreeServiceInstance from 'service/Finance/Accounts/Masters/GM/service.actree';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { convertTreeToReverseHierarchy, titleCase } from 'utils/functions';

// Define the type for tree items
export type TTreeItem = {
  id: string;
  label: string;
  parent_code?: string;
  level: number;
  children: TTreeItem[];
};

// Define the props for custom label component
interface CustomLabelProps extends UseTreeItem2LabelSlotOwnProps {
  id: string;
  level: number;
  ac_code: string;
  parent_code: string;
  item_name?: string;
  children_view: TTreeItem[];
  toggleItemEditing: () => void;
}

// Main component for the finance page
const AcTreeFinancePage = () => {
  // Define the type for ID and label
  type TIdLabel = {
    parent?: string[];
    id: string;
    label: string;
  };

  // State variables
  const [searchId, setSearchId] = useState<string | undefined>();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false);
  const [deleteLevel, setDeleteLevel] = useState<number>();
  const [deleteTitle, setDeleteTitle] = useState<string>('');
  const [deleteAcCode, setDeleteAcCode] = useState<string>();
  const [pos, setPos] = useState(false);
  const [accountFormPopup, setAccountFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Account" />,
    data: { level: null, ac_code: '', parent_code: '', isEditMode: false }
  });
  const [selectedItems, setSelectedItems] = useState<string>();
  const [idAndLable, setIdAndLabel] = useState<TIdLabel[]>([]);
  const [breadCrumbData, setBreadCrumData] = useState<{ [key: string]: string[] }>();

  // Custom tree item component
  const CustomTreeItem2 = React.forwardRef(function CustomTreeItem2(props: TreeItem2Props, ref: React.Ref<HTMLLIElement>) {
    const { publicAPI } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children
    });

    const item = publicAPI.getItem(props.itemId);
    return (
      <TreeItem2
        id={item.id as string}
        className="py-2"
        {...props}
        ref={ref}
        slots={{ label: CustomLabel }}
        label={item.id + '. ' + item.label}
        slotProps={{
          label: {
            id: item.id,
            level: item.level,
            parent_code: item.parent_code,
            children_view: item.children,
            item_name: item.label,
            ac_code: props.itemId
          } as CustomLabelProps
        }}
      />
    );
  });

  // Fetch tree data using react-query
  const { data: treeData, refetch: refetchTreeData } = useQuery({
    queryKey: ['ac_tree'],
    queryFn: () => AcTreeServiceInstance.getAcTree()
  });

  // Handler for deleting an account item
  const handleDelete = async () => {
    await AcTreeServiceInstance.deleteAccountItem(deleteLevel as number, deleteAcCode as string);
    setDeletePopup(false);
    refetchTreeData();
  };

  // Handler for opening delete popup
  const DeletePopup = ({ level, ac_code, title }: { level: number; ac_code: string; title: string }) => {
    setDeleteLevel(level);
    setDeleteAcCode(ac_code);
    setDeleteTitle(title);
    setDeletePopup(true);
  };

  // Handler for toggling the account form popup
  const handleTogglePopup = (level?: number, item_name?: string, ac_code?: string, parent_code?: string, refetchData?: boolean) => {
    if (accountFormPopup.action.open && refetchData) {
      refetchTreeData();
    }
    setAccountFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open, fullWidth: level === 5, maxWidth: Number(level) < 5 ? 'sm' : 'lg' },
        ...(prev.action.open === false && { title: `${ac_code ? 'Edit' : 'Add'} ${titleCase(item_name as string)}` }),
        data: {
          isEditMode: !!ac_code,
          ac_code,
          parent_code,
          level
        }
      };
    });
  };

  // Handler for closing the delete popup
  const handleCloseDelete = () => {
    setDeletePopup(false);
  };

  // Render the appropriate form based on the level
  const renderFrom = () => {
    switch (accountFormPopup.data.level) {
      case 3:
        return (
          <AddLevelThreeFinanceForm
            onClose={() => handleTogglePopup(undefined, undefined, undefined, undefined, true)}
            ac_code={accountFormPopup?.data?.ac_code}
            parent_code={accountFormPopup?.data?.parent_code}
            isEditMode={accountFormPopup?.data?.isEditMode}
          />
        );

      case 4:
        return (
          <AddLevelFourFinanceForm
            onClose={() => handleTogglePopup(undefined, undefined, undefined, undefined, true)}
            ac_code={accountFormPopup?.data?.ac_code}
            parent_code={accountFormPopup?.data?.parent_code}
            isEditMode={accountFormPopup?.data?.isEditMode}
          />
        );

      case 5:
        return (
          <AddAccountChildrenFinanceForm
            onClose={() => handleTogglePopup(undefined, undefined, undefined, undefined, true)}
            ac_code={accountFormPopup?.data?.ac_code}
            parent_code={accountFormPopup?.data?.parent_code}
            isEditMode={accountFormPopup?.data?.isEditMode}
          />
        );
    }
  };

  // Custom label component for tree items
  function CustomLabel({ children, children_view, item_name, ac_code, level, parent_code, id, ...other }: CustomLabelProps) {
    // Determine if the item is editable, deletable, and creatable
    const isEditable = level !== 2,
      isDeletable = children_view?.length === 0,
      isCreatable = level < 5;

    return (
      <TreeItem2Label
        id={id as string}
        {...other}
        sx={{
          fontWeight: level === 2 ? 'bold' : 'normal',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          justifyContent: 'space-between'
        }}
      >
        {children}
        <div className="flex space-x-1">
          {isEditable && (
            <IconButton
              size="small"
              disabled={!isEditable}
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePopup(level, item_name, ac_code, parent_code, false);
              }}
            >
              <EditOutlined className={`${isEditable && 'text-orange-400'}`} />
            </IconButton>
          )}
          <CustomTooltip message={!isDeletable && "Parent with children can't be deleted"}>
            <span>
              <IconButton
                size="small"
                disabled={!isDeletable}
                onClick={() => DeletePopup({ level: level, ac_code: ac_code, title: item_name as string })}
              >
                <DeleteOutlined className={`${isDeletable && 'text-red-400'}`} />
              </IconButton>
            </span>
          </CustomTooltip>
          {isCreatable && (
            <IconButton
              size="small"
              disabled={!isCreatable}
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePopup(level + 1, item_name as string, undefined, ac_code, false);
              }}
            >
              <PlusOutlined className={`${isCreatable && 'text-blue-400'}`} />
            </IconButton>
          )}
        </div>
      </TreeItem2Label>
    );
  }

  // Transition component for tree items
  function TransitionComponent(props: TransitionProps) {
    // const style = useSpring({
    //   to: {
    //     opacity: props.in ? 1 : 0,
    //     transform: `translate3d(${props.in ? 0 : 20}px,0,0)`
    //   }
    // });

    return (
      // <animated.div style={style}>
      <Collapse {...props} />
      // </animated.div>
    );
  }

  // Handler for changing selected items
  const handleSelectedItemsChange = (event: React.SyntheticEvent, ids: string | null) => {
    if (ids) setSelectedItems(ids);
  };

  // Function to collect IDs and labels from tree data
  const collectIdsAndLabels = useEventCallback(
    (data: any, result: TIdLabel[] = [], parent: string[] = [], groupedAccountData: Map<string, TIdLabel[]>) => {
      result.push({ id: data.id, label: data.label as string, parent: [...parent] });
      groupedAccountData.set(data.label.trim().toLowerCase()[0], [
        ...(groupedAccountData.get(data.label.trim().toLowerCase()[0]) ?? []),
        { id: data.id, label: data.label as string, parent: [...parent] }
      ]);

      if (data.children && data.children.length > 0) {
        data.children.forEach((child: any) => {
          collectIdsAndLabels(child, result, [...parent, data.id], groupedAccountData);
        });
      }

      return result;
    }
  );

  // Handler for changing expanded items
  const handleExpandedItemsChange = (event: any, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  // Handler for filtering options in autocomplete
  const handleFilter = (options: TIdLabel[], state: FilterOptionsState<TIdLabel>) => {
    return matchSorter(options, state.inputValue, {
      keys: ['label'],
      threshold: matchSorter.rankings.CONTAINS
    });
  };

  // Effect to set breadcrumb data and ID-label mapping
  useEffect(() => {
    if (treeData && treeData.length > 0) {
      setBreadCrumData(convertTreeToReverseHierarchy(treeData));
      let result: TIdLabel[] = [];
      const groupedAccountData: Map<string, TIdLabel[]> = new Map();
      treeData.forEach((eachData: any) => collectIdsAndLabels(eachData, result, [], groupedAccountData));
      if (result.length > 0) {
        setIdAndLabel(result);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData]);

  // Effect to handle scrolling to selected item
  useEffect(() => {
    setSelectedItems(searchId);
    const scrollElement = document.getElementById(searchId as string);
    if (scrollElement) {
      scrollElement.scrollIntoView({ block: 'center', behavior: 'auto' });
      setPos(true);
    }
  }, [searchId]);

  return (
    <Paper elevation={0} className="h-full" sx={{ width: { xs: '100%', md: '60%' } }}>
      <div className="p-5">
        {/* Check if treeData is available and has items */}
        {!!treeData && treeData.length > 0 ? (
          <div className="divide-y space-y-2">
            <Typography className="text-wrap">
              {/* Breadcrumbs for navigation */}
              <Breadcrumbs separator="›" aria-label="breadcrumb" className="sticky w-full">
                {breadCrumbData?.[`${selectedItems}`]?.map((eachData) => (
                  <Typography className="w-full text-xs ">
                    <FormattedMessage id={eachData} />
                  </Typography>
                ))}
              </Breadcrumbs>
            </Typography>

            <Box className="h-svh overflow-y-scroll custom-scrollbar">
              {/* Autocomplete for searching accounts */}
              <Autocomplete
                className="pb-6 pt-3 "
                id="act_code"
                value={!!searchId && searchId.length > 0 ? idAndLable.find((eachLable) => eachLable.id === searchId) || null : null}
                onChange={(event, value: TIdLabel | null) => {
                  if (value?.id) {
                    setSearchId(value?.id ?? null);
                    setSelectedItems(value?.id ?? null);
                    handleExpandedItemsChange(event, value?.parent ?? []);
                  }
                }}
                filterOptions={handleFilter}
                options={idAndLable}
                fullWidth
                autoHighlight
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Typography>{option.label}</Typography>
                  </li>
                )}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, optionValue) => option.id === optionValue.id}
                renderInput={(params) => <TextField placeholder="Search Account" {...params} />}
              />
              {/* RichTreeView for displaying tree structure */}
              <RichTreeView
                id="Richtreeview"
                expandedItems={expandedItems}
                selectedItems={selectedItems}
                onSelectedItemsChange={handleSelectedItemsChange}
                onExpandedItemsChange={handleExpandedItemsChange}
                items={treeData as TTreeItem[]}
                slots={{ item: CustomTreeItem2 }}
                slotProps={{ item: { slots: { groupTransition: TransitionComponent } } }}
              />
            </Box>
          </div>
        ) : (
          // Display skeletons if treeData is not available
          <Stack>
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={90} />
          </Stack>
        )}
      </div>
      <div>
        {/* IconButton for scrolling to top */}
        <IconButton
          style={{
            position: 'fixed',
            bottom: 50,
            right: 50,
            display: pos ? 'block' : 'none',
            background: 'white',
            borderRadius: '50%',
            color: 'black',
            padding: 5,
            justifyContent: 'center',
            width: 40,
            height: 40
          }}
          onClick={() => {
            const scrollElement = document.getElementById('Richtreeview');
            if (scrollElement) {
              scrollElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
              window.scroll({ top: 0, behavior: 'smooth' });
              setPos(false);
            }
          }}
        >
          <VerticalAlignTopIcon />
        </IconButton>
      </div>
      {/* UniversalDialog for account form popup */}
      {!!accountFormPopup && accountFormPopup.action.open && (
        <UniversalDialog
          onClose={() => handleTogglePopup(undefined, undefined, undefined, undefined, false)}
          action={{ ...accountFormPopup.action }}
          title={accountFormPopup.title}
          hasPrimaryButton={false}
        >
          {renderFrom()}
        </UniversalDialog>
      )}
      {/* UniversalDelete for delete confirmation */}
      {openDeletePopup === true && (
        <UniversalDelete open={openDeletePopup} handleClose={handleCloseDelete} title={deleteTitle} handleDelete={handleDelete} />
      )}
    </Paper>
  );
};

export default AcTreeFinancePage;
