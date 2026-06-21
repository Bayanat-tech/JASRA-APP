import { DeleteFilled, SearchOutlined } from '@ant-design/icons';
import { alpha, Badge, FormHelperText, IconButton, MenuItem, Radio, Select, TableCell, TableRow, TextField, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import CustomTooltip from 'components/CustomTooltip';
import { ISearch } from 'components/filters/SearchFilter';
import DataSelection from 'components/popup/DataSelection';
import { getIn } from 'formik';
import { TDetailRowSelection } from 'pages/accounts/transaction/types/transaction.types';
import { useEffect, useState } from 'react';
import transactionsServiceInstance from 'service/Finance/Accounts/service.transaction';
import { TDataSelection, TPair } from 'types/common';
import { formateAmount } from 'utils/functions';

// Define the props for the component
type TTransactionDetailItem = {
  setIsPresentChild: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: boolean;
        }
      | undefined
    >
  >; // Function to set validation state
  disabled: boolean; // Flag to disable the component
  id: string; // ID of the detail item
  setDetailAmountData: React.Dispatch<React.SetStateAction<number>>; // Function to set detail amount data
  handleDeleteDetail: (id: string, index: number) => void; // Function to handle deletion of a detail item
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
  index: number; // Index of the detail item
  formik: any; // Formik instance
  tax_perc?: number; // Tax percentage
  initialValues: { dept_name: string; curr_name: string }; // Initial values for the detail item
};
const TransactionDetailItem = ({
  id,
  setDetailAmountData,
  rowTableData,
  selectedRow,
  setRowTableData,
  setSelectedRow,
  index,
  formik,
  tax_perc,
  handleDeleteDetail,
  initialValues,
  disabled,
  setIsPresentChild
}: TTransactionDetailItem) => {
  //-----------constants-----
  const theme = useTheme(); // Get the current theme
  const backColor = alpha(theme.palette.primary.lighter, 0.1); // Set background color with alpha
  const filter: ISearch = {
    search: []
  }; // Initialize filter for search
  const taxType = [
    { label: 'Std. Tax', value: 'S' },
    { label: 'Zero', value: 'Z' },
    { label: 'Expmt', value: 'E' },
    { label: 'No Tax', value: 'N' }
  ]; // Define tax types
  const [toggleDataSelectionPopup, setToggleDataSelectionPopup] = useState<TDataSelection>({
    is_mounted: false,
    selected: { label: '', value: '' },
    data: {
      curr_name: '',
      dept_name: ''
    }
  }); // State to manage data selection popup

  //----------------useQuery----------
  const { data: tableName } = useQuery<{ table: 'invoice' | 'job' | 'expense'; code?: string } | undefined>({
    queryKey: [`table_name_${id}`, rowTableData?.[id]?.ac_code],
    queryFn: () => transactionsServiceInstance.getChildName(rowTableData?.[`${id}`]?.ac_code ?? ''),
    enabled: !!rowTableData && !!rowTableData[id] && rowTableData[id].ac_code.length > 0
  }); // Query to fetch table name based on account code

  //------------------handlers----------------
  const handleSelectRow = () => {
    if (formik.values.detail[index].ac_code) {
      setSelectedRow({ [id]: formik.values.detail[index].ac_code }); // Set selected row
    }
  };

  const handleToggleDataSelectionPopup = (selectedItem: TPair<''>) => {
    setToggleDataSelectionPopup((prev) => ({
      ...prev,
      selected: { label: !prev.is_mounted ? selectedItem.label : '', value: !prev.is_mounted ? selectedItem.value : '' },
      is_mounted: !prev.is_mounted
    })); // Toggle data selection popup
  };

  const handleSelected = (selectedItem: TPair<'ex_rate'>) => {
    switch (toggleDataSelectionPopup.selected.value) {
      case 'ac_code_search': {
        formik.setFieldValue(`detail[${index}].ac_name`, selectedItem.label); // Set account name
        formik.setFieldValue(`detail[${index}].ac_code`, selectedItem.value); // Set account code
        handleSelectRow(); // Select row
        setToggleDataSelectionPopup((prev) => ({
          ...prev,
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
      case 'tax': {
        formik.setFieldValue(`detail[${index}].tx_compntcat_code_1`, selectedItem.label); // Set tax component category code
        formik.setFieldValue(`detail[${index}].tx_cat_code`, selectedItem.label.substring(0, 2)); // Set tax category code
        setToggleDataSelectionPopup((prev) => ({
          ...prev,
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
      case 'department': {
        formik.setFieldValue(`detail[${index}].dept_code`, selectedItem.value); // Set department code
        setToggleDataSelectionPopup((prev) => ({
          data: { dept_name: selectedItem.label },
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
      case 'currency': {
        formik.setFieldValue(`detail[${index}].curr_code`, selectedItem.value); // Set currency code
        formik.setFieldValue(`detail[${index}].curr_name`, selectedItem.value); // Set currency name
        formik.setFieldValue(`detail[${index}].ex_rate`, selectedItem.ex_rate); // Set exchange rate
        setToggleDataSelectionPopup((prev) => ({
          ...prev,
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
    }
  };

  //-----------------useEffect----------
  /* 
    Select row when `ac_code` changes
  */
  useEffect(() => {
    if (!!formik.values.detail[index].ac_code) {
      setSelectedRow({ [id]: formik.values.detail[index].ac_code });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.detail[index].ac_code]);

  /* 
    Set table name to empty if selectedRow.id === this.row.id, 
    and it will only fetch if no table name has been added previously for that row
  */
  useEffect(() => {
    if (
      !!selectedRow &&
      Object.keys(selectedRow)[0] === id &&
      !!formik.values.detail &&
      formik.values.detail[index].ac_code.length > 0 &&
      formik.values.detail[index].ac_code !== rowTableData?.[id]?.ac_code
    ) {
      setRowTableData((prev) => ({
        ...prev,
        [id]: {
          ac_code: formik.values.detail[index].ac_code,
          table: { name: '', code: '' },
          div_code: formik.values.detail[index].div_code,
          doc_no: formik.values.detail[index].doc_no,
          doc_type: formik.values.doc_type,
          serial_no: formik.values.detail[index]?.serial_no
        }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRow]);

  /* 
    When table name is fetched, set it in `rowTableData`
  */
  useEffect(() => {
    if (!!tableName) {
      setRowTableData((prev) => ({
        ...prev,
        [id]: {
          ...prev?.[id],
          ac_code: formik.values.detail[index].ac_code,
          table: { name: tableName.table ?? '', code: tableName.code ?? '' }
        }
      }));
      setIsPresentChild((prev: any) => ({ ...prev, [id]: true }));
    } else {
      setIsPresentChild((prev: any) => ({ ...prev, [id]: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  /* 
    Set tax percentage based on selected tax type
  */
  useEffect(() => {
    if (formik.values.detail[index].tx_compnt_1_expmt === 'S') formik.setFieldValue(`detail[${index}].tx_compnt_perc_1`, tax_perc);
    else formik.setFieldValue(`detail[${index}].tx_compnt_perc_1`, 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.detail[index].tx_compnt_1_expmt]);

  /* 
    Set tax amount based on tax percentage
  */
  useEffect(() => {
    if (formik.values.detail[index].tx_compnt_1_expmt === 'S')
      formik.setFieldValue(
        `detail[${index}].tx_compnt_amt_1`,
        ((formik.values.detail[index].tx_compnt_perc_1 ?? 0) * Number.parseFloat(formik.values.detail[index].amount ?? 0)) / 100
      );
    else formik.setFieldValue(`detail[${index}].tx_compnt_amt_1`, 0);
    setDetailAmountData((prev) => (prev ?? 0) + 1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.detail[index].tx_compnt_perc_1, formik.values.detail[index].amount]);

  /* 
    Set `lcur_amount` based on exchange rate and amount
  */
  useEffect(() => {
    formik.setFieldValue(
      `detail[${index}].lcur_amount`,
      (formik.values.detail[index].ex_rate ?? 0) * Number.parseFloat(formik.values.detail[index].amount ?? 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.detail[index].ex_rate, formik.values.detail[index].amount]);

  /* 
    Set `tx_compnt_lcuramt_1` based on exchange rate and tax component percentage
  */
  useEffect(() => {
    formik.setFieldValue(
      `detail[${index}].tx_compnt_lcuramt_1`,
      (formik.values.detail[index].ex_rate ?? 0) * Number.parseFloat(formik.values.detail[index].tx_compnt_perc_1 ?? 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.detail[index].ex_rate, formik.values.detail[index].tx_compnt_perc_1]);

  /* 
    Change `sign_ind` of all children
  */
  useEffect(() => {
    !!formik.values.children &&
      formik.values.children?.[id]?.forEach((eachChild: any, eachChildIndex: number) => {
        formik.setFieldValue(`children[${id}][${eachChildIndex}].sign_ind`, formik.values.detail[index].sign_ind);
      });
    setDetailAmountData((prev) => (prev ?? 0) + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.detail[index].sign_ind]);

  /* 
    Update `detailAmountData` when `ltx_compnt_amt_1` changes
  */
  useEffect(() => {
    setDetailAmountData((prev) => (prev ?? 0) + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.detail[index].ltx_compnt_amt_1]);

  /* 
    Set initial values for department name and currency name
  */
  useEffect(() => {
    if (!!initialValues && !!initialValues.dept_name && !!initialValues.curr_name) {
      const { dept_name, curr_name } = initialValues;
      setToggleDataSelectionPopup((prev) => ({ ...prev, data: { dept_name, curr_name } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  /* 
    Set currency name in formik values when it changes in data selection popup
  */
  useEffect(() => {
    if (toggleDataSelectionPopup.data.curr_name)
      formik.setFieldValue(`detail[${index}].curr_name`, toggleDataSelectionPopup.data.curr_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleDataSelectionPopup.data.curr_name]);

  /* 
    Set exchange rate in formik values when it changes
  */
  useEffect(() => {
    formik.setFieldValue(`detail[${index}].ex_rate`, formik.values.ex_rate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.ex_rate]);
  return (
    <TableRow
      sx={{
        bgcolor: backColor, // Set background color
        '&:hover': { bgcolor: `${backColor} !important` }, // Change background color on hover
        cursor: !formik.values.detail[index].ac_code ? 'normal' : 'pointer' // Set cursor style based on account code
      }}
      hover
      onClick={(event) => {
        if (event.currentTarget === event.target) {
          handleSelectRow(); // Handle row selection
        }
      }}
      role="checkbox"
      tabIndex={-1}
      key={id}
      selected={!!selectedRow && Object.keys(selectedRow)[0] === id} // Check if the row is selected
    >
      {/* ------------------------------No.------------------------- */}
      <TableCell className="p-1 text-xs" size="small" padding="normal">
        {index + 1} {/* Display row number */}
      </TableCell>
      {/*----------------------row selection-------------------------- */}
      <TableCell className="p-1 text-xs" size="small" padding="normal">
        <CustomTooltip message={!formik.values.detail[index].ac_code && 'Select a/c code to enable selection.'}>
          <span>
            <Radio
              size="small"
              checked={!!selectedRow && Object.keys(selectedRow)[0] === id} // Check if the radio button is selected
              disabled={!formik.values.detail[index].ac_code || disabled} // Disable radio button if no account code or disabled
              id={id}
              key={id}
              value={id}
              color="primary"
              onChange={handleSelectRow} // Handle row selection
            />
          </span>
        </CustomTooltip>
      </TableCell>
      {/*----------------------div code-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          size="small"
          name={`detail[${index}].div_code`}
          id={`detail[${index}].div_code`}
          disabled
          fullWidth
          value={formik.values.detail[index].div_code} // Display division code
        />
      </TableCell>
      {/*----------------------Ac code-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <CustomTooltip
          message={
            getIn(formik.errors, `detail[${index}].ac_code`) && (
              <FormHelperText error id="helper-text-first_name" className="text-xs">
                {getIn(formik.errors, `detail[${index}].ac_code`)} {/* Display error message for account code */}
              </FormHelperText>
            )
          }
        >
          <Badge badgeContent={getIn(formik.errors, `detail[${index}].ac_code`) ? '!' : 0} variant="light" color="error">
            <TextField
              size="small"
              name={`detail[${index}].ac_code`}
              id={`detail[${index}].ac_code`}
              disabled
              className={getIn(formik.errors, `detail[${index}].ac_code`) ? 'border border-red-500' : ''} // Add border if there's an error
              fullWidth
              value={formik.values.detail[index].ac_code ?? ''} // Display account code
              InputProps={{
                endAdornment: (
                  <IconButton
                    disabled={disabled}
                    size="small"
                    onClick={(event) => {
                      handleToggleDataSelectionPopup({ label: 'Account', value: 'ac_code_search' }); // Open data selection popup for account code
                      event.stopPropagation();
                    }}
                  >
                    <SearchOutlined />
                  </IconButton>
                )
              }}
            />
          </Badge>
        </CustomTooltip>
      </TableCell>
      {/*----------------------Ac Name-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField disabled size="small" name={`detail[${index}].ac_name`} fullWidth value={formik.values.detail[index].ac_name} />{' '}
        {/* Display account name */}
      </TableCell>
      {/*----------------------Remarks-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled}
          onChange={formik.handleChange}
          size="small"
          id={`detail[${index}].remarks`}
          name={`detail[${index}].remarks`}
          sx={{ width: 150 }}
          value={formik.values.detail[index].remarks} // Display remarks
        />
      </TableCell>
      {/* ----------------Currency---------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          size="small"
          name={`detail[${index}].curr_code`}
          id={`detail[${index}].curr_code`}
          disabled
          fullWidth
          value={formik.values.detail[index]?.curr_name ?? ''} // Display currency name
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={disabled}
                size="small"
                onClick={(event) => {
                  handleToggleDataSelectionPopup({ label: 'Currency', value: 'currency' }); // Open data selection popup for currency
                  event.stopPropagation();
                }}
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </TableCell>
      {/* --------------------Ex. Rate-------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled}
          size="small"
          type="number"
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            const inputValue = event.target.value;
            if (inputValue.charAt(0) !== '-') {
              formik.handleChange(event); // Handle change for exchange rate
            }
          }}
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' }
            }
          }}
          name={`detail[${index}].ex_rate`}
          fullWidth
          value={formateAmount(formik.values.detail[index].ex_rate, 3)} // Display exchange rate
        />
      </TableCell>
      {/* ------------------Amount------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <CustomTooltip
          message={
            getIn(formik.errors, `detail[${index}].amount`) && (
              <FormHelperText error id="helper-text-first_name" className="text-xs">
                {getIn(formik.errors, `detail[${index}].amount`)} {/* Display error message for amount */}
              </FormHelperText>
            )
          }
        >
          <Badge badgeContent={getIn(formik.errors, `detail[${index}].amount`) ? '!' : 0} variant="light" color="error">
            <TextField
              disabled={disabled}
              size="small"
              type="number"
              name={`detail[${index}].amount`}
              fullWidth
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event); // Handle change for amount
                }
              }}
              InputProps={{
                inputProps: {
                  style: { textAlign: 'right' }
                }
              }}
              value={formateAmount(formik.values.detail[index].amount, 3)} // Display amount
              error={getIn(formik.errors, `detail[${index}].amount`)}
            />
          </Badge>
        </CustomTooltip>
      </TableCell>
      {/* ----------------------CR/DR--------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <Select
          size="small"
          disabled={disabled}
          fullWidth
          onChange={(e) => formik.setFieldValue(`detail[${index}].sign_ind`, e.target.value)} // Handle change for CR/DR
          name={`detail[${index}].sign_ind`}
          value={formik.values.detail[index].sign_ind} // Display CR/DR value
        >
          <MenuItem value={-1}>Cr</MenuItem>
          <MenuItem value={1}>Dr</MenuItem>
        </Select>
      </TableCell>
      {/* --------------------Tax Code------------------ */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          onChange={formik.handleChange}
          size="small"
          name={`detail[${index}].tx_compntcat_code_1`}
          fullWidth
          disabled
          value={formik.values.detail[index].tx_compntcat_code_1} // Display tax component category code
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={disabled}
                size="small"
                onClick={(event) => {
                  handleToggleDataSelectionPopup({ label: 'Tax', value: 'tax' }); // Open data selection popup for tax
                  event.stopPropagation();
                }}
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </TableCell>
      {/* --------------------Tax Type-------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <Select
          size="small"
          disabled={disabled}
          fullWidth
          onChange={(e) => formik.setFieldValue(`detail[${index}].tx_compnt_1_expmt`, e.target.value)} // Handle change for tax type
          name={`detail[${index}].tx_compnt_1_expmt`}
          value={formik.values.detail[index].tx_compnt_1_expmt} // Display tax type value
          renderValue={(selected) => taxType.find((eachType) => eachType.value === selected)?.value}
        >
          {taxType.map((eachType) => (
            <MenuItem value={eachType.value}>{eachType.label}</MenuItem>
          ))}
        </Select>
      </TableCell>
      {/* --------------------Tax %-------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          onChange={formik.handleChange}
          size="small"
          name={`detail[${index}].tx_compnt_perc_1`}
          fullWidth
          disabled
          value={formik.values.detail[index].tx_compnt_perc_1} // Display tax percentage
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' }
            }
          }}
        />
      </TableCell>
      {/* --------------------Tax Amount-------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          size="small"
          disabled
          name={`detail[${index}].tx_compnt_amt_1`}
          fullWidth
          value={formik.values.detail[index].tx_compnt_amt_1} // Display tax amount
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' }
            }
          }}
        />
      </TableCell>
      {/* --------------------Job No-------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled}
          onChange={formik.handleChange}
          size="small"
          name={`detail[${index}].job_no`}
          fullWidth
          value={formik.values.detail[index].job_no} // Display job number
        />
      </TableCell>
      {/* --------------------Dept-------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          size="small"
          id={`dept_name`}
          disabled
          fullWidth
          value={toggleDataSelectionPopup.data.dept_name ?? ''} // Display department name
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={disabled}
                size="small"
                onClick={(event) => {
                  handleToggleDataSelectionPopup({ label: 'Department', value: 'department' }); // Open data selection popup for department
                  event.stopPropagation();
                }}
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </TableCell>
      {/* --------------------Amt in Base Crr.-------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          onChange={formik.handleChange}
          size="small"
          fullWidth
          disabled
          value={formateAmount(formik.values.detail[index].lcur_amount, 3)} // Display amount in base currency
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' }
            }
          }}
        />
      </TableCell>
      {/* --------------------Tax LucrAmt-------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          onChange={formik.handleChange}
          disabled
          size="small"
          name={`detail[${index}].tx_compnt_lcuramt_1`}
          fullWidth
          value={formateAmount(formik.values.detail[index].tx_compnt_lcuramt_1, 3)} // Display tax amount in local currency
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' }
            }
          }}
        />
      </TableCell>
      {/*----------------------actions-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <IconButton
          disabled={disabled}
          color="error"
          onClick={(event) => {
            handleDeleteDetail(id, index); // Handle delete detail
            event.stopPropagation();
          }}
        >
          <DeleteFilled />
        </IconButton>
      </TableCell>

      {/* Render Data Selection Popup */}
      {!!toggleDataSelectionPopup &&
        toggleDataSelectionPopup.is_mounted &&
        ['ac_code_search', 'tax', 'department', 'currency'].includes(toggleDataSelectionPopup.selected.value) && (
          <DataSelection selectedItem={toggleDataSelectionPopup.selected} handleSelection={handleSelected} filter={filter} /> // Render data selection popup
        )}
    </TableRow>
  );
};

export default TransactionDetailItem;
