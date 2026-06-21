import { lazy } from 'react';
//import React from 'react';
//import { useQuery } from '@tanstack/react-query';
//import useAuth from 'hooks/useAuth';

// Loadable WMS Reports
import StockDetailReport from 'components/reports/wms/StockDetailReport';
import StockSummaryReport from 'components/reports/wms/StockSummaryReport';
import StockAgeingQuantityReport from 'components/reports/wms/StockAgeingQuantityReport';
import StockAgeingVolumeReport from 'components/reports/wms/StockAgeingVolumeReport';
import GrnSummaryReport from 'components/reports/wms/GrnSummaryReport';
import DnSummaryReport from 'components/reports/wms/DnSummaryReport';

// project import
// import VendorMainPg from 'pages/VendorSystem/VendorMainPg';
import Vendorpg from 'pages/VendorSystem/vendor/Vendorpg';
import VendorRegister from 'pages/VendorSystem/VendorRegister';
// import VendorStatus from 'pages/VendorSystem/VendorStatus'
import VendorStatus from 'pages/VendorSystem/VendorStatus';
import Loadable from 'components/Loadable';
import CommonLayout from 'layout/CommonLayout';
import MainLayout from 'layout/MainLayout';
import AppSelectionPage from 'pages/AppSelection/AppSelectionPage';
import AcTreeFinancePage from 'pages/Finance/AcTreeFinancePage';
import EmployeeHrPage from 'pages/HR/Masters/Employee/EmployeeHrPage';
//import ItemmasterPfPage from 'pages/Purchasefolder/ItemmasterPfpage';
import SecrollmasterWmsPage from 'pages/Security/SecrollmasterWmsPage';
import FlowmasterSecPage from 'pages/Security/flowmaster-sec.types';

import SecmasterWmsPage from 'pages/Security/secmasterWmsPage';
import SecmodulemasterWmsPage from 'pages/Security/secmodulemasterWmsPage';
import DivisionWmsPage from 'pages/WMS/DivisionWmsPage';
import PrincipalWmsPage from 'pages/WMS/PrincipalWmsPage';
import SalesmanWmsPage from 'pages/WMS/SalesmanWmsPage';
import WareHouseManagmentSystemPage from 'pages/WMS/WareHouseManagmentSystemPage';
import AuthGuard from 'utils/route-guard/AuthGuard';
import AssetGroupWmsPage from 'pages/WMS/AssetGroupWmsPage';

import PRSelectCriteria from '../components/forms/Purchaseflow/PRSelectCriteria';
import POSelectCriteria from '../components/forms/Purchaseflow/POSelectCriteria';
import PRRecovery from '../components/forms/Purchaseflow/PRRecovery';
//import BudgetProjwiseconsSelectioncriteria from '../components/forms/Purchaseflow/BudgetProjwiseconsSelectioncriteria';
//import POListingComponent from '../components/forms/Purchaseflow/POListingComponent'

//import PRSelectCriteria_Al from '../components/forms/Purchaseflow_AL/PurchasereqestheaderPfPage_Al';
// import CompanymasterPage from 'pages/Security/CompanymasterPage';

import PaycomponentHrPage from 'pages/HR/HrPaycomponentPage';
import HrleavetypePage from 'pages/HR/HrleavetypePage';
import JobsTabsWmsPage from 'pages/WMS/Transaction/Inbound/InboundJobTabsWmsPage';
import JobsWmsPage from 'pages/WMS/Transaction/Inbound/InboundJobWmsPage';
import DesignationHrPage from 'pages/HR/DesignationHrPage';
import FormaldesignationHrPage from 'pages/HR/FormaldesignationHrPage';
import GradeHrPage from 'pages/HR/GradeHrPage';
import DetailsStock from 'pages/WMS/reports/stockriteria/detailsstock/DetailsStock';
import SupplierPfPage from 'pages/Purchasefolder/SupplierPfPage';
import CategoryHrPage from 'pages/HR/CategoryHrPage';
import KpiNamePage from 'pages/HR/KpiNamePage';
import OperationHrPage from 'pages/HR/OperationHrPage';
import CompanymasterPage from 'pages/Security/CompanymasterPage';
import OutboundJobTabsWmsPage from 'pages/WMS/Transaction/outbound/OutboundJobMainTabsPage';
import OutboundJobWmsPage from 'pages/WMS/Transaction/outbound/OutboundJobWmsPage';
import WarehouseWmsPage from 'pages/WMS/WarehouseWmsPage';

