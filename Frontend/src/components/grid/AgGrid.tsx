import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';
import 'ag-grid-community/styles/ag-theme-apline.css';
import 'ag-grid-community/styles/ag-grid.css';

export interface CustomAgGridProps {
  rowData: any[];
  columnDefs: ColDef[];
  defaultColDef?: ColDef;
  onGridReady?: (params: any) => void;
  onFilterChanged?: (params: any) => void;
  onPaginationChanged?: (params: any) => void;
  onSortChanged?: (params: any) => void;
  onCellValueChanged?: (params: any) => void;
  onSelectionChanged?: (params: any) => void;
  enableCellTextSelection?: boolean;
  paginationPageSizeSelector?: number[];
  paginationPageSize?: number;
  pagination?: boolean;
  editable?: boolean;
  components?: any;
  height?: string;
  width?: string | number;
}

const CustomAgGrid = ({
  rowData,
  columnDefs,
  onGridReady,
  onSortChanged,
  onFilterChanged,
  onPaginationChanged,
  onSelectionChanged,
  onCellValueChanged,
  paginationPageSize = 10,
  paginationPageSizeSelector,
  width = '100%',
  height = '600px',
  editable = false, // Default value for the new prop
  components,
  ...rest
}: CustomAgGridProps) => {
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      editable
      //floatingFilter: false,
      // editable, // Use the new prop here
      //filterParams: {
      //buttons: ['reset', 'apply'],
      //closeOnApply: true
    }),
    [editable] // Add editable to the dependency array
  );

  return (
    <div
      className="ag-theme-alpine custom-ag-theme"
      style={
        {
          height: '600',
          width: '400%',
          border: '1px solid #ddd'
        } as React.CSSProperties
      }
    >
      {
        <>
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
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={paginationPageSize}
            onGridReady={onGridReady}
            enableCellTextSelection={true}
            onSortChanged={onSortChanged}
            onFilterChanged={onFilterChanged}
            onPaginationChanged={onPaginationChanged}
            onSelectionChanged={onSelectionChanged}
            paginationPageSizeSelector={paginationPageSizeSelector}
            onCellValueChanged={onCellValueChanged}
            // editable={false}
            rowHeight={30}
            {...rest}
          />
        </>
      }
    </div>
  );
};

export default CustomAgGrid;
