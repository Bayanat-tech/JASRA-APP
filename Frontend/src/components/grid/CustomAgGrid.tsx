import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useRef } from 'react';
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
  onCellValueChanged?: (params: any) => void;
  getRowId?: (params: any) => string;
  getRowNodeId?: (data: any) => string;
  selectedRows?: any[];
  suppressRowClickSelection?: boolean;
  rowMultiSelectWithClick?: boolean;
  suppressCellSelection?: boolean;
  suppressRowDeselection?: boolean;
  animateRows?: boolean;
  suppressRowTransform?: boolean;
  suppressColumnVirtualisation?: boolean;
  suppressScrollOnNewData?: boolean;
  ref?: any;
  reload_data?: boolean;
  pinnedBottomRowData?: any[];
}
 
const CustomAgGrid = forwardRef<any, CustomAgGridProps>(
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
      headerHeight,
      onCellValueChanged,
      getRowId,
      getRowNodeId,
      selectedRows,
      suppressRowClickSelection,
      rowMultiSelectWithClick,
      suppressCellSelection,
      suppressRowDeselection,
      animateRows,
      suppressRowTransform,
      suppressColumnVirtualisation,
      suppressScrollOnNewData,
      reload_data,
      pinnedBottomRowData,
      ...rest
    },
    ref
  ) => {
    const gridRef = useRef<any>(null);
 
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
 
    // Expose grid API methods through ref
    useImperativeHandle(ref, () => ({
      getApi: () => gridRef.current?.api,
      selectRows: (rowIds: string[]) => {
        if (gridRef.current?.api) {
          gridRef.current.api.forEachNode((node: any) => {
            if (rowIds.includes(node.data?.packdet_no)) {
              node.setSelected(true);
            }
          });
        }
      },
      refreshData: () => {
        if (gridRef.current?.api) {
          gridRef.current.api.refreshCells({ force: true });
          gridRef.current.api.redrawRows();
        }
      },
      redrawRows: () => {
        if (gridRef.current?.api) {
          gridRef.current.api.redrawRows();
        }
      }
    }));
 
    // Effect to handle data refresh when reload_data prop changes
    useEffect(() => {
      if (reload_data && gridRef.current?.api) {
        setTimeout(() => {
          gridRef.current.api.refreshCells({ force: true });
          gridRef.current.api.redrawRows();
        }, 100);
      }
    }, [reload_data, rowData]);
 
    // Filter out any empty/invalid rows before rendering - Generic version for all grids
    const filteredRowData = useMemo(() => {
      if (!Array.isArray(rowData)) return [];

      const filtered = rowData.filter((row: any, index: number) => {
        // Basic null/undefined check
        if (!row || typeof row !== 'object') {
          return false;
        }
        // Accept all objects (skip job-specific checks)
        return true;
      });
      return filtered;
    }, [rowData]);
 
    // Effect to force refresh when data changes
    useEffect(() => {
      if (gridRef?.current?.api) {
        const api = gridRef?.current?.api;
 
        // Force a complete refresh using proper ag-Grid methods
        setTimeout(() => {
          api?.refreshCells({ force: true });
          api?.redrawRows();
        }, 50);
      }
    }, [filteredRowData]);
 
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
          rowData={filteredRowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          pagination={true}
          paginationPageSize={paginationPageSize}
          onGridReady={(params) => {
            onGridReady?.(params);
          }}
          suppressCellFocus={true}
          animateRows={false}
          enableCellTextSelection={true}
          suppressRowClickSelection={true}
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
          suppressRowVirtualisation={false}
          suppressAnimationFrame={false}
          suppressAsyncEvents={false}
          suppressBrowserResizeObserver={false}
          getRowId={
            getRowId ||
            ((params: any) => {
              const data = params.data;
              if (!data) return `empty-row-${Math.random()}`;
 
              // Use a combination of fields to create unique ID
              const id =
                data.container_no?.toString() ||
                data.truck_no?.toString() ||
                data.asn_no?.toString() ||
                data.job_no?.toString() ||
                `row-${Math.random()}`;
 
              return id;
            })
          }
          // suppressRowTransform={true} // Prevent row transformations that might interfere
          {...(rowHeight ? { rowHeight } : {})}
          {...(headerHeight ? { headerHeight } : {})}
          onCellValueChanged={onCellValueChanged}
          {...(selectedRows ? { selectedRows } : {})}
          {...(rowMultiSelectWithClick !== undefined ? { rowMultiSelectWithClick } : {})}
          {...(suppressCellSelection !== undefined ? { suppressCellSelection } : {})}
          {...(suppressRowDeselection !== undefined ? { suppressRowDeselection } : {})}
          {...(suppressRowTransform !== undefined ? { suppressRowTransform } : {})}
          {...(suppressColumnVirtualisation !== undefined ? { suppressColumnVirtualisation } : {})}
          {...(suppressScrollOnNewData !== undefined ? { suppressScrollOnNewData } : {})}
          {...(pinnedBottomRowData ? { pinnedBottomRowData } : {})}
          {...rest}
        />
      </div>
    );
  }
);
 
CustomAgGrid.displayName = 'CustomAgGrid';
 
export default CustomAgGrid;
