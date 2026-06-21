// third-party
// assets
import {
  BarChartOutlined,
  ChromeOutlined,
  ContactsOutlined,
  CreditCardOutlined,
  DeploymentUnitOutlined,
  DollarOutlined,
  HomeOutlined,
  QuestionOutlined,
  SafetyOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined,
  DeploymentUnitOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  ContactsOutlined,
  DollarOutlined,
  SafetyOutlined,
  BarChartOutlined,
  CreditCardOutlined
};

export const NavigationItems = [
  {
    id: 'country_wms',
    type: 'item',
    url_path: '/wms/masters/gm/country',
    icon: icons.HomeOutlined
  },
  {
    id: 'princial_wms',
    type: 'item',
    url_path: '/wms/masters/gm/principal',
    icon: icons.HomeOutlined
  },
  {
    id: 'billing_wms',
    type: 'item',
    url_path: '/wms/masters/gm/billingactivity',
    icon: icons.HomeOutlined
  },
  {
    id: 'inbound_job_wms',
    type: 'item',
    url_path: '/wms/transactions/inbound/jobs',
    icon: icons.HomeOutlined
  },
  {
    id: 'outbound_job_wms',
    type: 'item',
    url_path: '/wms/transactions/outbound/jobs_oub',
    icon: icons.HomeOutlined
  },
  {
    id: 'summarystock_wms',
    type: 'item',
    url_path: '/wms/reports/stockcriteria/summarystock',
    icon: icons.HomeOutlined
  },
  {
    id: 'detailstock_wms',
    type: 'item',
    url_path: '/wms/reports/stockcriteria/detailstock',
    icon: icons.HomeOutlined
  },
  {
    id: 'aging_wms',
    type: 'item',
    url_path: '/wms/reports/stockcriteria/aging',
    icon: icons.HomeOutlined
  },
  {
    id: 'employee_hr',
    type: 'item',
    url_path: '/HR/masters/employee/employeemaster',
    icon: icons.HomeOutlined
  },
  {
    id: 'period_wise_accounts',
    type: 'item',
    url_path: '/accounts/reports/ageing/period-wise',
    icon: icons.HomeOutlined
  },
  {
    id: 'profit_and_loss_accounts',
    type: 'item',
    url_path: '/accounts/reports/profit-and-loss/profit-and-loss',
    icon: icons.HomeOutlined
  },
  {
    id: 'ac_tree_finance',
    type: 'item',
    url_path: '/finance/accounts/masters/a-c_tree',
    icon: icons.HomeOutlined
  },
  {
    id: 'cheq_payment',
    type: 'item',
    url_path: '/finance/accounts/transactions/cheque-payment',
    icon: icons.HomeOutlined
  },
  {
    id: 'cheq_reciept',
    type: 'item',
    url_path: '/finance/accounts/transactions/cheque-receipt',
    icon: icons.HomeOutlined
  },
  {
    id: 'cash_reciept',
    type: 'item',
    url_path: '/finance/accounts/transactions/cash-receipt',
    icon: icons.HomeOutlined
  },
  {
    id: 'wms_dashboard',
    type: 'item',
    url_path: '/wms/dashboard',
    icon: icons.HomeOutlined
  }
];