import PeriodWiseAccountsPage from 'pages/accounts/reports/ageing/PeriodWiseAccountsPage';
import ProducttypeWmsPage from 'pages/WMS/ProducttypeWmsPage';
import AlertWmsPage from 'pages/WMS/AlertWmsPage';
import SectionPage from 'pages/HR/SectionPage';
import ProfitAndLossPage from 'pages/accounts/reports/profitAndLoss/ProfitAndLossPage';
import ActivityKpiWmsPage from 'pages/WMS/ActivityKpiWmsPage';
import POcancelPfPage from 'pages/Purchasefolder/POcancelPfpage';
import POmodifyPfPage from 'pages/Purchasefolder/POmodifyPfpage';
import LocationtypeWmsPage from 'pages/WMS/LocationTypeWmsPage';
import TransactionDocument from 'pages/accounts/transaction/TransactionDocument';
import { transactionDocumentType } from 'utils/constants';
import WmsDashboard from 'pages/dashboard/WmsDashboard';
import CostControllerDashboard from 'pages/dashboard/CostControllerDashboard';
import ProcDashboard from 'pages/dashboard/ProcDashboard';
import ScreenAccessPage from 'pages/Security/ScreenAccessPage';
import RoleAccessPage from 'pages/Security/UserRoleAccessPage';
import AccessAssignRollPage from 'pages/Security/AccessAssignRollPage';
import AccessAssignUserPage from 'pages/Security/AccessAssignUserPage';
import UserDivisionAccessPage from 'pages/Security/UserDivisionAccessPage';
import Report from 'pages/Security/ReportMasterPage';
import MyItemPage from 'pages/Purchasefolder/MyitemPage';
import MyTaskPage from 'pages/Purchasefolder/MyTaskPage';
//import PurchaseRequestLog from '../../src/components/forms/Purchaseflow/PurchaseRequestLog';
//import PurchaseRequestHeaderPfPage1 from 'pages/Purchasefolder/transactions/purchase_request/PurchasereqestheaderPfPage1';
import PurchaserequestheaderPfPage_Al from '../components/forms/Purchaseflow_AL/PurchasereqestheaderPfPage_Al';
import CustomerMasterPage from 'pages/Purchasefolder/CustomerMasterPage';
// import report ledger
import PurchaseOrderReport from 'components/reports/PurchaseOrderReport';
import PurchaseRequestReport from 'components/reports/PurchaseRequestReport';
import PurchaseRequestSummary from 'components/reports/purchase/PurchaseRequestSummary';
import PurchaseRequestDetail from 'components/reports/purchase/PurchaseRequestDetail';
// import report Budget
import ProjectwiseCurrentStatus from 'components/reports/purchase/ProjectwiseCurrentStatus';
import CostwiseCurrentStatus from 'components/reports/purchase/CostwiseCurrentStatus';

import CustomersReport from 'components/reports/purchase/masters/CustomersReport';
import SuppliersReport from 'components/reports/purchase/masters/SuppliersReport';
import DivisionsReport from 'components/reports/purchase/masters/DivisionsReport';
import ProjectsReport from 'components/reports/purchase/masters/ProjectsReport';
import MaterialCatmasterPfpage from 'pages/Purchasefolder/MaterialCatmasterPfpage';
import PfProductPage from 'pages/Purchasefolder/PfProductPage';
import MaterialMainPage from 'pages/Materialflow/MaterialMainPage';

import CompanySmsPage from 'pages/SMS/CompanySMSPage';
import SegmentSmsPage from 'pages/SMS/SegmentSMSPage';
import SalesmanSmsPage from 'pages/SMS/SalesmanSMSPage';
import ReasonSmsPage from 'pages/SMS/ReasonSMSPage';
import DealProbabilitySmsPage from 'pages/SMS/DealProbabilitySMSPage';
import DealStatusSmsPage from 'pages/SMS/DealStatusSMSPage';
import SalesRequestSmsPage from 'pages/SMS/SMSTransactionsPage';
import SMSDashboard from 'pages/dashboard/SMSDashboard';

