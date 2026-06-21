import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { forwardRef, useMemo } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface CustomAgGridProps {
  rowData: any[];
  columnDefs: ColDef[];
  onGridReady?: (params: any) => void;
  onSortChanged?: (params: any) => void;
  onFilterChanged?: (params: any) => void;
  onPaginationChanged?: (params: any) => void;
  onSelectionChanged?: (params: any) => void;
  paginationPageSize?: number;
  height?: string;
  pagination?: boolean;
  paginationPageSizeOptions?: number[];
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
      columnDefs,
      onGridReady,
      onSortChanged,
      onFilterChanged,
      onPaginationChanged,
      onSelectionChanged,
      paginationPageSize = 10,
      paginationPageSizeSelector,
      height = '470px',
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
          closeOnApply: true,
        },
      }),
      [editable]
    );

    return (
      <div
        className="ag-theme-alpine custom-ag-theme"
        style={
          {
            height,
            width: '100%',
            border: '1px solid #ddd'
          } as React.CSSProperties
        }
      >
        <style>
          {`
            .ag-column-drop-title {
              font-size: 21px !important;
            }
            .ag-header-cell-text {
              font-size: 13px !important;
            }
            .custom-ag-theme .ag-header-cell {
              font-weight: 600;
              font-size: 11px !important;
            }
          `}
        </style>
        <AgGridReact
          ref={ref}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          pagination={true}
          paginationPageSize={paginationPageSize}
          onGridReady={onGridReady}
          suppressCellFocus={true}
          animateRows={true}
          enableCellTextSelection={true}
          suppressRowClickSelection={true}
          onSortChanged={onSortChanged}
          onFilterChanged={onFilterChanged}
          onPaginationChanged={onPaginationChanged}
          onSelectionChanged={onSelectionChanged}
          suppressMenuHide={false}
          multiSortKey="ctrl"
          paginationPageSizeSelector={paginationPageSizeSelector}
          getRowStyle={getRowStyle}
          {...(rowHeight ? { rowHeight } : {})}
           {...(headerHeight ? { headerHeight } : {})}
  
        />
      </div>
    );
  }
);

MyAgGrid.displayName = 'MyAgGrid';

export default MyAgGrid;