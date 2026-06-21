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
import { useQuery } from '@tanstack/react-query';
import useAuth from 'hooks/useAuth';
import { TDetailRowSelection, TTransactionChildren, TTransactionDetails } from 'pages/accounts/transaction/types/transaction.types';
import { TAccountChildren } from 'pages/Finance/types/acTree.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import transactionsServiceInstance from 'service/Finance/Accounts/service.transaction';
import financeSerivceInstance from 'service/Finance/service.finance';
import { formateAmount, titleCase } from 'utils/functions';
import TransactionExpenseItem from './TransactionExpenseItem';
import TransactionInvoiceItem from './TransactionInvoiceItem';
import TransactionJobItem from './TransactionJobItem';

// Define the props for the component
type TTransactionChildrenTable = {
  childAmountData: number;
  setChildAmountData: React.Dispatch<React.SetStateAction<number>>;
  disabled: boolean;
  formik: any;
  rowTableData: TDetailRowSelection;
  selectedRow: {
    [key: string]: string;
  };
  isEdit: boolean;
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
    | undefined;
};

// Main component
const TransactionChildrenTable = ({
  formik,
  selectedRow,
  rowTableData,
  documentData,
  isEdit,
  disabled,
  childAmountData,
  setChildAmountData
}: TTransactionChildrenTable) => {
  //-------------------constants-------------
  const { user } = useAuth();
  const theme = useTheme();
  const jobColumns = ['Job No', 'Doc Refno', 'Doc Refno 2', 'Amount', 'Actions'];
  const expenseColumns = ['Subtype Code', 'Subtype Description', 'Exp Code', 'Exp Description', 'Job No', 'Amount'];
  const invoiceColumns = ['Inv No.', 'Inv Date', 'Inv Amount', 'Balance Amount respect to org', 'Amount', 'Actions'];

  //----------------------useQuery------------
  // Fetch child table data using react-query
  const { data: childTableData } = useQuery({
    queryKey: ['ac_setup', rowTableData],
    queryFn: () => {
      const selectedRowId = Object.keys(selectedRow ?? [])[0],
        currentData = rowTableData?.[selectedRowId],
        selectedRowIndex = formik.values.detail.findIndex((eachDetailedRow: any) => eachDetailedRow.id === selectedRowId);
      return financeSerivceInstance.getMasters(
        'finance',
        rowTableData?.[selectedRowId].table.name ?? 'invoice',
        undefined,
        rowTableData?.[selectedRowId].table.name !== 'invoice'
          ? {
              search: [
                [{ field_name: 'doc_no', field_value: formik.values.doc_no, operator: 'exactmatch' }],
                [{ field_name: 'doc_type', field_value: formik.values.doc_type, operator: 'exactmatch' }],
                [{ field_name: 'serial_no', field_value: formik.values.detail[selectedRowIndex]?.serial_no, operator: 'exactmatch' }]
              ]
            }
          : undefined,
        currentData?.ac_code,
        currentData?.div_code,
        formik.values.doc_type,
        (currentData?.doc_no ?? 1)?.toString(),
        (currentData?.serial_no ?? 1)?.toString()
      );
    },
    enabled:
      !!rowTableData &&
      !!selectedRow &&
      !!rowTableData?.[Object.keys(selectedRow)[0]]?.table &&
      rowTableData?.[Object.keys(selectedRow)[0]]?.table.name?.length > 0 &&
      Object.keys(rowTableData).includes(Object.keys(selectedRow)[0]) &&
      (rowTableData?.[Object.keys(selectedRow)[0]]?.table.name === 'invoice' ||
        (rowTableData?.[Object.keys(selectedRow)[0]]?.table.name !== 'invoice' && isEdit))
  });

  //------------------handlers----------------
  // Handler to add a new child item
  const handleAddChildrenItem = () => {
    if (!!selectedRow) {
      let tempData,
        parentId = Object.keys(selectedRow)[0],
        parentIndex = (formik.values.detail as (TTransactionDetails & { id: string; isEditMode: boolean; ac_name: string })[])?.findIndex(
          (eachDetail) => eachDetail.id === parentId
        );
      const parentSerialNumber = formik.values.detail[parentIndex]?.serial_no;
      const table = rowTableData?.[parentId]?.table.name ?? '';

      const newChild = {
        // Common fields
        dtl_sr_no: Number(formik.values.children[parentId]?.[formik.values.children[parentId].length - 1]?.dtl_sr_no ?? 0) + 1,
        ac_code: formik.values.detail[parentIndex].ac_code,
        serial_no: parentSerialNumber,
        doc_no: isEdit ? formik.values.doc_no : 1,
        doc_type: formik.values.doc_type,
        div_code: formik.values.div_code,
        doc_date: formik.values.doc_date,
        company_code: user?.company_code,
        sign_ind: formik.values.detail[parentIndex].sign_ind,
        isEditMode: false,
        amount: 0,
        // Specific fields based on table type
        ...(table === 'job'
          ? {
              job_no: '',
              doc_refno: '',
              doc_refno_2: ''
            }
          : table === 'invoice'
          ? {
              inv_no: '',
              inv_date: null,
              inv_amt: null,
              c_bal_amt_org: null,
              curr_code: formik.values.curr_code,
              c_curr_name_orgin: formik.values.curr_name,
              ex_rate: formik.values.ex_rate,
              c_curr_amt: null,
              IsDeletable: true
            }
          : {
              exp_subtype_code: '',
              exp_subtype_description: '',
              exp_code: '',
              exp_description: '',
              job_no: '',
              exp_type_code: rowTableData[Object.keys(selectedRow)[0]].table.code
            })
      };

      tempData = [...(formik.values?.children?.[parentId] ?? []), newChild];
      tempData as TTransactionChildren<typeof table>[];

      formik.setFieldValue(`children[${Object.keys(selectedRow)[0]}]`, tempData);
    }
  };

  // Handler to delete a child item
  const handleDeleteChildren = async (index: number, parentId: string) => {
    const tempChildren = formik.values.children;
    if (
      tempChildren[parentId][index].isEditMode &&
      (rowTableData?.[parentId]?.table.name !== 'invoice' || tempChildren[parentId][index].IsDeletable)
    ) {
      const response = await transactionsServiceInstance.deleteTransactionChildrenItem(
        tempChildren[parentId][index].doc_no,
        tempChildren[parentId][index].doc_type,
        tempChildren[parentId][index]?.serial_no,
        tempChildren[parentId][index].div_code,
        rowTableData?.[parentId]?.table.name ?? 'invoice',
        tempChildren[parentId][index].dtl_sr_no
      );
      if (response) {
        tempChildren[parentId].splice(index, 1);
        setChildAmountData((prev) => prev + 1);
        formik.setFieldValue('children', tempChildren);
      }
      return;
    }
    tempChildren[parentId].splice(index, 1);
    setChildAmountData((prev) => prev + 1);
    formik.setFieldValue('children', tempChildren);
  };

  // Handler to render the appropriate child table based on the table type
  const handleRenderChildrenTable = (eachChildrenRow: any, eachChildrenRowIndex: number) => {
    // Determine the table type and render the appropriate component
    switch (rowTableData?.[Object.keys(selectedRow)[0]]?.table.name) {
      case 'invoice':
        return (
          <TransactionInvoiceItem
            disabled={disabled} // Pass disabled state
            isEditMode={eachChildrenRow.isEditMode} // Pass edit mode state
            lcur_decimal_nos={documentData?.Accountsetup.lcur_decimal_nos} // Pass decimal numbers for currency
            setChildAmountData={setChildAmountData} // Function to set child amount data
            formik={formik} // Pass formik instance
            index={eachChildrenRowIndex} // Pass the index of the child row
            parentId={Object.keys(selectedRow)[0]} // Pass the parent ID
            handleDeleteChildren={handleDeleteChildren} // Function to handle deletion of child item
          />
        );
      case 'job':
        return (
          <TransactionJobItem
            disabled={disabled} // Pass disabled state
            setChildAmountData={setChildAmountData} // Function to set child amount data
            formik={formik} // Pass formik instance
            index={eachChildrenRowIndex} // Pass the index of the child row
            parentId={Object.keys(selectedRow)[0]} // Pass the parent ID
            handleDeleteChildren={handleDeleteChildren} // Function to handle deletion of child item
          />
        );
      case 'expense':
        return (
          <TransactionExpenseItem
            disabled={disabled} // Pass disabled state
            setChildAmountData={setChildAmountData} // Function to set child amount data
            formik={formik} // Pass formik instance
            index={eachChildrenRowIndex} // Pass the index of the child row
            expenseTypeCode={rowTableData[Object.keys(selectedRow)[0]].table.code} // Pass the expense type code
            parentId={Object.keys(selectedRow)[0]} // Pass the parent ID
            handleDeleteChildren={handleDeleteChildren} // Function to handle deletion of child item
          />
        );
      default:
        return <></>; // Return an empty fragment if no matching case
    }
  };

  // Handler to set child table data
  const handleChildTableData = () => {
    if (!!selectedRow && !!rowTableData) {
      const selectedRowId = Object.keys(selectedRow)[0];
      const selectedRowIndex = (
        formik.values.detail as (TTransactionDetails & { id: string; isEditMode: boolean; ac_name: string })[]
      ).findIndex((eachDetailedRow) => eachDetailedRow.id === selectedRowId);
      let table;

      const tempData = childTableData?.tableData.map((eachChildren: any, eachChildrenIndex: number) => {
        table = rowTableData?.[selectedRowId]?.table.name;
        return {
          ...(table === 'invoice' && {
            inv_no: eachChildren.inv_no,
            inv_date: eachChildren.inv_date,
            inv_amt: eachChildren.inv_amt,
            curr_code: eachChildren.curr_code,
            c_curr_name_orgin: eachChildren?.Currency?.curr_name ?? '',
            c_bal_amt_org: Number(eachChildren.inv_amt ?? 0) - Number(eachChildren.amount ?? 0),
            amount: Number(eachChildren.amount ?? 0),
            ex_rate: eachChildren.ex_rate,
            c_curr_amt: eachChildren.c_curr_amt,
            IsDeletable: eachChildren?.IsDeletable ?? false
          }),
          ...(table === 'job' && {
            job_no: eachChildren.job_no,
            doc_refno: eachChildren.doc_refno,
            doc_refno_2: eachChildren.doc_refno_2,
            amount: Number(eachChildren.amount ?? 0)
          }),
          ...(table === 'expense' && {
            exp_type_code: eachChildren?.exp_type_code ?? '',
            exp_subtype_code: eachChildren?.exp_subtype_code ?? '',
            exp_subtype_description: eachChildren?.ExpenseSubType?.exp_subtype_description ?? '',
            exp_code: eachChildren?.exp_code ?? '',
            exp_description: eachChildren?.ExpenseType?.exp_description ?? '',
            job_no: eachChildren?.job_no ?? '',
            amount: Number(eachChildren?.amount ?? 0)
          }),
          dtl_sr_no: eachChildren.dtl_sr_no,
          ac_code: eachChildren.ac_code,
          serial_no: rowTableData?.[selectedRowId]?.serial_no,
          doc_no: formik.values.doc_no,
          doc_type: formik.values.doc_type,
          div_code: formik.values.div_code,
          doc_date: formik.values.doc_date,
          company_code: user?.company_code,
          sign_ind: formik.values.detail[selectedRowIndex].sign_ind,
          isEditMode: isEdit
        } as TTransactionChildren<typeof table>;
      });

      formik.setFieldValue(`children[${selectedRowId}]`, tempData);
    }
  };

  //-------------------useMemo-------------
  // Calculate the total amount for children
  const childrenTotal = useMemo(() => {
    if (!selectedRow || !formik.values.children) return 0;

    const key = Object.keys(selectedRow)[0];
    const children = formik.values.children[key];

    if (!children) return 0;

    return children.reduce((total: number, item: any) => {
      const amount = Number(item?.amount) || 0;
      return item?.sign_ind === -1 ? total - amount : total + amount;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childAmountData]);

  //---------------------useEffect-----------------
  // Effect to handle child table data when childTableData changes
  useEffect(() => {
    handleChildTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childTableData]);

  return (
    <Grid item xs={12} hidden={!['invoice', 'job', 'expense'].includes(rowTableData?.[Object.keys(selectedRow)[0]]?.table?.name)}>
      <Typography component="h1" className="pb-2 font-bold">
        {/* Display the table name and selected row */}
        {titleCase(rowTableData?.[Object.keys(selectedRow)[0]]?.table.name)} ({selectedRow[Object.keys(selectedRow)[0]]})
      </Typography>
      {/*--------------------Table-------------------- */}
      <TableContainer component={Paper} className="w-full custom-scrollbar" sx={{ maxHeight: 175 }}>
        <Table sx={{ minWidth: 1300 }}>
          {/*--------------------Heading-------------------- */}
          <TableRow component={TableHead}>
            <TableCell align="left" className="p-1 text-xs" size="small">
              No.
            </TableCell>
            {/* Render table columns based on the table type */}
            {(rowTableData?.[Object.keys(selectedRow)[0]]?.table.name === 'invoice'
              ? invoiceColumns
              : rowTableData?.[Object.keys(selectedRow)[0]]?.table.name === 'job'
              ? jobColumns
              : rowTableData?.[Object.keys(selectedRow)[0]]?.table.name === 'expense'
              ? expenseColumns
              : []
            ).map((eachColumn) => (
              <TableCell key={eachColumn} align="left" className="p-1 text-xs" size="small">
                {eachColumn}
              </TableCell>
            ))}
          </TableRow>

          {/*--------------------Body-------------------- */}
          <TableBody>
            {/* Render child rows */}
            {!!selectedRow &&
              !!formik.values.children &&
              formik.values.children[Object.keys(selectedRow)[0]]?.map((eachChildrenRow: any, eachChildrenRowIndex: number) =>
                handleRenderChildrenTable(eachChildrenRow, eachChildrenRowIndex)
              )}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />

      {/*--------------------Submit & Total-------------------- */}
      <Grid container item xs={12} justifyContent="space-between">
        <Grid item xs={12} md={8}>
          <Box sx={{ pt: 2.5, pr: 2.5, pb: 2.5, pl: 0 }}>
            {/* Button to add a new child item */}
            <Button
              disabled={disabled}
              size="extraSmall"
              color="primary"
              startIcon={<PlusOutlined />}
              onClick={handleAddChildrenItem}
              variant="dashed"
              sx={{ bgcolor: 'transparent !important' }}
            >
              <FormattedMessage id="Add Item" />
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Grid item xs={12} sx={{ pt: 2.5, pb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between">
              <InputLabel>
                <FormattedMessage id="Total" />
              </InputLabel>

              {/* Display the total amount */}
              <Typography variant="h6" color={childrenTotal < 0 ? '#f87171' : '#16a34a'}>
                {childrenTotal < 0
                  ? `(${formateAmount(Math.abs(childrenTotal) as number, 3) ?? 0})`
                  : formateAmount(Math.abs(childrenTotal) as number, 3) ?? 0}
              </Typography>

              <Typography color={theme.palette.grey[500]}>{formateAmount(Math.abs(childrenTotal) as number, 3) ?? 0}</Typography>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TransactionChildrenTable;