import QueryMasterPage from 'pages/Security/QueryMasterPage'; //
import TransferMainPage from 'pages/Transfer/StockTransfer/TransferMainPage';
import ServiceSmsPage from 'pages/SMS/ServiceSMSPage';
// import CompanySmsPage from 'pages/SMS/CompanySMSPage';
// import MaterialrequestheaderPfPage from 'pages/Purchasefolder/MaterialrequestheaderPfPage';
import LmsDashboard from 'pages/HR/dashboard/LmsDashboard';
import HRLLeaveApprovalPage from 'pages/HR/HRFlow/HRLLeaveApprovalPage';
import HRMainPage from 'pages/HR/HRFlow/HRMainPage';
import HrEmployeeRegisterMainPage from 'pages/HR/HRFlow/HrEmployeeRegisterMainPage';
import HRLeaveResumptionMainPage from 'pages/HR/HRFlow/HRLeaveResumptionMainPage';
import HREmployeeProfileMainPage from 'pages/HR/HRFlow/EmployeeProfile/HREmployeeProfileMainPage';
import HRPayslips from 'pages/HR/HRFlow/HRPayslips';
import ViewPayslipReport from '../pages/HR/HRFlow/ViewPayslipReport';
import VendorOutstanding from 'pages/VendorSystem/VendorOutstanding';
import VendorProfile from 'pages/VendorSystem/VendorProfile';
import VendorAcEntryMain from 'pages/VendorSystem/VendorAcEntryMain';
import VendorRegistrationApproval from 'pages/VendorSystem/VendorRegistrationApproval';
import VendorApprovalPg from 'pages/VendorSystem/vendorApproval/VendorApprovalPg';
import MyitemPage_history from 'pages/Purchasefolder/MyitemPage_history';
import FiberPlastPoReport from 'components/reports/purchase/FiberPlastPoReport';
import VendorConsolidatedReportDetails from 'components/reports/purchase/VendorConsoldatedReportDetails';
import VendorConsolidatedReportSummary from 'components/reports/purchase/VendorConsolidatedReportSummary';
import CustomerWmsPage from 'pages/WMS/CustomerWmsPage';
import ItemMasterReport from 'components/reports/purchase/masters/ItemMasterReport';
import SupplierMasterReport from 'components/reports/purchase/masters/SupplierMasterReport';
import ItemWiseHistoryReport from 'components/reports/purchase/masters/ItemWiseHistoryReport';
import ProjectwiseReport from 'components/reports/purchase/masters/ProjectwiseReport';
import SupplierwiseReport from 'components/reports/purchase/masters/SupplierwiseReport';
import BoldPurchaseOrderReport from 'components/reports/purchase/BoldPurchaseOrderDetailReport';
import BoldPurchaseRequestSummary from 'components/reports/purchase/BoldPurchaseRequestSummaryReport';
import BudgetStatusReport from 'pages/Report/components/BudgetStatusReport';
import ItemInformationReport from 'pages/Report/item_information/ItemInformationReport';
// import BTHRMainPage from 'BT_INDIA/pages/BTHRMainPages';
// import MyTaskPage from 'pages/Purchasefolder/MyitemPage_history';
// import VendorDashboard from 'pages/VendorSystem/dashboard/VendorDashboard'
// import Design from 'components/reports/Design'; // Importing Design component
// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));
const CountryWmsPage = Loadable(lazy(() => import('pages/WMS/CountryWmsPage')));
const DepartmentWmsPage = Loadable(lazy(() => import('pages/WMS/DepartmentWmsPage')));
const BrandWmsPage = Loadable(lazy(() => import('pages/WMS/BrandWmsPage')));
const SupplierWmsPage = Loadable(lazy(() => import('pages/WMS/SupplierWmsPage')));
const LocationWmsPage = Loadable(lazy(() => import('pages/WMS/LocationWmsPage')));
const PickWaveWmsPage = Loadable(lazy(() => import('pages/WMS/PickWaveWmsPage')));
const PortWmsPage = Loadable(lazy(() => import('pages/WMS/PortWmsPage')));
const ActivityGroupWmsPage = Loadable(lazy(() => import('pages/WMS/ActivityGroupWmsPage')));
const CurrencyWmsPage = Loadable(lazy(() => import('pages/WMS/CurrencyWmsPage')));
const LineWmsPage = Loadable(lazy(() => import('pages/WMS/LineWmsPage')));
const VesselWmsPage = Loadable(lazy(() => import('pages/WMS/VesselWmsPage')));
const GroupWmsPage = Loadable(lazy(() => import('pages/WMS/GroupWmsPage')));
const ManufactureWmsPage = Loadable(lazy(() => import('pages/WMS/ManufactureWmsPage')));
const AirLineWmsPage = Loadable(lazy(() => import('pages/WMS/AirLineWmsPage')));
const PartnerWmsPage = Loadable(lazy(() => import('pages/WMS/PartnerWmsPage')));
const AccountsetupWmsPage = Loadable(lazy(() => import('pages/WMS/AccountsetupWmsPage')));
const ProductWmsPage = Loadable(lazy(() => import('pages/WMS/ProductWmsPage')));
const UomWmsPage = Loadable(lazy(() => import('pages/WMS/UomWmsPage')));
const MocWmsPage = Loadable(lazy(() => import('pages/WMS/MocWmsPage')));
const Moc2WmsPage = Loadable(lazy(() => import('pages/WMS/MocWmsPage')));
const UocWmsPage = Loadable(lazy(() => import('pages/WMS/UocWmsPage')));
const Harmonize = Loadable(lazy(() => import('pages/WMS/HarmonizeWmsPage')));

