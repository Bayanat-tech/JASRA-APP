import { ArrowDownOutlined, ArrowUpOutlined, EllipsisOutlined, InboxOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Box,
  CardContent,
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
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Row,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import ColumnFilter from 'components/filters/ColumnFilter';
import { ISearch } from 'components/filters/SearchFilter';
import TablePaginationActions from 'components/third-party/ReactTablePagination';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import pickingServiceInstance from 'service/wms/transaction/outbound/service.pickingDetailsWms';
import { TableActionButtons } from 'types/common.types';
import { getPathNameList } from 'utils/functions';
import { ITEM_HEIGHT, rowsPerPageOptions } from './CustomDataTables';

// Define the type for the props of the component
type ISubReactTable = {
  columns: ColumnDef<any>[]; // Column definitions
  row: Row<any>; // Row data
  hasPagination: boolean; // Flag to indicate if pagination is enabled
  filter?: ISearch; // Filter data
  handleExportData?: () => void; // Function to handle data export
  handleSortingChange?: (sorting: SortingState) => void; // Function to handle sorting change
  tableActions?: string[]; // Table action buttons
  customData: any; // Custom data
};
const ReactSubTable = (props: ISubReactTable) => {
  //------------------constanst------------
  const {
    columns,
    row,
    hasPagination = true,
    filter = { search: [] as ISearch['search'], sort: {} as ISearch['sort'] },
    handleExportData = () => {},
    tableActions
  } = props;
  const [sorting, setSorting] = useState<SortingState>([]); // State for sorting
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // State for column filters
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] }); // State for pagination data
  const [page, setPage] = useState<number>(0); // State for current page
  const [rowsPerPage, setRowsPerPage] = useState<number>(rowsPerPageOptions[0]); // State for rows per page
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // State for anchor element
  const openMenu = Boolean(anchorEl); // State for menu open
  const [filterData, setFilterData] = useState<ISearch>(filter as ISearch); // State for filter data
  const location = useLocation(); // Get current location
  const pathNameList = getPathNameList(location.pathname); // Get path name list

  //----------- useQuery--------------
  const { data, isFetching: isDataFetching } = useQuery({
    queryKey: [`${row.index}`, filterData, paginationData],
    queryFn: () => pickingServiceInstance.getPickingItemStockDetails(paginationData, filterData),
    enabled: !!filterData && filterData.search.length > 1
  }); // Fetch data using react-query

  //---------------table instance-----------
  const subTableInstance = useReactTable({
    //-------basic-----
    state: {
      columnFilters,
      sorting
    },
    //-------pagination-----
    initialState: { pagination: { pageIndex: page, pageSize: rowsPerPage } },
    pageCount: data?.count,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    //-------sorting-----
    enableSorting: true,
    enableMultiSort: false,
    manualSorting: true,
    onSortingChange: setSorting,
    //---------------filter-----------
    manualFiltering: true,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    data: (data?.tableData as any[]) ?? [],
    columns
  }); // Create table instance

  //------------handlers----------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage }); // Set pagination data
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    event?.preventDefault();
    setPage(newPage); // Set current page
    handleChangePagination(newPage, rowsPerPage); // Handle pagination change
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Set rows per page
    setPage(0); // Reset to first page
    handleChangePagination(0, parseInt(event.target.value, 10)); // Handle pagination change
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Set anchor element for menu
  };

  const handleClose = () => {
    setAnchorEl(null); // Close menu
  };

  const handleFilterChange = (value: ISearch['search']) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        search: [...filter?.search, ...value] // Update filter data
      };
    });
  };

  const handleSortingChange = (sorting: SortingState) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true } // Update sorting data
      };
    });
  };

  const transformFilterStructure = () => {
    let transformedFilters: ISearch['search'] = [];

    // Map each column ID to its corresponding filter type
    const columnFilterTypes = columns.reduce((acc, column) => {
      const filterVariant = (column?.meta as any)?.filterVariant;
      acc[column.id as string] =
        filterVariant === 'select' ? 'exactmatch' : filterVariant === 'range' ? 'range' : filterVariant === 'date' ? 'Date' : 'contains';
      return acc;
    }, {} as { [key: string]: string });

    // Process columnFilters if they exist and are not empty
    if (columnFilters?.length) {
      transformedFilters = columnFilters.flatMap((columnFilter) => {
        const filterType = columnFilterTypes[columnFilter.id];
        const filterValue = columnFilter.value as string[];

        // Range filters
        if (filterType === 'range' && filterValue?.length) {
          return filterValue.map((value, index) => [
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
    setRowsPerPage(20); // Reset rows per page
    setPage(0); // Reset to first page
    handleChangePagination(0, 20); // Handle pagination change

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!!sorting && sorting.length > 0) handleSortingChange?.(sorting); // Handle sorting change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  useEffect(() => {
    if (!!columnFilters && columnFilters.length > 0) transformFilterStructure(); // Transform filter structure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  useEffect(() => {
    switch (pathNameList[pathNameList.length - 1]) {
      case 'picking_details': {
        filter.search = [...filter.search, [{ field_name: 'prod_code', field_value: row.original.prod_code, operator: 'exactmatch' }]];
        setFilterData((prev) => {
          return {
            ...prev,
            search: [...prev.search, [{ field_name: 'prod_code', field_value: row.original.prod_code, operator: 'exactmatch' }]]
          };
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const tableActionButtons: TableActionButtons = {
    export: {
      key: 'export',
      title: 'Export',
      icon: <UploadOutlined />,
      handler: () => handleExportData
    }
  }; // Define table action buttons
  return (
    <Box sx={{ py: 3, pl: { xs: 3, sm: 5, md: 6, lg: 10, xl: 12 } }}>
      {/*----------------Table----------------*/}
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ padding: 1 }}>
        {/*----------------Export And Import----------------*/}
        <div>
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
              ?.map((eachAction) => tableActionButtons[eachAction as keyof typeof tableActionButtons])
              .filter((option) => option) // Filter out undefined values
              .map((option) => (
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
      </Stack>
      <TableContainer component={Paper} className="border border-gray-200 custom-scrollbar" elevation={0} sx={{ maxHeight: 700 }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            {subTableInstance.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableCell
                      key={header.id}
                      className="select-none"
                      style={
                        {
                          // position: 'sticky'
                          // zIndex: 1
                        }
                      }
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div className="flex justify-center" onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <ArrowUpOutlined className="pl-2" />, // Ascending sort icon
                              desc: <ArrowDownOutlined className="pl-2" /> // Descending sort icon
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                          <div className="flex justify-center">
                            {header.column.getCanFilter() ? <ColumnFilter column={header.column} /> : null} {/* Render column filter */}
                          </div>
                        </>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          ;
          {isDataFetching ? (
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
              {!!data && data?.tableData?.length > 0 ? (
                <TableBody>
                  {subTableInstance.getRowModel().rows.map((row) => {
                    return (
                      <>
                        <TableRow hover key={row.id}>
                          {row.getVisibleCells().map((cell) => {
                            return (
                              <TableCell className="p-0 h-fit w-fit" key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())} {/* Render cell content */}
                              </TableCell>
                            );
                          })}
                        </TableRow>
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
          {hasPagination && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={rowsPerPageOptions}
                  colSpan={12}
                  count={(data?.count || data?.tableData.length) ?? 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage} // Handle page change
                  onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page change
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReactSubTable;
