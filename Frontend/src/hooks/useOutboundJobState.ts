// hooks/useOutboundJobState.ts
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/service.wms';

export const useOutboundJobState = (rowData: any) => {
  const queryClient = useQueryClient();

  console.log("rowData useOutboundJobState", rowData)

  // Order Entry Data

   const order_sql_string = `
  SELECT * FROM TO_ORDER
  WHERE COMPANY_CODE = '${rowData.company_code}' 
    AND JOB_NO = '${rowData.job_no}' 
    AND PRIN_CODE = '${rowData.prin_code}'
`;

  const {
    data: tableOrderData,
    isLoading: isOrderLoading,
    refetch: refetchTableOrder
  } = useQuery({
    queryKey: ['order_entry_data', order_sql_string],
    queryFn: async () => {
      const response = await WmsSerivceInstance.executeRawSql(order_sql_string);

      // If response is an array, map through it and convert datetime fields
      const localTimeData = (response || []).map((item: any) => ({
        ...item,
        pack_start: item.pack_start ? new Date(item.pack_start + ' UTC').toLocaleString() : item.pack_start,
        pack_end: item.pack_end ? new Date(item.pack_end + ' UTC').toLocaleString() : item.pack_end,
        load_start: item.load_start ? new Date(item.load_start + ' UTC').toLocaleString() : item.load_start,
        load_end: item.load_end ? new Date(item.load_end + ' UTC').toLocaleString() : item.load_end
      }));

      return {
        tableData: localTimeData,
        count: localTimeData.length || 0
      };
    },
    enabled: !!rowData.company_code && !!rowData.prin_code && !!rowData.job_no
  });


  // const {
  //   data: tableOrderData,
  //   isLoading: isOrderLoading,
  //   refetch: refetchTableOrder
  // } = useQuery({
  //   queryKey: ['order_entry_data', rowData?.job_no],
  //   queryFn: async () => {
  //     const response = await OrderEntryServiceInstance.getOrderentry(rowData?.job_no ?? '');

  //     // If response is an array, map through it and convert datetime fields
  //     const localTimeData = (response || []).map((item: any) => ({
  //       ...item,
  //       pack_start: item.pack_start ? new Date(item.pack_start + ' UTC').toLocaleString() : item.pack_start,
  //       pack_end: item.pack_end ? new Date(item.pack_end + ' UTC').toLocaleString() : item.pack_end,
  //       load_start: item.load_start ? new Date(item.load_start + ' UTC').toLocaleString() : item.load_start,
  //       load_end: item.load_end ? new Date(item.load_end + ' UTC').toLocaleString() : item.load_end
  //     }));

  //     return {
  //       tableData: localTimeData,
  //       count: localTimeData.length || 0
  //     };
  //   },
  //   enabled: !!rowData?.job_no
  // });

  // Order Details Data
  const sql_string = `
  SELECT * FROM VW_TO_ORDER_DET 
  WHERE COMPANY_CODE = '${rowData.company_code}' 
    AND JOB_NO = '${rowData.job_no}' 
    AND PRIN_CODE = '${rowData.prin_code}'
`;

  const {
    data: tableOrderDetailsData,
    isLoading: isOrderDetailsLoading,
    refetch: refetchTableOrderDetails
  } = useQuery({
    queryKey: ['order_details_data', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled: !!rowData.company_code && !!rowData.prin_code && !!rowData.job_no
  });

  // const {
  //   data: tableOrderDetailsData,
  //   isLoading: isOrderDetailsLoading,
  //   refetch: refetchTableOrderDetails
  // } = useQuery({
  //   queryKey: ['order_details_data', rowData?.company_code, rowData?.prin_code, rowData?.job_no],
  //   queryFn: async () => {
  //     try {
  //       const response = await OutboundJobServiceInstance.getAllOrderDetails(rowData.company_code, rowData.prin_code, rowData.job_no);

  //       let tableData: any[] = [];
  //       if (Array.isArray(response)) {
  //         tableData = response;
  //       } else if (response) {
  //         tableData = [response];
  //       }

  //       return {
  //         tableData,
  //         count: tableData.length
  //       };
  //     } catch (error) {
  //       console.error('Error fetching order details:', error);
  //       return {
  //         tableData: [],
  //         count: 0
  //       };
  //     }
  //   },
  //   enabled: !!rowData?.company_code && !!rowData?.prin_code && !!rowData?.job_no
  // });

  // Invalidate and refetch queries
  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['order_entry_data', rowData?.job_no]
    });
    queryClient.invalidateQueries({
      queryKey: ['order_details_data', rowData?.company_code, rowData?.prin_code, rowData?.job_no]
    });
  }, [queryClient, rowData]);

  return {
    tableOrderData,
    tableOrderDetailsData,
    isOrderLoading,
    isOrderDetailsLoading,
    refetchTableOrder,
    refetchTableOrderDetails,
    invalidateQueries
  };
};
