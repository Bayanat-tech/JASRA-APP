// import React from 'react';
// import { Paper, Typography, Box, CircularProgress } from '@mui/material';
// import { PieChart, Pie, Legend, ResponsiveContainer, Tooltip, Cell } from 'recharts';
// import useAuth from 'hooks/useAuth';
// import { useQuery } from '@tanstack/react-query';
// import VendorSerivceInstance from 'service/wms/service.vendor';

// type StatusItem = {
//   STATUS: string;
//   COUNT: number | string;
// };

// const VendorOverviewChart: React.FC = () => {
//   const { user } = useAuth();

//   const sql_Overview = `
//     SELECT 'Submitted' AS STATUS, COUNT(*) AS COUNT
//     FROM VW_TR_AC_LPO_HEADER
//     WHERE AC_CODE = ${user?.loginid} AND COMPANY_CODE = 'BSG' AND LAST_ACTION = 'SUBMITTED'
//     UNION
//     SELECT 'Paid' AS STATUS, COUNT(*) AS COUNT
//     FROM VW_LPO_HEADER_DOCNO_PAID_AWARE
//     WHERE AC_CODE = ${user?.loginid} AND COMPANY_CODE = 'BSG'
//     UNION
//     SELECT 'Approved' AS STATUS, COUNT(*) AS COUNT
//     FROM VW_TR_AC_LPO_HEADER
//     WHERE AC_CODE = ${user?.loginid} AND COMPANY_CODE = 'BSG' AND FINAL_APPROVED = 'YES'
//   `;

//   const { data: overview, isLoading } = useQuery<StatusItem[]>({
//     queryKey: ['Overview', sql_Overview],
//     queryFn: async (): Promise<StatusItem[]> => {
//       const res = await VendorSerivceInstance.executeRawSql(sql_Overview);
//       return res ?? [];
//     }
//   });

//   const allStatus: StatusItem[] = (overview ?? []).map((item) => ({
//     ...item,
//     COUNT: Number(item.COUNT)
//   }));

//   const COLORS = [
//     '#0056A3', // darker 3
//     '#006BCC', // darker 2
//     '#0088FE', // base
//     '#66B1FF', // lighter 2
//     '#99C8FF' // lighter 3
//   ];

//   if (isLoading) {
//     return (
//       <Paper
//         elevation={2}
//         sx={{
//           borderRadius: 3,
//           p: 3,
//           height: 350,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}
//       >
//         <CircularProgress />
//       </Paper>
//     );
//   }

//   if (!allStatus.length || allStatus.every((item) => item.COUNT === 0)) {
//     return (
//       <Paper
//         elevation={2}
//         sx={{
//           borderRadius: 3,
//           p: 3,
//           height: 350,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}
//       >
//         <Typography variant="h5" fontWeight={600} gutterBottom color="#1e293b">
//           Invoice Status Overview
//         </Typography>
//         <Typography color="text.secondary">No data available to display</Typography>
//       </Paper>
//     );
//   }

//   return (
//     <Paper
//       elevation={2}
//       sx={{
//         borderRadius: 3,
//         p: 3,
//         height: 380,
//         width: '100%',
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'space-between'
//         // background: "linear-gradient(to right, #f7f9fc, #eef3f8)",
//       }}
//     >
//       <Typography variant="h6" fontWeight={600} mb={1} sx={{ color: '#1a237e', textAlign: 'center' }}>
//         Invoice Status Overview
//       </Typography>

//       <Box
//         sx={{
//           flex: 1,
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           mt: 1
//         }}
//       >
//         <ResponsiveContainer width="95%" height="95%">
//           <PieChart>
//             <Pie
//               data={allStatus}
//               cx="50%"
//               cy="50%"
//               innerRadius={60}
//               outerRadius={80}
//               paddingAngle={2}
//               dataKey="COUNT"
//               nameKey="STATUS"
//               label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}
//               labelLine={false}
//             >
//               {allStatus.map((entry: StatusItem, index: number) => (
//                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Pie>
//             <Tooltip formatter={(value: number) => [`${value}`, 'Count']} contentStyle={{ borderRadius: 10 }} />
//             <Legend
//               verticalAlign="middle"
//               align="right"
//               iconType="circle"
//               layout="vertical"
//               wrapperStyle={{
//                 paddingLeft: 10,
//                 fontSize: 13
//               }}
//             />
//             <Legend verticalAlign="bottom" height={36} iconType="circle" />
//           </PieChart>
//         </ResponsiveContainer>
//       </Box>
//     </Paper>
//   );
// };

// export default VendorOverviewChart;
