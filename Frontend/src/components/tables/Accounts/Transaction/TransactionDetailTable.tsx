import { PlusOutlined } from '@ant-design/icons';
import {
  Box,
  Button,
  Divider,
  Grid,
  InputLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import CustomTooltip from 'components/CustomTooltip';
import useAuth from 'hooks/useAuth';
import { TDetailRowSelection, TTransactionDetails } from 'pages/accounts/transaction/types/transaction.types';
import { TAccountChildren } from 'pages/Finance/types/acTree.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import transactionsServiceInstance from 'service/Finance/Accounts/service.transaction';
import { formateAmount } from 'utils/functions';
import { v4 as UIDV4 } from 'uuid';
import TransactionDetailItem from './TransactionDetailItem';

// Define the props for the component
type TTransactionDetailTable = {
  setIsPresentChild: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: boolean;
        }
      | undefined
    >
  >; // Function to set validation state
  disabled: boolean; // Flag to disable the component
  formik: any; // Formik instance
  rowTableData: TDetailRowSelection | undefined; // Row table data
  setRowTableData: React.Dispatch<React.SetStateAction<TDetailRowSelection | undefined>>; // Function to set row table data
  selectedRow:
    | {
        [key: string]: string;
      }
    | undefined; // Selected row data
  setSelectedRow: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: string;
        }
      | undefined
    >
  >; // Function to set selected row data
  setChildAmountData: React.Dispatch<React.SetStateAction<number>>; // Function to set child amount data
  isEdit: boolean; // Flag to indicate if it's in edit mode
  documentData:
    | {
        Account: TAccountChildren;
        Currency: TCurrency;
        Division: TDivision;
        Accountsetup: {
          tax_perc: number;
          lcur_decimal_nos: number;
        };
      }
    | undefined; // Document data
};
const TransactionDetailTable = ({
  formik,
  rowTableData,
  setRowTableData,
  selectedRow,
  setSelectedRow,
  isEdit,
  documentData,
  disabled,
  setChildAmountData,
  setIsPresentChild
}: TTransactionDetailTable) => {
  //----------------------constants----------------
  const theme = useTheme(); // Get the current theme
  const { user } = useAuth(); // Get the current user
  const detailColumns = [
    '',
    'Division',
    'A/c Code',
    'A/c Name',
    'Description',
    'Currency',
    'Ex Rate',
    'Amount',
    'Cr/Dr',
    'Tax Code',
    'Tax Type',
    'Tax %',
    'Tax Amt',
    'Job No',
    'Dept.',
    'Amt in Base Curr.',
    'Tax LucrAmt',
    'Actions'
  ]; // Define the columns for the detail table
  const [detailAmountData, setDetailAmountData] = useState<number>(0); // State to manage detail amount data

  //---------------------useMemo----------------
  /* 
    Calculate the total amount of details.
    This will re-calculate whenever detailAmountData changes.
  */
  const detailTotal = useMemo(() => {
    return (formik.values.detail as (TTransactionDetails & { id: string; isEditMode: boolean; ac_name: string })[]).reduce(
      (total, item) => {
        const amount = Number(item.amount) || 0;
        return item.sign_ind === -1 ? total - amount : total + amount;
      },
      0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailAmountData]);

  /* 
    Calculate the total tax amount of details.
    This will re-calculate whenever detailAmountData changes.
  */
  const detailTax = useMemo(
    () => {
      return (formik.values.detail as (TTransactionDetails & { id: string; isEditMode: boolean; ac_name: string })[]).reduce(
        (total, item) => {
          const tax = Number(item.tx_compnt_amt_1) || 0;
          return total + tax;
        },
        0
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detailAmountData]
  );

  //--------------------Handlers--------------------
  /* 
    Handler to delete a detail item.
    If the item is in edit mode, it will be deleted from the server.
    Otherwise, it will be removed from the local state.
  */
  const handleDeleteDetail = async (id: string, index: number) => {
    const currentItem = formik.values.detail[index];
    if (formik.values.detail[index].isEditMode) {
      const response = await transactionsServiceInstance.deleteTransactionDetailItem(
        currentItem.doc_no,
        currentItem.doc_type,
        currentItem.serial_no,
        currentItem.div_code,
        rowTableData?.[id]?.table.name ?? 'invoice'
      );

      if (response) {
        const tempDetail = (formik.values.detail as (TTransactionDetails & { id: string; isEditMode: boolean; ac_name: string })[]).filter(
          (eachDetail) => eachDetail.id !== id
        );
        const tempChildren = formik.values.children;
        delete tempChildren[id];
        formik.setFieldValue('detail', tempDetail);
        formik.setFieldValue('children', tempChildren);
        setDetailAmountData((prev) => (prev ?? 0) + 1);
        setChildAmountData((prev) => prev + 1);

        if (!!tempDetail && tempDetail.length > 0 && !!selectedRow && id === Object.keys(selectedRow)[0])
          setSelectedRow({ [`${tempDetail[tempDetail.length - 1].id}`]: tempDetail[tempDetail.length - 1].ac_code });
        const tempRowTableData = rowTableData;
        if (tempRowTableData) delete tempRowTableData[id];
      }
      return;
    }

    const tempDetail = (formik.values.detail as (TTransactionDetails & { id: string; isEditMode: boolean; ac_name: string })[]).filter(
      (eachDetail) => eachDetail.id !== id
    );
    const tempChildren = formik.values.children;
    delete tempChildren[id];
    setDetailAmountData((prev) => (prev ?? 0) + 1);
    setChildAmountData((prev) => prev + 1);

    formik.setFieldValue('detail', tempDetail);
    formik.setFieldValue('children', tempChildren);
    if (!!tempDetail && tempDetail.length > 0 && !!selectedRow && id === Object.keys(selectedRow)[0])
      setSelectedRow({ [`${tempDetail[tempDetail.length - 1].id}`]: tempDetail[tempDetail.length - 1].ac_code });
  };

  /* 
    Handler to add a new detail item.
    It will add a new item to the detail list with default values.
  */
  const handleAddDetailItem = () => {
    const tempData = [
      ...formik.values.detail,
      {
        //---common fields-------
        serial_no: (formik.values.detail?.[formik.values.detail.length - 1]?.serial_no ?? 0) + 1,
        doc_no: isEdit ? formik.values.doc_no : 1,
        doc_type: formik.values.doc_type,
        div_code: formik.values.div_code,
        doc_date: formik.values.doc_date,
        company_code: user?.company_code,
        //todo: make isEdit mode true for existing data - no need as isEditMode will be false so that new data can be deleted - done
        isEditMode: false,
        //------remaining---------
        id: UIDV4(),
        ac_code: '',
        ac_name: '',
        remarks: '',
        curr_code: formik.values.curr_code,
        curr_name: formik.values.curr_name,
        ex_rate: 1,
        amount: 0,
        sign_ind: -1,
        tx_compntcat_code_1: '',
        tx_cat_code: '',
        tx_compnt_1_expmt: 'S',
        tx_compnt_lcuramt_1: null as unknown as number,
        tx_compnt_perc_1: null as unknown as number,
        tx_compnt_amt_1: null as unknown as number,
        job_no: '',
        dept_code: ''
      }
    ];

    formik.setFieldValue('detail', tempData);
  };
  return (
    <Grid item xs={12}>
      <Typography component="h1" className="pb-2 font-bold">
        Details
      </Typography>
      <TableContainer component={Paper} className="w-full rounded-none border-gray-200 custom-scrollbar" sx={{ maxHeight: 175 }}>
        <Table sx={{ minWidth: 2100 }} size="small">
          {/*------------------------Header----------------- */}
          <TableHead>
            <TableRow className="h-2">
              <TableCell className="p-0 text-xs" align="left" size="small">
                No.
              </TableCell>
              {/* Render table headers */}
              {detailColumns.map((eachColumn) => (
                <TableCell className="p-1 text-xs" key={eachColumn} align="left" size="small">
                  {eachColumn}
                  {/* Add asterisk for required fields */}
                  {['A/c Code', 'Amount'].includes(eachColumn) && <span className="text-red-500">*</span>}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/*------------------------Body----------------- */}
          <TableBody>
            {/* Render each detail item */}
            {(
              formik.values.detail as (TTransactionDetails & {
                id: string;
                isEditMode: boolean;
                ac_name: string;
                dept_name?: string;
                curr_name: string;
              })[]
            )?.map((eachDetail, index: number) => {
              return (
                <TransactionDetailItem
                  initialValues={{ dept_name: eachDetail.dept_name ?? '', curr_name: eachDetail?.curr_name ?? '' }}
                  setDetailAmountData={setDetailAmountData}
                  rowTableData={rowTableData}
                  setRowTableData={setRowTableData}
                  selectedRow={selectedRow}
                  setSelectedRow={setSelectedRow}
                  index={index}
                  id={eachDetail.id}
                  key={eachDetail.id}
                  formik={formik}
                  tax_perc={documentData?.Accountsetup.tax_perc}
                  handleDeleteDetail={handleDeleteDetail}
                  disabled={disabled}
                  setIsPresentChild={setIsPresentChild}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />

      {/*------------------------Footer----------------- */}
      <Grid container item xs={12} justifyContent="space-between">
        {/*------------------------Submit----------------- */}
        <Grid item xs={12} md={8}>
          <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
            <CustomTooltip
              message={
                !formik.values.div_code
                  ? 'Select division to enable add button'
                  : formik.values.detail.length > 0 && !formik.values?.detail?.[formik.values.detail.length - 1]?.ac_code
                  ? 'Select Account in your last row to enable add button'
                  : ''
              }
            >
              <span>
                {/* Button to add a new detail item */}
                <Button
                  size="extraSmall"
                  color="primary"
                  disabled={
                    !(
                      formik.values.div_code &&
                      (formik.values.detail.length === 0 || !!formik.values?.detail?.[formik.values.detail.length - 1]?.ac_code)
                    ) || disabled
                  }
                  startIcon={<PlusOutlined />}
                  onClick={handleAddDetailItem}
                  variant="dashed"
                  sx={{ bgcolor: 'transparent !important' }}
                >
                  <FormattedMessage id="Add Item" />
                </Button>
              </span>
            </CustomTooltip>
          </Box>
        </Grid>
        {/*------------------------Total----------------- */}
        <Grid item xs={12} md={2}>
          <Stack spacing={0}>
            <Stack direction="row" justifyContent="space-between" spacing={0} sx={{ pt: 2.5 }}>
              <InputLabel>
                <FormattedMessage id="Total" />
              </InputLabel>
              <Typography color={theme.palette.grey[500]}>
                {detailTotal < 0 ? (
                  <Typography color="#f87171">
                    {' '}
                    {/* Red for negative */}({formateAmount(Math.abs(detailTotal), documentData?.Accountsetup.lcur_decimal_nos)})
                  </Typography>
                ) : (
                  <Typography color="#16a34a">
                    {' '}
                    {/* Green for positive */}
                    {formateAmount(detailTotal, documentData?.Accountsetup.lcur_decimal_nos)}
                  </Typography>
                )}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color={theme.palette.grey[500]}>Tax</Typography>
              <Typography>{formateAmount(detailTax, documentData?.Accountsetup.lcur_decimal_nos)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color={theme.palette.grey[500]}>Net Amount</Typography>
              <Typography
                variant="h6"
                color={(detailTotal < 0 ? detailTotal - detailTax : detailTotal + detailTax) < 0 ? '#f87171' : '#16a34a'}
              >
                {(detailTotal < 0 ? detailTotal - detailTax : detailTotal + detailTax) < 0
                  ? `(${formateAmount(
                      Math.abs(detailTotal < 0 ? detailTotal - detailTax : detailTotal + detailTax),
                      documentData?.Accountsetup.lcur_decimal_nos
                    )})`
                  : formateAmount(
                      detailTotal < 0 ? detailTotal - detailTax : detailTotal + detailTax,
                      documentData?.Accountsetup.lcur_decimal_nos
                    )}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TransactionDetailTable;
