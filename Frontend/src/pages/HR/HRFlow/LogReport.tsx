import { ColDef } from "ag-grid-community";
import MyAgGrid from "components/grid/MyAgGrid";
import dayjs from "dayjs";
import { useMemo } from "react";
import { FaHistory, FaFileAlt } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";

const onGridReady = (params: any) => {
  params.api.sizeColumnsToFit();
};

const LogReport = ({ logData }: any) => {
  console.log("logData in log report", logData)

  const formatToMonthDDYY24hr = (dateString:string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  const TotalRecords = logData.length;

  const columnDefs = useMemo<ColDef<any>[]>(
    () => [
      {
        headerName: "Request Number",
        field: "REQUEST_NUMBER",
        maxWidth: 150 ,
      },
      {
        headerName: "Last Action",
        field: "LAST_ACTION",
        maxWidth: 150 ,
      },
      {
        headerName: "Leave Type",
        field: "LEAVE_TYPE_DESC",
        maxWidth: 200 ,
      },
      {
        headerName: "Updated By",
        field: "UPDATED_BY_DISPLAY",
        maxWidth: 500 ,
      },
      {
        headerName: "Updated At",
        field: "UPDATED_AT",
        maxWidth:200 ,
        valueFormatter: (params: any) => {
        const date = dayjs(params.value);
        return date.isValid() ? date.format('DD/MM/YYYY hh:mm:ss A') : '-';}
      },
      {
        headerName: "Next Action By",
        field: "NEXT_ACTION_BY_DISPLAY",
        maxWidth: 400 ,
      },
    ], []);

  return (
    <div className="container mx-auto px-4 pt-2">
      <div>
        <div className="mb-4">
          <div className="grid grid-cols-12 gap-3">
            {/* Main Header Card */}
            {/* <div className="col-span-12">
              <div className="border border-gray-200 min-h-[80px] flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 rounded-lg shadow-md">
                <div className="text-center py-2 w-full">
                  <div className="text-center text-xl font-bold text-white mb-1">
                    Leave Request History
                  </div>
                  <div className="text-blue-100 text-sm">
                    <strong>Request Number:</strong> {logData?.[0]?.REQUEST_NUMBER || 'N/A'}
                  </div>
                </div>
              </div>
            </div> */}

            {/* Current Status Card */}
            <div className="col-span-12 md:col-span-4">
              <div className="border border-gray-200 min-h-[70px] flex items-center bg-white hover:bg-gray-50 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md">
                <div className="flex items-center w-full px-4 py-3">
                  <FaCircleUser className="text-2xl mr-3 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                      Current Status
                    </div>
                    <div className="text-gray-900 font-medium text-base mt-1">
                      {logData?.[logData.length - 1]?.LAST_ACTION || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Updated Card */}
            <div className="col-span-12 md:col-span-4">
              <div className="border border-gray-200 min-h-[70px] flex items-center bg-white hover:bg-gray-50 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md">
                <div className="flex items-center w-full px-4 py-3">
                  <FaHistory className="text-xl mr-3 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                      Last Updated
                    </div>
                    <div className="text-gray-900 font-medium text-base mt-1">
                      {formatToMonthDDYY24hr(logData?.[logData.length - 1]?.UPDATED_AT)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Type Card */}
            <div className="col-span-12 md:col-span-4">
              <div className="border border-gray-200 min-h-[70px] flex items-center bg-white hover:bg-gray-50 transition-all duration-300 rounded-lg shadow-sm hover:shadow-md">
                <div className="flex items-center w-full px-4 py-3">
                  <FaFileAlt className="text-xl mr-3 text-purple-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
                      Leave Type
                    </div>
                    <div className="text-gray-900 font-medium text-base mt-1">
                      {logData?.[0]?.LEAVE_TYPE_DESC || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-left font-bold p-1 text-lg text-gray-800 mb-2">
            Activity Timeline
          </div>
          <div className="rounded-lg shadow-sm">
            <MyAgGrid
              rowData={logData || []}
              columnDefs={columnDefs}
              onGridReady={(params) => {
                console.log('Grid Ready, rowData:', logData?.tableData || []);
                onGridReady(params);
              }}
              height="400px"
              rowHeight={27}
              headerHeight={35}
              paginationPageSize={100}
            />
          </div>
        </div>
        
        <div className="text-center font-semibold p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 rounded-lg border border-gray-200 shadow-sm text-sm">
          Last Updated: {formatToMonthDDYY24hr(logData?.[logData.length - 1]?.UPDATED_AT)} • Total Records: {TotalRecords}
        </div>
      </div>
    </div>
  );
};

export default LogReport;