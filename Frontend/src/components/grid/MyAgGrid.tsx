import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { forwardRef, useMemo } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface CustomAgGridProps {
  rowData?: any[];

  // server-side (infinite)
  rowModelType?: 'clientSide' | 'infinite' | 'serverSide' | 'viewport';
  datasource?: any;
  cacheBlockSize?: number;
  cacheOverflowSize?: number;
  maxConcurrentDatasourceRequests?: number;
  infiniteInitialRowCount?: number;
  maxBlocksInCache?: number;
  blockLoadDebounceMillis?: number;

  columnDefs: ColDef[];
  onGridReady?: (params: GridReadyEvent) => void;
  onSortChanged?: (params: any) => void;
  onFilterChanged?: (params: any) => void;
  onPaginationChanged?: (params: any) => void;
  onSelectionChanged?: (params: any) => void;
  paginationPageSize?: number;
  height?: string;
  pagination?: boolean;
  paginationPageSizeSelector?: number[];
  editable?: boolean;
  rowSelection?: 'single' | 'multiple';
  getRowStyle?: (params: any) => any;
  rowHeight?: number;
  headerHeight?: number;
}

const MyAgGrid = forwardRef<AgGridReact, CustomAgGridProps>(
  (
    {
      rowData,
      rowModelType = 'clientSide',
      datasource,
      cacheBlockSize,
      cacheOverflowSize,
      maxConcurrentDatasourceRequests,
      infiniteInitialRowCount,
      maxBlocksInCache,
      blockLoadDebounceMillis,
      columnDefs,
      onGridReady,
      onSortChanged,
      onFilterChanged,
      onPaginationChanged,
      onSelectionChanged,
      paginationPageSize = 10,
      paginationPageSizeSelector,
      height = '470px',
      pagination = true,
      editable = false,
      rowSelection = 'single',
      getRowStyle,
      rowHeight,
      headerHeight
    },
    ref
  ) => {
    const defaultColDef = useMemo(
      () => ({
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 100,
        floatingFilter: false,
        editable,
        filterParams: {
          buttons: ['reset', 'apply'],
          closeOnApply: true
        }
      }),
      [editable]
    );

    const isInfinite = rowModelType === 'infinite';

    // Only pass pagination-related props in client-side mode.
    // In infinite mode AG Grid has its own pager; mixing them breaks things.
    const paginationProps = isInfinite
      ? {}
      : {
          pagination,
          paginationPageSize,
          paginationPageSizeSelector
        };

    const infiniteProps = isInfinite
      ? {
          rowModelType: 'infinite' as const,
          datasource,
          cacheBlockSize,          // must be <= backend max limit
          cacheOverflowSize,
          maxConcurrentDatasourceRequests: maxConcurrentDatasourceRequests ?? 1,
          infiniteInitialRowCount: infiniteInitialRowCount ?? 1,
          maxBlocksInCache: maxBlocksInCache ?? 2,
          blockLoadDebounceMillis: blockLoadDebounceMillis ?? 300
        }
      : { rowModelType: 'clientSide' as const, rowData };

    return (
      <div
        className="ag-theme-alpine custom-ag-theme"
        style={{ height, width: '100%', border: '1px solid #ddd' } as React.CSSProperties}
      >
        <style>{`
          .ag-column-drop-title { font-size: 21px !important; }
          .ag-header-cell-text { font-size: 13px !important; }
          .custom-ag-theme .ag-header-cell {
            font-weight: 600;
            font-size: 11px !important;
          }
        `}</style>

        <AgGridReact
          ref={ref}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          onGridReady={onGridReady}
          suppressCellFocus
          animateRows
          enableCellTextSelection
          suppressRowClickSelection
          onSortChanged={onSortChanged}
          onFilterChanged={onFilterChanged}
          onPaginationChanged={onPaginationChanged}
          onSelectionChanged={onSelectionChanged}
          suppressMenuHide={false}
          multiSortKey="ctrl"
          getRowStyle={getRowStyle}
          {...(rowHeight ? { rowHeight } : {})}
          {...(headerHeight ? { headerHeight } : {})}
          {...paginationProps}
          {...infiniteProps}
        />
      </div>
    );
  }
);

MyAgGrid.displayName = 'MyAgGrid';

export default MyAgGrid;