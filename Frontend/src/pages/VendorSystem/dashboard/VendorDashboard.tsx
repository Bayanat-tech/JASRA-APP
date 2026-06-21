// import { Box, Typography, Grid, Paper } from '@mui/material';
// import { AiTwotoneFileText, AiTwotoneExclamationCircle, AiTwotoneDollarCircle, AiTwotoneCreditCard } from "react-icons/ai";
// import { useQuery } from '@tanstack/react-query';
// import VendorSerivceInstance from 'service/wms/service.vendor';
// import useAuth from 'hooks/useAuth';
// import VendorOverviewChart from '../dashboard/VendorOverviewChart';
// import VendorRecentInv from '../dashboard/VendorRecentInv';
// import VendorPiplineOverview from '../dashboard/VendorPiplineOverview';
// import RandomData from '../dashboard/RandomData';

// const VendorDashboard = () => {
//     const { user } = useAuth();

//     // ✅ Total invoice count API
//     const sql_InvoiceCount = `
//     SELECT COUNT(*) FROM VW_TR_AC_LPO_HEADER
//     WHERE LAST_ACTION <> 'SAVEASDRAFT'
//     AND COMPANY_CODE = 'BSG'
//     AND AC_CODE = ${user?.loginid}
//   `;

//     const { data: totalInvoice } = useQuery({
//         queryKey: ['totalInvoice', sql_InvoiceCount],
//         queryFn: async () => await VendorSerivceInstance.executeRawSql(sql_InvoiceCount),
//     });

//     // ✅ Pending Approval API
//     const sql_PendingApproval = `
//     SELECT COUNT(*) FROM VW_TR_AC_LPO_HEADER
//     WHERE LAST_ACTION = 'SUBMITTED'
//     AND COMPANY_CODE = 'BSG'
//     AND AC_CODE = ${user?.loginid}
//   `;

//     const { data: totalPendingApproval } = useQuery({
//         queryKey: ['totalPendingInvoice', sql_PendingApproval],
//         queryFn: async () => await VendorSerivceInstance.executeRawSql(sql_PendingApproval),
//     });

//     const totalInvoiceCount = totalInvoice?.[0]?.["COUNT(*)"] ?? 0;
//     const totalPendingApprovalCount = totalPendingApproval?.[0]?.["COUNT(*)"] ?? 0;

//     const statusDetails = [
//         {
//             status: "Total Invoices Raised",
//             statusScore: totalInvoiceCount,
//             icon: <AiTwotoneFileText size={40} />,
//         },
//         {
//             status: "Pending Approval",
//             statusScore: totalPendingApprovalCount,
//             icon: <AiTwotoneExclamationCircle size={40} />,
//         },
//         {
//             status: "Outstanding Amount",
//             statusScore: "OMR 12,500",
//             icon: <AiTwotoneDollarCircle size={40}  />,
//         },
//         {
//             status: "Last Payment Received",
//             statusScore: "OMR 5,500",
//             icon: <AiTwotoneCreditCard size={40}  />,
//         },
//     ];

//     return (
//         <Box sx={{ p: 2, bgcolor: "#f8fafc", minHeight: "100vh" }}>
//             <Typography variant="h4" fontWeight={700} gutterBottom color="#1e293b">
//                 Dashboard
//             </Typography>

//             {/* ===== STATUS CARDS ===== */}
//             <Grid container spacing={2} mb={3}>
//                 {statusDetails.map((item, index) => (
//                     <Grid item xs={12} sm={6} md={3} key={index}>
//                         <Paper
//                             elevation={2}
//                             sx={{
//                                 borderRadius: 2,
//                                 p: 2,
//                                 transition: 'all 0.3s ease',
//                                 '&:hover': {
//                                     transform: 'translateY(-2px)',
//                                     boxShadow: 4,
//                                 }
//                             }}
//                         >
//                             <Box display="flex" alignItems="center" gap={2}>
//                                 {item.icon}
//                                 <Box>
//                                     <Typography variant="h6" fontWeight={600} color="#374151">
//                                         {item.status}
//                                     </Typography>
//                                     <Typography variant="h4" fontWeight={700} color="#1f2937" mt={1}>
//                                         {item.statusScore}
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         </Paper>
//                     </Grid>
//                 ))}
//             </Grid>

//             {/* ===== CHARTS SECTION ===== */}
//             <Grid container spacing={3}>
//                 {/* Overview Chart */}
//                 <Grid item xs={12} md={6}>
//                     <VendorOverviewChart />
//                 </Grid>

//                 {/* Recent Invoices */}
//                 <Grid item xs={12} md={6}>
//                     <VendorRecentInv />
//                 </Grid>
//             </Grid>

//             <Grid container spacing={3} mt={1}>
//                 <Grid item xs={12} md={6}>
//                     <VendorPiplineOverview />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                     <RandomData />
//                 </Grid>
//             </Grid>
//         </Box>
//     );
// };

// export default VendorDashboard;