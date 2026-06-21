import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { forwardRef, useMemo, useImperativeHandle, useRef } from 'react';
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
  selectedRows?: any[];
  suppressRowClickSelection?: boolean;
  rowMultiSelectWithClick?: boolean;
  suppressRowDeselection?: boolean;
  getRowId?: (params: any) => string;
}

const CustomGrid = forwardRef<any, CustomAgGridProps>((props, ref) => {
  const {
    rowData,
    columnDefs,
    onGridReady,
    onSortChanged,
    onFilterChanged,
    onPaginationChanged,
    onSelectionChanged,
    paginationPageSize = 10,
    paginationPageSizeSelector,
    height = '400px',
    editable = false,
    rowSelection = 'multiple',
    getRowStyle,
    rowHeight = 25,
    headerHeight = 30,
    suppressRowClickSelection = true,
    rowMultiSelectWithClick = true,
    suppressRowDeselection = false,
    getRowId
  } = props;

  const gridRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getApi: () => gridRef.current?.api,
    selectRows: (rowIds: string[]) => {
      if (gridRef.current?.api) {
        gridRef.current.api.forEachNode((node: any) => {
          if (rowIds.includes(node.data?.id)) {
            node.setSelected(true);
          }
        });
      }
    }
  }));

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
          .custom-ag-theme .ag-cell {
            font-size: 11px !important;
          }
          .custom-ag-theme .ag-row {
            font-size: 11px !important;
          }
        `}
      </style>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection={rowSelection}
        pagination={true}
        paginationPageSize={paginationPageSize}
        onGridReady={onGridReady}
        animateRows={false}
        enableCellTextSelection={true}
        suppressRowClickSelection={suppressRowClickSelection}
        onSortChanged={onSortChanged}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSelectionChanged={(params) => {
          if (onSelectionChanged) {
            const selectedRows = params.api.getSelectedRows();
            onSelectionChanged(selectedRows);
          }
        }}
        suppressMenuHide={false}
        multiSortKey="ctrl"
        paginationPageSizeSelector={paginationPageSizeSelector}
        getRowStyle={getRowStyle}
        rowHeight={rowHeight}
        headerHeight={headerHeight}
        rowMultiSelectWithClick={rowMultiSelectWithClick}
        suppressCellFocus={true}
        suppressRowDeselection={suppressRowDeselection}
        getRowId={
          getRowId ||
          ((params: any) => {
            const data = params.data;
            if (!data) return `empty-row-${Math.random()}`;
            return data.id || `row-${Math.random()}`;
          })
        }
      />
    </div>
  );
});

CustomGrid.displayName = 'CustomGrid';

export default CustomGrid;
