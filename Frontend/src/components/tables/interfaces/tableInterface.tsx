import { ColumnDef, OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import { ReactNode } from 'react';

export interface IReactTable {
  //---parent table-----
  customFilter?: ReactNode;
  tableActions?: string[];
  count?: number;
  enableMultiRowSelection?: boolean;
  componentRef?: any;
  columns: ColumnDef<any>[];
  data: Array<any>;
  toggleFilter?: boolean | null;
  onPaginationChange?: (arg0: number, arg1: number) => void;
  isDataLoading?: boolean;
  hasPagination?: boolean;
  rowSelection?: RowSelectionState;
  setRowSelection?: OnChangeFn<RowSelectionState> | undefined;
  row_id?: string;
  handleImportData?: (values: any[]) => Promise<boolean>;
  handleExportData?: () => void;
  // handleGlobalFilterChange?: (value: string) => void;
  handleSortingChange?: (sorting: SortingState) => void;
  handleFilterChange?: (value: ISearch['search']) => void;
  //---sub table-----
  subColumns?: ColumnDef<any>[];
  hasSubRowPagination?: boolean;
  subRowsActionbuttons?: string[];
  subRowFilter?: ISearch;
  subRowCustomData?: any;
  handleExportSubRow?: () => void;
  isSelectAllRows?: boolean;
  selectedAllRows?: boolean;
  selectedAllData?: boolean;
  setSelectedAllData?: React.Dispatch<React.SetStateAction<boolean>>;
  seeMoreData?: boolean;
}
