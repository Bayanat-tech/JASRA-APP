import React, { useState, useEffect, useRef } from 'react';
import { showAlert } from 'store/CustomAlert/alertSlice';
import {
  TextField,
  Button,
  Grid,
  Box,
  ButtonGroup,
  Tabs,
  Tab,
  Snackbar,
  Autocomplete,
  Paper,
  Typography,
  Modal,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IoIosAttach } from 'react-icons/io';
import useAuth from 'hooks/useAuth';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useSelector, useDispatch } from 'store';
import { FaSave } from 'react-icons/fa';
import { IoSendSharp } from 'react-icons/io5';
import { FaCheckCircle } from 'react-icons/fa';
import PfSerivceInstance from 'service/service.purhaseflow';
import ExcelBudgetUpload from './ExcelBudgetUpload';
import MonthCostWiseInfo from './MonthCostWiseInfo';
import MonthProjectWiseInfo from './MonthProjectWiseInfo';
import { FiUpload } from 'react-icons/fi';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { ImExit } from 'react-icons/im';

import {
  TBasicBrequest,
  Titembudgetrequest,
  Addbudgettab3dd,
  TexcelBudgetupload,
  TMonthCostWiseInfo,
  TMonthProjectWiseInfo
} from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
//import axiosServices from 'utils/axios'; // Ensure this path matches your project structure
import NewDataEntryComponent from './BudgetAllocation';
import AddbudgetTab3 from './AddBudgetTab3';
import AddBudgetTab2 from './AddBudgetTab2';
import BudgetRequestFormprint from './budgetrequestprint';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ImportData from 'components/popup/ImportData';
import FileUploadServiceInstance from 'service/services.files';
import FilesForPurchaseRequest from './FilesForPurchaseRequest';
import { TFile } from 'types/types.file';
import CustomAlert from 'components/@extended/CustomAlert';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from 'components/popup/UniversalDialog';
import { openSnackbar } from 'store/reducers/snackbar';
import { MdCancelScheduleSend } from 'react-icons/md';
import { RiArrowGoBackFill } from 'react-icons/ri';
import BudgetRequestFormReport from 'components/reports/purchase/BudgetRequestFormReport';

export interface ProjectOption {
  project_code: string;
  project_name: string;
  div_code: string;
  total_project_cost: number;
  project_date_from: Date;
  project_date_to: Date;
  facility_mgr_email: string;
  prno_pre_fix: string;
  facility_mgr_name: string;
  facility_mgr_phone: string;
  div_name: string;

  // Added fields from consolidated budget view
  po_amount: number;
  pr_amount: number;
  prev_appr_amt: number;
}

// interface ProjectListResponse {
//   tableData: ProjectOption[];
//   count: number;
// }

export interface TBudgetrequestPf {
  headerData: TBasicBrequest | null;
  itemData: Titembudgetrequest[];
  additionalData: Addbudgettab3dd[];
  TMonthCostWiseInfodata: TMonthCostWiseInfo[];
  TMonthProjectWiseInfodata: TMonthProjectWiseInfo[];
}

interface AddBudgetrequestPfFormProps {
  request_number: string;
  onClose: () => void;
  isEditMode: boolean;
  existingData: any;
  onConfirmCloseTab?: () => void;
}

