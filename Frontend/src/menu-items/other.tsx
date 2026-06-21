// third-party

// assets
// type
import { NavItemType } from 'types/menu';

// icons
// const icons = {
//   ChromeOutlined,
//   QuestionOutlined,
//   DeploymentUnitOutlined
// };

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const other: NavItemType = {
  // id: 'other',
  // title: <FormattedMessage id="others" />,
  // type: 'group',
  // children: [
  // {
  //   id: '1',
  //   title: 'WMS',
  //   type: 'collapse',
  //   icon: 'MenuUnfoldOutlined', // Icon for the first level
  //   children: [
  //     {
  //       id: '2',
  //       title: 'MASTERS',
  //       type: 'collapse',
  //       children: [
  //         {
  //           id: '3',
  //           title: 'GM',
  //           type: 'collapse',
  //           children: [
  //             {
  //               id: '4',
  //               title: ' ',
  //               type: 'item',
  //               url_path: undefined,
  //               icon: 'NoIcon'
  //             },
  //             {
  //               id: '5',
  //               title: 'COMPANY',
  //               type: 'item',
  //               url_path: 'company',
  //               icon: 'BusinessIcon' // Icon for the last level
  //             },
  //             {
  //               id: '6',
  //               title: 'CITY',
  //               type: 'item',
  //               url_path: 'city',
  //               icon: 'LocationCityIcon' // Icon for the last level
  //             },
  //             {
  //               id: '7',
  //               title: 'CURRENCY',
  //               type: 'item',
  //               url_path: 'currency',
  //               icon: 'AttachMoneyIcon' // Icon for the last level
  //             },
  //             {
  //               id: '8',
  //               title: 'STATE',
  //               type: 'item',
  //               url_path: 'state',
  //               icon: 'MapIcon' // Icon for the last level
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       id: '9',
  //       title: 'TRANSACTION',
  //       type: 'collapse',
  //       children: [
  //         {
  //           id: '10',
  //           title: 'INBOUND',
  //           type: 'collapse',
  //           children: [
  //             {
  //               id: '11',
  //               title: 'JOB CREATION',
  //               type: 'item',
  //               url_path: 'job_creation',
  //               icon: 'CreateIcon' // Icon for the last level
  //             },
  //             {
  //               id: '12',
  //               title: 'CONTAINER',
  //               type: 'item',
  //               url_path: 'container',
  //               icon: 'LocalShippingIcon' // Icon for the last level
  //             },
  //             {
  //               id: '13',
  //               title: 'PACKING LIST',
  //               type: 'item',
  //               url_path: 'packing_list',
  //               icon: 'ListAltIcon' // Icon for the last level
  //             },
  //             {
  //               id: '14',
  //               title: 'CLEARANCE',
  //               type: 'item',
  //               url_path: 'clearance',
  //               icon: 'CheckCircleIcon' // Icon for the last level
  //             },
  //             {
  //               id: '15',
  //               title: 'PUTAWAY',
  //               type: 'item',
  //               url_path: 'putaway',
  //               icon: 'MoveToInboxIcon' // Icon for the last level
  //             },
  //             {
  //               id: '16',
  //               title: 'CONFIRMATION',
  //               type: 'item',
  //               url_path: 'confirmation',
  //               icon: 'CheckIcon' // Icon for the last level
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // },
  // {
  //   id: '17',
  //   title: 'Finance',
  //   type: 'collapse',
  //   icon: 'MenuUnfoldOutlined', // Icon for the first level
  //   children: [
  //     {
  //       id: '18',
  //       title: 'ACCOUNTS',
  //       type: 'collapse',
  //       children: [
  //         {
  //           id: '19',
  //           title: 'MASTERS',
  //           type: 'collapse',
  //           children: [
  //             {
  //               id: '20',
  //               title: 'A/C TREE',
  //               type: 'item',
  //               url_path: 'ac_tree',
  //               icon: 'AccountTreeIcon' // Icon for the last level
  //             },
  //             {
  //               id: '21',
  //               title: 'BANK CODE SETTING',
  //               type: 'item',
  //               url_path: 'bank_code_setting',
  //               icon: 'AccountBalanceIcon' // Icon for the last level
  //             },
  //             {
  //               id: '22',
  //               title: 'EXPENSE TYPE',
  //               type: 'item',
  //               url_path: 'expense_type',
  //               icon: 'MoneyOffIcon' // Icon for the last level
  //             },
  //             {
  //               id: '23',
  //               title: 'BUDGET VERSION',
  //               type: 'item',
  //               url_path: 'budget_version',
  //               icon: 'InsertChartIcon' // Icon for the last level
  //             },
  //             {
  //               id: '24',
  //               title: 'BUDGET A/C GROUP',
  //               type: 'item',
  //               url_path: 'budget_ac_group',
  //               icon: 'GroupIcon' // Icon for the last level
  //             },
  //             {
  //               id: '25',
  //               title: 'BUDGET A/C WISE',
  //               type: 'item',
  //               url_path: 'budget_ac_wise',
  //               icon: 'BarChartIcon' // Icon for the last level
  //             }
  //           ]
  //         },
  //         {
  //           id: '26',
  //           title: 'TRANSACTION',
  //           type: 'collapse',
  //           children: [
  //             {
  //               id: '27',
  //               title: 'CHEQUE PAYMENT',
  //               type: 'item',
  //               url_path: 'cheque_payment',
  //               icon: 'PaymentIcon' // Icon for the last level
  //             },
  //             {
  //               id: '28',
  //               title: 'CHEQUE RECEIPT',
  //               type: 'item',
  //               url_path: 'cheque_receipt',
  //               icon: 'ReceiptIcon' // Icon for the last level
  //             },
  //             {
  //               id: '29',
  //               title: 'PETTY CASH PAYMENT',
  //               type: 'item',
  //               url_path: 'petty_cash_payment',
  //               icon: 'LocalAtmIcon' // Icon for the last level
  //             },
  //             {
  //               id: '30',
  //               title: 'CASH RECEIPT',
  //               type: 'item',
  //               url_path: 'cash_receipt',
  //               icon: 'MonetizationOnIcon' // Icon for the last level
  //             },
  //             {
  //               id: '31',
  //               title: 'JOURNAL',
  //               type: 'item',
  //               url_path: 'journal',
  //               icon: 'MenuBookIcon' // Icon for the last level
  //             },
  //             {
  //               id: '32',
  //               title: 'LPO',
  //               type: 'item',
  //               url_path: 'lpo',
  //               icon: 'DescriptionIcon' // Icon for the last level
  //             },
  //             {
  //               id: '33',
  //               title: 'CPO',
  //               type: 'item',
  //               url_path: 'cpo',
  //               icon: 'DescriptionIcon' // Icon for the last level
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // }
  // ]
};

export default other;
