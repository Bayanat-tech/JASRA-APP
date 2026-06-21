import { EllipsisOutlined, InboxOutlined, PrinterOutlined, UploadOutlined } from '@ant-design/icons';
import {
  alpha,
  Button,
  CardContent,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import ImportData from 'components/popup/ImportData';
import UniversalDialog from 'components/popup/UniversalDialog';
import TablePaginationActions from 'components/third-party/ReactTablePagination';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { TableActionButtons } from 'types/common.types';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import FilterCustomDataTable from './FilterCustomDataTable';
import { IReactTable } from './interfaces/tableInterface';
import ReactSubTable from './ReactSubTable';

//------interface---
// Define the type for the expanded state
type ExpandedState = true | Record<string, boolean>;

// Constants for item height and rows per page options
export const ITEM_HEIGHT = 48;
export const rowsPerPageOptions: number[] = [20, 50, 100];
const CustomDataTable = (props: IReactTable) => {
  //-------------constants------------------
  const {
    //----basic----
    data, // Data to be displayed in the table
    columns, // Column definitions
    subColumns, // Sub-column definitions
    enableMultiRowSelection = true, // Enable multi-row selection by default
    customFilter = <></>, // Custom filter component
    //----pagination----
    subRowCustomData = {}, // Custom data for sub-rows
    hasPagination = true, // Enable pagination by default
    hasSubRowPagination = false, // Disable sub-row pagination by default
    subRowFilter = {} as ISearch, // Filter for sub-rows
    subRowsActionbuttons = [], // Action buttons for sub-rows
    onPaginationChange = () => {}, // Function to handle pagination change
    //----delete----
    row_id, // Row ID
    rowSelection, // Row selection state
    setRowSelection, // Function to set row selection state
    //----import and export----
    tableActions, // Table action buttons
    handleImportData, // Function to handle data import
    handleExportData, // Function to handle data export
    handleExportSubRow = () => {}, // Function to handle sub-row data export
    //----sorting and filter----
    handleFilterChange, // Function to handle filter change
    handleSortingChange, // Function to handle sorting change
    //--------handle select all rows------
    isSelectAllRows, // Flag to indicate if all rows are selected
    selectedAllRows, // State for selected all rows
    selectedAllData, // State for selected all data
    setSelectedAllData, // Function to set selected all data
    seeMoreData // Function to see more data
  } = props;

  const theme = useTheme(); // Get the current theme
  const backColor = alpha(theme?.palette?.primary?.lighter, 0.1); // Set background color with alpha
  const contentRef = useRef<HTMLDivElement>(null); // Reference for printing content
  const handlePrint = useReactToPrint({ contentRef }); // Function to handle printing
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // State for anchor element
  const openMenu = Boolean(anchorEl); // State for menu open
  const [page, setPage] = useState<number>(0); // State for current page
  const [rowsPerPage, setRowsPerPage] = useState<number>(rowsPerPageOptions[0]); // State for rows per page
  const [importFormPopup, setImportFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'xs'
    },
    title: 'Import Files'
  }); // State for import form popup
  const [sorting, setSorting] = useState<SortingState>([]); // State for sorting
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // State for column filters
  const [expanded, setExpanded] = useState<ExpandedState>({}); // State for expanded rows

  const tableInstance = useReactTable({
    //-------basic-----
    state: {
      rowSelection,
      columnFilters,
      sorting,
      expanded
    },
    data,
    columns,
    enableMultiRowSelection,
    //-------delete-----
    getRowId: (row) => row[row_id as string], // Get row ID
    enableRowSelection: true, // Enable row selection
    onRowSelectionChange: setRowSelection, // Handle row selection change
    //-------pagination-----
    initialState: { pagination: { pageIndex: page, pageSize: rowsPerPage } }, // Initial pagination state
    pageCount: props?.count, // Page count
    manualPagination: true, // Enable manual pagination
    getCoreRowModel: getCoreRowModel(), // Get core row model
    getPaginationRowModel: getPaginationRowModel(), // Get pagination row model
    //-------sorting-----
    enableSorting: true, // Enable sorting
    enableMultiSort: false, // Disable multi-sort
    manualSorting: true, // Enable manual sorting
    onSortingChange: setSorting, // Handle sorting change
    //--------------expanding---------
    manualExpanding: true, // Enable manual expanding
    onExpandedChange: setExpanded, // Handle expanded change
    getExpandedRowModel: getExpandedRowModel(), // Get expanded row model
    //---------------filter-----------
    manualFiltering: true, // Enable manual filtering
    onColumnFiltersChange: setColumnFilters, // Handle column filters change
    getFilteredRowModel: getFilteredRowModel() // Get filtered row model
  });

  //------------------functions------------
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    event?.preventDefault();
    setPage(newPage); // Set current page
    onPaginationChange(newPage, rowsPerPage); // Handle pagination change
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Set rows per page
    setPage(0); // Reset to first page
    onPaginationChange(0, parseInt(event.target.value, 10)); // Handle pagination change
  };

  const handleImport = () => {
    setImportFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Import Data'
      };
    }); // Toggle import form popup
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Set anchor element for menu
  };

  const handleClose = () => {
    setAnchorEl(null); // Close menu
  };

  const transformFilterStructure = () => {
    let transformedFilters: ISearch['search'] = [];

    // Map each column ID to its corresponding filter type
    const columnFilterTypes = columns.reduce((acc, column) => {
      const filterVariant = (column?.meta as any)?.filterVariant;
      acc[column.id as string] =
        filterVariant === 'select' ? 'exactmatch' : filterVariant === 'range' ? 'range' : filterVariant === 'date' ? 'between' : 'contains';
      return acc;
    }, {} as { [key: string]: string });

    // Process columnFilters if they exist and are not empty
    if (columnFilters?.length) {
      transformedFilters = columnFilters.flatMap((columnFilter) => {
        const filterType = columnFilterTypes[columnFilter.id];
        const filterValue = columnFilter.value as string[];

        // Range filters
        if (filterType === 'range' && filterValue?.length) {
          return filterValue?.map?.((value, index) => [
            {
              field_name: columnFilter.id,
              field_value: value?.length ? value : '0',
              operator: index === 0 ? '>=' : '<='
            }
          ]);
        }

        // Other filter types, wrapped in an array of arrays
        return [
          [
            {
              field_name: columnFilter.id,
              field_value: columnFilter.value as string | string[] | number | boolean | Date,
              operator: filterType
            }
          ]
        ];
      });
    }

    handleFilterChange?.(transformedFilters); // Handle filter change
  };

  //-----------------useEffects------------
  useEffect(() => {
    if (props.toggleFilter !== null) {
      setRowsPerPage(20); // Reset rows per page
      setPage(0); // Reset to first page
      onPaginationChange(0, 20); // Handle pagination change
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.toggleFilter]);

  useEffect(() => {
    if (!!sorting && sorting.length > 0) handleSortingChange?.(sorting); // Handle sorting change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  useEffect(() => {
    if (columnFilters.length >= 0) transformFilterStructure(); // Transform filter structure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  const tableActionButtons: TableActionButtons = {
    export: {
      key: 'export',
      title: 'Export',
      icon: <UploadOutlined />,
      handler: handleExportData
    },
    import: {
      key: 'import',
      title: 'Import',
      icon: <UploadOutlined />,
      handler: handleImport
    },
    print: {
      key: 'print',
      title: 'Print',
      icon: <PrinterOutlined />,
      handler: handlePrint
    }
  }; // Define table action buttons

  useEffect(() => {
    if (!selectedAllRows && setSelectedAllData) {
      setSelectedAllData(false); // Reset selected all data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAllRows]);
  return (
    <Paper>
      <div className="flex justify-between p-0 text-sm ">
        {customFilter}
        {/*----------------Export And Import----------------*/}
        {!!tableActions && tableActions?.length > 0 && (
          <div className="flex items-center">
            <IconButton onClick={handleClick}>
              <EllipsisOutlined rotate={90} />
            </IconButton>
            <Menu
              id="long-menu"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleClose}
              slotProps={{
                paper: {
                  style: {
                    maxHeight: ITEM_HEIGHT * 4.5,
                    maxWidth: '100px',
                    width: '20ch'
                  }
                }
              }}
            >
              {tableActions
                ?.map?.((eachAction) => tableActionButtons[eachAction as keyof typeof tableActionButtons])
                .filter((option) => option) // Filter out undefined values
                ?.map?.((option) => (
                  <MenuItem
                    key={option.key}
                    onClick={() => {
                      option?.handler?.(); // Execute the handler for the action
                      handleClose(); // Close the menu
                    }}
                  >
                    {option.title}
                  </MenuItem>
                ))}
            </Menu>
          </div>
        )}
      </div>

      <TableContainer component={Paper} className="border-gray-200 custom-scrollbar max-h-lvh" elevation={0} ref={contentRef}>
        {/*----------------Table----------------*/}
        <Table sx={{ minWidth: 700 }} stickyHeader size="small">
          <TableHead>
            {tableInstance?.getHeaderGroups()?.map?.((headerGroup) => (
              <TableRow key={headerGroup.id} className="border border-gray-200">
                <TableCell
                  key={'no'}
                  className="select-none text-sm "
                  style={{
                    position: 'sticky',
                    zIndex: 1,
                    textTransform: 'unset'
                  }}
                  size="small"
                  align="left"
                >
                  No.
                </TableCell>
                {headerGroup?.headers?.map?.((header) => {
                  return (
                    <TableCell
                      align="right"
                      key={header.id}
                      className="select-none p-0 text-sm "
                      style={{
                        position: 'sticky',
                        zIndex: 1,
                        textTransform: 'unset'
                      }}
                      colSpan={header.colSpan}
                      size="small"
                    >
                      {header.isPlaceholder ? null : <FilterCustomDataTable header={header} />}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          {isSelectAllRows && selectedAllRows && setSelectedAllData && (
            <TableRow className="w-full bg-gray-200">
              <TableCell colSpan={17}>
                {selectedAllData ? (
                  <Button color="secondary" onClick={() => setSelectedAllData(false)} className="hover:bg-gray-100 w-full">
                    clear {props?.count || data.length} Rows
                  </Button>
                ) : (
                  <Button color="secondary" onClick={() => setSelectedAllData(true)} className="hover:bg-gray-100 w-full">
                    Select {props?.count || data.length} Rows
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )}

          {props?.isDataLoading ? (
            <TableBody>
              <TableCell colSpan={12}>
                <Stack>
                  <Skeleton height={50} />
                  <Skeleton height={50} />
                  <Skeleton height={50} />
                  <Skeleton height={90} />
                </Stack>
              </TableCell>
            </TableBody>
          ) : (
            <>
              {!!data && !!data.length ? (
                <TableBody>
                  {tableInstance?.getRowModel()?.rows?.map?.((row, rowIndex) => {
                    return (
                      <>
                        <TableRow hover key={row.id} className="row-span-1 h-fit">
                          <TableCell className="text-sm" key={(rowIndex + 1) * (page + 1)} size="small">
                            {rowIndex + 1 + page * rowsPerPage} {/* Display row number */}
                          </TableCell>
                          {row?.getVisibleCells()?.map?.((cell) => {
                            const isDateInValid = cell.getValue() !== 'Invalid Date';
                            return (
                              <TableCell className="p-0 h-4 w-fit text-sm" key={cell.id} size="small">
                                {!isDateInValid ? ' ' : flexRender(cell.column.columnDef.cell, cell.getContext())}{' '}
                                {/* Render cell content */}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        {row.getIsExpanded() && (
                          <TableRow
                            sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}
                            key={rowIndex.toString() + row.id.toString()}
                          >
                            <TableCell sx={{ py: 0 }} colSpan={12}>
                              <Collapse in={row.getIsExpanded()} timeout="auto" unmountOnExit>
                                <ReactSubTable
                                  handleExportData={handleExportSubRow}
                                  customData={subRowCustomData}
                                  columns={subColumns as ColumnDef<any>[]}
                                  row={row}
                                  hasPagination={hasSubRowPagination}
                                  filter={subRowFilter}
                                  tableActions={subRowsActionbuttons}
                                />
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              ) : (
                <TableRow>
                  <TableCell colSpan={12}>
                    <CardContent className="flex justify-center w-full">
                      <Stack className="mt-4">
                        <InboxOutlined style={{ width: 50, height: 20, transform: 'scale(3)', color: 'GrayText' }} />
                        <Typography color={'GrayText'}>No Data</Typography>
                      </Stack>
                    </CardContent>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </Table>
      </TableContainer>
      {hasPagination && (
        <TableFooter className="flex p-0 justify-end " sx={{ maxHeight: 45, padding: 1 }}>
          <TableRow>
            <TablePagination
              size="small"
              rowsPerPageOptions={seeMoreData ? [...rowsPerPageOptions, 1000] : rowsPerPageOptions}
              colSpan={3}
              count={props?.count || data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage} // Handle page change
              onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page change
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      )}
      {!!importFormPopup && importFormPopup.action.open && !!handleImportData && (
        <UniversalDialog
          action={{ ...importFormPopup.action }}
          onClose={handleImport}
          title={importFormPopup.title}
          hasPrimaryButton={false}
        >
          <ImportData handleToggleImportDataPopup={handleImport} handleImportData={(values) => handleImportData?.(values)} />
        </UniversalDialog>
      )}
    </Paper>
  );
};

export default CustomDataTable;