const ActivitySubgroupWms = Loadable(lazy(() => import('pages/WMS/ActivitySubgroupWmsPage')));
const CostmasterPfPage = Loadable(lazy(() => import('pages/Purchasefolder/CostmasterPfpage')));

const ProjectmasterPfPage = Loadable(lazy(() => import('pages/Purchasefolder/ProjectmasterPfPage')));
const BillingActivityPage = Loadable(lazy(() => import('../pages/WMS/ActivityBillingPage')));
const PurchaserequestheaderPfPage = Loadable(lazy(() => import('../pages/Purchasefolder/PurchasereqestheaderPfPage')));
// const SysDateComponent = Loadable(lazy(() => import('../pages/Purchasefolder/Oracleexample')));
const PurchasehistoryPfPage = Loadable(lazy(() => import('../pages/Purchasefolder/purchasehistoryPfPage')));

// pages routing HR
const BankWmsPage = Loadable(lazy(() => import('pages/HR/BankWmsPage')));

// Main routing configurations
const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'apps',
          element: <AppSelectionPage />
        },
        {
          path: 'wms',
          children: [
            // {
            //   path: 'dashboard',
            //   element: <WmsDashboard />
            // },
            // {
            //   path: 'cost-controller-dashboard',
            //   element: <CostControllerDashboard />
            // },
            // {
            //   path: 'proc-dashboard',
            //   element: <ProcDashboard />
            // },

            {
              path: 'masters',
              children: [
                {
                  path: 'gm',
                  children: [
                    { path: 'city', element: <CountryWmsPage /> }, // City master page
                    { path: 'country', element: <CountryWmsPage /> }, // Country master page
                    { path: 'principal', element: <PrincipalWmsPage /> }, // Principal master page
                    { path: 'department', element: <DepartmentWmsPage /> }, // Department master page
                    { path: 'location', element: <LocationWmsPage /> }, // Location master page
                    { path: 'currency', element: <CurrencyWmsPage /> }, // Currency master page
                    { path: 'supplier', element: <SupplierWmsPage /> }, // Supplier master page
                    { path: 'pickwave', element: <PickWaveWmsPage /> }, // Pick wave master page
                    { path: 'product', element: <ProductWmsPage /> }, // Product master page
                    { path: 'port', element: <PortWmsPage /> }, // Port master page
                    { path: 'activitygroup', element: <ActivityGroupWmsPage /> }, // Activity group master page
                    { path: 'vessel', element: <VesselWmsPage /> }, // Vessel master page
                    { path: 'airline', element: <AirLineWmsPage /> }, // Airline master page
                    { path: 'partner', element: <PartnerWmsPage /> }, // Partner master page
                    { path: 'salesman', element: <SalesmanWmsPage /> }, // Salesman master page
                    { path: 'brand', element: <BrandWmsPage /> }, // Brand master page
                    { path: 'group', element: <GroupWmsPage /> }, // Group master page
                    { path: 'manufacturer', element: <ManufactureWmsPage /> }, // Manufacturer master page
                    { path: 'accountsetup', element: <AccountsetupWmsPage /> }, // Account setup master page
                    { path: 'producttype', element: <ProducttypeWmsPage /> }, // Product type master page
                    { path: 'uom', element: <UomWmsPage /> }, // Unit of measure master page
                    { path: 'moc', element: <MocWmsPage /> }, // MOC master page
                    { path: 'moc2', element: <Moc2WmsPage /> }, // MOC2 master page
                    { path: 'uoc', element: <UocWmsPage /> }, // UOC master page
                    { path: 'harmonize', element: <Harmonize /> }, // Harmonize master page
                    { path: 'activitysubgroup', element: <ActivitySubgroupWms /> }, // Activity subgroup master page
                    { path: 'billing_activity', element: <BillingActivityPage /> }, // Billing activity page
                    { path: 'secrole', element: <SecrollmasterWmsPage /> }, // Security role master page
                    { path: 'division', element: <DivisionWmsPage /> }, // Division master page
                    { path: 'line', element: <LineWmsPage /> }, // Line master page
                    { path: 'warehouse', element: <WarehouseWmsPage /> }, // Warehouse master page
                    { path: 'locationtype', element: <LocationtypeWmsPage /> }, // Location type master page
                    { path: 'alert', element: <AlertWmsPage /> }, // Alert master page
                    { path: 'assetgroup', element: <AssetGroupWmsPage /> }, // Asset group master page
                    { path: 'activitykpi', element: <ActivityKpiWmsPage /> }, // Activity KPI master page
                    { path: 'customer', element: <CustomerWmsPage /> }, // Customer master page
                    { path: '*', element: <MaintenanceError /> } // 404 error page
                  ]
                },
                {
                  path: 'inbound'
                },

                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                },
                { path: 'test1', element: <DetailsStock key={'detailstock'} /> }
              ]
            },
            { path: 'thistest', element: <DetailsStock key={'detailstock'} /> },
            {
              path: 'transactions',
              children: [
                {
                  path: 'inbound',
                  children: [
                    { path: 'jobs', element: <JobsWmsPage /> }, // Inbound jobs page
                    { path: 'jobs/view/:id/:tab', element: <JobsTabsWmsPage /> }, // Inbound job details page
                    { path: '*', element: <MaintenanceError /> } // 404 error page
                  ]
                },
                {
                  path: 'outbound',
                  children: [
                    { path: 'jobs_oub', element: <OutboundJobWmsPage /> }, // Outbound jobs page
                    { path: 'jobs_oub/view/:id/:tab', element: <OutboundJobTabsWmsPage /> }, // Outbound job details page
                    { path: '*', element: <MaintenanceError /> } // 404 error page
                  ]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'reports',
              children: [
                {
                  path: 'Stock Report',
                  children: [
                    { path: 'stock_ageing_quantity', element: <StockAgeingQuantityReport /> },
                    { path: 'stock_ageing_volume', element: <StockAgeingVolumeReport /> },
                    { path: 'stock_summary', element: <StockSummaryReport /> },
                    { path: 'stock_detail', element: <StockDetailReport /> }
                  ]
                },
                {
                  path: 'Summary Report',
                  children: [
                    { path: 'grn_summary', element: <GrnSummaryReport /> },
                    { path: 'dn_summary', element: <DnSummaryReport /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'stock_transfer', element: <TransferMainPage /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            }
          ]
        },
        {
          path: 'BT-WF-AL',
          children: [
            {
              path: 'dashboard',
              element: <WmsDashboard />
            },
            {
              path: 'cost-controller-dashboard',
              element: <CostControllerDashboard />
            },
            {
              path: 'proc-dashboard',
              element: <ProcDashboard />
            },
            {
              path: 'Transactions',
              children: [
                {
                  path: 'Request',
                  children: [
                    {
                      path: 'purchase_request',
                      // eslint-disable-next-line react/jsx-pascal-case
                      element: <PurchaserequestheaderPfPage_Al />
                    },
                    { path: 'flow_master', element: <FlowmasterSecPage /> },
                    { path: 'role_master', element: <SecrollmasterWmsPage /> },
                    { path: 'sec_login', element: <SecmasterWmsPage /> },
                    { path: 'sec_module_data', element: <SecmodulemasterWmsPage /> },
                    { path: 'project_access', element: <ScreenAccessPage /> },
                    { path: 'user_role_access', element: <RoleAccessPage /> },
                    { path: 'access_assign_role', element: <AccessAssignRollPage /> },
                    { path: 'access_assign_user', element: <AccessAssignUserPage /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            }
          ]
        },
        {
          path: 'vendor',
          children: [
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'invoice_entry', element: <Vendorpg /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'invoice_register', element: <VendorRegister /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'invoice_outstanding', element: <VendorOutstanding /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'invoice_status', element: <VendorStatus /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'vendor_profile', element: <VendorProfile /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'invoice_approval', element: <VendorApprovalPg /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'account_entry', element: <VendorAcEntryMain /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [{ path: 'registration_approval', element: <VendorRegistrationApproval /> }]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon />
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'consolidated_report',
                  children: [
                    { path: 'invoice_detail', element: <VendorConsolidatedReportDetails /> },
                    { path: 'invoice_summary', element: <VendorConsolidatedReportSummary /> }
                  ]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon />
                }
              ]
            }
          ]
        },
        {
          path: 'security',
          children: [
            {},
            {
              path: 'masters',
              children: [
                {
                  path: 'gm',
                  children: [
                    { path: 'sec_company', element: <CompanymasterPage /> },
                    { path: 'flow_master', element: <FlowmasterSecPage /> },
                    { path: 'role_master', element: <SecrollmasterWmsPage /> },
                    { path: 'sec_login', element: <SecmasterWmsPage /> },
                    { path: 'sec_module_data', element: <SecmodulemasterWmsPage /> },
                    { path: 'project_access', element: <ScreenAccessPage /> },
                    { path: 'user_role_access', element: <RoleAccessPage /> },
                    { path: 'access_assign_role', element: <AccessAssignRollPage /> },
                    { path: 'access_assign_user', element: <AccessAssignUserPage /> },
                    { path: 'user_division_access', element: <UserDivisionAccessPage /> },
                    { path: 'report_master', element: <Report /> },
                    { path: '*', element: <MaintenanceError /> },
                    { path: 'query_master', element: <QueryMasterPage /> }
                  ]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon />
                }
              ]
            }
          ]
        },
        {
          path: 'pf',
          children: [
            {
              path: 'dashboard',
              element: <ProcDashboard />
            },
            {
              path: 'cost-controller-dashboard',
              element: <CostControllerDashboard />
            },
            {
              path: 'proc-dashboard',
              element: <ProcDashboard />
            },
            {
              path: 'master',
              children: [
                {
                  path: 'gm',
                  children: [
                    { path: 'cost_master', element: <CostmasterPfPage /> },
                    { path: 'project_master', element: <ProjectmasterPfPage /> },
                    { path: 'purchase_request', element: <PurchaserequestheaderPfPage /> },
                    { path: 'supplier_master', element: <SupplierPfPage /> },
                    { path: 'MATERIAL_CATEGORY_MASTER', element: <MaterialCatmasterPfpage /> },
                    { path: 'product_master', element: <PfProductPage /> },
                    { path: 'pocancel', element: <POcancelPfPage /> },
                    { path: 'pomodify', element: <POmodifyPfPage /> },
                    { path: 'Purchase_Request_Register', element: <PRSelectCriteria /> },
                    { path: 'Purchase_Order_Register', element: <POSelectCriteria /> },
                    { path: 'customer_master', element: <CustomerMasterPage /> },
                    { path: 'leave_request', element: <HRLLeaveApprovalPage /> },

                    { path: '*', element: <MaintenanceError /> }
                  ]
                }
              ]
            },
            { path: 'my_item', element: <DetailsStock key={'detailstock'} /> },
            {
              path: 'Activity',
              children: [
                {
                  path: 'Request',
                  children: [
                    { path: 'MY_TASK', element: <MyTaskPage /> },
                    { path: 'MY_ITEM', element: <MyItemPage /> },
                    { path: 'My_History', element: <MyitemPage_history /> },
                    { path: 'PO_Cancel', element: <POcancelPfPage /> },
                    { path: 'PO_Modify', element: <POmodifyPfPage /> },
                    { path: 'material_request', element: <MaterialMainPage /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                {
                  path: 'Recovery',
                  children: [
                    { path: 'Customer', element: <PRRecovery type_of_pr="Charge to Customer" /> },
                    { path: 'Supplier', element: <PRRecovery type_of_pr="Charge to Supplier" /> },
                    { path: 'Employee', element: <PRRecovery type_of_pr="Charge to Employee" /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                { path: '*', element: <MaintenanceComingSoon /> }
              ]
            },
            {
              path: 'Reports',
              children: [
                {
                  path: 'ledger', //ledger
                  children: [
                    {
                      path:"item_information",
                      element: <ItemInformationReport />
                    },
                    {
                      path: 'po_register_summary',
                      element: <PurchaseRequestReport /> // Po Register (summary)
                    },
                    {
                      path: 'po_register_detail',
                      element: <BoldPurchaseOrderReport /> // Po Register (detail)
                    },
                    {
                      path: 'purchase_request_register_summary',
                      element: <BoldPurchaseRequestSummary /> // purchase request register (summary)
                    },
                    {
                      path: 'purchase_request_register_detail',
                      element: <PurchaseRequestDetail /> //  purchase request register (detail)
                    },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                {
                  path: 'Budget',
                  children: [
                    { path: 'budget_status_report', element: <ProjectwiseCurrentStatus /> },
                    { path: 'budget_allocation_report', element: <CostwiseCurrentStatus /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                {
                  path: 'po',
                  children: [
                    { path: 'po_print', element: <FiberPlastPoReport /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },

                {
                  path: 'excel_reports',
                  children: [
                    { path: 'item_master', element: <ItemMasterReport /> },
                    { path: 'supplier_master', element: <SupplierMasterReport /> },
                    { path: 'item_wise_history', element: <ItemWiseHistoryReport /> },
                    { path: 'project_wise_purchase', element: <ProjectwiseReport /> },
                    { path: 'supplier_wise_purchase', element: <SupplierwiseReport /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },

                {
                  path: 'MASTERS',
                  children: [
                    { path: 'CUSTOMERS', element: <CustomersReport /> },
                    { path: 'SUPPLIERS', element: <SuppliersReport /> },
                    { path: 'DIVISIONS', element: <DivisionsReport /> },
                    { path: 'PROJECTS', element: <ProjectsReport /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                {
                  path: 'ledger_new',
                  children: [
                    { path: 'purchase_request_register_summary', element: <PurchaseRequestSummary /> },
                    { path: 'po_register_detail', element: <PurchaseOrderReport /> }
                  ]
                },
                {
                  path:'budget_new',
                  children: [
                    {path: 'budget_status_report', element:<BudgetStatusReport required_values={{ divCode: '', companyCode: '' }}/> }
                  ]
                },
                { path: '*', element: <MaintenanceComingSoon /> }
              ]
            }
          ]
        },
        {
          path: 'hr',
          children: [
            {
              path: 'dashboard',
              element: <LmsDashboard />
            },
            // {
            //   path: 'cost-controller-dashboard',
            //   element: <CostControllerDashboard />
            // },
            // {
            //   path: 'proc-dashboard',
            //   element: <ProcDashboard />
            // },
            {
              path: 'masters',
              children: [
                {
                  path: 'employee',
                  children: [{ path: 'employeemaster', element: <EmployeeHrPage /> }]
                },
                {
                  path: 'gm',
                  children: [
                    { path: 'employee_profile', element: <HREmployeeProfileMainPage /> },
                    { path: 'categorymaster', element: <CategoryHrPage /> }, // Category master page
                    { path: 'section', element: <SectionPage /> }, // Section page
                    { path: 'leavetype', element: <HrleavetypePage /> }, // Leave type page
                    { path: 'paycomponent', element: <PaycomponentHrPage /> }, // Pay component page
                    { path: 'kpiname', element: <KpiNamePage /> }, // KPI name page
                    { path: 'kpioperation', element: <OperationHrPage /> }, // KPI operation page
                    { path: 'leavetype', element: <HrleavetypePage /> }, // Leave type page
                    { path: 'paycomponent', element: <PaycomponentHrPage /> }, // Pay component page
                    { path: 'grademaster', element: <GradeHrPage /> }, // Grade master page
                    { path: 'designation', element: <DesignationHrPage /> }, // Designation page
                    { path: 'formaldesignation', element: <FormaldesignationHrPage /> }, // Formal designation page
                    { path: 'bank', element: <TransactionDocument doc_type="" /> } // Bank transaction document page
                  ]
                },
                {
                  path: 'inbound'
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon />
                }
              ]
            },
            {
              path: 'Activity',
              children: [
                {
                  path: 'Request',
                  children: [
                    { path: 'leave_request', element: <HRMainPage /> },
                    { path: 'employee_payslip', element: <HRPayslips /> },
                    { path: 'employee_payslip_view/:employeeId/:month/:year', element: <ViewPayslipReport /> },
                    { path: 'leave_register', element: <HrEmployeeRegisterMainPage /> },
                    { path: 'leave_resumption', element: <HRLeaveResumptionMainPage /> },
                    { path: 'MY_ITEM', element: <MyItemPage /> },
                    { path: 'My_History', element: <PurchasehistoryPfPage /> },
                    { path: 'PO_Cancel', element: <POcancelPfPage /> },
                    { path: 'PO_Modify', element: <POmodifyPfPage /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                {
                  path: 'Recovery',
                  children: [
                    { path: 'Customer', element: <PRRecovery type_of_pr="Charge to Customer" /> },
                    { path: 'Supplier', element: <PRRecovery type_of_pr="Charge to Supplier" /> },
                    { path: 'Employee', element: <PRRecovery type_of_pr="Charge to Employee" /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                { path: '*', element: <MaintenanceComingSoon /> }
              ]
            }
          ]
        },
        {
          path: 'finance',
          children: [
            {
              path: 'accounts',
              children: [
                {
                  path: 'masters',
                  children: [
                    { path: 'bank', element: <BankWmsPage /> }, // Bank master page
                    { path: 'a-c_tree', element: <AcTreeFinancePage /> }, // A/C tree page
                    { path: '*', element: <MaintenanceError /> } // 404 error page
                  ]
                },
                {
                  path: 'transactions',
                  children: [
                    {
                      path: 'cheque-payment',
                      element: (
                        <TransactionDocument
                          doc_type={transactionDocumentType.CHEQUE_PAYMENT}
                          key={transactionDocumentType.CHEQUE_PAYMENT}
                        />
                      ) // Cheque payment transaction document page
                    },
                    {
                      path: 'cheque-receipt',
                      element: (
                        <TransactionDocument
                          doc_type={transactionDocumentType.CHEQUE_RECEIPT}
                          key={transactionDocumentType.CHEQUE_RECEIPT}
                        />
                      ) // Cheque receipt transaction document page
                    },
                    {
                      path: 'cash-receipt',
                      element: (
                        <TransactionDocument doc_type={transactionDocumentType.CASH_RECEIPT} key={transactionDocumentType.CASH_RECEIPT} />
                      ) // Cash receipt transaction document page
                    }
                  ]
                },
                {
                  path: 'inbound'
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              path: 'dashboard',
              element: <WmsDashboard />
            },
            {
              path: 'cost-controller-dashboard',
              element: <CostControllerDashboard />
            },
            {
              path: 'proc-dashboard',
              element: <ProcDashboard />
            }
          ]
        },
        {
          path: 'accounts',
          children: [
            {
              path: 'reports',
              children: [
                {
                  path: 'ageing',
                  children: [
                    { path: 'period-wise', element: <PeriodWiseAccountsPage /> },
                    { path: '*', element: <MaintenanceError /> } // 404 error page
                  ]
                },
                {
                  path: 'profit-and-loss',
                  children: [
                    { path: 'profit-and-loss', element: <ProfitAndLossPage /> }, // Profit and loss report page
                    { path: '*', element: <MaintenanceError /> } // 404 error page
                  ]
                },
                {
                  path: '*',
                  element: <MaintenanceComingSoon /> // Coming soon page
                }
              ]
            },
            {
              // path: 'dashboard',
              // element: <WmsDashboard />
            },
            {
              path: 'cost-controller-dashboard',
              element: <CostControllerDashboard />
            },
            {
              path: 'proc-dashboard',
              element: <ProcDashboard />
            }
          ]
        },
        {
          path: 'sms',
          children: [
            {
              path: 'dashboard',
              element: <SMSDashboard />
            },
            {
              path: 'masters',
              children: [
                {
                  path: 'gm',
                  children: [
                    { path: 'lead', element: <CompanySmsPage /> },
                    { path: 'services', element: <ServiceSmsPage /> },
                    { path: 'segment_master', element: <SegmentSmsPage /> },
                    { path: 'salesman_master', element: <SalesmanSmsPage /> },
                    { path: 'reject_reason', element: <ReasonSmsPage /> },
                    { path: 'deal_status', element: <DealStatusSmsPage /> },
                    { path: 'deal_probability', element: <DealProbabilitySmsPage /> }
                  ]
                }
              ]
            },
            {
              path: 'activity',
              children: [
                {
                  path: 'request',
                  children: [
                    { path: 'sales_request', element: <SalesRequestSmsPage /> },
                    { path: '*', element: <MaintenanceError /> }
                  ]
                },
                { path: '*', element: <MaintenanceError /> }
              ]
            },
            {
              path: 'dashboard',
              element: <WmsDashboard />
            },
            {
              path: 'cost-controller-dashboard',
              element: <CostControllerDashboard />
            },
            {
              path: 'proc-dashboard',
              element: <ProcDashboard />
            },
            {
              path: '*',
              element: <MaintenanceComingSoon />
            }
          ]
        },
        {
          path: '*',
          element: <MaintenanceComingSoon />
        }
      ]
    },
    {
      path: '/maintenance',
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError /> // 404 error page
        },
        {
          path: '500',
          element: <MaintenanceError500 /> // 500 error page
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction /> // Under construction page
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon /> // Coming soon page
        }
      ]
    },
    {
      path: '*',
      element: <WareHouseManagmentSystemPage /> // Default page
    }
  ]
};

export default MainRoutes;
// const checkRoutes = MainRoutes.children[0]?.children;
// console.log('MainRoutes', checkRoutes);
if (MainRoutes) {
  console.log('MainRoutes', MainRoutes?.children?.[0]?.children?.[5]?.children?.[0]?.children?.[0]?.path || '');
}
// const checkRoutes = MainRoutes.children[0]?.children;
// console.log('MainRoutes', checkRoutes);
if (MainRoutes) {
  console.log('MainRoutes', MainRoutes?.children?.[0]?.children?.[5]?.children?.[0]?.children?.[0]?.path || '');
}
