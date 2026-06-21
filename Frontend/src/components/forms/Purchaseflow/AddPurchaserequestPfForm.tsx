import React, { useState, useEffect, useRef } from 'react';
import FilesForPurchaseRequest from './FilesForPurchaseRequest';
import UniversalDialog from 'components/popup/UniversalDialog';
import FileUploadServiceInstance from 'service/services.files';
import { TFile } from 'types/types.file';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { IoIosAttach } from 'react-icons/io';
import { IoIosDocument } from 'react-icons/io';
import { IoPrintSharp } from 'react-icons/io5';
import { BiDetail } from 'react-icons/bi';
import { MdOutlineLibraryAddCheck } from 'react-icons/md';
import { FaSave } from 'react-icons/fa';
import { IoSendSharp } from 'react-icons/io5';
import { MdCancelScheduleSend } from 'react-icons/md';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import ReportDialogPage from 'pages/Report/ReportDialogPage';
import PurchaseRequestReportDesign from 'pages/Report/components/PurchaseRequestReportDesign';

import {
  TextField,
  Button,
  Tabs,
  Tab,
  Box,
  Autocomplete,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Modal,
  ButtonGroup,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import PfServiceInstance from 'service/service.purhaseflow';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { dispatch, useSelector } from 'store';
import useAuth from 'hooks/useAuth';
import { Add as AddIcon } from '@mui/icons-material';
import { TPurchaserequestPf, TItemPrrequest, TPrTermCondition } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import TermsAndCondition from './TermsAndCondition';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { openSnackbar } from 'store/reducers/snackbar';

import { Table as AntTable, Popconfirm, Result } from 'antd';
import { Select as AntSelect } from 'antd';
import SentbackRollSection from './SentbackRollSection';
import { ImExit } from 'react-icons/im';
import { SentBackPopup } from 'pages/Purchasefolder/MyTaskPendingRequestTab';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { FaCheckCircle } from 'react-icons/fa';
//User Level

import PoList from './PoList';
import { FetchPOListingData } from 'pages/Purchasefolder/type/polisting';
import { gs_userlevel, useInitializeUserLevel } from 'shared/global-state';
import { clearAlert, showAlert } from 'store/CustomAlert/alertSlice';
import CustomAlert from 'components/@extended/CustomAlert';
import { ColDef } from 'ag-grid-community';
import { ColumnsType } from 'antd/es/table';
import PurchaseRequestFormReport from 'components/reports/purchase/PurchaseRequestFormReport';
import PurchaseRequestLogReport from 'components/reports/purchase/PurchaseRequestLogReport';
import { CurrencyListResponse, IddCurrency } from 'pages/Purchasefolder/type/currency_pr_type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

interface SupplierOption {
  supp_code: string;
  supp_name: string;
}

interface ParentRowData {
  key: string;
  items: TItemPrrequest[];
  totalBudget: number;
  totalPrAmount: number;
  totalPoAmount: number;
}

/*interface SupplierListResponse {
  tableData: SupplierOption[];
  count: number;
}*/

interface UomOption {
  uom_code: string;
  uom_name: string;
}

interface UomListResponse {
  tableData: UomOption[];
  count: number;
}

interface ProdOption {
  prod_code: string;
  prod_name: string;
  upp: number;
  uppp: number;
  p_uom: string;
  l_uom: string;
  prin_code: string;
}

interface ProdListResponse {
  tableData: ProdOption[];
  count: number;
}

interface CostOption {
  cost_code: string;
  cost_name: string;
}

/*interface CostListResponse {
  tableData: CostOption[];
  count: number;
}*/

interface ProjectOption {
  project_code: string;
  project_name: string;
}

interface ProjectListResponse {
  tableData: ProjectOption[];
  count: number;
}

interface AddPurchaserequestPfFormProps {
  request_number?: string;
}
interface AddPurchaserequestPfFormProps {
  request_number?: string;
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData: TPurchaserequestPf;
}

const initialPurchaseRequest = (): TPurchaserequestPf => ({
  requestor_name: '',
  div_code: '',
  request_number: '',
  request_date: new Date(),
  need_by_date: new Date(),
  description: '',
  wo_number: '',
  type_of_contract: '',
  type_of_material_supply: 'N/A',
  contract_soft_hard: 'N/A',
  service_type: 'N/A',
  amc_service_status: 'N/A',
  amc_from: undefined,
  remarks: '',
  amc_to: undefined,
  flow_level_running: 1,
  material_mechanical: 'N',
  material_electrical: 'N',
  material_plumbing: 'N',
  material_tools: 'N',
  material_civil: 'N',
  material_ac: 'N',
  material_cleaning: 'N',
  material_other: 'N',
  services_temp_staff: 'N',
  services_rentals: 'N',
  services_subcon_conslt: 'N',
  services_other: 'N',
  other_stationery: 'N',
  other_it: 'N',
  other_new_uniform_ppe: 'N',
  other_rplcmt_uniform: 'N',
  other_other: 'N',
  good_material_request: 'N',
  service_request: 'N',
  project_code: '',
  company_code: '',
  created_by: '',
  updated_by: '',
  last_action: '',
  created_at: new Date(),
  updated_at: new Date(),
  fa_uploaded: 'N',
  final_approved: 'No',
  type_of_pr: '',
  covered_by_contract_yes: 'N/A',
  flag_sharing_cost: 'N/A',
  budgeted_yes: 'N/A',
  checked_store_yes: 'N/A',
  amount: 0,
 exchange_rate: 0,
  //div_code 10
  accommodation: 'N',
  catering: 'N',
  laundry_housekeeping: 'N',
  medical: 'N',
  transportation: 'N',
  training: 'N',
  recruitment_hr: 'N',
  uniform: 'N',
  stationary: 'N',
  it_tech: 'N',
  furniture: 'N',
  entertainment: 'N',
  barber: 'N',
  others: 'N',

  items: [
    // {
    //   item_code: '',
    //   item_desp: '',
    //   item_group_code: '',
    //   item_rate: 0,
    //   p_uom: '',
    //   flow_level_running: 1,
    //   l_uom: '',
    //   upp: 0,
    //   item_l_qty: 0,
    //   item_p_qty: 0,
    //   appr_upp: 0,
    //   appr_item_l_qty: 0,
    //   appr_item_p_qty: 0,
    //   currency_rate: 0,
    //   amount: 0,
    //   company_code: '',
    //   updated_at: new Date(),
    //   updated_by: '',
    //   request_number: '',
    //   curr_code: '',
    //   lcurr_amt: 0,
    //   allocated_approved_quantity: 0,
    //   selected_item: '',
    //   last_action: 'SAVEASDRAFT',
    //   history_serial: 0,
    //   curr_name: '',
    //   item_sequence_no: 0,
    //   item_srno: 0,
    //   supplier_part_code: '',
    //   rate_method: '',
    //   supplier: '',
    //   select_item: '',
    //   discount_amount: 0,
    //   final_rate: 0,
    //   item_cancel: '',
    //   mail_attach: '',
    //   cash_ind: '',
    //   service_rm_flag: 'Service',
    //   addl_item_desc: '',
    //   pr_amount: 0,
    //   po_amount: 0,
    //   month_budget: 0,
    //   ac_name: '',
    //   cost_code: '',
    //   cost_name: '',
    //   ref_doc_no: '',
    //   doc_date: null
    // }
  ],

  Termscondition: [
    {
      tsupplier: '',
      remarks: '',
      dlvr_term: '',
      payment_terms: '',
      quatation_reference: '',
      delivery_address: ''
    }
  ]
});

interface AddPurchaserequestPfFormProps {
  divCode?: string; // Optional
  setDivCode?: React.Dispatch<React.SetStateAction<string>>; // Optional
  request_number?: string;
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  isViewMode: boolean;
  existingData: TPurchaserequestPf;
}

const AddPurchaserequestPfForm: React.FC<AddPurchaserequestPfFormProps> = ({
  divCode, // Default empty string if not provided
  setDivCode = () => { },
  request_number = '',
  onClose,
  isEditMode,
  isViewMode,
  existingData
}) => {

  const [prReportValues, setPrReportValues] = useState<{
    open: boolean;
    companyCode: string;
    requestNumber: string;
  }>({
      open: false,
      companyCode: '',
      requestNumber: ''
  });

  const [purchaseRequest, setPurchaseRequest] = useState<TPurchaserequestPf>(initialPurchaseRequest());
  const [termsConditions, setTermsConditions] = useState<TPrTermCondition[]>([]);
  const [POdata, setPOdata] = useState<FetchPOListingData[]>([]); // State to hold the file data
  //onst [termsConditionsdata] = useState<TPrTermCondition[]>([]);
  const [tabIndex, setTabIndex] = useState(0); // Default to the first tab
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  //changes on 01.12.2024
  const [openRequestForm, setOpenRequestForm] = useState(false); // State to control the modal visibility
  //*** */
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();
  const [tempChanges, setTempChanges] = useState<{ [key: string]: any }>({}); // Store field changes temporarily
  // Removed unused 'openLog' state variable
  const [PoOpen, setPoOpen] = useState(false);
  const [showLog, setShowLog] = useState(false);
  //Approve Modal
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [currentItem, setCurrentItem] = React.useState<any>({
    item_code: '',
    item_desp: '',
    item_group_code: '',
    item_rate: 0,
    p_uom: '',
    flow_level_running: 1,
    l_uom: '',
    upp: 1,
    item_l_qty: 1,
    item_p_qty: 0,
    appr_upp: 0,
    appr_item_l_qty: 0,
    appr_item_p_qty: 0,
    currency_rate: 0,
    amount: 0,
    company_code: '',
    updated_at: new Date(),
    updated_by: '',
    request_number: '',
    curr_code: '',
    lcurr_amt: 0,
    allocated_approved_quantity: 0,
    selected_item: '',
    last_action: '',
    history_serial: 0,
    curr_name: '',
    item_sequence_no: 0,
    item_srno: 0,
    supplier_part_code: '',
    rate_method: '',
    supplier: '',
    select_item: '',
    discount_amount: 0,
    final_rate: 0,
    item_cancel: '',
    mail_attach: '',
    cash_ind: '',
    service_rm_flag: purchaseRequest.items.length > 0 ? 'Addl Desc' : 'Service',
    addl_item_desc: '',
    pr_amount: 0,
    po_amount: 0,
    month_budget: 0,
    ac_name: '',
    cost_code: '',
    cost_name: '',
    ref_doc_no: '',
    doc_date: null
  });

  useInitializeUserLevel();
  // Remove the registration of AllCommunityModule as it does not exist

  // Action Button States
  const [sentBackPopup, setSentBackPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Send Back Request',
    data: { request_number: '', remarks: '', level: '' }
  });

  //Send Back
  const [isSendBackModalOpen, setIsSendbackModalOpen] = useState(false);

  // Reject

  const [rejectPopup, setRejectPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Reject Request',
    data: { request_number: '', remarks: '' }
  });

  // Cancel
  const [createPR, setCreatePR] = useState<boolean>(false);
  const [cancelPopup, setCancelPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Cancel Request',
    data: { request_number: '', remarks: '' }
  });

  //currency

  const { data: currency } = useQuery<CurrencyListResponse>({
    queryKey: ['curr_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };

      const response = await PfServiceInstance.proc_build_dynamic_sql({
        parameter: "ddCurrency",  // Use "ddCurrency" as the parameter
        loginid: user?.loginid ?? "",
        code1: user?.company_code ?? "",
        code2: "NULL",
        code3: "NULL",
        code4: "NULL",
        number1: 0,
        number2: 0,
        number3: 0,
        number4: 0,
        date1: null,
        date2: null,
        date3: null,
        date4: null,
      });

      // ✔ FIX: response is array → wrap into expected shape
      const tableData = Array.isArray(response) ? response as IddCurrency[] : [];
      const count = tableData.length;

      return { tableData, count };
    },
    enabled: !!app,
  });


  console.log('currency', currency?.tableData);

  const { data: uomList } = useQuery<UomListResponse>({
    queryKey: ['uom_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };

      const response = await PfServiceInstance.proc_build_dynamic_sql({
        parameter: "dduommaster",  // Use "dduommaster" as the parameter
        loginid: user?.loginid ?? "",
        code1: user?.company_code ?? "",
        code2: "NULL",
        code3: "NULL",
        code4: "NULL",
        number1: 0,
        number2: 0,
        number3: 0,
        number4: 0,
        date1: null,
        date2: null,
        date3: null,
        date4: null,
      });

      // ✔ FIX: response is array → wrap into expected shape
      const tableData = Array.isArray(response) ? response as UomOption[] : [];
      const count = tableData.length;

      return { tableData, count };
    },
    enabled: !!app,
  });


  // const formattedNeedByDate = purchaseRequest.need_by_date
  //   ? dayjs(purchaseRequest.need_by_date).format('YYYY-MM-DD')
  //   : dayjs().format('YYYY-MM-DD'); // Default to today's date if undefined
  const theme = createTheme({
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif' // Set Roboto as the default font
    }
  });

  const { data: supplierList } = useQuery({
    queryKey: ['supplier_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };

      const response = await PfServiceInstance.proc_build_dynamic_sql({
        parameter: "ddSupplier",               // <-- changed from "division"
        loginid: user?.loginid ?? "",
        code1: user?.company_code ?? "",
        code2: "NULL",
        code3: "NULL",
        code4: "NULL",
        number1: 0,
        number2: 0,
        number3: 0,
        number4: 0,
        date1: null,
        date2: null,
        date3: null,
        date4: null,
      });

      // Ensure response is an array
      const tableData = Array.isArray(response) ? (response as SupplierOption[]) : [];
      const count = tableData.length;

      return { tableData, count };
    },
    enabled: !!app,
  });


  // Product Master
  const { data: prodList } = useQuery<ProdListResponse>({
    queryKey: ['ddprodprojectmaster', app],  // Change queryKey for product data
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };

      // Fetch product data using proc_build_dynamic_sql
      const response = await PfServiceInstance.proc_build_dynamic_sql({
        parameter: "dddivproductmaster",  // This refers to the 'prod_data' parameter for product data
        loginid: user?.loginid ?? "",  // User's login ID
        code1: user?.company_code ?? "",  // User's company code
        code2: divCode ?? "",  // Division code
        code3: "NULL",  // Placeholder for any additional parameters
        code4: "NULL",  // Placeholder for any additional parameters
        number1: 0,  // Placeholder for numerical parameters
        number2: 0,  // Placeholder for numerical parameters
        number3: 0,  // Placeholder for numerical parameters
        number4: 0,  // Placeholder for numerical parameters
        date1: null,  // Placeholder for date parameters
        date2: null,  // Placeholder for date parameters
        date3: null,  // Placeholder for date parameters
        date4: null   // Placeholder for date parameters
      });

      // Transform the response data to match the ProdOption type
      const transformedData = Array.isArray(response) ? response.map((item) => ({
        prod_code: item.prod_code || '',  // Default to empty string if 'prod_code' is missing
        prod_name: item.prod_name || '',  // Default to empty string if 'prod_name' is missing
        upp: item.upp || 0,               // Default to 0 if 'upp' is missing
        ...item                           // Include other properties if needed
      })) : [];

      const count = transformedData.length;

      return {
        tableData: transformedData,
        count
      };
    },
    enabled: !!app  // Ensure query only runs when 'app' is truthy
  });


  const {
    data: projectList,  // Renamed from 'divisionData' to 'projectData'
    isLoading: projectLoading,
    error: projectError
  } = useQuery<ProjectListResponse>({
    queryKey: ['dddivprojectmaster', app],  // Renamed queryKey from 'division' to 'dddivprojectmaster'
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };

      // Calling proc_build_dynamic_sql instead of getddProjectMaster
      const response = await PfServiceInstance.proc_build_dynamic_sql({
        parameter: "dddivprojectmaster",  // New parameter for project data
        loginid: user?.loginid ?? "",  // User's login ID
        code1: user?.company_code ?? "",  // User's company code
        code2: divCode ?? "",  // Division code (could be null or empty)
        code3: "NULL",  // Placeholder for any additional parameters
        code4: "NULL",  // Placeholder for any additional parameters
        number1: 0,  // Placeholder for numerical parameters
        number2: 0,  // Placeholder for numerical parameters
        number3: 0,  // Placeholder for numerical parameters
        number4: 0,  // Placeholder for numerical parameters
        date1: null,  // Placeholder for date parameters
        date2: null,  // Placeholder for date parameters
        date3: null,  // Placeholder for date parameters
        date4: null   // Placeholder for date parameters
      });

      // ✔ FIX: response is array → wrap into expected shape
      const tableData = Array.isArray(response) ? response as ProjectOption[] : [];
      const count = tableData.length;

      return { tableData, count };
    },
    enabled: !!app,  // Only enable query if 'app' is truthy
  });

  console.log('projectList', projectList);

  // Store the previous tab index value
  const prevTabIndexRef = useRef<number | null>(null);
  const { data: costList } = useQuery({
    queryKey: ['cost_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };

      const response = await PfServiceInstance.proc_build_dynamic_sql({
        parameter: "ddcostmaster",  // Use "ddcostmaster" for the parameter
        loginid: user?.loginid ?? "",
        code1: user?.company_code ?? "",
        code2: "NULL",
        code3: "NULL",
        code4: "NULL",
        number1: 0,
        number2: 0,
        number3: 0,
        number4: 0,
        date1: null,
        date2: null,
        date3: null,
        date4: null,
      });

      // ✔ FIX: response is array → wrap into expected shape
      const tableData = Array.isArray(response) ? response as CostOption[] : [];
      const count = tableData.length;

      return { tableData, count };
    },
    enabled: !!app,
  });


  console.log('costList', costList);

  const loadPurchaseRequest = async () => {
    if (request_number) {
      try {
        const purchaseRequestData = await GmPfServiceInstance.getRequestNumber(request_number);
        
        console.log('Received purchase request data:', purchaseRequestData);
        if (!purchaseRequestData || !Array.isArray(purchaseRequestData.items)) {
          console.error('Purchase request data is missing or items array is not present');
          return; // Exit early if data is missing
        }

        console.log('Received purchase request data:', purchaseRequestData);
        if (setDivCode && typeof setDivCode === 'function') {
          setDivCode(purchaseRequestData.div_code || ''); // Set divCode from the data
        }
        const items = purchaseRequestData.items; // This is the dynamic items data
        const termsConditionsdata = purchaseRequestData.Termscondition;
        setTermsConditions(termsConditionsdata);
        console.log('term & conditions', termsConditionsdata);
        // const termsConditionsdata = purchaseRequestData.Termscondition;

        // Now group the items by cost_code
        const groupedItems = groupItemsByCostName(items);
        console.log('Grouped Items:', groupedItems);

        Object.entries(groupedItems).forEach(([cost_name, group]) => {
          console.log(`Cost Name: ${cost_name}, Total Budget: ${group.totalBudget}`);
        });

        // Log the result to see the grouped items
        console.log(groupedItems);
              if (purchaseRequestData) {
        setPurchaseRequest(purchaseRequestData);
        
        // ✅ Populate exchange_rate from item's currency_rate on load
        const nonQARItem = purchaseRequestData.items?.find(
          (item: any) => item.curr_code && item.curr_code !== 'QAR'
        );
        if (nonQARItem && nonQARItem.currency_rate && nonQARItem.currency_rate !== 1) {
          setPurchaseRequest((prev) => ({
            ...prev,
            exchange_rate: nonQARItem.currency_rate
          }));
        }
      }
        
      } catch (error) {
        console.error('Error loading purchase request:', error);
      }
    } else {
      setPurchaseRequest(initialPurchaseRequest());
    }
  };

  useEffect(() => {
    prevTabIndexRef.current = tabIndex;

    loadPurchaseRequest();
    console.log('divCode in useEffect:', divCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request_number]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const startTime = performance.now();

    // Update Termscondition based on accumulated tempChanges
    setPurchaseRequest((prevState) => {
      const updatedTermsConditions = [...prevState.Termscondition];

      // Apply all temporary changes to the Termscondition array
      Object.keys(tempChanges).forEach((key) => {
        const { field, value, index } = tempChanges[key];
        updatedTermsConditions[index] = {
          ...updatedTermsConditions[index],
          [field]: value
        };
      });

      const endTime = performance.now();
      console.log(`State update took ${endTime - startTime}ms`);
      return {
        ...prevState,
        Termscondition: updatedTermsConditions
      };
    });

    // Clear the tempChanges after applying them
    setTempChanges({});

    // Update the tab index
    setTabIndex(newValue);

    // Log the tab index changes
    const prevTabIndex = prevTabIndexRef.current;
    console.log('Old Tab Index:', prevTabIndex);
    console.log('New Tab Index:', newValue);
    prevTabIndexRef.current = newValue;

    console.log('Tab index changed:', newValue);
  };

  const handleChange = (name: keyof TPurchaserequestPf, value: string | Date | number) => {
    console.log('handleChange', name, value);
    setPurchaseRequest((prevRequest) => ({ ...prevRequest, [name]: value }));

    // if (name === 'wo_number') {
    //   setIsWO(!!value);
    // }
  };

  const handleItemChange = (index: number, name: keyof TItemPrrequest, value: string | number) => {
    setPurchaseRequest((prevRequest) => {
      const newItems = [...prevRequest.items];
      const item = { ...newItems[index] };

      // Handle changes for item_p_qty, item_l_qty, and upp
      if (name === 'item_p_qty' || name === 'item_l_qty' || name === 'upp') {
        // First, update the value in the item object
        if (name === 'item_p_qty') item.item_p_qty = value as number;
        if (name === 'item_l_qty') item.item_l_qty = value as number;
        if (name === 'upp') {
          // Set upp to 1 if value is 0 or null
          item.upp = value === 0 || value === null ? 1 : (value as number);
        }

        // Now, recalculate allocated_approved_quantity based on updated values
        const item_p_qty = Number(item.item_p_qty) || 0;
        const item_l_qty = Number(item.item_l_qty) || 0;
        const upp = Number(item.upp) || 1;

        // Recalculate allocated_approved_quantity using the formula
        item.allocated_approved_quantity = item_p_qty * upp + item_l_qty;
        item.amount = item.item_rate * item.allocated_approved_quantity;
        // item.upp = upp;
      }

      // Handle item_rate change separately, sanitizing input and converting to a number
      if (name === 'item_rate' && typeof value === 'string') {
        // Remove non-numeric characters except decimal point (.)
        const sanitizedValue = value.replace(/[^0-9.]/g, '');

        // Ensure there's only one decimal point and the number is valid
        const [integerPart, decimalPart] = sanitizedValue.split('.');
        const validDecimalPart = decimalPart ? decimalPart.slice(0, 2) : ''; // Limit to two decimals
        const formattedValue = `${integerPart}.${validDecimalPart}`;
        item.amount = item.item_rate * item.allocated_approved_quantity;
        // Ensure the value doesn't exceed 9999.99
        const numericValue = parseFloat(formattedValue);
        if (numericValue <= 9999.99) {
          item.item_rate = numericValue;
        } else {
          item.item_rate = 9999.99; // Cap the value at 9999.99
        }
      }
      // Calculate item.amount whenever item_rate or allocated_approved_quantity changes

      // For other fields, handle them normally
      else {
        // Ensure the value type is correctly assigned
        (item as any)[name] = value;
      }

      // After any change, update Addl Desc items that follow this item
      if (name !== 'cost_code' || item.service_rm_flag !== 'Addl Desc') {
        // Find all Addl Desc items that come after this item
        for (let i = index + 1; i < newItems.length; i++) {
          if (newItems[i].service_rm_flag === 'Addl Desc') {
            // Update their cost_code to match the current item's cost_code
            newItems[i] = {
              ...newItems[i],
              cost_code: item.cost_code
            };
          } else {
            // Stop when we hit a non-Addl Desc item
            break;
          }
        }
      }

      // Save the updated item back in the array

      newItems[index] = item;

      return { ...prevRequest, items: newItems };
    });
  };

  // const validateTermsConditions = (data: TPrTermCondition) => {

  const validatePurchaseRequest = (data: TPurchaserequestPf, termsConditions?: TPrTermCondition[]) => {
    // const errors: string[] = [];
    const errors: string[] = [];

    console.log('validate termsConditions', termsConditions);
    // Validate terms and conditions
    // Validate terms and conditions - check both possible property names
    if (data.flow_level_running === 3) {
      const termsToValidate = termsConditions || [];
      // const termsToValidate = data.Termscondition || [];

      if (termsToValidate.length === 0 && data.last_action === 'SUBMITTED') {
        errors.push('At least one term and condition is required.');
      } else {
        termsToValidate.forEach((term, index) => {
          const termPrefix = `Terms & Conditions (Item ${index + 1}):`;

          if (data.last_action === 'SUBMITTED' && (!term.dlvr_term || term.dlvr_term.trim() === '')) {
            errors.push(`${termPrefix} Delivery terms are required`);
          }
          if (data.last_action === 'SUBMITTED' && (!term.payment_terms || term.payment_terms.trim() === '')) {
            errors.push(`${termPrefix} Payment terms are required`);
          }
          if (data.last_action === 'SUBMITTED' && (!term.quatation_reference || term.quatation_reference.trim() === '')) {
            errors.push(`${termPrefix} Quotation reference is required`);
          }
        });
      }
    }

    // Validate top-level fields

    if (!data.project_code || data.project_code.trim() === '') {
      errors.push('Project Code is required.');
    }

    if (data.type_of_pr === 'Charge to Customer') {
      if (!data.wo_number || data.wo_number.trim() === '') {
        errors.push('Work Order is required.');
      }
    }

    if (!data.description || data.description.trim() === '') {
      errors.push('Scope of Work is required.');
    }
    if (!data.remarks || data.remarks.trim() === '') {
      errors.push('Remarks is required.');
    }
    if (!data.type_of_contract || data.type_of_contract.trim() === '') {
      errors.push('Please select Type of Contract');
    }
    if (data.type_of_contract === 'AMC' && !data.amc_from) {
      errors.push('Please select AMC Data From');
    }
    if (data.type_of_contract === 'AMC' && !data.amc_to) {
      errors.push('Please select AMC Data To');
    }
    if (!data.type_of_pr || data.type_of_pr.trim() === '') {
      errors.push('Please select Type of PR');
    }
    // if (data.request_date && data.need_by_date && data.request_date > data.need_by_date) {
    //   errors.push('Need By Date cannot be less than or equal to Request Date');
    // }

    // Validate items array
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required.');
    } else {
      data.items.forEach((item, index) => {
        if (
          (item.service_rm_flag === 'Service' ||
            item.service_rm_flag === 'Addl Desc' ||
            (item.service_rm_flag === 'RM' && item.item_code === 'NEWITEM')) &&
          (!item.addl_item_desc || item.addl_item_desc.trim() === '')
        ) {
          errors.push(`Item ${index + 1}: Enter Item description.`);
        }
        if (item.service_rm_flag === 'RM') {
          if (!item.item_code || item.item_code.trim() === '') {
            errors.push(`Item ${index + 1}: Product is required.`);
          }
        }
        if (item.service_rm_flag === 'RM') {
          if (!item.p_uom || item.p_uom.trim() === '') {
            errors.push(`Item ${index + 1}: Please Select Primary Unit of Measurement(PUOM).`);
          }
        }

        // if (item.service_rm_flag === 'RM' && data.last_action === 'SUBMITTED') {
        //   if (!item.item_p_qty || item.item_p_qty <= 0) {
        //     errors.push(`Item ${index + 1}: Primary Unit Quantity must be greater than 0.`);
        //   }
        // }
        // if (item.service_rm_flag !== 'Addl Desc' && data.last_action === 'SUBMITTED') {
        //   if (!item.item_l_qty || item.item_l_qty <= 0) {
        //     errors.push(`Item ${index + 1}: Lowest Quantity must be greater than 0.`);
        //   }
        // }
        if (item.service_rm_flag !== 'Addl Desc' && data.last_action === 'SUBMITTED') {
          if (!item.allocated_approved_quantity || item.allocated_approved_quantity <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be greater than 0.`);
          }
        }
        // if (!item.l_uom || item.l_uom.trim() === '') {
        //   errors.push(`Item ${index + 1}: Please Select Primary Unit of Measurement(PUM).`);
        // }
        if (item.service_rm_flag !== 'Addl Desc') {
          if (!item.l_uom || item.l_uom.trim() === '') {
            errors.push(`Item ${index + 1}: Please select Lowest Unit of Measurement (LUOM).`);
          }
        }

        if (data.flow_level_running === 2 || data.flow_level_running === 4) {
          if (!item.cost_code || item.cost_code.trim() === '') {
            errors.push(`Item ${index + 1}: Please Select Cost Code`);
          }
        }

        if (data.flow_level_running === 3 && item.service_rm_flag !== 'Addl Desc') {
          if (data.last_action === 'SUBMITTED' && (!item.supplier || item.supplier.trim() === '')) {
            errors.push(`Item ${index + 1}: Please Select Supplier`);
          }
          // eslint-disable-next-line eqeqeq
          if (data.last_action === 'SUBMITTED' && (!item.item_rate || item.item_rate <= 0 || item.item_rate === 0.0)) {
            errors.push(`Item ${index + 1}: Please enter Item rate`);
          }
          if (data.last_action === 'SUBMITTED' && (!item.amount || item.amount <= 0 || item.amount === 0.0)) {
            errors.push(`Item ${index + 1}:  Amount cannot be 0`);
          }
        }
        // Add more field checks as needed
      });
    }

if (gs_userlevel === 4) {
  const hasNonQARCurrency = data.items.some(item => item.curr_code && item.curr_code !== 'QAR');

  if (hasNonQARCurrency) {
    if (!data.exchange_rate || data.exchange_rate <= 0) {
      errors.push('Exchange Rate is required when currency is not QAR.');
    } else if (data.exchange_rate === 1) {
      errors.push('Exchange Rate cannot be 1. Please enter the actual exchange rate.');
    }
  }
}


    return errors;
  };

  const data = purchaseRequest?.items;

  console.log('cost details data', data);
  console.log(submitStatus);

  // Function to group data by "Cost Name"
  const groupData = (data: any[]) => {
    return data.reduce((acc, item) => {
      if (!acc[item.cost_name]) {
        acc[item.cost_name] = { items: [] };
      }
      acc[item.cost_name].items.push(item);
      return acc;
    }, {});
  };
  console.log('groupData', groupData);

  const ServiceTypeCellRenderer = (props: any) => {
    const { value, data, node, api, colDef } = props;

    const handleChange: (newValue: string) => void = (newValue) => {
      // Update the data in AG Grid
      const newData = { ...data, service_rm_flag: newValue };
      api.applyTransaction({ update: [newData] });

      // Reset dependent fields
      const resetData = {
        ...newData,
        cost_code: '',
        p_uom: '',
        item_p_qty: 0,
        l_uom: '',
        item_l_qty: 0,
        upp: 0
      };
      api.applyTransaction({ update: [resetData] });

      // If you need to notify parent component
      if (colDef.cellRendererParams?.onChange) {
        colDef.cellRendererParams.onChange(node.rowIndex, newValue);
      }
    };

    return (
      <AntSelect
        size="small"
        showSearch
        style={{ width: '100%', fontSize: '11px' }}
        placeholder="Select Service"
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        options={[
          { value: 'Service', label: 'Service' },
          { value: 'RM', label: 'Raw Material' },
          { value: 'Addl Desc', label: 'Sub Service' }
        ]}
        value={value}
        onChange={handleChange}
        dropdownStyle={{ zIndex: 9999 }}
        variant="borderless"
        disabled={isViewMode || gs_userlevel === 5} // Disable the select if in view mode
      />
    );
  };

  const CostCodeCellRenderer = (props: any) => {
    const { value, data, node, api, colDef } = props;
    const { costListTableData = [] } = colDef.cellRendererParams || {};

    // Get the display value - if this is "Addl Desc", get from previous row
    const getDisplayValue = () => {
      if (data.service_rm_flag === 'Addl Desc') {
        const rowIndex = node.rowIndex;
        if (rowIndex > 0) {
          const previousNode = api.getDisplayedRowAtIndex(rowIndex - 1);
          return previousNode?.data?.cost_code || '';
        }
        return '';
      }
      return value || '';
    };

    const displayValue = getDisplayValue();

    if (isViewMode || gs_userlevel === 5) {
      // View mode - just display the value
      return <div>{displayValue}</div>;
    }

    const handleChange = (newValue: string) => {
      // Update the data in AG Grid
      const newData = { ...data, cost_code: newValue };
      api.applyTransaction({ update: [newData] });

      // If you need to notify parent component
      if (colDef.cellRendererParams?.onChange) {
        colDef.cellRendererParams.onChange(node.rowIndex, newValue);
      }
    };

    // For "Addl Desc" rows, show the inherited value but make it non-editable
    if (data.service_rm_flag === 'Addl Desc') {
      return (
        <div
          style={{
            padding: '5px ',
            color: '#666' // Optional: gray out to indicate it's inherited
          }}
        >
          {displayValue}
        </div>
      );
    }

    // Format options from API data
    const costCodeOptions = costListTableData.map((item: any) => ({
      value: item.cost_code,
      label: `${item.cost_code} - ${item.cost_name}`
    }));

    return (
      <AntSelect
        disabled={isViewMode || gs_userlevel === 5}
        size="small"
        showSearch
        style={{ width: '100%' }}
        placeholder="Select Cost Code"
        filterOption={(input, option) =>
          String(option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        options={costCodeOptions}
        value={value}
        onChange={handleChange}
        dropdownStyle={{ zIndex: 9999 }}
        variant="borderless"
      />
    );
  };

  const ProductCellRenderer = (props: any) => {
    const { value, data, node, api, colDef } = props;
    const { productData = [], onChange } = colDef.cellRendererParams || {};

    const handleChange = (selectedValue: string) => {
      const selectedProduct = productData.find((item: ProdOption) => item.prod_code === selectedValue);

      if (selectedProduct) {
        // Update the data in AG Grid
        const newData = {
          ...data,
          item_code: selectedProduct.prod_code,
          upp: selectedProduct.upp || 0
        };
        api.applyTransaction({ update: [newData] });

        // Notify parent component if needed
        if (onChange) {
          onChange(node.rowIndex, selectedValue);
        }
      }
    };

    // Format options from product data
    const productOptions = productData.map((item: ProdOption) => ({
      value: item.prod_code,
      label: `${item.prod_code} - ${item.prod_name}`
    }));

    return (
      <AntSelect
        size="small"
        showSearch
        style={{ width: '100%' }}
        placeholder="Select Product"
        value={value}
        onChange={handleChange}
        filterOption={(input, option) =>
          String(option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        dropdownStyle={{
          zIndex: 9999,
          minWidth: 'fit-content',
          maxHeight: 'fit-content',
          overflow: 'auto'
        }}
        dropdownRender={(menu) => <div style={{ minWidth: '100%' }}>{menu}</div>}
        variant="borderless"
        options={productOptions.map((option: any) => ({
          ...option,
          style: {
            whiteSpace: 'nowrap',
            overflow: 'visible',
            textOverflow: 'unset'
          }
        }))}
      />
    );
  };

  const LUOMCellRenderer = (props: any) => {
    const { value, data, node, api, colDef } = props;
    const { uomData = [] } = colDef.cellRendererParams || {};

    const handleChange = (newValue: string) => {
      // Update the data in AG Grid
      const newData = { ...data, cost_code: newValue };
      api.applyTransaction({ update: [newData] });

      // If you need to notify parent component
      if (colDef.cellRendererParams?.onChange) {
        colDef.cellRendererParams.onChange(node.rowIndex, newValue);
      }
    };

    // Skip rendering if this is  a "Addl Desc" row
    if (data.service_rm_flag === 'Addl Desc') {
      return null;
    }

    // Format options from API data
    const uomOptions = uomData.map((item: any) => ({
      value: item.uom_code,
      label: item.uom_name
    }));

    return (
      <AntSelect
        disabled={isViewMode || gs_userlevel === 5}
        size="small"
        showSearch
        style={{ width: '100%' }}
        placeholder="Select LUOM"
        filterOption={(input, option) =>
          String(option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        options={uomOptions}
        value={value}
        onChange={handleChange}
        dropdownStyle={{ zIndex: 9999 }}
        variant="borderless"
      />
    );
  };

  // const ProductCellRenderer = (props: any) => {
  //   const { value,  node,  colDef } = props;
  //   const { productData = [], onChange } = colDef.cellRendererParams || {};

  //   const handleChange = (selectedValue: string) => {
  //     const selectedProduct = productData.find((item: ProdOption) => item.prod_code === selectedValue);

  //     // if (selectedProduct) {
  //     //   // Update the data in AG Grid
  //     //   const newData = {
  //     //     ...data,
  //     //     item_code: selectedProduct.prod_code,
  //     //     upp: selectedProduct.upp || 1
  //     //   };

  //     //   api.applyTransaction({ update: [newData] });

  //     //   // Notify parent component if needed
  //     //   if (onChange) {
  //     //     onChange(node.rowIndex, selectedValue);
  //     //   }
  //     // }
  //     if (selectedProduct) {

  //       // Directly update the row data using rowNode
  //       node.setDataValue('item_code', selectedValue);
  //       node.setDataValue('upp', selectedProduct.upp || 0);

  //       // Notify parent component if needed
  //       if (onChange) {
  //         onChange(node.rowIndex, selectedValue);
  //       }
  //     }
  //   };

  //   // Format options from product data
  //   const productOptions = productData.map((item: ProdOption) => ({
  //     value: item.prod_code,
  //     label: `${item.prod_code} - ${item.prod_name} - ${item.upp}`
  //   }));

  //   return (
  //     <AntSelect
  //       disabled={isViewMode || gs_userlevel === 5}
  //       size="small"
  //       showSearch
  //       style={{ width: '100%' }}
  //       placeholder="Select Product"
  //       value={value}
  //       onChange={handleChange}
  //       filterOption={(input, option) =>
  //         String(option?.label ?? '')
  //           .toLowerCase()
  //           .includes(input.toLowerCase())
  //       }
  //       dropdownStyle={{
  //         zIndex: 9999,
  //         minWidth: 'fit-content',
  //         maxHeight: 'fit-content',
  //         overflow: 'auto'
  //       }}
  //       dropdownRender={(menu) => <div style={{ minWidth: '100%' }}>{menu}</div>}
  //       variant="borderless"
  //       options={productOptions.map((option: any) => ({
  //         ...option,
  //         style: {
  //           whiteSpace: 'nowrap',
  //           overflow: 'visible',
  //           textOverflow: 'unset'
  //         }
  //       }))}
  //     />
  //   );
  // };

  const SupplierSelectCellRenderer = (props: any) => {
    const { value, data, node, api, colDef } = props;
    const { SupplierData } = colDef.cellRendererParams || {};

    const handleChange = (selectedValue: string) => {
      // Update the data in AG Grid
      const newData = { ...data, supplier: selectedValue };
      api.applyTransaction({ update: [newData] });

      // Notify parent component
      if (colDef.cellRendererParams?.onChange) {
        colDef.cellRendererParams.onChange(node.rowIndex, selectedValue);
      }
    };

    // Format options from API data
    const supplierOptions = SupplierData.map((item: SupplierOption) => ({
      value: item.supp_code,
      label: `${item.supp_name}`
    }));

    return (
      <AntSelect
        disabled={isViewMode || gs_userlevel === 5}
        size="small"
        showSearch
        style={{ width: '100%' }}
        placeholder="Select Supplier"
        filterOption={(input, option) =>
          String(option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        options={supplierOptions}
        value={value}
        onChange={handleChange}
        dropdownStyle={{ zIndex: 9999 }}
        variant="borderless"
      />
    );
  };

  const CostColumns: ColDef[] = [
    {
      field: 'cost_code',
      headerName: 'Cost Code',
      headerClass: 'flex justify-start',
      width: 210,
      cellRenderer: CostCodeCellRenderer,
      cellRendererParams: {
        costListTableData: costList?.tableData || [],
        onChange: (index: number, value: string) => {
          handleItemChange(index, 'cost_code', value);
        }
      },
      valueGetter: (params) => {
        // If this is an 'Addl Desc' item, get the cost code from the previous item
        if (params.data.service_rm_flag === 'Addl Desc') {
          const rowIndex = params.node?.rowIndex ?? 0;
          if (rowIndex > 0) {
            const previousNode = params.api.getDisplayedRowAtIndex(rowIndex - 1);
            return previousNode?.data?.cost_code || '';
          }
        }
        return params.data.cost_code || '';
      },
      cellStyle: (params) => ({
        backgroundColor: params.data.service_rm_flag === 'Addl Desc' ? 'lightGrey' : 'transparent'
      }),
      suppressCellFlash: true,
      suppressMovable: true,
      suppressAutoSize: true
    },
    {
      headerName: 'Description',
      field: 'item_desp',
      width: 210,
      valueGetter: (params) => params.data.addl_item_desc || params.data.item_desp
    },
    {
      headerName: 'Primary Qty',
      field: 'item_p_qty',
      width: 210,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' }
    },
    {
      headerName: 'Primary UOM',
      field: 'p_uom',
      width: 230
    },
    {
      headerName: 'Lowest Qty',
      field: 'item_l_qty',
      width: 210,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' }
    },
    {
      headerName: 'Lowest UOM',
      field: 'l_uom',
      width: 210,
      valueGetter: (params) => {
        // Find matching UOM in uomList
        const uom = uomList?.tableData?.find((uomItem) => uomItem.uom_code === params.data.l_uom);

        // Return uom_name if found, otherwise the code
        return uom?.uom_name || params.data.l_uom || '';
      },
      suppressCellFlash: true,
      suppressMovable: true,
      suppressAutoSize: true
    },
    {
      headerName: 'Quantity',
      field: 'allocated_approved_quantity',
      width: 180,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' }
    },
    {
      headerName: 'Rate',
      field: 'item_rate',
      width: 180,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' }
    },
    {
      headerName: 'Discount Amount',
      field: 'discount_amount',
      width: 290,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' }
    },
    {
      headerName: 'Final Rate',
      field: 'final_rate',
      width: 180,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' }
    },
    {
      headerName: 'Amount',
      field: 'amount',
      width: 180,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' }
    }
  ];

  //  Cost Details table Before Saving the Cost Code
  const CostDetailBeforeSave = () => {
    const gridRef = React.useRef<AgGridReact>(null);
    return (
      <div className="ag-theme-alpine ag-theme-alpine-mytable" style={{ width: 'auto', fontSize: '11px' }}>
        <AgGridReact
          ref={gridRef}
          columnDefs={CostColumns}
          rowData={purchaseRequest?.items || []}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true
          }}
          animateRows={true}
          suppressCellFocus={true}
          domLayout="autoHeight"
        />
      </div>
    );
  };

  ///Ant Table
  const MyAntTable = () => {
    const [expandedRowKeys, setExpandedRowKeys] = React.useState<React.Key[]>([]);

    const gridRef = React.useRef<AgGridReact>(null);

    const [groupedData, setGroupedData] = React.useState<{
      [key: string]: {
        items: TItemPrrequest[];
        totalBudget: number;
        totalPrAmount: number;
        totalPoAmount: number;
      };
    }>({
      group1: {
        items: [
          {
            div_code: '',
            cost_code: '001',
            addl_item_desc: 'Item 1',
            item_p_qty: 10,
            p_uom: 'kg',
            item_l_qty: 5,
            l_uom: 'kg',
            allocated_approved_quantity: 8,
            item_rate: 100,
            discount_amount: 10,
            final_rate: 90,
            amount: 720,
            item_code: '',
            item_desp: '',
            item_group_code: '',
            upp: 0,
            flow_level_running: 0,
            appr_upp: 0,
            appr_item_l_qty: 0,
            appr_item_p_qty: 0,
            currency_rate: 0,
            company_code: '',
            updated_at: new Date(),
            updated_by: '',
            request_number: '',
            curr_code: '',
            lcurr_amt: 0,
            history_serial: 0,
            curr_name: '',
            item_sequence_no: 0,
            item_srno: 0,
            supplier_part_code: '',
            rate_method: '',
            supplier: '',
            select_item: '',
            item_cancel: '',
            cash_ind: '',
            service_rm_flag: '',
            pr_amount: 0,
            po_amount: 0,
            month_budget: 0,
            ac_name: '',
            cost_name: '',
            doc_date: null,
            prod_name: ''
          }
          // Add more items as needed
        ],
        totalBudget: 1000,
        totalPrAmount: 800,
        totalPoAmount: 700
      }
    });

    // Group data by "Cost Name"
    React.useEffect(() => {
      console.log('useEffect triggered with data:', data);
      if (purchaseRequest?.items) {
        const grouped = groupItemsByCostName(purchaseRequest?.items);
        setGroupedData(grouped);
        console.log('Grouped Data:', grouped);

        const keys = Object.keys(grouped);
        setExpandedRowKeys(keys);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const handleExpand = (expanded: boolean, record: ParentRowData) => {
      if (expanded) {
        setExpandedRowKeys([...expandedRowKeys, record.key]);
      } else {
        setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record.key));
      }
    };

    const childColumnDefs: ColDef[] = [
      {
        field: 'cost_code',
        headerName: 'Cost Code',
        headerClass: 'flex justify-start',
        width: 210,
        cellRenderer: CostCodeCellRenderer,
        cellRendererParams: {
          costListTableData: costList?.tableData || [],
          onChange: (index: number, value: string) => {
            handleItemChange(index, 'cost_code', value);
          }
        },
        valueGetter: (params) => params.data.cost_code || '',
        cellStyle: (params) => ({
          backgroundColor: params.data.service_rm_flag === 'Addl Desc' ? 'lightGrey' : 'transparent'
        }),
        suppressCellFlash: true,
        suppressMovable: true,
        suppressAutoSize: true
      },
      {
        headerName: 'Description',
        field: 'item_desp',
        width: 210,
        valueGetter: (params) => params.data.addl_item_desc || params.data.item_desp
      },
      {
        headerName: 'Primary Qty',
        field: 'item_p_qty',
        width: 210,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' }
      },
      {
        headerName: 'Primary UOM',
        field: 'p_uom',
        width: 230,
        valueGetter: (params) => {
          // Find matching UOM in uomList
          const uom = uomList?.tableData?.find((uomItem) => uomItem.uom_code === params.data.p_uom);

          // Return uom_name if found, otherwise the code
          return uom?.uom_name || params.data.p_uom || '';
        },
        suppressCellFlash: true,
        suppressMovable: true,
        suppressAutoSize: true
      },
      {
        headerName: 'Lower Qty',
        field: 'item_l_qty',
        width: 210,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' }
      },
      {
        headerName: 'Lower UOM',
        field: 'l_uom',
        width: 210
      },
      {
        headerName: 'Quantity',
        field: 'allocated_approved_quantity',
        width: 180,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' }
      },
      {
        headerName: 'Rate',
        field: 'item_rate',
        width: 180,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' }
      },
      {
        headerName: 'Discount Amount',
        field: 'discount_amount',
        width: 290,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' }
      },
      {
        headerName: 'Final Rate',
        field: 'final_rate',
        width: 180,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' }
      },
      {
        headerName: 'Amount',
        field: 'amount',
        width: 180,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' }
      }
    ];

    const parentColumns: ColumnsType<ParentRowData> = [
      {
        title: () => <span className="flex bg-gray-200 justify-center py-1 text-sm font-bold">Project Name</span>,
        dataIndex: 'key',
        key: 'key',
        className: ' bg-gray-200'
      },
      {
        title: () => <span className="flex bg-gray-200 justify-center py-1 text-sm font-bold">Total Budget</span>,
        dataIndex: 'totalBudget',
        key: 'totalBudget',
        align: 'right' as 'right',
        className: ' bg-gray-200'
      },
      {
        title: () => <span className="flex bg-gray-200 justify-center py-1 text-sm font-bold">Total PR Amount</span>,
        dataIndex: 'totalPrAmount',
        key: 'totalPrAmount',
        className: ' bg-gray-200',
        align: 'right' as 'right'
      },
      {
        title: () => <span className="flex bg-gray-200 justify-center py-1 text-sm font-bold">Total PO Amount</span>,
        dataIndex: 'totalPoAmount',
        className: ' bg-gray-200',
        key: 'totalPoAmount',
        align: 'right'
      }
    ];

    const parentData: ParentRowData[] = Object.keys(groupedData).map((key) => ({
      key,
      ...groupedData[key]
    }));

    return (
      <AntTable
        size="small"
        bordered={true}
        columns={parentColumns}
        dataSource={parentData}
        pagination={false}
        className="bg-gray-200 [&_.ant-table]:bg-gray-200 [&_.ant-table-thead_.ant-table-cell]:bg-gray-200 [&_.ant-table-tbody_.ant-table-cell]:bg-gray-200"
        expandable={{
          expandedRowKeys,
          onExpand: handleExpand,
          expandedRowRender: (record) => (
            <div className="ag-theme-alpine ag-theme-alpine-mytable ml-4" style={{ width: 'auto', fontSize: '11px' }}>
              <AgGridReact
                ref={gridRef}
                rowData={record.items}
                columnDefs={childColumnDefs}
                defaultColDef={{ resizable: true, sortable: true }}
                domLayout="autoHeight" // Key change here
                animateRows={true}
                rowHeight={25}
                headerHeight={25}
                suppressScrollOnNewData={true}
                onGridReady={({ api }) => {
                  api.sizeColumnsToFit();
                }}
                onFirstDataRendered={({ api }) => {
                  api.sizeColumnsToFit();
                }}
                suppressClickEdit={isViewMode || gs_userlevel === 5}
              />
            </div>
          ),
          rowExpandable: (record) => record.items.length > 0
        }}
      />
    );
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setCurrentItem({ ...purchaseRequest.items[index] });
    setIsOpenDetail(true);
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseRequest((prevRequest) => {
      const newItems = [...prevRequest.items];
      newItems.splice(index, 1);
      return {
        ...prevRequest,
        items: newItems
      };
    });
  };

  console.log('purchaseRequest.items', purchaseRequest.items);

  const AgTableItemDetails = () => {
    const [rowData, setRowData] = React.useState(
      () =>
        purchaseRequest.items?.length > 0
          ? purchaseRequest.items.map((item, index) => ({
            ...item,
            originalIndex: index,
            item_p_qty: Number(item.item_p_qty) || 0, // Force conversion to number
            item_l_qty: Number(item.item_l_qty) || 0 // Force conversion to number
          }))
          : [] // Empty array when no items
    );

    console.log('rowData', rowData);

    const onCellValueChanged = React.useCallback((params: any) => {
      setRowData((prev) => {
        const newData = [...prev];
        newData[params.rowIndex] = params.data;
        return newData;
      });
    }, []);

    const gridWrapperRef = React.useRef(null);

    // Update rowData when source changes
    React.useEffect(() => {
      console.log('items of table', purchaseRequest.items);
      setRowData(
        purchaseRequest.items?.length > 0
          ? purchaseRequest.items.map((item, index) => ({
            ...item,
            originalIndex: index,
            item_p_qty: Number(item.item_p_qty) || 0, // Force conversion to number
            item_l_qty: Number(item.item_l_qty) || 0 // Force conversion to number
          }))
          : [] // Empty array when no items
      );
    }, [purchaseRequest.items]);

    const columnDefs = React.useMemo<ColDef<any>[]>(
      () => [
        {
          field: 'action',
          headerName: 'Action',
          width: 80,
          pinned: true,
          cellRenderer: (params: any) => {
            return (
              <div className="flex justify-center items-center gap-2">
                <EditOutlined
                  style={{
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditItem(params.node.rowIndex);
                  }}
                />
                <DeleteOutlined
                  style={{
                    cursor: 'pointer',
                    color: 'red',
                    fontSize: '16px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row selection when clicking
                    handleRemoveItem(params.node.rowIndex);
                  }}
                />
              </div>
            );
          },
          headerClass: 'flex justify-center'
        },
        {
          field: 'item_sequence_no',
          headerName: 'Sr. No',
          width: 80,
          headerClass: 'flex justify-center'
        },
        {
          field: 'service_rm_flag',
          headerName: 'Service Type',
          width: 130,
          headerClass: 'flex justify-center',
          valueFormatter: (params) => {
            switch (params.value) {
              case 'Service':
                return 'Service';
              case 'RM':
                return 'Raw Material';
              case 'Addl Desc':
                return 'Sub Service';
              default:
                return params.value || ''; // Fallback for unexpected values
            }
          }
          // Optional: If you need the same display in the cell renderer
        },
        {
          field: 'cost_code',
          headerName: 'Cost Code',
          headerClass: 'flex justify-center',
          width: 130,
          valueGetter: (params) => {
            // Find the matching cost item from your costList
            const costItem = costList?.tableData?.find((cost) => cost.cost_code === params.data.cost_code);

            // Return combined string if both exist, otherwise just the code
            return costItem ? `${costItem.cost_code}${costItem.cost_name ? ` - ${costItem.cost_name}` : ''}` : params.data.cost_code || '';
          },
          suppressCellFlash: true,
          suppressMovable: true,
          suppressAutoSize: true
        },
        {
          field: 'addl_item_desc',
          headerName: 'Description',
          cellEditorPopup: true,
          width: 130,
          cellEditor: 'agLargeTextCellEditor',

          // cellEditorParams: {
          //   rows: 15,
          //   cols: 50
          // },
          // cellStyle: (params) => ({
          //   backgroundColor: params.data.service_rm_flag === 'RM' ? 'lightGrey' : 'transparent'
          // }),
          // cellRenderer: (params: { data: { service_rm_flag: string }; value: any }) => {
          //   if (params.data.service_rm_flag === 'RM') return null; // Hide if not RM
          //   return params.value ?? ''; // Show value, default to '0' if null/undefined
          // },
          // valueFormatter: (params) => params.value || '',
          // valueParser: (params) => params.newValue.trim(),
          // onCellValueChanged: (params) => {
          //   if (params.node && params.node.rowIndex !== null) {
          //     handleItemChange(params.node.rowIndex, 'addl_item_desc', params.newValue);
          //   }
          // },
          headerClass: 'flex justify-center'
        },
        {
          field: 'item_code',
          headerName: 'Product',
          headerClass: 'flex justify-center',
          valueGetter: (params) => {
            // Find matching product in prodList
            const product = prodList?.tableData?.find((prod) => prod.prod_code === params.data.item_code);

            // Return combined string if both exist, otherwise just the code
            return product ? `${product.prod_code}${product.prod_name ? ` - ${product.prod_name}` : ''}` : params.data.item_code || '';
          },
          suppressCellFlash: true,
          suppressMovable: true,
          suppressAutoSize: true
        },
        {
          field: 'item_p_qty',
          headerName: 'Primary Qty',
          width: 130,
          type: 'numericColumn',
          valueFormatter: (params) => {
            const value = Number(params.value);
            return isNaN(value) ? '0' : value.toString();
          },
          valueParser: (params) => {
            const parsed = parseFloat(params.newValue);
            return isNaN(parsed) ? 0 : parsed;
          },
          cellRenderer: (params: { value: any }) => {
            const value = Number(params.value);
            return isNaN(value) ? '0' : value.toString();
          }
        },
        {
          field: 'p_uom',
          headerName: 'Primary UOM',
          width: 130,
          valueGetter: (params) => {
            // Find matching UOM in uomList
            const uom = uomList?.tableData?.find((uomItem) => uomItem.uom_code === params.data.p_uom);

            // Return uom_name if found, otherwise the code
            return uom?.uom_name || params.data.p_uom || '';
          },
          suppressCellFlash: true,
          suppressMovable: true,
          suppressAutoSize: true
        },
        {
          field: 'item_l_qty',
          headerName: 'Lowest Qty',
          width: 130,
          type: 'numericColumn',
          valueFormatter: (params) => {
            const value = Number(params.value);
            return isNaN(value) ? '0' : value.toString();
          },
          valueParser: (params) => {
            const parsed = parseFloat(params.newValue);
            return isNaN(parsed) ? 0 : parsed;
          },
          cellRenderer: (params: { value: any }) => {
            const value = Number(params.value);
            return isNaN(value) ? '0' : value.toString();
          }
        },
        {
          field: 'l_uom',
          headerName: 'Lowest UOM',
          width: 130,
          valueGetter: (params) => {
            // Find matching UOM in uomList
            const uom = uomList?.tableData?.find((uomItem) => uomItem.uom_code === params.data.l_uom);

            // Return uom_name if found, otherwise the code
            return uom?.uom_name || params.data.l_uom || '';
          },
          suppressCellFlash: true,
          suppressMovable: true,
          suppressAutoSize: true
        },

        {
          field: 'allocated_approved_quantity',
          headerName: 'Quantity',
          type: 'numericColumn',
          width: 130,
          headerClass: 'flex justify-center'
        },
        {
          field: 'upp',
          headerName: 'UPPP',
          type: 'numericColumn',
          width: 90,
          headerClass: 'flex justify-center'
        },
        ...(Number(purchaseRequest?.flow_level_running) > 1
          ? [
            {
              field: 'item_rate',
              headerName: 'Rate',
              width: 130,
              type: 'numericColumn',
              headerClass: 'flex justify-center',
              valueFormatter: (params: { value: any }) => {
                const num = Number(params.value);
                return isNaN(num)
                  ? '0.00000'
                  : new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 5,
                    maximumFractionDigits: 5
                  }).format(num);
              }
            }
          ]
          : []),

        ...(Number(purchaseRequest?.flow_level_running) > 1
          ? [
            {
              field: 'discount_amount',
              headerName: 'Discount',
              width: 130,
              type: 'numericColumn',
              headerClass: 'flex justify-center',
              valueFormatter: (params: { value: any }) => {
                const num = Number(params.value);
                return isNaN(num)
                  ? '0.00000'
                  : new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 5,
                    maximumFractionDigits: 5
                  }).format(num);
              }
            }
          ]
          : []),
        ...(Number(purchaseRequest?.flow_level_running) > 1
          ? [
            {
              field: 'final_rate',
              headerName: 'Final Rate',
              type: 'numericColumn',
              width: 130,
              headerClass: 'flex justify-center',
              valueFormatter: (params: { value: any }) => {
                const num = Number(params.value);
                return isNaN(num)
                  ? '0.00000'
                  : new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 5,
                    maximumFractionDigits: 5
                  }).format(num);
              }
            }
          ]
          : []),
        ...(Number(purchaseRequest?.flow_level_running) > 1
          ? [
            {
              field: 'amount',
              headerName: 'Amount',
              type: 'numericColumn',
              width: 130,
              headerClass: 'flex justify-center',
              valueFormatter: (params: { value: any }) => {
                const num = Number(params.value);
                return isNaN(num)
                  ? '0.00'
                  : new Intl.NumberFormat('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(num);
              }
            }
          ]
          : []),
        ...(Number(purchaseRequest?.flow_level_running) > 1 && currentItem?.service_rm_flag !== 'Addl Desc'
          ? [
            {
              field: 'supplier',
              headerName: 'Supplier',
              headerClass: 'flex justify-center',
              width: 130,
              valueGetter: (params: { data: { supplier: string } }) => {
                // Find matching UOM in uomList
                const supp = supplierList?.tableData?.find((supplierItem) => supplierItem.supp_code === params.data.supplier);

                // Return uom_name if found, otherwise the code
                return supp?.supp_name || params.data.supplier || '';
              },
              suppressCellFlash: true,
              suppressMovable: true,
              suppressAutoSize: true
            }
          ]
          : []),
        ...(Number(purchaseRequest?.flow_level_running) > 1 && currentItem?.service_rm_flag !== 'Addl Desc'
          ? [
            {
              field: 'curr_name',
              headerName: 'Currency',
              headerClass: 'flex justify-center',
              width: 130,
              valueGetter: (params: { data: { curr_code: any } }) => {
                // Get the currency name if available, otherwise just show the code
                const curr = currency?.tableData?.find((c: { curr_code: any }) => c.curr_code === params.data.curr_code);
                return curr ? curr.curr_name : params.data.curr_code || 'QAR';
              },
              suppressCellFlash: true,
              suppressMovable: true,
              suppressAutoSize: true
            }
          ]
          : [])
      ],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [costList?.tableData, uomList?.tableData, supplierList?.tableData]
    );

    return (
      <div ref={gridWrapperRef} className="ag-theme-alpine ag-theme-alpine-mytable" style={{ maxHeight: 400, overflow: 'auto' }}>
        <AgGridReact
          rowData={rowData}
          onCellValueChanged={onCellValueChanged}
          columnDefs={columnDefs}
          components={{
            CostCodeCellRenderer,
            ServiceTypeCellRenderer,
            LUOMCellRenderer,
            ProductCellRenderer,
            SupplierSelectCellRenderer
          }}
          defaultColDef={{ resizable: true, sortable: true, filter: false }}
          domLayout="autoHeight"
          animateRows={true}
          rowHeight={20}
          headerHeight={25}
          suppressClickEdit={isViewMode || gs_userlevel === 5}
          overlayNoRowsTemplate="<span>No data to display</span>"
          suppressDragLeaveHidesColumns={true}
          suppressRowTransform={true}
        />
      </div>
    );
  };

  // const handleAddItem = () => {
  //   const errors = validatePurchaseRequest(purchaseRequest, termsConditions);
  //   if (errors.length > 0) {
  //     setSubmitStatus(errors.join(' '));

  //     errors.forEach((error, index) => {
  //       console.log(`Error ${index + 1}:`, error);
  //     });

  //     const formattedErrors = errors.map((error) => `${error}`).join('\n');

  //     dispatch(
  //       showAlert({
  //         severity: 'error',
  //         message: formattedErrors,
  //         open: true
  //       })
  //     );

  //     setLoading(false);
  //     return;
  //   }

  //   setPurchaseRequest((prevRequest) => {
  //     // Clone the existing items
  //     const newItems = [...prevRequest.items];

  //     // Create a new item with default values
  //     const newItem = {
  //       item_code: '',
  //       item_desp: '',
  //       item_group_code: '',
  //       flow_level_running: 1,
  //       item_rate: 0,
  //       p_uom: '',
  //       l_uom: '',
  //       upp: 1,
  //       item_l_qty: 0,
  //       item_p_qty: 0,
  //       appr_upp: 0,
  //       appr_item_l_qty: 0,
  //       appr_item_p_qty: 0,
  //       currency_rate: 0,
  //       amount: 0,
  //       company_code: '',
  //       updated_at: new Date(),
  //       updated_by: '',
  //       request_number: '',
  //       curr_code: '',
  //       lcurr_amt: 0,
  //       allocated_approved_quantity: 0,
  //       selected_item: '',
  //       last_action: 'SAVEASDRAFT',
  //       history_serial: 0,
  //       curr_name: '',
  //       item_sequence_no: 0,
  //       item_srno: 0,
  //       supplier_part_code: '',
  //       rate_method: '',
  //       supplier: '',
  //       select_item: '',
  //       discount_amount: 0,
  //       final_rate: 0,
  //       item_cancel: '',
  //       mail_attach: '',
  //       cash_ind: '',
  //       service_rm_flag: prevRequest.items.length > 0 ? 'Addl Desc' : 'Service',
  //       addl_item_desc: '',
  //       pr_amount: 0,
  //       po_amount: 0,
  //       month_budget: 0,
  //       ac_name: '',
  //       cost_code: '', // Default empty value
  //       cost_name: '',
  //       ref_doc_no: '',
  //       doc_date: null,
  //       item_sequence_no: prevRequest.items.length + 1 // Add a default value for item_sequence_no
  //     };

  //     // Assign cost_code from the last item if available
  //     if (newItems.length > 0) {
  //       const lastItem = newItems[newItems.length - 1];
  //       newItem.cost_code = lastItem?.cost_code || ''; // Default to empty if undefined
  //       if (lastItem.supplier && lastItem.supplier.trim() !== '') {
  //         newItem.supplier = lastItem.supplier;
  //       } else {
  //         newItem.supplier = ''; // Default value if supplier is empty or undefined
  //       }
  //     }

  //     // Add the new item to the array
  //     if (editingIndex !== null) {
  //       // Update existing item
  //       newItems[editingIndex] = currentItem;
  //     } else {
  //       // Add new item
  //       newItems.push(currentItem);
  //     }

  //     // Return the updated request object
  //     return {

  //       ...prevRequest,
  //       items: newItems
  //     };
  //   });
  //   setIsOpenDetail(false);
  //   setEditingIndex(null);
  //   setCurrentItem(null);
  // };
  const handleAddItemNew = () => {
    if (editingIndex === null) {
      const errors = validatePurchaseRequest({ ...purchaseRequest, items: [...purchaseRequest.items, currentItem] }, termsConditions);
      if (errors.length > 0) {
        setSubmitStatus(errors.join(' '));
        errors.forEach((error, index) => {
          console.log(`Error ${index + 1}:`, error);
        });
        const formattedErrors = errors.map((error) => `${error}`).join('\n');
        dispatch(
          showAlert({
            severity: 'error',
            message: formattedErrors,
            open: true
          })
        );
        setLoading(false);
        return;
      }
    }

    setPurchaseRequest((prevRequest) => {
      const newItems = [...prevRequest.items];

      const itemToAdd = {
        ...currentItem,
        supplier: currentItem.supplier || (newItems.length > 0 ? newItems[newItems.length - 1].supplier : ''),
        item_l_qty: currentItem.item_l_qty || '',
        item_p_qty: currentItem.item_p_qty || '',
        curr_code: currentItem.curr_code || 'QAR',
        curr_name: currentItem.curr_name || 'Qatari Riyal',
        upp: currentItem.upp === undefined || currentItem.upp === null || currentItem.upp === 0 ? 1 : currentItem.upp
      };

      if (editingIndex !== null) {
        // Update the existing item
        newItems[editingIndex] = {
          ...newItems[editingIndex],
          ...itemToAdd
        };

        // After updating, update Addl Desc items that follow this item
        if (itemToAdd.name !== 'supplier' || itemToAdd.service_rm_flag !== 'Addl Desc') {
          // Find all Addl Desc items that come after this item
          for (let i = editingIndex + 1; i < newItems.length; i++) {
            if (newItems[i].service_rm_flag === 'Addl Desc') {
              // Update their supplier to match the current item's supplier
              newItems[i] = {
                ...newItems[i],
                supplier: itemToAdd.supplier
              };
            } else {
              // Stop when we hit a non-Addl Desc item
              break;
            }
          }
        }
      } else {
        // Add new item
        const maxSequence = Math.max(...prevRequest.items.map((item) => item.item_sequence_no ?? 0), 0);

        let supplierToSet = itemToAdd.supplier;
        if (itemToAdd.service_rm_flag === 'Addl Desc' && newItems.length > 0) {
          supplierToSet = newItems[newItems.length - 1].supplier;
        }

        const newItem = {
          ...itemToAdd,
          supplier: supplierToSet,
          item_sequence_no: maxSequence + 1
        };

        newItems.push(newItem);

        // For new items, we might also want to update following Addl Desc items if this is not an Addl Desc
        if (newItem.name !== 'supplier' || newItem.service_rm_flag !== 'Addl Desc') {
          // Find all Addl Desc items that come after this new item
          for (let i = newItems.length - 1 + 1; i < newItems.length; i++) {
            if (newItems[i].service_rm_flag === 'Addl Desc') {
              // Update their supplier to match the new item's supplier
              newItems[i] = {
                ...newItems[i],
                supplier: newItem.supplier
              };
            } else {
              // Stop when we hit a non-Addl Desc item
              break;
            }
          }
        }
      }

      console.log('Updated Items OK:', newItems);
      return { ...prevRequest, items: newItems };
    });

    setIsOpenDetail(false);
    setEditingIndex(null);
    setCurrentItem(null);
  };
  // In the parent window
  window.addEventListener('message', (event) => {
    // Make sure the message is coming from the expected source (optional but recommended for security)
    if (event.origin !== 'your-child-window-origin') {
      return;
    }

    // Handle the message
    if (event.data.type === 'SET_LAST_ACTION') {
      const action = event.data.action;
      console.log(`Last action received: ${action}`);
      // Set the action in your parent state or global variable
      window.last_action = action;
    }
  });

  localStorage.setItem('message', 'helllo');

  const handlePrint = async () => {
    try {
      if (purchaseRequest.request_number) {
        const request_number = purchaseRequest.request_number.replace(/\//g, '$');
        const data = await GmPfServiceInstance.fetchPOlisting(request_number);
        setPOdata(data);
        setPoOpen(true);
        console.log('POdata', data);
      } else {
        console.error('Request number is undefined.');
      }
    } catch (error) {
      console.error('Error fetching PO listing:', error);
    }
  };

  const handleSaveAsDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(openBackdrop());
    setLoading(true);
    setSubmitStatus(null);
    try {
      purchaseRequest.last_action = 'SAVEASDRAFT';
      console.log('test request data', purchaseRequest);
      const errors = validatePurchaseRequest(purchaseRequest, termsConditions);
      if (errors.length > 0) {
        setSubmitStatus(`Error test: ${errors.join(' ')}`);
        setLoading(false);
        dispatch(closeBackdrop());

        const formattedErrors = errors.map((error) => `${error}`).join('\n');

        dispatch(
          showAlert({
            severity: 'error',
            message: formattedErrors,
            open: true
          })
        );

        return;
      }

      const itemsWithSequence = purchaseRequest.items.map((item: any, index: number) => ({
        ...item,
        item_sequence_no: index + 1
      }));

      const purchaseRequestData: TPurchaserequestPf = {
        ...purchaseRequest,
        // items: (purchaseRequest?.flow_level_running === 1 || purchaseRequest?.flow_level_running === 3) ? itemsWithSequence : [],
        items: itemsWithSequence,
        company_code: user?.company_code ?? '',
        updated_by: user?.loginid ?? '',
        created_by: user?.loginid ?? '',
        created_at: user?.created_at ?? new Date(),
        updated_at: user?.updated_at ?? new Date(),
        last_action: 'SUBMITTED',
        Termscondition: termsConditions,
        files: filesData // Include file upload details
      };
      if (request_number) {
        purchaseRequestData.request_number = request_number;
      }
      console.log(' ', purchaseRequestData);
      purchaseRequestData.last_action = 'SAVEASDRAFT';
      purchaseRequestData.company_code = user?.company_code ?? '';
      console.log('print div_code', divCode);

      // Sandeep Dandekar saveasdraft
 //sandeep changes for currency_rate 27/03/2026
           console.log('SandeepDandekar');
            console.log(purchaseRequestData.items[0].currency_rate);
            console.log(purchaseRequestData.items[0].curr_code);
          //  const currencyRate = 1.6; // example
      const allQAR = purchaseRequestData.items.every(item => !item.curr_code || item.curr_code === 'QAR');
      console.log(purchaseRequest, "purchaseRequest")
      const currencyRate = allQAR ? 1 : (purchaseRequest.exchange_rate || 1);
      if (allQAR) purchaseRequestData.exchange_rate = 1;

          // ✅ Apply to all rows
            purchaseRequestData.items = purchaseRequestData.items.map((item) => ({
                ...item,
              currency_rate: currencyRate
              }));
            //end sandeep changes for currency_rate



      await GmPfServiceInstance.updatepurchaserequest({ ...purchaseRequestData, updated_by: user?.loginid, div_code: divCode || '' });

      setSubmitStatus('Purchase request saved successfully!');

      dispatch(closeBackdrop());

      if (!request_number) {
        setPurchaseRequest(initialPurchaseRequest());
      }

      onClose(true);
    } catch (error) {
      console.error('Error saving purchase request:', error);
      setSubmitStatus('Error saving purchase request.');
    }
  };

  // Function to group items by cost_code
  const groupItemsByCostName = (items: TItemPrrequest[]) => {
    console.log('group groupItemsByCostName called with items:', items); // Log the input

    const groupedItems = items.reduce(
      (groupedItems, item) => {
        console.log('group Processing item:', item); // Log each item being processed

        if (item.cost_name && typeof item.cost_name === 'string') {
          // Initialize group if not present
          if (!groupedItems[item.cost_name]) {
            groupedItems[item.cost_name] = {
              items: [],
              totalBudget: 0,
              totalPrAmount: 0, // Property for pr_amount
              totalPoAmount: 0 // New property for po_amount
            };
            console.log(` group Initialized group for cost_name: ${item.cost_name}`);
          }

          // Add the item to the group
          groupedItems[item.cost_name].items.push(item);
          console.log(`group Added item to group: ${item.cost_name}`);

          // Ensure monthBudget, prAmount, and poAmount are valid numbers
          const monthBudget = Number(item.month_budget) || 0;
          const prAmount = Number(item.pr_amount) || 0;
          const poAmount = Number(item.po_amount) || 0;

          groupedItems[item.cost_name].totalBudget += monthBudget;
          groupedItems[item.cost_name].totalPrAmount += prAmount; // Add pr_amount to the total
          groupedItems[item.cost_name].totalPoAmount += poAmount; // Add po_amount to the total

          console.log(` group Updated totals for ${item.cost_name}:`, {
            totalBudget: groupedItems[item.cost_name].totalBudget,
            totalPrAmount: groupedItems[item.cost_name].totalPrAmount,
            totalPoAmount: groupedItems[item.cost_name].totalPoAmount
          });
        } else {
          console.warn('Item skipped due to missing or invalid cost_name:', item);
        }

        return groupedItems;
      },
      {} as {
        [key: string]: {
          items: TItemPrrequest[];
          totalBudget: number;
          totalPrAmount: number;
          totalPoAmount: number;
        };
      }
    );

    console.log(' group groupItemsByCostName result:', groupedItems); // Log the final result
    return groupedItems;
  };

  const handleOpenRequestForm = () => {
    if (!purchaseRequest.request_number) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Request number is required',
          variant: 'alert',
          alert: { color: 'error' },
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          close: true
        })
      );
      return;
    }

    setOpenRequestForm(true);
  };

  const [, forceUpdate] = useState(0);
  const handleCloseRequestForm = () => {
    console.log(purchaseRequest.Termscondition);
    setOpenRequestForm(false);
    forceUpdate((prev) => prev + 1); // Trigger a re-render manually (avoid this unless necessary)
    console.log('Save');
    window.close();
  };

  // Removed unused handleReject function to resolve the error.

  const handleSentBack = async (purchaseRequestData: TPurchaserequestPf) => {
    setLoading(true);
    setSubmitStatus(null);
    try {
      // Update purchase request status to sent back
      await GmPfServiceInstance.updatepurchaserequest({ ...purchaseRequestData, last_action: 'SENTBACK' });
      setSubmitStatus('Purchase request sent back successfully!');
    } catch (error) {
      console.error('Error sending back purchase request:', error);
      setSubmitStatus('Error sending back purchase request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit")
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setSubmitStatus(null);
    //const navigate = useNavigate(); // Initialize navigate

    try {
      const purchaseRequestData: TPurchaserequestPf = {
        ...purchaseRequest,
        company_code: user?.company_code ?? '',
        updated_by: user?.loginid ?? '',
        created_by: user?.loginid ?? '',
        last_action: 'SUBMITTED',
        files: filesData // Include file upload details
      };
 console.log(purchaseRequestData, "purchaseRequestData")

      if (request_number) {
        purchaseRequestData.request_number = request_number;
      }
      purchaseRequestData.last_action = 'SUBMITTED';
      purchaseRequestData.company_code = user?.company_code ?? '';

      // if (
      //   purchaseRequestData.flow_level_running === 3 &&
      //   purchaseRequestData.last_action === 'SUBMITTED' &&
      //   purchaseRequestData.type_of_pr !== 'Non Chargeable'
      // ) {
      //   console.log('sandeep4');
      //   const result = await GmPfServiceInstance.CheckBudgetStatus(request_number, purchaseRequestData.company_code);
      //   console.log('result', result);
      //   if (result !== 'EXCEED') {
      //     purchaseRequestData.flow_level_running = 4;
      //   }
      // } else {
      //   if (purchaseRequestData.flow_level_running === 3) {
      //     purchaseRequestData.flow_level_running = 4;
      //   }
      // }

           //sandeep changes for currency_rate
           console.log('SandeepDandekar');
            console.log(purchaseRequestData.items[0].currency_rate);
            console.log(purchaseRequestData.items[0].curr_code);
           const currencyRate = 1.2; // example
      
          // ✅ Apply to all rows
            purchaseRequestData.items = purchaseRequestData.items.map((item) => ({
                ...item,
              currency_rate: currencyRate
              }));
            //end sandeep changes for currency_rate
            console.log("purchaseRequestData", purchaseRequestData)
      await GmPfServiceInstance.updatepurchaserequest({ ...purchaseRequestData, updated_by: user?.loginid });
      setSubmitStatus('Purchase request submitted successfully12!');

      // Close the form and exit by navigating to the previous screen
      // navigate(-1); // This will take the user to the previous page in the history stack

      if (!request_number) {
        setPurchaseRequest(initialPurchaseRequest());
      }
    } catch (error) {
      console.error('Error submitting purchase request:', error);
      setSubmitStatus('Error submitting purchase request.');
    } finally {
      setLoading(false);
      onClose(true);
    }
  };
  /* const selectedCost = costList?.tableData?.find((cost: CostOption) => String(cost.cost_code) === String(item.cost_code));
  console.log('selectedCost:', selectedCost);*/
  // const myTheme = createTheme({
  //   components: {
  //     MuiTab: {
  //       styleOverrides: {
  //         root: {
  //           fontSize: '0.85rem',
  //           padding: '0rem 1rem'
  //         }
  //       }
  //     }
  //   }
  // });

  const grandTotals = Object.entries(groupItemsByCostName(purchaseRequest.items)).map(([cost_name, group], idx) => {
    const grandTotalForGroup = group.items.reduce((sum, item) => sum + item.amount, 0);
    console.log('grandTotalForGroup', grandTotalForGroup);
    return {
      grandTotal: grandTotalForGroup
    };
  });

  const overallGrandTotal = grandTotals.reduce((sum, group) => sum + group.grandTotal, 0);

  console.log('Overall Grand  Total:', overallGrandTotal);

  Object.entries(groupItemsByCostName(purchaseRequest.items)).forEach(([cost_name, group], idx) => {
    group.items.forEach((item, index) => {
      const supp = item.supplier || '';
      console.log(`Supplier for ${cost_name} (Item ${index + 1}):`, supp);
    });
  });

  const [filesData, setFilesData] = useState<TFile[]>([]);
  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Upload Files'
  });

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ['purchase_request_files', request_number],
    queryFn: () => FileUploadServiceInstance.getPurchaseRequestFiles(request_number, app, 'Purchase Request'), // Pass module and type
    enabled: !!isEditMode && !!request_number
  });

  useEffect(() => {
    if (files) {
      setFilesData(files);
    }
  }, [files]);

  const handleUploadPopup = async () => {
    if (!request_number) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Please generate a request number first.',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          },
          close: true
        })
      );
      return;
    }

    // Refetch files data when opening the popup
    try {
      await refetchFiles();
    } catch (error) {
      console.error('Error refetching files:', error);
    }

    setUploadFilesPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const calculateAmount = (final_rate: number, allocated_approved_quantity: number) => {
    const rawAmount = final_rate * allocated_approved_quantity;
    return Math.round((rawAmount + Number.EPSILON) * 100) / 100;
  };

  const calculateTotalAmount = (items: any[]) => {
    const total = items.reduce((sum: number, item: any) => {
      const amount = calculateAmount(item.final_rate, item.allocated_approved_quantity);
      return sum + amount;
    }, 0);

    // Apply the same rounding to the final total
    return Math.round((total + Number.EPSILON) * 100) / 100;
  };

  const totalAmount = calculateTotalAmount(purchaseRequest.items).toFixed(2);

  //Styles for changing appearance of ant d table
  // Custom styles applied via CSS-in-JS
  const customStyles = `
:where(.css-dev-only-do-not-override-1yacf91).ant-table-wrapper .ant-table-cell,
:where(.css-dev-only-do-not-override-1yacf91).ant-table-wrapper .ant-table-thead>tr>th,
:where(.css-dev-only-do-not-override-1yacf91).ant-table-wrapper .ant-table-tbody>tr>th,
:where(.css-dev-only-do-not-override-1yacf91).ant-table-wrapper tfoot>tr>th,
:where(.css-dev-only-do-not-override-1yacf91).ant-table-wrapper tfoot>tr>td {
  padding: 0 !important; /* Set padding for table cells and headers */
}
`;

  // Injecting custom styles into the document head
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);

  // ---------------- ACTION -----------------------

  // SUBMIT
  const handleUpdateRequest = async (action: string, l_flow_level: number, actionFunction: (data: TPurchaserequestPf) => void) => {
    if (window.opener) {
      window.opener.postMessage({ type: 'SET_LAST_ACTION', action }, '*');
    } else {
      console.error('Parent window (opener) not available');
    }

    const purchaseRequestData = purchaseRequest;
    purchaseRequestData.last_action = action;
    console.log('actionddd', action);
    console.log('inside handleupdaterequest', purchaseRequestData.Termscondition);

    try {
      if (purchaseRequest?.wo_number?.trim() !== '' && !isUploaded && gs_userlevel === 1 && action === 'SUBMITTED') {
        dispatch(
          showAlert({
            severity: 'error',
            message: 'Please Select the Work Order Document uploaded status',
            open: true
          })
        );
        return;
      } else if (!isUploaded && gs_userlevel === 3 && action === 'SUBMITTED') {
        dispatch(
          showAlert({
            severity: 'error',
            message: 'Please Select the Comparison Excel Sheet uploaded status',
            open: true
          })
        );
        return;
      }
      const errors = validatePurchaseRequest(purchaseRequest, termsConditions);
      if (errors.length > 0) {
        setSubmitStatus(`Error test: ${errors.join(' ')}`);
        setLoading(false);

        const formattedErrors = errors.map((errors) => `${errors}`).join('\n');

        dispatch(
          showAlert({
            severity: 'error',
            message: formattedErrors,
            open: true
          })
        );
        return;
      }

      dispatch(openBackdrop());

      purchaseRequestData.last_action = action;
      console.log('actionddd', action);

      if (l_flow_level > 0) {
        purchaseRequestData.flow_level_running = l_flow_level;
      }

      console.log('need_by_date check', purchaseRequestData.need_by_date);

      purchaseRequestData.company_code = user?.company_code ?? '';

 //sandeep changes for currency_rate 27/03/2026
           console.log('SandeepDandekar');
            console.log(purchaseRequestData.items[0].currency_rate);
            console.log(purchaseRequestData.items[0].curr_code);
          //  const currencyRate = 1.4; // example
          const allQAR = purchaseRequestData.items.every(item => !item.curr_code || item.curr_code === 'QAR');
          const currencyRate = allQAR ? 1 : (purchaseRequest.exchange_rate || 1);

          // ✅ Apply to all rows
            purchaseRequestData.items = purchaseRequestData.items.map((item) => ({
                ...item,
              currency_rate: currencyRate
              }));
            //end sandeep changes for currency_rate
        if (allQAR) purchaseRequestData.exchange_rate = 1;

      await GmPfServiceInstance.updatepurchaserequest({
        ...purchaseRequestData,
        updated_by: user?.loginid,
        Termscondition: termsConditions
      });

      if (!purchaseRequestData.request_number) {
        console.error('Request number is undefined.');
        return;
      }

      if (action === 'SUBMITTED' && purchaseRequestData.type_of_pr !== 'Non Chargeable') {
        const result = await GmPfServiceInstance.CheckBudgetStatus(purchaseRequestData.request_number, purchaseRequestData.company_code);
        console.log('result', result);

        if (result === 'EXCEED') {
          const imgElement = document.createElement('img');
          imgElement.src = 'https://i.postimg.cc/sgV9VCx5/ober-budget.jpg';
          imgElement.alt = 'Exceeded';
          document.body.appendChild(imgElement);
        }
      }

      actionFunction(purchaseRequestData);
      dispatch(closeBackdrop());

      onClose(true);
    } catch (error) {
      console.error('Error updating purchase request:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to update request',
          variant: 'alert',
          alert: { color: 'error' },
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          close: true
        })
      );
    }
  };
// Add this state near the top of the component with other useState declarations
const [exchangeRateInput, setExchangeRateInput] = useState<string>('');

// Add this useEffect to sync edit mode value into the input string
useEffect(() => {
  if (purchaseRequest.exchange_rate && purchaseRequest.exchange_rate !== 0) {
    setExchangeRateInput(String(purchaseRequest.exchange_rate));
  }
}, [purchaseRequest.exchange_rate]);
  // SEND BACK
  const handleSentBackPopupOpen = (request_number: string, flow_level: number) => {
    setSentBackPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: { request_number, remarks: '', level: flow_level }
    }));
  };

  const handleSentBackPopupClose = () => {
    setSentBackPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '', level: '' }
    }));
    onClose(true);
  };

  // REJECT
  const handleRejectRemarksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setRejectPopup((prev) => ({
      ...prev,
      data: { ...prev.data, remarks: value }
    }));
  };

  const handleRejectPopupOpen = (request_number: string) => {
    setRejectPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: { request_number, remarks: '' }
    }));
  };

  const handleRejectPopupClose = () => {
    setRejectPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '' }
    }));
  };

  const handleRejectSubmit = async () => {
    const { request_number, remarks } = rejectPopup.data;
    if (!remarks.trim()) {
      alert('Remarks cannot be empty');
      return;
    }
    const COMPANY_CODE = user?.company_code || '';
    const loginid = user?.loginid || '';
    await GmPfServiceInstance.updatecancelrejectsentback('REJECTED', request_number, COMPANY_CODE, loginid, '0', remarks, 'N');
    onClose(true);
    handleRejectPopupClose();
  };

  // Cancel

  // const handleCancelPopupOpen = (request_number: string) => {
  //   setCancelPopup((prev) => ({
  //     ...prev,
  //     action: { ...prev.action, open: true },
  //     data: { request_number, remarks: '' }
  //   }));
  // };

  const handleCancelPopupClose = () => {
    setCancelPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '' }
    }));
  };

  const handleCancelRemarksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCancelPopup((prev) => ({
      ...prev,
      data: { ...prev.data, remarks: value }
    }));
  };

  const handleCancelSubmit = async () => {
    const { request_number, remarks } = cancelPopup.data;
    if (!remarks.trim()) {
      alert('Remarks cannot be empty');
      return;
    }
    const COMPANY_CODE = user?.company_code || '';
    const loginid = user?.loginid || '';
    const createPRValue = createPR ? 'Y' : 'N';
    await GmPfServiceInstance.updatecancelrejectsentback('CANCELLED', request_number, COMPANY_CODE, loginid, '0', remarks, createPRValue);
    handleCancelPopupClose();
    // refetchPurchaserequestheaderData();
    onClose(true);
  };

  console.log('from terms', termsConditions);
  console.log('purchaseRequest.need_by_date', purchaseRequest.need_by_date);

  const handleCloseFilesPopup = () => {
    setUploadFilesPopup((prev) => ({
      ...prev,

      action: { ...prev.action, open: false }
    }));
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  const handleItemFieldChange = (fieldName: keyof TPurchaserequestPf['items'][0], value: any) => {
    setCurrentItem((prev: any) => {
      const updatedItem = {
        ...prev,
        [fieldName]: value
      };

      // Handle UPP default value
      if (fieldName === 'upp') {
        updatedItem.upp = Number(value) || 1;
      }

      if (fieldName === 'curr_code') {
        const selectedCurrency = currency?.tableData?.find((c) => c.curr_code === value);
        if (selectedCurrency) {
          updatedItem.curr_name = selectedCurrency.curr_name;
        }

        // Update currency for all items in purchaseRequest
        setPurchaseRequest((prevRequest) => {
          const updatedItems = prevRequest.items.map((item) => ({
            ...item,
            curr_code: value,
            curr_name: selectedCurrency?.curr_name || 'Qatari Riyal'
          }));
          return { ...prevRequest, items: updatedItems };
        });
      }

      // Rest of your existing logic...
      if (fieldName === 'service_rm_flag') {
        if (value === 'Service') {
          updatedItem.item_code = '';
          updatedItem.p_uom = '';
          updatedItem.l_uom = '';
          updatedItem.upp = 1;
        } else if (value === 'Addl Desc') {
          updatedItem.item_code = '';
          updatedItem.p_uom = '';
          updatedItem.upp = 0;
        }
      }

      // Calculation logic remains the same...
      const item_p_qty = Number(updatedItem.item_p_qty) || 0;
      const upp = Number(updatedItem.upp) || 1;
      const item_l_qty = Number(updatedItem.item_l_qty) || 0;
      const item_rate = Number(updatedItem.item_rate) || 0;
      let discount_amount = Number(updatedItem.discount_amount) || 0;

      if (fieldName === 'discount_amount' || fieldName === 'item_rate') {
        if (discount_amount >= item_rate && item_rate !== 0) {
          discount_amount = item_rate - 0.01;
          updatedItem.discount_amount = discount_amount;
        }
      }

      if (updatedItem.service_rm_flag === 'RM') {
        updatedItem.allocated_approved_quantity = item_p_qty * upp + item_l_qty;
      } else if (updatedItem.service_rm_flag === 'Service') {
        updatedItem.allocated_approved_quantity = item_l_qty;
      } else {
        updatedItem.allocated_approved_quantity = item_l_qty;
      }

      updatedItem.final_rate = item_rate - discount_amount;
      updatedItem.amount = updatedItem.allocated_approved_quantity * updatedItem.final_rate;

      console.log('Updated Item New:', updatedItem);
      return updatedItem;
    });
  };
  // Rendering JSX
  return (
    <div className="flex flex-col h-auto font-segoe">
      {/* Fixed Tabs Container */}
      <div className="sticky top-0 z-10  bg-white font-segoe">
        <CustomAlert />
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: { display: 'none' }
          }}
          sx={{
            minHeight: '32px',
            '& .MuiTab-root': {
              color: '#082A89',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              minHeight: '32px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#E8EBF7',
                color: '#082A89'
              },
              '&.Mui-selected': {
                color: '#082A89',
                backgroundColor: '#C5CDE8'
              }
            }
          }}
        >
          <Tab label="Request Information" sx={{ textTransform: 'none' }} />
          {[1, 3, 5].includes(Number(gs_userlevel)) && <Tab label="Details" sx={{ textTransform: 'none' }} />}
          {[2, 4].includes(Number(gs_userlevel)) && <Tab label="Cost Details" sx={{ textTransform: 'none' }} />}
          {[3, 5].includes(Number(gs_userlevel)) && <Tab label="Terms and Condition" sx={{ textTransform: 'none' }} />}
        </Tabs>
      </div>

      {/* Scrollable Content */}

      <div className="flex-grow">
        <div className="px-2">
          <form onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}></ThemeProvider>
            {tabIndex === 2 && (
              <Box>
                {/* Pass additionalData to AddbudgetTab3 */}
                <TermsAndCondition
                  isViewMode={isViewMode || gs_userlevel === 5}
                  Purhasedata={purchaseRequest}
                  tabIndex={tabIndex} // Pass the tabIndex prop here
                  TermsConditions={termsConditions}
                  setTermsConditions={setTermsConditions}
                />
              </Box>
            )}
            {/* Header Detail renamed to Request Info */}
            {tabIndex === 0 &&
              (isSendBackModalOpen ? null : (
                <>
                  <div className="mt-1 flex flex-col">
                    <Typography className="text-[0.50rem]">Autogenerated</Typography>

                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <Typography variant="h5" className="font-bold text-xs">
                          Purchase Request Number
                        </Typography>
                        <Typography variant="h5" className="font-bold text-xs">
                          {purchaseRequest.request_number || 'N/A'}
                        </Typography>
                      </div>

                      <div className="flex flex-col items-end">
                        <Typography variant="h5" className="font-bold text-xs">
                          Amount
                        </Typography>
                        <Typography variant="h5" className="font-bold text-xs">
                          {` ${totalAmount !== null && totalAmount !== undefined
                            ? new Intl.NumberFormat('en-US', {
                              style: 'decimal',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(Number(totalAmount))
                            : '0.00'
                            }`}
                        </Typography>
                      </div>
                    </div>

                    {/* Line */}
                    <div className="flex bg-[#1677ff] mt-2 p-[1px]"></div>
                  </div>

                  <div className="flex gap-4 mt-3 items-start ">
                    {/* form left side */}
                    <div className="w-[100%]">
                      <div className="flex gap-4 flex-col ">
                        <div className="flex gap-3 flex-col mt-1">
                          <div className="flex gap-3 flex-col md:flex-row ">
                            {projectLoading ? (
                              <TextField label="Loading..." fullWidth disabled />
                            ) : projectError ? (
                              <TextField label="Error loading projects" fullWidth error />
                            ) : (
                              <Autocomplete
                                fullWidth
                                id="project_code"
                                size="small"
                                options={projectList?.tableData || []}
                                getOptionLabel={(option) => option.project_name || ''}
                                onChange={(event, value) => handleChange('project_code', value ? value.project_code : '')}
                                value={
                                  projectList?.tableData?.find(
                                    (project: { project_code: string | undefined }) => project.project_code === purchaseRequest.project_code
                                  ) || null
                                }
                                renderInput={(params) => <TextField {...params} label="Project *" variant="outlined" fullWidth />}
                                noOptionsText="No options available"
                                readOnly={isViewMode || gs_userlevel !== 1 || Boolean(purchaseRequest?.request_number)}
                                sx={{
                                  '& .MuiAutocomplete-inputRoot': {
                                    paddingTop: '5px !important',
                                    paddingBottom: '5px !important',
                                    minHeight: '30px' // Adjust height
                                  },
                                  '& .MuiInputLabel-outlined': {
                                    transform: 'translate(14px, 10px) scale(1)',
                                    '&.MuiInputLabel-shrink': {
                                      transform: 'translate(14px, -9px) scale(0.75)'
                                    }
                                  }
                                }}
                              />
                            )}

                            <TextField
                              label="Work Order Number"
                              size="small"
                              name="wo_number"
                              value={purchaseRequest.wo_number || ''}
                              onChange={(e) => handleChange('wo_number', e.target.value)}
                              required
                              fullWidth
                              InputProps={{ readOnly: isViewMode || gs_userlevel !== 1 }}
                            />

                            {gs_userlevel === 1 && (
                              <TextField
                                label="Requestor Name"
                                size="small"
                                name="requestor_name"
                                value={purchaseRequest.requestor_name || ''}
                                onChange={(e) => handleChange('requestor_name', e.target.value)}
                                fullWidth
                                InputProps={{ readOnly: isViewMode || gs_userlevel !== 1 }}
                              />
                            )}

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                className="w-full"
                                label="Request Date"
                                name="request_date"
                                format="DD/MM/YYYY"
                                value={purchaseRequest.request_date ? dayjs(purchaseRequest.request_date) : dayjs()}
                                onChange={(newValue) => {
                                  // Convert to ISO string (e.g., "2025-04-23T00:00:00.000Z")
                                  const isoDate = newValue ? newValue.toISOString() : new Date().toISOString();
                                  handleChange('request_date', isoDate);
                                }}
                                readOnly={isViewMode || gs_userlevel === 5}
                                minDate={dayjs()}
                                slotProps={{
                                  textField: {
                                    error: false,
                                    InputProps: {
                                      readOnly: isViewMode
                                    }
                                  },
                                  actionBar: {
                                    actions: isViewMode ? [] : ['accept', 'cancel', 'today', 'clear']
                                  }
                                }}
                                sx={{  
                                  minWidth: 140,
                                    maxWidth: 160,
                                  '& .MuiInputBase-root': {
                                    height: 33,
                                    fontSize: '0.675rem'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '7.5px 12px'
                                  }
                                }}
                                shouldDisableDate={(date) => {
                                  return date.isBefore(dayjs(), 'day') && !isViewMode;
                                }}
                              />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                className="w-full"
                                label="Need By Date"
                                name="need_by_date"
                                format="DD/MM/YYYY"
                                value={dayjs(purchaseRequest.need_by_date || new Date())}
                                onChange={(newValue) => handleChange('need_by_date', newValue ? newValue.toDate() : new Date())}
                                readOnly={isViewMode}
                                // minDate={dayjs(purchaseRequest.request_date || new Date())}
                                slotProps={{
                                  textField: {
                                    error: false,
                                    InputProps: {
                                      readOnly: isViewMode
                                    }
                                  },
                                  actionBar: {
                                    actions: isViewMode ? [] : ['accept', 'cancel', 'today', 'clear']
                                  }
                                }}
                                sx={{
                                    minWidth: 140,
                                      maxWidth: 160,
                                  '& .MuiInputBase-root': {
                                    height: 33,
                                    fontSize: '0.675rem'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '7.5px 12px'
                                  }
                                }}
                                shouldDisableDate={(date) => {
                                  const minDate = purchaseRequest.request_date ? dayjs(purchaseRequest.request_date) : dayjs();
                                  return date.isBefore(minDate, 'day') && !isViewMode;
                                }}
                              />
                            </LocalizationProvider>
                            {/* After the Need By Date DatePicker closing tag */}

{gs_userlevel === 4 && purchaseRequest.items.some(i => i.curr_code && i.curr_code !== 'QAR') && (
  <TextField
    label="Exchange Rate *"
    size="small"
    sx={{
      minWidth: 140,
      maxWidth: 160,
      '& .MuiInputBase-root': { height: 33, fontSize: '0.675rem' },
      '& .MuiOutlinedInput-input': { padding: '7.5px 12px' }
    }}
    name="exchange_rate"
    type="number"
    // ✅ Drive display from local string state — allows clearing freely
    value={exchangeRateInput}
    onChange={(e) => {
      const raw = e.target.value;

      // ✅ Always update local input string so user can type/clear freely
      setExchangeRateInput(raw);

      // Empty — clear the actual value
      if (raw === '') {
        handleChange('exchange_rate', 0);
        return;
      }

      const val = parseFloat(raw);

      if (isNaN(val)) return;
      if (val < 0) return;
      if (val === 0) return;
      // ✅ Block exact integer 1 only — 1.2, 1.5 etc are fine
      if (Number.isInteger(val) && val === 1) return;

      handleChange('exchange_rate', val);
    }}
    onBlur={(e) => {
      const val = parseFloat(e.target.value);
      // On blur, if invalid final value — clear both
      if (isNaN(val) || val <= 0 || val === 1) {
        setExchangeRateInput('');
        handleChange('exchange_rate', 0);
      }
    }}
    fullWidth
    error={
      exchangeRateInput !== '' &&
      (parseFloat(exchangeRateInput) <= 0 ||
        (Number.isInteger(parseFloat(exchangeRateInput)) && parseFloat(exchangeRateInput) === 1))
    }
    helperText={
      exchangeRateInput !== '' && parseFloat(exchangeRateInput) === 1 &&
      Number.isInteger(parseFloat(exchangeRateInput))
        ? 'Exchange rate cannot be exactly 1'
        : exchangeRateInput !== '' && parseFloat(exchangeRateInput) <= 0
        ? 'Must be greater than 0'
        : ''
    }
    required={purchaseRequest.items.some(i => i.curr_code && i.curr_code !== 'QAR')}
    InputProps={{
      readOnly: isViewMode,
      inputProps: { min: 0, step: '0.00001' }
    }}
    InputLabelProps={{ shrink: true }}
  />
)}

                          </div>

                          <div className="flex  gap-3 flex-col md:flex-row">
                            <TextField
                              className="w-full"
                              label="Scope of Work"
                              name="description"
                              size="small"
                              value={purchaseRequest.description || ''}
                              onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                  handleChange('description', e.target.value);
                                }
                              }}
                              required
                              fullWidth
                              multiline
                              rows={3}
                              InputProps={{
                                inputProps: {
                                  maxLength: 500
                                },
                                readOnly: isViewMode || (gs_userlevel !== 1 && gs_userlevel !== 3)
                              }}
                            />

                            <TextField
                              className="w-full"
                              label="Remarks"
                              size="small"
                              name="remarks"
                              value={purchaseRequest.remarks || ''}
                              onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                  handleChange('remarks', e.target.value);
                                }
                              }}
                              fullWidth
                              required
                              multiline
                              rows={3}
                              InputProps={{
                                inputProps: {
                                  maxLength: 500
                                },
                                readOnly: isViewMode || gs_userlevel !== 1
                              }}
                            />
                          </div>
                        </div>

                        {gs_userlevel === 3 && (
                          <div className="flex items-center gap-2 bg-slate-200 p-2 rounded-md">
                            <Typography variant="h6" component="h4">
                              Comparison Excel Sheet Uploaded
                            </Typography>
                            <Checkbox checked={isUploaded} onChange={(e) => setIsUploaded(e.target.checked)} color="primary" />
                          </div>
                        )}
                        {gs_userlevel === 1 && purchaseRequest?.wo_number?.trim() !== '' && (
                          <div className="flex items-center gap-2 bg-slate-200 p-2 rounded-md">
                            <Typography variant="h6" component="h4">
                              Work Order Document Uploaded
                            </Typography>
                            <Checkbox checked={isUploaded} onChange={(e) => setIsUploaded(e.target.checked)} color="primary" />
                          </div>
                        )}
                        {/* Select */}

                        <div className="flex gap-4 flex-col mt-1 ">
                          <div className="flex gap-2 flex-col md:flex-row">
                            <TextField
                              select
                              size="small"
                              name="type_of_contract"
                              value={purchaseRequest.type_of_contract || ''}
                              label="Type of Contract *"
                              onChange={(e) => handleChange('type_of_contract', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                readOnly: isViewMode || gs_userlevel !== 1
                              }}
                              SelectProps={{
                                native: false,
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  if (!selected) return <em>Select Type of Contract</em>;
                                  return selected === 'AMC' ? 'AMC' : 'One Time';
                                },
                                IconComponent: isViewMode ? () => null : undefined
                              }}
                            >
                              {!isViewMode && [
                                <MenuItem key="amc" value="AMC">
                                  AMC
                                </MenuItem>,
                                <MenuItem key="onetime" value="One Time">
                                  One Time
                                </MenuItem>
                              ]}
                            </TextField>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                className="w-full"
                                name="amc_from"
                                format="DD/MM/YYYY"
                                value={purchaseRequest.amc_from ? dayjs(purchaseRequest.amc_from) : null}
                                onChange={(newValue) => {
                                  const isoDate = newValue ? newValue.toISOString() : new Date().toISOString();
                                  handleChange('amc_from', isoDate);

                                  // Reset AMC_To if it's before the new AMC_From
                                  if (purchaseRequest.amc_to && newValue && dayjs(purchaseRequest.amc_to).isBefore(newValue)) {
                                    handleChange('amc_to', newValue.toISOString());
                                  }
                                }}
                                readOnly={isViewMode || gs_userlevel === 3 || gs_userlevel === 5}
                                slotProps={{
                                  textField: {
                                    error: false,
                                    placeholder: 'Select AMC From Date', // Placeholder text here
                                    InputProps: {
                                      readOnly: isViewMode
                                    }
                                  },
                                  actionBar: {
                                    actions: isViewMode ? [] : ['accept', 'cancel', 'today', 'clear']
                                  }
                                }}
                                sx={{
                                  '& .MuiInputBase-root': {
                                    height: 33,
                                    fontSize: '0.675rem'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '7.5px 12px'
                                  }
                                }}
                                shouldDisableDate={(date) => isViewMode && date.isBefore(dayjs(), 'day')}
                              />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                className="w-full"
                                name="amc_to"
                                format="DD/MM/YYYY"
                                value={purchaseRequest.amc_to ? dayjs(purchaseRequest.amc_to) : null}
                                onChange={(newValue) => {
                                  const isoDate = newValue ? newValue.toISOString() : new Date().toISOString();
                                  handleChange('amc_to', isoDate);
                                }}
                                readOnly={isViewMode || gs_userlevel === 3 || gs_userlevel === 5}
                                minDate={purchaseRequest.amc_from ? dayjs(purchaseRequest.amc_from) : dayjs()} // Ensure AMC_To is >= AMC_From
                                slotProps={{
                                  textField: {
                                    error: false,
                                    placeholder: 'Select AMC To Date',
                                    InputProps: {
                                      readOnly: isViewMode
                                    }
                                  },
                                  actionBar: {
                                    actions: isViewMode ? [] : ['accept', 'cancel', 'today', 'clear']
                                  }
                                }}
                                sx={{
                                  '& .MuiInputBase-root': {
                                    height: 33,
                                    fontSize: '0.675rem'
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    padding: '7.5px 12px'
                                  }
                                }}
                                shouldDisableDate={(date) => isViewMode && date.isBefore(dayjs(), 'day')}
                              />
                            </LocalizationProvider>

                            <TextField
                              select
                              size="small"
                              name="type_of_pr"
                              value={purchaseRequest.type_of_pr || ''}
                              label="Type of PR *"
                              onChange={(e) => !isViewMode && handleChange('type_of_pr', e.target.value)}
                              fullWidth
                              InputProps={{
                                readOnly: isViewMode || gs_userlevel !== 1
                              }}
                              SelectProps={{
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return String(selected);
                                },
                                IconComponent: isViewMode ? () => null : undefined
                              }}
                            >
                              <MenuItem value="Non Chargeable" disabled={isViewMode}>
                                Non Chargeable
                              </MenuItem>
                              <MenuItem value="Charge to Customer" disabled={isViewMode}>
                                Charge to Customer
                              </MenuItem>
                              <MenuItem value="Charge to Employee" disabled={isViewMode}>
                                Charge to Employee
                              </MenuItem>
                              <MenuItem value="Charge to Supplier" disabled={isViewMode}>
                                Charge to Supplier
                              </MenuItem>
                            </TextField>

                            <TextField
                              select
                              size="small"
                              name="contract_soft_hard"
                              value={purchaseRequest.contract_soft_hard || ''}
                              label="Contract Type"
                              onChange={(e) => !isViewMode && handleChange('contract_soft_hard', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                readOnly: isViewMode || gs_userlevel !== 1
                              }}
                              SelectProps={{
                                native: false,
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return selected ? String(selected) : 'N/A';
                                },
                                IconComponent: isViewMode ? () => null : undefined // Hides dropdown arrow in view mode
                              }}
                            >
                              {/* Always render MenuItems but disable them in view mode */}
                              <MenuItem value="" disabled={isViewMode}>
                                N/A
                              </MenuItem>
                              <MenuItem value="Hard" disabled={isViewMode}>
                                Hard
                              </MenuItem>
                              <MenuItem value="Soft" disabled={isViewMode}>
                                Soft
                              </MenuItem>
                              <MenuItem value="Special" disabled={isViewMode}>
                                Special
                              </MenuItem>
                            </TextField>

                            <TextField
                              select
                              size="small"
                              name="amc_service_status"
                              value={purchaseRequest.amc_service_status || ''}
                              label="AMC Service Status"
                              onChange={(e) => !isViewMode && handleChange('amc_service_status', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                readOnly: isViewMode || gs_userlevel !== 1
                              }}
                              SelectProps={{
                                native: false,
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return selected ? String(selected) : 'N/A';
                                },
                                IconComponent: isViewMode ? () => null : undefined // Hides dropdown arrow in view mode
                              }}
                            >
                              {/* Always render MenuItems but disable them in view mode */}
                              <MenuItem value="" disabled={isViewMode}>
                                N/A
                              </MenuItem>
                              <MenuItem value="Under Approval" disabled={isViewMode}>
                                Under Approval
                              </MenuItem>
                              <MenuItem value="Approved" disabled={isViewMode}>
                                Approved
                              </MenuItem>
                              <MenuItem value="Flag raised" disabled={isViewMode}>
                                Flag raised
                              </MenuItem>
                            </TextField>

                            <TextField
                              select
                              size="small"
                              name="service_type"
                              value={purchaseRequest.service_type || ''}
                              label="Service Type"
                              onChange={(e) => !isViewMode && handleChange('service_type', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              InputProps={{ readOnly: isViewMode || gs_userlevel !== 1 }}
                              SelectProps={{
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return selected ? String(selected) : 'N/A';
                                },
                                IconComponent: isViewMode ? () => null : undefined
                              }}
                            >
                              <MenuItem value="" disabled={isViewMode}>
                                N/A
                              </MenuItem>
                              <MenuItem value="Manpower" disabled={isViewMode}>
                                Manpower
                              </MenuItem>
                              <MenuItem value="Manpower + Materials" disabled={isViewMode}>
                                Manpower + Materials
                              </MenuItem>
                              <MenuItem value="Material Supply" disabled={isViewMode}>
                                Material Supply
                              </MenuItem>
                              <MenuItem value="Rental Supply of Vehicle" disabled={isViewMode}>
                                Rental Supply of Vehicle
                              </MenuItem>
                              <MenuItem value="Special AMC's" disabled={isViewMode}>
                                Special AMC's
                              </MenuItem>
                              <MenuItem value="Supply & Installation" disabled={isViewMode}>
                                Supply & Installation
                              </MenuItem>
                              <MenuItem value="Supply of Potable Water And Sewage Removal" disabled={isViewMode}>
                                Supply of Potable Water And Sewage Removal
                              </MenuItem>
                            </TextField>
                          </div>

                          <div className="flex gap-2 flex-col md:flex-row">
                            <TextField
                              select
                              size="small"
                              name="type_of_material_supply"
                              value={purchaseRequest.type_of_material_supply || ''}
                              label="Type of Material Supply"
                              onChange={(e) => !isViewMode && handleChange('type_of_material_supply', e.target.value)}
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                readOnly: isViewMode || gs_userlevel !== 1
                              }}
                              SelectProps={{
                                native: false,
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return selected ? String(selected) : 'N/A';
                                },
                                IconComponent: isViewMode ? () => null : undefined
                              }}
                            >
                              {/* Always render MenuItems but disable them in view mode */}

                              <MenuItem value="" disabled={isViewMode}>
                                N/A
                              </MenuItem>
                              <MenuItem value="Supply" disabled={isViewMode}>
                                Supply
                              </MenuItem>
                              <MenuItem value="Installation" disabled={isViewMode}>
                                Installation
                              </MenuItem>
                              <MenuItem value="Supply Installation" disabled={isViewMode}>
                                Supply Installation
                              </MenuItem>
                            </TextField>

                            <TextField
                              select
                              size="small"
                              name="covered_by_contract_yes"
                              value={purchaseRequest.covered_by_contract_yes || ''}
                              label="Covered by Contract"
                              onChange={(e) => !isViewMode && handleChange('covered_by_contract_yes', e.target.value)}
                              fullWidth
                              variant="outlined"
                              InputLabelProps={{ shrink: true }}
                              InputProps={{ readOnly: isViewMode || gs_userlevel !== 1 }}
                              SelectProps={{
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return selected ? String(selected) : 'N/A';
                                },
                                IconComponent: isViewMode ? () => null : undefined
                              }}
                            >
                              <MenuItem value="" disabled={isViewMode}>
                                N/A
                              </MenuItem>
                              <MenuItem value="Yes" disabled={isViewMode}>
                                Yes
                              </MenuItem>
                              <MenuItem value="No" disabled={isViewMode}>
                                No
                              </MenuItem>
                            </TextField>

                            <TextField
                              select
                              size="small"
                              name="flag_sharing_cost"
                              value={purchaseRequest.flag_sharing_cost || ''}
                              label="Flag Sharing Cost"
                              onChange={(e) => !isViewMode && handleChange('flag_sharing_cost', e.target.value)}
                              fullWidth
                              variant="outlined"
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                readOnly: isViewMode || gs_userlevel !== 1
                              }}
                              SelectProps={{
                                native: false,
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return selected ? String(selected) : 'N/A';
                                },
                                IconComponent: isViewMode ? () => null : undefined
                              }}
                            >
                              <MenuItem value="" disabled={isViewMode}>
                                N/A
                              </MenuItem>
                              <MenuItem value="Yes" disabled={isViewMode}>
                                Yes
                              </MenuItem>
                              <MenuItem value="No" disabled={isViewMode}>
                                No
                              </MenuItem>
                            </TextField>
                            <TextField
                              select
                              size="small"
                              name="budgeted_yes"
                              value={purchaseRequest.budgeted_yes || ''}
                              label="Budgeted"
                              onChange={(e) => !isViewMode && handleChange('budgeted_yes', e.target.value)}
                              fullWidth
                              variant="outlined"
                              InputLabelProps={{ shrink: true }}
                              InputProps={{ readOnly: isViewMode || gs_userlevel !== 1 }}
                              SelectProps={{
                                native: false,
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return selected ? String(selected) : 'N/A';
                                },
                                IconComponent: isViewMode ? () => null : undefined
                              }}
                            >
                              <MenuItem value="" disabled={isViewMode}>
                                N/A
                              </MenuItem>
                              <MenuItem value="Yes" disabled={isViewMode}>
                                Yes
                              </MenuItem>
                              <MenuItem value="No" disabled={isViewMode}>
                                No
                              </MenuItem>
                            </TextField>
                            <TextField
                              select
                              size="small"
                              name="checked_store_yes"
                              value={purchaseRequest.checked_store_yes || ''}
                              label="Checked Store"
                              onChange={(e) => !isViewMode && handleChange('checked_store_yes', e.target.value)}
                              fullWidth
                              variant="outlined"
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                readOnly: isViewMode || gs_userlevel !== 1
                              }}
                              SelectProps={{
                                native: false,
                                displayEmpty: false,
                                renderValue: (selected) => {
                                  return selected ? String(selected) : 'N/A';
                                },
                                IconComponent: isViewMode ? () => null : undefined
                              }}
                            >
                              <MenuItem value="" disabled={isViewMode}>
                                N/A
                              </MenuItem>
                              <MenuItem value="Yes" disabled={isViewMode}>
                                Yes
                              </MenuItem>
                              <MenuItem value="No" disabled={isViewMode}>
                                No
                              </MenuItem>
                            </TextField>
                          </div>
                        </div>

                        <div>
                          {/* checkboxes for DIVISION CODE 10 == THe Maintainers */}
                          {divCode === '13' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px'
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.accommodation === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('accommodation', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                    sx={{
                                      '&.Mui-disabled': {
                                        color: isViewMode || gs_userlevel !== 1 ? 'action.disabled' : 'inherit'
                                      }
                                    }}
                                  />
                                }
                                label="Accomodation"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.catering === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('catering', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Catering"
                              />

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.laundry_housekeeping === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('laundry_housekeeping', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Laundry / Housekeeping "
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.medical === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('medical', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Medical"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.transportation === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('transportation', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Transportation"
                              />

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.training === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('training', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Training"
                              />

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.recruitment_hr === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('recruitment_hr', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Recruitment / HR"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.uniform === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('uniform', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Uniform"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.stationary === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('stationary', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Stationary"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.it_tech === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('it_tech', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="IT / Technology"
                              />

                              {/* services checkbox */}

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.furniture === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('furniture', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Furniture"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.entertainment === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('entertainment', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Entertainment"
                              />

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.barber === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('barber', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Barber"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.others === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('others', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Others"
                              />
                            </div>
                          )}
                          {/* checkboxes for DIVISION CODE 13 == Al Jassra Security Services */}
                          {divCode === '10' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px'
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.good_material_request === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('good_material_request', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Good Material Request"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.service_request === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('service_request', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Service Request"
                              />

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.material_mechanical === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('material_mechanical', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Mechanical Material"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.material_electrical === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('material_electrical', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Electrical Material"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.material_plumbing === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('material_plumbing', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Plumbing Material"
                              />

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.material_tools === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('material_tools', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Tools Material"
                              />

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.material_civil === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('material_civil', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Civil Material"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.material_ac === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('material_ac', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="AC Material"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.material_cleaning === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('material_cleaning', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Cleaning Material"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    checked={purchaseRequest.material_other === 'Y'}
                                    size="small"
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('material_other', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Other Material"
                              />

                              {/* services checkbox */}

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.services_temp_staff === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('services_temp_staff', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Temporary Staff Services"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.services_rentals === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('services_rentals', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Rental Services"
                              />

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.services_subcon_conslt === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('services_subcon_conslt', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Subcontractor / Consultant Services"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.services_other === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('services_other', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Other Services"
                              />

                              {/* Other checkbox */}
                              {/* <div className="flex gap-2 p-2 mt-2 border border-[#dfdfdf] rounded-md"> */}

                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.other_stationery === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('other_stationery', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Stationery"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.other_it === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('other_it', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="IT"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.other_new_uniform_ppe === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('other_new_uniform_ppe', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="New Uniform/PPE"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.other_rplcmt_uniform === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('other_rplcmt_uniform', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Replacement Uniform"
                              />
                              <FormControlLabel
                                sx={{
                                  '& .MuiTypography-root': {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={purchaseRequest.other_other === 'Y'}
                                    onChange={(e) => {
                                      if (!isViewMode && gs_userlevel === 1) {
                                        handleChange('other_other', e.target.checked ? 'Y' : 'N');
                                      }
                                    }}
                                    inputProps={{
                                      readOnly: isViewMode || gs_userlevel !== 1
                                    }}
                                  />
                                }
                                label="Other"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* <div className="flex mt-4 mb-4 bg-gray-300 p-[1px]"></div> */}
                    {/* form right side */}
                  </div>
                </>
              ))}
              
            {/* Details */}
            {tabIndex === 1 && [1, 3, 5].includes(Number(gs_userlevel)) && (
              <div className="flex flex-col h-full">
                <div className="w-full overflow-x-auto flex-grow">
                  <AgTableItemDetails />
                </div>

                {/* ADD ITEM */}
                {isOpenDetail && (
                  <Modal
                    open={isOpenDetail}
                    onClose={handleCloseDetail}
                    aria-labelledby="add-item-modal"
                    aria-describedby="add-item-modal-description"
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 1390,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 2,
                        borderRadius: 1
                      }}
                    >
                      <CustomAlert />

                      <div className="w-full flex gap-2 justify-center items-center">
                        <FormControl sx={{ width: '300px' }}>
                          <InputLabel id="demo-simple-select-label">Service Type *</InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Service Type *"
                            size="small"
                            value={
                              currentItem.service_rm_flag === ''
                                ? purchaseRequest.items.length > 0
                                  ? 'Addl Desc'
                                  : 'Service'
                                : currentItem.service_rm_flag
                            }
                            onChange={(event) => handleItemFieldChange('service_rm_flag', event.target.value)}
                          >
                            <MenuItem value="Service">Service</MenuItem>
                            <MenuItem value="RM">Raw Material</MenuItem>
                            {purchaseRequest.items.length !== 0 && <MenuItem value="Addl Desc">Sub Service</MenuItem>}
                          </Select>
                        </FormControl>

                        {/* {currentItem?.service_rm_flag !== 'Addl Desc' && (
                          <Autocomplete
                            fullWidth
                            id="cost_code"
                            size="small"
                            options={costList?.tableData || []}

                            getOptionLabel={(option) =>
                              option.cost_code && option.cost_name ? `${option.cost_code} - ${option.cost_name}` : option.cost_code || ''
                            }
                            onChange={(event, value) => {
                              if (value) {
                                handleItemFieldChange('cost_code', value.cost_code);
                                handleItemFieldChange('cost_name', value.cost_name);
                              } else {
                                handleItemFieldChange('cost_code', '');
                                handleItemFieldChange('cost_name', '');
                              }
                            }}
                            value={costList?.tableData?.find((cost) => cost.cost_code === currentItem?.cost_code) || null}
                            renderInput={(params) => <TextField {...params} label="Cost Code *" variant="outlined" fullWidth />}
                            renderOption={(props, option) => (
                              <li {...props} key={option.cost_code}>
                                {option.cost_code} - {option.cost_name}
                              </li>
                            )}
                            noOptionsText="No options available"
                            readOnly={isViewMode || gs_userlevel === 5}
                            sx={{
                              '& .MuiAutocomplete-inputRoot': {
                                paddingTop: '5px !important',
                                paddingBottom: '5px !important',
                                minHeight: '30px' // Adjust height
                              },
                              '& .MuiInputLabel-outlined': {
                                transform: 'translate(14px, 10px) scale(1)',
                                '&.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -9px) scale(0.75)'
                                }
                              }
                            }}
                          />
                        )} */}

                        {currentItem?.service_rm_flag === 'RM' && (
                          <Autocomplete
                            fullWidth
                            id="item_code"
                            size="small"
                            options={prodList?.tableData || []}
                            getOptionLabel={(option) => option.prod_name || ''}
                            onChange={(event, value) => {
                              handleItemFieldChange('item_code', value?.prod_code);
                              // Also update the upp field when a product is selected
                              if (value) {
                                handleItemFieldChange('upp', value.uppp);
                                handleItemFieldChange('l_uom', value.l_uom);
                                handleItemFieldChange('p_uom', value.p_uom);
                              }
                            }}
                            value={
                              prodList?.tableData?.find((prod: { prod_code: string }) => prod.prod_code === currentItem?.item_code) || null
                            }
                            renderInput={(params) => <TextField {...params} label="Product *" variant="outlined" fullWidth />}
                            noOptionsText="No options available"
                            readOnly={isViewMode || gs_userlevel === 5}
                            sx={{
                              '& .MuiAutocomplete-inputRoot': {
                                paddingTop: '5px !important',
                                paddingBottom: '5px !important',
                                minHeight: '30px' // Adjust height
                              },
                              '& .MuiInputLabel-outlined': {
                                transform: 'translate(14px, 10px) scale(1)',
                                '&.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -9px) scale(0.75)'
                                }
                              }
                            }}
                          />
                        )}

                        <TextField
                          disabled={currentItem?.service_rm_flag === 'RM' && currentItem.item_code !== 'NEWITEM'}
                          id="outlined-number"
                          label="Description"
                          type="text"
                          size="small"
                          value={currentItem.addl_item_desc || ''}
                          onChange={(e) => {
                            if (e.target.value.length <= 500) {
                              handleItemFieldChange('addl_item_desc', e.target.value);
                            }
                          }}
                          InputLabelProps={{
                            shrink: true
                          }}
                          InputProps={{
                            inputProps: {
                              maxLength: 500
                            },

                            readOnly: isViewMode || gs_userlevel === 5
                          }}
                          sx={{ width: '100%' }}
                          multiline
                          maxRows={4}
                        />

                        {currentItem?.service_rm_flag !== 'Addl Desc' && gs_userlevel === 3 && (
                          <Autocomplete
                            fullWidth
                            id="supplier"
                            size="small"
                            options={supplierList?.tableData || []}
                            getOptionLabel={(option) => option.supp_name || ''} // Display only name
                            onChange={(event, value) => {
                              handleItemFieldChange('supplier', value?.supp_code || '');
                            }}
                            value={
                              currentItem?.supplier
                                ? supplierList?.tableData?.find((supp) => supp.supp_code === currentItem?.supplier) || null
                                : null
                            }
                            renderInput={(params) => <TextField {...params} label="Supplier *" variant="outlined" fullWidth />}
                            renderOption={(props, option) => (
                              <li {...props} key={option.supp_code}>
                                {option.supp_name} {/* Display only name in dropdown */}
                              </li>
                            )}
                            filterOptions={(options, { inputValue }) =>
                              options.filter((option) => option.supp_name?.toLowerCase().includes(inputValue.toLowerCase()))
                            }
                            noOptionsText="No options available"
                            readOnly={isViewMode || gs_userlevel === 5}
                            sx={{
                              '& .MuiAutocomplete-inputRoot': {
                                paddingTop: '5px !important',
                                paddingBottom: '5px !important',
                                minHeight: '30px' // Adjust height
                              },
                              '& .MuiInputLabel-outlined': {
                                transform: 'translate(14px, 10px) scale(1)',
                                '&.MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -9px) scale(0.75)'
                                }
                              }
                            }}
                          />
                        )}
                      </div>
                      <div className="w-full flex gap-2 justify-start items-center mt-4">
                        {currentItem?.service_rm_flag === 'RM' && (
                          <TextField
                            id="outlined-number"
                            label="Primary Qty"
                            type="number"
                            size="small"
                            value={currentItem.item_p_qty || ''}
                            onChange={(e) => handleItemFieldChange('item_p_qty', e.target.value)}
                            InputLabelProps={{
                              shrink: true
                            }}
                            InputProps={{
                              readOnly: isViewMode || gs_userlevel === 5
                            }}
                            sx={{ width: '100%' }}
                          />
                        )}

                        {currentItem?.service_rm_flag === 'RM' && (
                          <>
                            <Autocomplete
                              fullWidth
                              id="p_uom"
                              size="small"
                              options={uomList?.tableData || []}
                              getOptionLabel={(option) => option.uom_name || ''}
                              onChange={(event, value) => handleItemFieldChange('p_uom', value?.uom_code)}
                              value={uomList?.tableData?.find((uom: { uom_code: string }) => uom.uom_code === currentItem?.p_uom) || null}
                              renderInput={(params) => <TextField {...params} label="Primary UOM *" variant="outlined" fullWidth />}
                              noOptionsText="No options available"
                              readOnly={isViewMode || gs_userlevel === 5}
                              sx={{
                                '& .MuiAutocomplete-inputRoot': {
                                  paddingTop: '5px !important',
                                  paddingBottom: '5px !important',
                                  minHeight: '30px' // Adjust height
                                },
                                '& .MuiInputLabel-outlined': {
                                  transform: 'translate(14px, 10px) scale(1)',
                                  '&.MuiInputLabel-shrink': {
                                    transform: 'translate(14px, -9px) scale(0.75)'
                                  }
                                }
                              }}
                            />
                            <Typography>
                              {uomList?.tableData?.find((uom) => uom.uom_code === currentItem.p_uom)?.uom_name || currentItem.p_uom || ''}
                            </Typography>
                          </>
                        )}

                        {currentItem?.service_rm_flag !== 'Addl Desc' && (
                          <TextField
                            id="outlined-number"
                            label="Lowest Qty"
                            type="number"
                            size="small"
                            value={currentItem.item_l_qty || ''}
                            onChange={(e) => handleItemFieldChange('item_l_qty', e.target.value)}
                            InputLabelProps={{
                              shrink: true
                            }}
                            InputProps={{
                              readOnly: isViewMode || gs_userlevel === 5
                            }}
                            sx={{ width: '100%' }}
                          />
                        )}
                        {currentItem?.service_rm_flag !== 'Addl Desc' && (
                          <>
                            <Autocomplete
                              fullWidth
                              id="l_uom"
                              size="small"
                              options={uomList?.tableData || []}
                              getOptionLabel={(option) => option.uom_name || ''}
                              onChange={(event, value) => handleItemFieldChange('l_uom', value?.uom_code)}
                              value={uomList?.tableData?.find((uom) => uom.uom_code === currentItem?.l_uom) || null}
                              renderInput={(params) => <TextField {...params} label="Lowest UOM *" variant="outlined" fullWidth />}
                              noOptionsText="No options available"
                              readOnly={isViewMode || gs_userlevel === 5}
                              sx={{
                                '& .MuiAutocomplete-inputRoot': {
                                  paddingTop: '5px !important',
                                  paddingBottom: '5px !important',
                                  minHeight: '30px' // Adjust height
                                },
                                '& .MuiInputLabel-outlined': {
                                  transform: 'translate(14px, 10px) scale(1)',
                                  '&.MuiInputLabel-shrink': {
                                    transform: 'translate(14px, -9px) scale(0.75)'
                                  }
                                }
                              }}
                            />
                            <Typography>
                              {uomList?.tableData?.find((uom) => uom.uom_code === currentItem.l_uom)?.uom_name || currentItem.l_uom || ''}
                            </Typography>
                          </>
                        )}
                        {currentItem?.service_rm_flag !== 'Addl Desc' && gs_userlevel === 3 && (
                          <TextField
                            id="outlined-number"
                            label="Item Rate"
                            type="number"
                            size="small"
                            value={currentItem.item_rate || 0}
                            onChange={(e) => handleItemFieldChange('item_rate', parseFloat(e.target.value) || 0)}
                            InputLabelProps={{
                              shrink: true
                            }}
                            InputProps={{
                              readOnly: isViewMode || gs_userlevel === 5,
                              inputMode: 'decimal'
                            }}
                            sx={{ width: '100%' }}
                          />
                        )}
                        {currentItem?.service_rm_flag !== 'Addl Desc' && gs_userlevel === 3 && (
                          <TextField
                            id="outlined-number"
                            label="Discount"
                            type="number"
                            size="small"
                            value={currentItem.discount_amount || 0}
                            onChange={(e) => handleItemFieldChange('discount_amount', parseFloat(e.target.value) || 0)}
                            InputLabelProps={{
                              shrink: true
                            }}
                            InputProps={{
                              readOnly: isViewMode || gs_userlevel === 5,
                              inputMode: 'decimal'
                            }}
                            sx={{ width: '100%' }}
                          />
                        )}
                        {currentItem?.service_rm_flag !== 'Addl Desc' && gs_userlevel === 3 && (
                          <>
                            <Autocomplete
                              fullWidth
                              id="curr_name"
                              size="small"
                              options={currency?.tableData || []}
                              getOptionLabel={(option) => option.curr_name || ''}
                              onChange={(event, value) => {
                                handleItemFieldChange('curr_code', value?.curr_code);
                                handleItemFieldChange('curr_name', value?.curr_name);
                              }}
                              value={currency?.tableData?.find((curr) => curr.curr_code === (currentItem?.curr_code || 'QAR')) || null}
                              renderInput={(params) => <TextField {...params} label="Currency *" variant="outlined" fullWidth />}
                              noOptionsText="No options available"
                              readOnly={isViewMode || gs_userlevel === 5}
                              sx={{
                                '& .MuiAutocomplete-inputRoot': {
                                  paddingTop: '5px !important',
                                  paddingBottom: '5px !important',
                                  minHeight: '30px' // Adjust height
                                },
                                '& .MuiInputLabel-outlined': {
                                  transform: 'translate(14px, 10px) scale(1)',
                                  '&.MuiInputLabel-shrink': {
                                    transform: 'translate(14px, -9px) scale(0.75)'
                                  }
                                }
                              }}
                            />
                          </>
                        )}
                      </div>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button onClick={handleCloseDetail} variant="outlined" sx={{ mr: 2 }}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddItemNew} variant="contained" color="primary">
                          OK
                        </Button>
                      </Box>
                    </Box>
                  </Modal>
                )}

                <div className="flex gap-2 mt-4 justify-between">
                  <React.Fragment>
                    {/* <Button size="small" variant="contained" onClick={handleAddItem} endIcon={<AddIcon />}>
                      Add Row
                    </Button> */}
                    {/* Fix the Add Item button onClick handler */}
                    <Button
                      disabled={isViewMode}
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setIsOpenDetail(true);

                        // Create the base new item with defaults
                        const newItem = {
                          ...initialPurchaseRequest().items[0],
                          service_rm_flag: purchaseRequest.items.length > 0 ? 'Addl Desc' : 'Service',
                          item_sequence_no: purchaseRequest.items.length + 1
                        };

                        // Copy cost_code and supplier from last item if available
                        if (purchaseRequest.items.length > 0) {
                          const lastItem = purchaseRequest.items[purchaseRequest.items.length - 1];
                          newItem.cost_code = lastItem?.cost_code || '';
                          newItem.supplier = lastItem?.supplier?.trim() !== '' ? lastItem.supplier : '';
                        }

                        setCurrentItem(newItem);
                        setEditingIndex(null);
                      }}
                      endIcon={<AddIcon />}
                    >
                      Add Item
                    </Button>
                  </React.Fragment>

                  {Number(purchaseRequest?.flow_level_running) !== 1 && (
                    <div className="flex gap-2 items-center">
                      <Typography>TOTAL</Typography>

                      <TextField
                        margin="none"
                        type="text"
                        size="small"
                        InputProps={{
                          readOnly: true,
                          style: {
                            textAlign: 'right',
                            fontWeight: 'bold'
                          }
                        }}
                        value={
                          totalAmount !== null && totalAmount !== undefined
                            ? new Intl.NumberFormat('en-US', {
                              style: 'decimal',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(Number(totalAmount))
                            : '0.00'
                        }
                        sx={{
                          '& .MuiInputBase-input': {
                            textAlign: 'right'
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {tabIndex === 1 && [2, 4].includes(Number(gs_userlevel)) && (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div className="overflow-auto flex-grow">
                  {purchaseRequest?.last_action !== 'SAVEASDRAFT' && <CostDetailBeforeSave />}
                  {purchaseRequest?.last_action === 'SAVEASDRAFT' && <MyAntTable />}
                </div>

                {/* Data Rows */}
                {/* Cost Details */}
              </Box>
            )}
          </form>
        </div>
      </div>

      {/* Fixed Buttons Rack at bottom */}
      <div className="sticky bottom-0 z-10 bg-white mt-2">
        {/* Line */}
        <div className="flex bg-[#1677ff] mt-1 mb-2 p-[1px]"></div>
        <div className="flex flex-col  md:flex-row  items-center bg-white justify-between">
          <div className=" pb-3 md:pb-0 ">
            {!isViewMode && (
              <>
                <ButtonGroup variant="contained" size="small" aria-label="Basic button group">
                  {purchaseRequest?.final_approved === 'YES' && (!purchaseRequest?.fa_uploaded || purchaseRequest?.fa_uploaded === 'N') && (
                    <Popconfirm
                      zIndex={9999}
                      title="Cancel"
                      description="Are you sure you want to Generate PO ?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={async () => {
                        purchaseRequest.company_code = user?.company_code || 'JASRA';
                        purchaseRequest.last_action = 'POGEN';
                        try {
                          purchaseRequest.company_code = user?.company_code ?? '';
                          await GmPfServiceInstance.updatepurchaserequest({ ...purchaseRequest, updated_by: user?.loginid });
                        } catch (error) {
                          console.error('Error updating purchase request:', error);
                        } finally {
                          setIsOpen(true);
                        }
                      }}
                    >
                      <Button sx={{ backgroundColor: '#082a89' }} endIcon={<MdOutlineLibraryAddCheck />}>
                        Genrate PO
                      </Button>
                    </Popconfirm>
                  )}

                  {purchaseRequest?.final_approved?.toUpperCase() !== 'YES' && gs_userlevel !== 5 && (
                    <Button
                      sx={{ backgroundColor: '#082a89' }}
                      color="primary"
                      onClick={async () => {
                        handleSaveAsDraft(new Event('submit') as unknown as React.FormEvent);
                      }}
                      endIcon={<FaSave />}
                    >
                      Save as Draft
                    </Button>
                  )}

                  {purchaseRequest.request_number && gs_userlevel !== 5 && purchaseRequest?.final_approved !== 'YES' && (
                    <Popconfirm
                      zIndex={9999}
                      title="Submit"
                      description="Are you sure you want to Submit ?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => handleUpdateRequest('SUBMITTED', 0, handleCloseRequestForm)}
                    >
                      <Button sx={{ backgroundColor: '#082a89' }} color="primary" endIcon={<IoSendSharp />}>
                        Submit
                      </Button>
                    </Popconfirm>
                  )}

                  {gs_userlevel === 5 && purchaseRequest?.final_approved?.toUpperCase() !== 'FINAL APPROVED' && (
                    <Popconfirm
                      zIndex={9999}
                      title="Submit"
                      description="Are you sure you want to Approve?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => handleUpdateRequest('SUBMITTED', 0, handleCloseRequestForm)}
                    >
                      <Button sx={{ backgroundColor: '#082a89' }} endIcon={<FaCheckCircle />} color="primary">
                        Approve
                      </Button>
                    </Popconfirm>
                  )}

                  {purchaseRequest?.flow_level_running !== 1 && purchaseRequest?.final_approved !== 'YES' && (
                    <Button
                      sx={{ backgroundColor: '#082a89' }}
                      color="primary"
                      onClick={async () => {
                        handleRejectPopupOpen(purchaseRequest.request_number ?? '');
                      }}
                      endIcon={<MdCancelScheduleSend />}
                    >
                      Reject
                    </Button>
                  )}

                  {purchaseRequest?.flow_level_running !== 1 && purchaseRequest?.final_approved !== 'YES' && (
                    <Button
                      sx={{ backgroundColor: '#082a89' }}
                      color="primary"
                      onClick={() => {
                        handleSentBackPopupOpen(purchaseRequest.request_number ?? '', Number(purchaseRequest?.flow_level_running));
                      }}
                      endIcon={<RiArrowGoBackFill />}
                    >
                      Send Back
                    </Button>
                  )}
                </ButtonGroup>
              </>
            )}
          </div>

          <div className="hidden md:flex">
            <ButtonGroup variant="outlined" size="medium" aria-label="Basic button group">
              {purchaseRequest.request_number && (
                <>
                <Tooltip title="React Report">
                <Button onClick={() => {
                  setPrReportValues({
                    open: true,
                    companyCode: purchaseRequest.company_code || 'BSG',
                    requestNumber: purchaseRequest.request_number || ''
                  });
                }} >
                  <IoPrintSharp /> 
                </Button>
                </Tooltip>
                <Tooltip title="Print & View">
                  <Button disabled={!purchaseRequest.request_number} color="primary" onClick={handleOpenRequestForm}>
                    <IoPrintSharp />
                  </Button>
                </Tooltip>
                </>
              )}

              <Tooltip title="View Log">
                <Button onClick={() => setShowLog(true)} sx={{ textTransform: 'none' }}>
                  <IoIosDocument />
                </Button>
              </Tooltip>

              {request_number && (
                <Tooltip title="Attach & View">
                  <Button
                    onClick={handleUploadPopup}
                  // Disable button if request_number is not generated
                  >
                    <IoIosAttach />
                  </Button>
                </Tooltip>
              )}

              {request_number && (
                <Tooltip title="PO Details">
                  <Button onClick={handlePrint}>
                    <BiDetail />
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Exit">
                <Button
                  onClick={() => {
                    onClose(true);
                    dispatch(clearAlert());
                  }}
                >
                  <ImExit />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>
      </div>

      {/* pop up */}
      {showLog && purchaseRequest?.request_number && (
        <PurchaseRequestLogReport requestNumber={purchaseRequest.request_number} onClose={() => setShowLog(false)} />
      )}

      <PoList

        PoOpen={PoOpen}

        setPoOpen={setPoOpen}

        POdata={POdata}

        requestNumber={purchaseRequest.request_number || ''}

        div_code={divCode || ''}

      />

      {/* POP UP */}
      {/* Send Back */}
      {sentBackPopup.action.open && (
        <UniversalDialog
          action={{ ...sentBackPopup.action }}
          onClose={handleSentBackPopupClose}
          title={sentBackPopup.title}
          hasPrimaryButton={false}
        >
          <SentBackPopup
            request_number={sentBackPopup.data.request_number}
            flowLevel={sentBackPopup.data.level}
            onClose={handleSentBackPopupClose}
            onLevelChange={(level) => setSentBackPopup((prev) => ({ ...prev, data: { ...prev.data, level } }))}
            onRemarksChange={(remarks) => setSentBackPopup((prev) => ({ ...prev, data: { ...prev.data, remarks } }))}
          />
        </UniversalDialog>
      )}

      {/* Reject */}
      {rejectPopup.action.open && (
        <UniversalDialog
          action={{ ...rejectPopup.action }}
          onClose={handleRejectPopupClose}
          title={rejectPopup.title}
          hasPrimaryButton={true}
          primaryButonTitle="Submit"
          onSave={handleRejectSubmit}
        >
          <TextField label="Remarks" value={rejectPopup.data.remarks} onChange={handleRejectRemarksChange} fullWidth multiline rows={4} />
        </UniversalDialog>
      )}

      {/* Cancel */}
      {cancelPopup.action.open && (
        <UniversalDialog
          action={{ ...cancelPopup.action }}
          onClose={handleCancelPopupClose}
          title={cancelPopup.title}
          hasPrimaryButton={true}
          primaryButonTitle="Submit"
          onSave={handleCancelSubmit}
        >
          <div>
            <TextField label="Remarks" value={cancelPopup.data.remarks} onChange={handleCancelRemarksChange} fullWidth multiline rows={4} />
            <FormControlLabel control={<Checkbox checked={createPR} onChange={(e) => setCreatePR(e.target.checked)} />} label="Create PR" />
          </div>
        </UniversalDialog>
      )}

      {isSendBackModalOpen && (
        <SentbackRollSection
          onClose={async (newFlowLevel: number) => {
            if (newFlowLevel > 0) {
              await handleUpdateRequest('SENTBACK', newFlowLevel, handleSentBack);
            }

            setIsSendbackModalOpen(false);
          }}
          flowLevel={purchaseRequest?.flow_level_running || 0}
        />
      )}

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          <Result
            className="bg-white rounded-lg shadow-xl p-6"
            status="success"
            title="Purchase Order Generated Successfully !"
            extra={[
              <>
                <Button variant="contained" color="primary" onClick={() => onClose(true)} size="small" className="mt-4">
                  Close
                </Button>
              </>
            ]}
          />
        </div>
      </Modal>
      {openRequestForm && (
        <Dialog open={openRequestForm} onClose={handleCloseRequestForm} fullWidth maxWidth="lg">
          <DialogContent>
            {purchaseRequest.request_number ? (
              <PurchaseRequestFormReport
                requestNumber={purchaseRequest.request_number}
                divCode={divCode} // Add this prop
                key={`${purchaseRequest.request_number}`}
                onClose={handleCloseRequestForm}
              />
            ) : (
              <Typography>No request number available</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRequestForm}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {!!uploadFilesPopup && uploadFilesPopup.action.open && (
        <UniversalDialog
          action={{ ...uploadFilesPopup.action }}
          onClose={handleUploadPopup}
          title={uploadFilesPopup.title}
          hasPrimaryButton={false}
        >
          <FilesForPurchaseRequest
            isViewMode={isViewMode}
            level={2}
            handleUploadPopup={handleUploadPopup}
            existingFilesData={filesData}
            filesData={filesData}
            setFilesData={setFilesData}
            module={app}
            type="Purchase_Request"
            request_number={request_number}
            onClose={handleCloseFilesPopup}
          />
        </UniversalDialog>
      )}

      {prReportValues.open && (
        <ReportDialogPage
        Report={PurchaseRequestReportDesign}
        required_values={{companyCode: prReportValues.companyCode, requestNumber: prReportValues.requestNumber }}
        title="Purchase Order"
        onClose={() => setPrReportValues(prev => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
};

function setShowReport(value: boolean) {
  console.log('Setting showReport to:', value);
}

setShowReport(true);

export default AddPurchaserequestPfForm;