const AddBudgetRequestForm: React.FC<AddBudgetrequestPfFormProps> = ({
  request_number,
  onClose,
  isEditMode,
  existingData,
  onConfirmCloseTab
}) => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [headerData, setHeaderData] = useState<TBasicBrequest>({
    request_number: '',
    company_code: '',
    request_date: new Date(),
    description: '',
    remarks: '',
    last_action: '',
    project_code: '',
    updated_by: '',
    created_by: '',
    total_project_cost: 0,
    proj_budget_alloc: 0,
    tot_proj_po: 0,
    tot_proj_pr: 0,
    tot_proj_cost_po: 0,
    total_proj_cost_pr: 0,
    flow_level_running: 1
  });

  /* const [formData] = useState<TBasicBrequest>({
    request_number: '',
    company_code: '',
    request_date: new Date(),
    description: '',
    remarks: '',
    last_action: '',
    project_code: '',
    updated_by: '',
    created_by: '',
    total_project_cost: 0,
    proj_budget_alloc: 0,
    tot_proj_po: 0,
    tot_proj_pr: 0,
    tot_proj_cost_po: 0,
    // total_proj_cost_pr: 0,
    flow_level_running: 1
  });*/

  const [itemData, setItemData] = useState<Titembudgetrequest[]>([]);
  const [detailedBudgetData, setDetailedBudgetData] = useState<any[]>([]); // ✅ Now properly defined
  const [additionalData, setAdditionalData] = useState<Addbudgettab3dd[]>([]);
  const [TMonthCostWiseInfodata, setTMonthCostWiseInfodata] = useState<TMonthCostWiseInfo[]>([]);
  const [TMonthProjectWiseInfodata, setTMonthProjectWiseInfodata] = useState<TMonthProjectWiseInfo[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [showAllocate, setShowAllocate] = useState<boolean>(false);
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const [open, setOpen] = useState(false);
  const [isImportDataPopupOpen, setIsImportDataPopupOpen] = useState(false);
  const requestNumberRef = useRef<string | undefined>(request_number);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [formattedRequestNumber, setFormattedRequestNumber] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isTabDisabled, setIsTabDisabled] = useState(true);

  const [projectDetails, setProjectDetails] = useState<any>({
    div_name: '',
    facility_mgr_email: '',
    project_code: '',
    project_date_from: '',
    project_date_to: '',
    project_name: '',
    total_project_cost: '',
    po_amount: '',
    pr_amount: '',
    prev_appr_amt: ''
  });

  const handleToggleImportDataPopup = () => {
    setIsImportDataPopupOpen(!isImportDataPopupOpen);
  };

  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({
    project_code: false,
    description: false,
    remarks: false
  });

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const transformData = (data: unknown[]): TexcelBudgetupload[] => {
    return data
      .filter((item: any) => Array.isArray(item) && item.length === 6)
      .map((item: any) => ({
        project_code: String(item[0]),
        cost_code: String(item[1]),
        equal_amount: String(parseFloat(item[2])),
        total_amount: String(parseFloat(item[3])),
        from_date: formatDate(item[4]),
        to_date: formatDate(item[5])
      }));
  };
  console.log(transformData, "transformData")
  /*const updateBudgetRequest = async (values: TBasicBrequest): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('inside before updatebudget1');
      console.log(values);
      const response = await axiosServices.post<{ success: boolean; message: string }>('api/pf/gm/budgetrequest', values);
      console.log('after before updatebudget2');

      if (response.data.success) {
        return { success: true, message: response.data.message || 'Budget request processed successfully.' };
      } else {
        return { success: false, message: response.data.message || 'Update failed' };
      }
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        displayAlert({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          severity: 'error'
        })
      );
      return { success: false, message: knownError.message || 'An unexpected error occurred' };
    }
  };*/
  const handleAlert = async () => {
    let popupMessage: string | null = null;
    let severity: 'success' | 'info' | 'warning' | 'error' = 'success'; // Default

    try {
      if (!user?.loginid || !user?.company_code) {
        console.error('User information is incomplete. Cannot fetch message box.');
        return;
      }
      const messageBoxData = await GmPfServiceInstance.Fetchmessagebox(user.loginid, user.company_code);
      console.log('messagebox', messageBoxData);

      if (messageBoxData && messageBoxData.length > 0) {
        const box = messageBoxData[0] as any;
        popupMessage = box.MESSAGE_BOX ?? 'Records saved successfully!';
        severity = (box.MESSAGE_TYPE?.toLowerCase() as typeof severity) ?? 'success';
      } else {
        popupMessage = 'Contact Help desk for checking Message!';
      }
      //  await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      console.log('popupMessage', popupMessage);
      console.log('severity', severity);

      dispatch(
        showAlert({
          severity,
          message: popupMessage ?? '',
          open: true
        })
      );
      return severity;
    } catch (error) {
      console.error('Error fetching alert message:', error);
      dispatch(
        showAlert({
          severity: 'error',
          message: 'An error occurred while fetching the alert message.',
          open: false
        })
      );
    }
  };
  const handleConfirm = async () => {
    setLoading(true);

    const payload = {
      ...headerData,
      last_action: 'SUBMITTED',
      company_code: user?.company_code ?? '',
      updated_by: user?.loginid ?? '',
      created_by: user?.loginid ?? ''
    };
    console.log('inside handleconfirm1');
    await GmPfServiceInstance.updatebudgetrequest(payload);
    console.log('inside handleconfirm2');
    // await updateBudgetRequest(payload);

    const returnValue = await handleAlert(); // Wait for result
    console.log('inside handleConfirm3');

    if (returnValue === 'success') {
      //   await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      onClose(); // Close the window/dialog
    }
  };

  const handleRejected = async () => {
    setLoading(true);

    const payload = {
      ...headerData,
      last_action: 'REJECTED',
      company_code: user?.company_code ?? '',
      updated_by: user?.loginid ?? '',
      created_by: user?.loginid ?? ''
    };
    console.log('inside handleconfirm1');
    await GmPfServiceInstance.updatebudgetrequest(payload);
    console.log('inside handleconfirm2');
    // await updateBudgetRequest(payload);

    const returnValue = await handleAlert(); // Wait for result
    console.log('inside handleConfirm3');

    if (returnValue === 'success') {
      //   await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      onClose(); // Close the window/dialog
    }
  };

  const handleSentBack = async () => {
    setLoading(true);

    const payload = {
      ...headerData,
      last_action: 'SENTBACK',
      company_code: user?.company_code ?? '',
      updated_by: user?.loginid ?? '',
      created_by: user?.loginid ?? ''
    };
    console.log('inside handleconfirm1');
    await GmPfServiceInstance.updatebudgetrequest(payload);
    console.log('inside handleconfirm2');
    // await updateBudgetRequest(payload);

    const returnValue = await handleAlert(); // Wait for result
    console.log('inside handleConfirm3');

    if (returnValue === 'success') {
      //   await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      onClose(); // Close the window/dialog
    }
  };

  const formatDate = (dateInput: string | Date): string => {
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateToDDMMYYYY(dateInput);
    } else if (typeof dateInput === 'string') {
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        return dateToDDMMYYYY(parsedDate);
      }
    }
    throw new Error(`Invalid date format: ${dateInput}`);
  };

  const dateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleImportData = async (values: unknown[]): Promise<boolean> => {
    try {
      const budgetValues = transformData(values);
      if (budgetValues.length === 0) {
        console.error('No data to upload.');
        return false;
      }
      if (!requestNumberRef.current) {
        console.error('Request number is undefined.');
        return false;
      }

      const request_number = requestNumberRef.current;
      const response = await GmPfServiceInstance.budgetexcelupload(budgetValues, request_number);
      if (response) {
        setIsModalOpen(true);
        return true;
      }

      console.error('Failed to upload data.');
      return false;
    } catch (error) {
      console.error('Error during budget upload:', error);
      return false;
    }
  };

  const { data: projectList } = useQuery({
  queryKey: ['project_data', app],
  queryFn: async () => {
    if (!app) return { tableData: [], count: 0 };

    const response = await PfSerivceInstance.proc_build_dynamic_sql({
      parameter: "dropdwonprojectmaster",   // 🔥 replaced
      loginid: user?.loginid ?? "",
      code1: user?.company_code ?? "",      // 🔥 company filter applied
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

    // ✔ response is an array → convert properly
    const tableData = Array.isArray(response)
      ? (response as ProjectOption[])
      : [];

    const count = tableData.length;

    return { tableData, count };
  },
  enabled: !!app
});

  const fetchData = async () => {
    try {
      setLoading(true);
      if (request_number) {
        const response = await GmPfServiceInstance.getBudgetRequestNumber(request_number);
        console.log('🔍 RAW API RESPONSE:', JSON.stringify(response, null, 2));
        
        if (response) {
          if ('budgetRequests' in response) {
            const { budgetRequests, itemBudgets, additionalBudgets, TMonthCostWiseInfodata, TMonthProjectWiseInfodata } = response;

            console.log('🔍 RAW itemBudgets:', itemBudgets); // ✅ Debug log

            // ✅ Map camelCase API response to snake_case
            const mappedHeaderData = budgetRequests?.[0] ? {
              request_number: budgetRequests[0].requestNumber || '', // ✅ Fixed mapping
              company_code: budgetRequests[0].companyCode || '',     // ✅ Fixed mapping
              request_date: budgetRequests[0].requestDate ? new Date(budgetRequests[0].requestDate) : new Date(),
              description: budgetRequests[0].description || '',
              remarks: budgetRequests[0].remarks || '',
              last_action: budgetRequests[0].lastAction || '',       // ✅ Fixed mapping
              project_code: budgetRequests[0].projectCode || '',
              updated_by: budgetRequests[0].updatedBy || user?.loginid || '',
              created_by: budgetRequests[0].createdBy || '',
              total_project_cost: budgetRequests[0].totalProjectCost || 0,
              proj_budget_alloc: budgetRequests[0].projBudgetAlloc || 0,
              tot_proj_po: budgetRequests[0].totProjPo || 0,
              tot_proj_pr: budgetRequests[0].totProjPr || 0,
              tot_proj_cost_po: budgetRequests[0].totProjCostPo || 0,
              total_proj_cost_pr: budgetRequests[0].totalProjCostPr || 0,
              flow_level_running: 1
            } : null;

            // ✅ Map camelCase itemBudgets to snake_case
            const mappedItemData = (itemBudgets || []).map((item: any) => ({
              company_code: item.companyCode || '',
              request_number: item.requestNumber || '',
              cost_code: item.costCode || '',
              requested_amt: item.requestedAmt || item.requestAmt || 0,
              req_appr_amt: item.reqApprAmt || 0,
              pr_amount: item.prAmount || 0,
              po_amount: item.poAmount || 0,
              cost_name: item.costName || '',
              prev_appr_amt: item.prevApprAmt || 0
            }));

            setItemData(mappedItemData);

            // ✅ COMPREHENSIVE FIX: Try multiple approaches to get detailed data
            try {
              console.log('🔍 Attempting to fetch detailed budget data...');
              console.log('🔍 Request number:', request_number);
              
              // Try the API call
              const detailedResponse: any = await GmPfServiceInstance.getBudgetReqCostdetails(request_number, '');
              console.log('🔍 RAW Detailed Budget Response:', JSON.stringify(detailedResponse, null, 2));
              console.log('🔍 Type of response:', typeof detailedResponse);
              console.log('🔍 Is Array:', Array.isArray(detailedResponse));
              
              let processedData: any[] = [];
              
              // Handle different response structures
              if (detailedResponse && typeof detailedResponse === 'object') {
                if (Array.isArray(detailedResponse)) {
                  processedData = detailedResponse;
                } else if (detailedResponse.data && Array.isArray(detailedResponse.data)) {
                  processedData = detailedResponse.data;
                } else if (detailedResponse.tableData && Array.isArray(detailedResponse.tableData)) {
                  processedData = detailedResponse.tableData;
                } else if (detailedResponse.itemsData && Array.isArray(detailedResponse.itemsData)) {
                  // ✅ Check for itemsData specifically
                  processedData = detailedResponse.itemsData;
                }
              }
              
              console.log('🔍 Processed data length:', processedData.length);
              console.log('🔍 First item:', processedData[0]);
              
              if (processedData.length > 0) {
                const formattedDetailedData = processedData.map((item: any) => {
                  console.log('🔍 Mapping item:', item);
                  return {
                    company_code: item.company_code || item.companyCode || user?.company_code || '',
                    request_number: item.request_number || item.requestNumber || request_number,
                    cost_code: item.cost_code || item.costCode || '',
                    project_code: item.project_code || item.projectCode || headerData?.project_code || '',
                    month_budget: Number(item.month_budget || item.monthBudget || item.MONTH_BUDGET) || 0,
                    budget_year: Number(item.budget_year || item.budgetYear || item.BUDGET_YEAR) || 0,
                    requested_amt: Number(item.requested_amt || item.requestedAmt || item.requestAmt || item.REQUEST_AMT) || 0,
                    approved_amt: Number(item.approved_amt || item.approvedAmt || item.reqApprAmt || item.REQ_APPR_AMT) || 0,
                    po_amount: Number(item.po_amount || item.poAmount || item.PO_AMOUNT) || 0,
                    pr_amount: Number(item.pr_amount || item.prAmount || item.PR_AMOUNT) || 0,
                    prev_appr_amt: Number(item.prev_appr_amt || item.prevApprAmt || item.PREV_APPR_AMT) || 0
                  };
                });
                
                console.log('✅ Formatted detailed data:', JSON.stringify(formattedDetailedData, null, 2));
                setDetailedBudgetData(formattedDetailedData);
              } else {
                console.log('⚠️ No detailed budget data found, trying itemBudgets as fallback');
                // ✅ FALLBACK: If no detailed data, transform itemBudgets if they have month/year info
                const fallbackData = (itemBudgets || [])
                  .filter((item: any) => item.monthBudget || item.month_budget)
                  .map((item: any) => ({
                    company_code: item.companyCode || item.company_code || user?.company_code || '',
                    request_number: item.requestNumber || item.request_number || request_number,
                    cost_code: item.costCode || item.cost_code || '',
                    project_code: headerData?.project_code || '',
                    month_budget: Number(item.monthBudget || item.month_budget) || 0,
                    budget_year: Number(item.budgetYear || item.budget_year) || 0,
                    requested_amt: Number(item.requestedAmt || item.requestAmt || item.requested_amt) || 0,
                    approved_amt: Number(item.reqApprAmt || item.req_appr_amt || item.approved_amt) || 0,
                    po_amount: Number(item.poAmount || item.po_amount) || 0,
                    pr_amount: Number(item.prAmount || item.pr_amount) || 0,
                    prev_appr_amt: Number(item.prevApprAmt || item.prev_appr_amt) || 0
                  }));
                
                if (fallbackData.length > 0) {
                  console.log('✅ Using fallback data from itemBudgets:', fallbackData);
                  setDetailedBudgetData(fallbackData);
                } else {
                  setDetailedBudgetData([]);
                }
              }
            } catch (error) {
              console.error('❌ Error fetching detailed budget data:', error);
              setDetailedBudgetData([]);
            }

            // ...existing code for setting headerData...
            setHeaderData(mappedHeaderData || {
              request_number: '',
              company_code: '',
              request_date: new Date(),
              description: '',
              remarks: '',
              last_action: '',
              project_code: '',
              updated_by: user?.loginid || '',
              created_by: '',
              total_project_cost: 0,
              proj_budget_alloc: 0,
              tot_proj_po: 0,
              tot_proj_pr: 0,
              tot_proj_cost_po: 0,
              total_proj_cost_pr: 0,
              flow_level_running: 1
            });

            setAdditionalData(additionalBudgets || []);
            const formattedData = (TMonthCostWiseInfodata || []).map((item: any) => ({
              project_name: item.PROJECT_NAME,
              project_code: item.PROJECT_CODE,
              cost_code: item.COST_CODE,
              company_code: item.COMPANY_CODE,
              requested_amt: item.REQUESTED_AMT ?? 0,
              req_appr_amt: item.REQ_APPROVED_AMT ?? 0,
              req_approved_amt: item.REQ_APPROVED_AMT ?? 0,
              month_budget: item.MONTH_BUDGET as
                | 'Jan'
                | 'Feb'
                | 'Mar'
                | 'Apr'
                | 'May'
                | 'Jun'
                | 'Jul'
                | 'Aug'
                | 'Sep'
                | 'Oct'
                | 'Nov'
                | 'Dec',
              budget_year: item.BUDGET_YEAR,
              approved_amt: Number(item.APPROVED_AMT) || 0,
              po_amount: Number(item.PO_AMOUNT) || 0,
              pr_amount: Number(item.PR_AMOUNT) || 0,
              remarks: item.REMARKS || '-'
            }));

            setTMonthCostWiseInfodata(formattedData);

            const formattedProjectWiseData = (TMonthProjectWiseInfodata || []).map((item: any) => ({
              project_name: item.PROJECT_NAME,
              project_code: item.PROJECT_CODE,
              cost_code: item.COST_CODE,
              company_code: item.COMPANY_CODE,
              requested_amt: Number(item.REQUESTED_AMT) || 0,
              req_appr_amt: Number(item.REQ_APPROVED_AMT) || 0,
              req_approved_amt: Number(item.REQ_APPROVED_AMT) || 0,
              month_budget: item.MONTH_BUDGET as
                | 'Jan'
                | 'Feb'
                | 'Mar'
                | 'Apr'
                | 'May'
                | 'Jun'
                | 'Jul'
                | 'Aug'
                | 'Sep'
                | 'Oct'
                | 'Nov'
                | 'Dec',
              budget_year: item.BUDGET_YEAR,
              approved_amt: Number(item.APPROVED_AMT) || 0,
              po_amount: Number(item.PO_AMOUNT) || 0,
              pr_amount: Number(item.PR_AMOUNT) || 0,
              remarks: item.REMARKS || ''
            }));

            setTMonthProjectWiseInfodata(formattedProjectWiseData);
          } else {
            setItemData([]);
            setAdditionalData([]);
            setTMonthCostWiseInfodata([]);
            setTMonthProjectWiseInfodata([]);
          }
        } else {
          setHeaderData({
            request_number: '',
            company_code: '',
            request_date: new Date(),
            description: '',
            remarks: '',
            last_action: '',
            project_code: '',
            updated_by: user?.updated_by ?? '',
            created_by: '',
            total_project_cost: 0,
            proj_budget_alloc: 0,
            tot_proj_po: 0,
            tot_proj_pr: 0,
            tot_proj_cost_po: 0,
            total_proj_cost_pr: 0,
            flow_level_running: 1
          });
          console.log('updated_by', user?.updated_by);

          setItemData([]);
          setAdditionalData([]);
          setTMonthCostWiseInfodata([]);
          setTMonthProjectWiseInfodata([]);
        }
      } else {
        setHeaderData({} as TBasicBrequest);
        setItemData([]);
        setAdditionalData([]);
        setTMonthCostWiseInfodata([]);
        setTMonthProjectWiseInfodata([]);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      fetchData();
    }
  }, [modalVisible]);

  useEffect(() => {
    fetchData();
    requestNumberRef.current = request_number;
    if (request_number) {
      setIsTabDisabled(false);
    }
  }, [request_number]);

  // ✅ Add effect to refetch when tab changes to Allocate Budget
  useEffect(() => {
    if (tabIndex === 1 && headerData?.request_number) {
      fetchData();
    }
  }, [tabIndex]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (!isTabDisabled || newValue === 0) {
      setTabIndex(newValue);
    }
  };

  const theme = createTheme({
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif'
    }
  });

  const { user } = useAuth();

  const handleHeaderChange = (field: string, value: any) => {
    setHeaderData((prevData) => ({ ...prevData, [field]: value }));
  };

  useEffect(() => {
    const projectData = projectList?.tableData?.find((project) => project.project_code === headerData?.project_code);
    if (projectData) {
      setProjectDetails({
        ...projectData
      });
      console.log('abcdx', projectData);
    }
  }, [headerData?.project_code]);

  // const handleOpenRequestForm = () => {
  //   setOpen(true);
  // };

  const handleCloseRequestForm = () => {
    setOpen(false);
  };

  const handleSaveAsDraft = async () => {
    if (!headerData) {
      console.error('No header data available to save');
      return;
    }

    try {
      setLoading(true);
      setIsButtonDisabled(true);
      setIsSavingDraft(true);

      const payload = {
        ...headerData,
        last_action: 'SAVEASDRAFT',
        company_code: user?.company_code ?? '',
        updated_by: user?.loginid ?? '',
        created_by: user?.loginid ?? ''
      };

      requestNumberRef.current = requestNumberRef.current ?? '';
      payload.request_number = requestNumberRef.current;

      const response = await GmPfServiceInstance.updatebudgetrequest(payload);
      console.log('requestNumberRef.current', requestNumberRef.current);
      
      if (!headerData.request_number) {
        const rawCode = (await GmPfServiceInstance.fetchRequestNoFromGTSession()) || '';
        const formattedCode = rawCode.replace(/\$/g, '/');
        console.log('formattedCode', formattedCode);
        setFormattedRequestNumber(formattedCode);
        
        if (formattedCode) {
          console.log('Checking 1');
          setSuccess(true);
          
          // ✅ FIX: Properly update headerData with new object reference
          setHeaderData((prev) => ({
            ...prev,
            request_number: formattedCode
          }));
          
          // ✅ Also update the ref
          requestNumberRef.current = formattedCode;
          
          // ✅ Enable tabs after getting request number
          setIsTabDisabled(false);
          
          console.log('Checking 2');
          console.log('Checking 3');
        } else {
          console.error('Failed to save draft or formattedCode is empty', { response, formattedCode });
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setLoading(false);
      setIsSavingDraft(false);
      setIsButtonDisabled(false); // ✅ Re-enable button after save completes
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!headerData) {
      console.error('No header data available to save');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...headerData,
        last_action: 'SUBMITTED',
        company_code: user?.company_code ?? '',
        updated_by: user?.loginid ?? '',
        created_by: user?.loginid ?? ''
      };

      const response = await GmPfServiceInstance.updatebudgetrequest(payload);

      if (response?.valueOf) {
        setSuccess(true);
      } else {
        console.error('Failed to save draft: Response not valid', response);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const { data: userLevel } = useQuery({
    queryKey: ['user_level', user?.loginid, user?.company_code],
    queryFn: async () => {
      if (!user?.loginid || !user?.company_code) return null;
      const level = await GmPfServiceInstance.fetchUserlevel(user?.loginid ?? '', user?.company_code ?? '', '003');
      return level;
    },
    enabled: !!user?.loginid && !!user?.company_code
  });

  const [filesData, setFilesData] = useState<TFile[]>([]);
  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Upload Files',
    data: { request_number: '', remarks: '' }
  });

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ['budget_request_files', request_number],
    queryFn: () => FileUploadServiceInstance.getFile(request_number),
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
          alert: { color: 'error' },
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          close: true
        })
      );
      return;
    }

    try {
      await refetchFiles();
    } catch (error) {
      console.error('Error refetching files:', error);
    }

    setUploadFilesPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleCloseFilesPopup = () => {
    setUploadFilesPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false }
    }));
  };

  // if (loading) {
  //   return <Box>Loading...</Box>;
  // }

  interface ModalProps {
    modalVisible: boolean;
    closeModal: () => void;
    TMonthProjectWiseInfodata: TMonthProjectWiseInfo[];
    itemData: any[];
    additionalData: any[];
    request_number: string;
  }

  const MyModal: React.FC<ModalProps> = ({ modalVisible, closeModal, TMonthProjectWiseInfodata, itemData, additionalData }) => {
    const rows = ['Cost Code Summary', 'Project Monthwise', 'Cost Month Summary', 'Project Month Summary'];
    const [projectMonthModalOpen, setProjectMonthModalOpen] = useState(false);
    const [costCodeModalOpen, setCostCodeModalOpen] = useState(false);
    const [costMonthModalOpen, setCostMonthModalOpen] = useState(false);
    const [projectBudgetModalOpen, setProjectBudgetModalOpen] = useState(false);

    return (
      <>
        <Modal open={modalVisible} onClose={closeModal} aria-labelledby="modal-title">
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 3,
              borderRadius: '10px'
            }}
          >
            <Typography variant="h6">Request Number: {request_number ? request_number.replace(/\$/g, '/') : 'N/A'}</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Report Name</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Action</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((label, index) => (
                    <TableRow key={index}>
                      <TableCell>{label}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            if (label === 'Project Month Summary') {
                              setProjectMonthModalOpen(true);
                            } else if (label === 'Cost Code Summary') {
                              setCostCodeModalOpen(true);
                            } else if (label === 'Cost Month Summary') {
                              setCostMonthModalOpen(true);
                            } else if (label === 'Project Monthwise') {
                              setProjectBudgetModalOpen(true);
                            }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button onClick={closeModal} variant="contained" sx={{ mt: 2, width: '100%' }}>
              Close
            </Button>
          </Box>
        </Modal>

        <Modal open={costCodeModalOpen} onClose={() => setCostCodeModalOpen(false)} aria-labelledby="cost-code-modal">
          <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
            <Box
              sx={{
                position: 'relative',
                width: '80%',
                maxWidth: 1000,
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: 'white',
                borderRadius: 2,
                p: 3,
                boxShadow: 3
              }}
            >
              <Button
                onClick={() => setCostCodeModalOpen(false)}
                variant="contained"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  minWidth: 0,
                  padding: '4px',
                  fontSize: '0.75rem'
                }}
              >
                ✕
              </Button>
              <Box>
                <AddBudgetTab2 itemBudgets={itemData} />
              </Box>
              <Button onClick={() => setCostCodeModalOpen(false)} variant="contained" sx={{ mt: 3, width: '100%' }}>
                Close
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal open={projectBudgetModalOpen} onClose={() => setProjectBudgetModalOpen(false)} aria-labelledby="project-budget-modal">
          <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 1000,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 3,
                borderRadius: '10px'
              }}
            >
              <Box>
                <AddbudgetTab3 project_budgets={additionalData} />
              </Box>
              <Button onClick={() => setProjectBudgetModalOpen(false)} variant="contained" sx={{ mt: 2, width: '100%' }}>
                Close
              </Button>
              <Button
                onClick={() => setProjectBudgetModalOpen(false)}
                variant="contained"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  minWidth: 0,
                  padding: '4px',
                  fontSize: '0.75rem'
                }}
              >
                ✕
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal open={costMonthModalOpen} onClose={() => setCostMonthModalOpen(false)} aria-labelledby="cost-month-modal">
          <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 1300,
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: 'white',
                borderRadius: 2,
                p: 3,
                boxShadow: 3
              }}
            >
              <Box>
                {TMonthCostWiseInfodata?.length ? (
                  <MonthCostWiseInfo monthCostData={TMonthCostWiseInfodata} />
                ) : (
                  <Typography>No data available</Typography>
                )}
              </Box>
              <Button
                onClick={() => setCostMonthModalOpen(false)}
                variant="contained"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  minWidth: 0,
                  padding: '4px',
                  fontSize: '0.75rem'
                }}
              >
                ✕
              </Button>
              <Button onClick={() => setCostMonthModalOpen(false)} variant="contained" sx={{ mt: 2, width: '100%' }}>
                Close
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal open={projectMonthModalOpen} onClose={() => setProjectMonthModalOpen(false)} aria-labelledby="project-month-modal">
          <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
            <Box
              sx={{
                position: 'relative',
                width: '80%',
                maxWidth: 1500,
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: 'white',
                borderRadius: 2,
                p: 2,
                boxShadow: 3
              }}
            >
              <Button
                onClick={() => setProjectMonthModalOpen(false)}
                variant="contained"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  minWidth: 0,
                  padding: '4px',
                  fontSize: '0.75rem'
                }}
              >
                ✕
              </Button>
              {TMonthProjectWiseInfodata.length ? (
                <MonthProjectWiseInfo monthProjectData={TMonthProjectWiseInfodata} />
              ) : (
                <Typography sx={{ textAlign: 'center', fontSize: '0.85rem' }}>No data available</Typography>
              )}
            </Box>
          </Box>
        </Modal>
      </>
    );
  };

  // Add state for report dialog
  const [openReportDialog, setOpenReportDialog] = useState(false);

  // Replace the handleReport function
  const handleOpenReport = () => {
    if (!headerData?.request_number) {
      dispatch(
        showAlert({
          severity: 'error',
          message: 'Please generate a request number first.',
          open: true
        })
      );
      return;
    }
    setOpenReportDialog(true);
  };

  console.log(projectList, "projectList")

  return (
    <>
      <MyModal
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        TMonthProjectWiseInfodata={TMonthProjectWiseInfodata}
        itemData={itemData}
        additionalData={additionalData}
        request_number={request_number}
      />

      <Box sx={{ width: '100%', height: '90vh', margin: 0, padding: 0 }}>
        <CustomAlert />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              padding: '6px',
              display: 'inline-flex'
            }}
          >
            {['Budget Info', 'Allocate Budget'].map((label, index) => (
              <Tab
                key={index}
                label={label}
                disabled={index === 1 && isTabDisabled}
                sx={{
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: '8px 16px',
                  borderRadius: 2,
                  mx: 0.5,
                  minHeight: 36,
                  backgroundColor: tabIndex === index ? 'white' : 'transparent',
                  color: tabIndex === index ? 'white' : '#333',
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: tabIndex === index ? '#d9f0ff' : '#e0e0e0'
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>

        <form>
          {tabIndex === 0 && headerData && (
            <Grid container columnSpacing={1} alignItems="flex-start" marginTop={1}>
              <Grid item xs={12}>
                <Grid item xs={12}>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      maxWidth: '400px',
                      fontSize: '1rem'
                    }}
                  >
                    {formattedRequestNumber && `Request Number: ${formattedRequestNumber}`}
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      maxWidth: '400px',
                      fontSize: '1rem'
                    }}
                  >
                    {headerData?.request_number?.replace(/\$/g, '/')}
                  </Typography>
                  <Divider sx={{ marginBottom: '12px', borderBottomWidth: '2px', borderColor: 'black' }} />
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={6} sx={{ marginTop: '8px' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={projectList?.tableData ?? []}
                      getOptionLabel={(option) => option.project_name}
                      disabled={userLevel !== null && userLevel > 1}
                      onChange={(event, value) => handleHeaderChange('project_code', value ? value.project_code : '')}
                      onBlur={() => handleBlur('project_code')}
                      value={projectList?.tableData?.find((project) => project.project_code === headerData?.project_code) || null} // ✅ Find the full object
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Project"
                          variant="outlined"
                          disabled={!!userLevel && userLevel > 1}
                          sx={{
                            maxWidth: '700px',
                            '& .MuiInputBase-input': { fontSize: '0.8rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: touchedFields.project_code && !headerData?.project_code ? 'red' : 'default'
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      size="small"
                      name="description"
                      required
                      value={headerData?.description || ''}
                      onChange={(e) => handleHeaderChange('description', e.target.value)}
                      onBlur={() => handleBlur('description')}
                      fullWidth
                      label="Description"
                      sx={{
                        maxWidth: '700px',
                        '& .MuiInputBase-input': { fontSize: '0.8rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: touchedFields.description && !headerData?.description ? 'red' : 'default'
                          }
                        }
                      }}
                      error={touchedFields.description && !headerData?.description}
                      helperText={touchedFields.description && !headerData?.description ? 'Description is required' : ''}
                      InputLabelProps={{
                        sx: { fontSize: '0.75rem', color: touchedFields.description && !headerData?.description ? 'red' : 'inherit' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      size="small"
                      name="remarks"
                      required
                      value={headerData?.remarks || ''}
                      onChange={(e) => handleHeaderChange('remarks', e.target.value)}
                      onBlur={() => handleBlur('remarks')}
                      fullWidth
                      multiline
                      rows={7}
                      label="Remarks"
                      sx={{
                        maxWidth: '700px',
                        minHeight: '200px',
                        '& .MuiInputBase-input': { fontSize: '0.8rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: touchedFields.remarks && !headerData?.remarks ? 'red' : 'default'
                          }
                        }
                      }}
                      error={touchedFields.remarks && !headerData?.remarks}
                      helperText={touchedFields.remarks && !headerData?.remarks ? 'Remarks are required' : ''}
                      InputLabelProps={{
                        sx: { color: touchedFields.remarks && !headerData?.remarks ? 'red' : 'inherit' }
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <ThemeProvider theme={theme}>
                  <Grid item xs={12} sm={4} mt={1}>
                    <TextField
                      type="date"
                      size="small"
                      value={
                        headerData?.request_date
                          ? new Date(headerData.request_date).toISOString().split('T')[0]
                          : new Date().toISOString().split('T')[0]
                      }
                      fullWidth
                      label="Request Date"
                      sx={{
                        maxWidth: '300px',
                        '& .MuiInputBase-input': { fontSize: '0.8rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' }
                      }}
                    />
                  </Grid>
                  <Paper
                    sx={{
                      backgroundColor: '#e7f5ff',
                      padding: 3,
                      borderRadius: 3,
                      marginTop: 1,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" mb={3} color="primary">
                      Project Details
                    </Typography>

                    <Grid container spacing={2}>
                      {[
                        { name: 'total_project_cost', label: 'Total Project Cost', value: projectDetails?.total_project_cost },
                        { name: 'proj_budget_alloc', label: 'Project Budget Allocation', value: projectDetails?.prev_appr_amt },
                        { name: 'tot_proj_po', label: 'Total Project PO', value: projectDetails.po_amount },
                        { name: 'tot_proj_pr', label: 'Total Project PR', value: projectDetails.pr_amount },
                        { name: 'tot_proj_cost_po', label: 'Total Project Cost PO', value: projectDetails.po_amount },
                        { name: 'total_proj_cost_pr', label: 'Total Project Cost PR', value: projectDetails.pr_amount }
                      ].map((field, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <TextField
                            size="small"
                            name={field.name}
                            label={field.label}
                            value={field.value || ''}
                            fullWidth
                            disabled
                            variant="outlined"
                            sx={{
                              backgroundColor: 'white',
                              borderRadius: 1,
                              '& .MuiInputBase-input': {
                                fontSize: '0.85rem',
                                padding: '10px',
                                color: 'black'
                              },
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: '#0035d5'
                                },
                                '&:hover fieldset': {
                                  borderColor: '#0035d5'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0035d5'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: '0.8rem',
                                color: 'black'
                              }
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </ThemeProvider>
              </Grid>
              <Grid item xs={12} marginTop={2} display="flex" justifyContent="space-between" alignItems="center">
                <ButtonGroup variant="contained" size="small" aria-label="Basic button group">
                  <Button
                    endIcon={<FaSave />}
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleSaveAsDraft}
                    disabled={isButtonDisabled}
                    sx={{ textTransform: 'none', backgroundColor: '#082a89' }}
                  >
                    Save As Draft
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={handleConfirm}
                    disabled={!headerData?.request_number}
                    sx={{ textTransform: 'none', backgroundColor: '#082a89' }}
                    endIcon={(userLevel ?? 1) === 1 ? <IoSendSharp /> : <FaCheckCircle />}
                  >
                    {(userLevel ?? 1) === 1 ? 'Submit' : 'Approve'}
                  </Button>
                  <Button sx={{ backgroundColor: '#082a89' }} onClick={handleRejected} color="primary" endIcon={<MdCancelScheduleSend />}>
                    Reject
                  </Button>
                  <Button sx={{ backgroundColor: '#082a89' }} onClick={handleSentBack} color="primary" endIcon={<RiArrowGoBackFill />}>
                    Send Back
                  </Button>
                  {/* <Button disabled={!headerData?.request_number} variant="contained" size="small" color="primary" onClick={handleConfirm}>
                    Confirm
                  </Button> */}
                </ButtonGroup>
                <ButtonGroup variant="outlined" size="small" aria-label="Basic button group">
                  <Tooltip title="View Reports">
                    <Button color="primary" onClick={handleOpenReport} disabled={isSavingDraft || !headerData?.request_number}>
                      <HiOutlineDocumentReport />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Upload">
                    <Button color="primary" onClick={handleToggleImportDataPopup} disabled={isSavingDraft || !headerData?.request_number}>
                      <FiUpload />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Attach & View">
                    <Button color="primary" onClick={handleUploadPopup} disabled={!headerData?.request_number}>
                      <IoIosAttach />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Exit">
                    <Button color="primary" onClick={() => onClose()}>
                      <ImExit />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Grid>
            </Grid>
          )}
          {tabIndex === 4 && (
            <Box>
              {TMonthProjectWiseInfodata?.length ? (
                <MonthProjectWiseInfo monthProjectData={TMonthProjectWiseInfodata} />
              ) : (
                <p>No data available</p>
              )}
            </Box>
          )}
          {tabIndex === 3 && (
            <Box>
              {TMonthCostWiseInfodata?.length ? <MonthCostWiseInfo monthCostData={TMonthCostWiseInfodata} /> : <p>No data available</p>}
            </Box>
          )}

          {tabIndex === 1 && headerData?.request_number && (
            <>


              <NewDataEntryComponent
                key={`${headerData?.request_number}-${detailedBudgetData.length}`}
                request_number={headerData?.request_number || ''}
                project_code={headerData?.project_code || ''}
                itemData={detailedBudgetData} // ✅ Pass DETAILED data, not summary itemData
                onClose={() => {
                  setShowAllocate(false);
                  fetchData();
                }}
              />
            </>
          )}
          {tabIndex === 2 && (
            <Box>
              <AddbudgetTab3 project_budgets={additionalData} />
            </Box>
          )}
        </form>
        <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Box>Data saved successfully!</Box>
        </Snackbar>
        {isImportDataPopupOpen && (
          <ImportData handleImportData={handleImportData} handleToggleImportDataPopup={handleToggleImportDataPopup} />
        )}
        {isModalOpen && <ExcelBudgetUpload request_number={requestNumberRef.current} onClose={handleModalClose} />}
        {showAllocate && headerData && (
          <NewDataEntryComponent
            key={`${headerData?.request_number}-${itemData.length}`} // ✅ Force re-render
            request_number={headerData?.request_number || ''}
            project_code={headerData?.project_code || ''}
            itemData={itemData} // ✅ Pass itemData as prop
            onClose={() => {
              setShowAllocate(false);
              fetchData();
            }}
          />
        )}
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}></Typography>

          <BudgetRequestFormprint
            open={open}
            onClose={handleCloseRequestForm}
            requestNumber={headerData?.request_number || ''}
            onConfirm={handleSubmit}
          />
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}></Typography>
            {!!uploadFilesPopup && uploadFilesPopup.action.open && (
              <UniversalDialog
                action={uploadFilesPopup.action}
                onClose={handleUploadPopup}
                title={uploadFilesPopup.title}
                hasPrimaryButton={false}
              >
                <FilesForPurchaseRequest
                  level={2}
                  handleUploadPopup={handleUploadPopup}
                  existingFilesData={filesData}
                  filesData={filesData}
                  setFilesData={setFilesData}
                  module={app}
                  type="Budget Request"
                  request_number={request_number}
                  onClose={handleCloseFilesPopup}
                />
              </UniversalDialog>
            )}
          </Box>
        </Box>

        {/* Add this near the end of the component before the final closing tag */}
        {openReportDialog && headerData?.request_number && (
          <BudgetRequestFormReport requestNumber={headerData.request_number} onClose={() => setOpenReportDialog(false)} />
        )}
      </Box>
    </>
  );
};

export default AddBudgetRequestForm;
