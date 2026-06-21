import { DeleteFilled } from '@ant-design/icons';
import { alpha, IconButton, MenuItem, Select, TableCell, TableRow, TextField, useTheme } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DataSelection from 'components/popup/DataSelection';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { TDataSelection, TPair } from 'types/common';
import { filter } from 'utils/constants';
import { formateAmount, handleDateChange } from 'utils/functions';

// Define the props for the component
type TProps = {
  disabled: boolean; // Flag to disable the component
  lcur_decimal_nos?: number; // Number of decimal places for currency
  setChildAmountData: React.Dispatch<React.SetStateAction<number>>; // Function to set child amount data
  parentId: string; // ID of the parent item
  index: number; // Index of the child item
  formik: any; // Formik instance
  handleDeleteChildren: (index: number, parentId: string) => void; // Function to handle deletion of a child item
  isEditMode: boolean; // Flag to indicate if it's in edit mode
};
const TransactionInvoiceItem = ({
  setChildAmountData,
  parentId,
  index,
  formik,
  handleDeleteChildren,
  lcur_decimal_nos,
  isEditMode,
  disabled
}: TProps) => {
  //-----------constants-----
  const theme = useTheme();
  const backColor = alpha(theme.palette.primary.lighter, 0.1);
  const [toggleDataSelectionPopup, setToggleDataSelectionPopup] = useState<TDataSelection>({
    is_mounted: false,
    selected: { label: '', value: '' },
    data: {
      curr_name: '',
      dept_name: ''
    }
  });
  //-----------Handlers-----
  // const handleToggleDataSelectionPopup = (selectedItem: TPair<''>) => {
  //   setToggleDataSelectionPopup((prev) => ({
  //     ...prev,
  //     selected: { label: !prev.is_mounted ? selectedItem.label : '', value: !prev.is_mounted ? selectedItem.value : '' },
  //     is_mounted: !prev.is_mounted
  //   }));
  // };
  const handleSelected = (selectedItem: TPair<'ex_rate'>) => {
    switch (toggleDataSelectionPopup.selected.value) {
      case 'currency': {
        formik.setFieldValue(`children[${parentId}][${index}].curr_code`, selectedItem.value);
        formik.setFieldValue(`children[${parentId}][${index}].c_curr_name_orgin`, selectedItem.label);

        formik.setFieldValue(`children[${parentId}][${index}].ex_rate`, selectedItem.ex_rate);
        setToggleDataSelectionPopup((prev) => ({
          ...prev,
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
    }
  };

  //-----------useEffect-----
  useEffect(() => {
    setChildAmountData((prev) => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.children[parentId][index].amount, formik.values.children[parentId][index].sign_ind]);
  // useEffect(() => {
  //   formik.setFieldValue(
  //     `children[${parentId}][${index}].c_bal_amt_org`,
  //     Number(formik.values.children[parentId][index].inv_amt ?? 0) - Number(formik.values.children[parentId][index].amount ?? 0)
  //   );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [formik.values.children[parentId][index].amount, formik.values.children[parentId][index].inv_amt]);

  return (
    <TableRow
      sx={{
        bgcolor: backColor, // Set background color
        '&:hover': { bgcolor: `${backColor} !important` } // Change background color on hover
      }}
      hover
    >
      {/* -----------------------------No.------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        {index + 1} {/* Display row number */}
      </TableCell>
      {/*----------------------Invoice No-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={isEditMode} // Disable if in edit mode
          size="small"
          name={`children[${parentId}][${index}].inv_no`}
          id={`children[${parentId}][${index}].inv_no`}
          onChange={formik.handleChange} // Handle change
          fullWidth
          value={formik.values.children[parentId][index].inv_no ?? ''} // Display invoice number
        />
      </TableCell>
      {/*----------------------Invoice Date-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disabled={disabled} // Disable if disabled
            format="DD/MM/YYYY"
            name={`children[${parentId}][${index}].inv_date`}
            slotProps={{ textField: { size: 'small' } }}
            sx={{ backgroundColor: 'white' }}
            className="w-full min-w-28"
            value={formik.values.children[parentId][index].inv_date ? dayjs(formik.values.children[parentId][index].inv_date) : null} // Display invoice date
            onChange={(newValue: Dayjs | null) => handleDateChange(newValue, formik, `children[${parentId}][${index}].inv_date`)} // Handle date change
          />
        </LocalizationProvider>
      </TableCell>
      {/*----------------------Inv amount-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled
          type="number"
          size="small"
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' } // Align text to the right
            }
          }}
          name={`children[${parentId}][${index}].inv_amt`}
          fullWidth
          value={formateAmount(formik.values.children[parentId][index].inv_amt, lcur_decimal_nos) ?? 0} // Display invoice amount
        />
      </TableCell>
      {/*----------------------c_bal_amt_org-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled
          size="small"
          type="number"
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' } // Align text to the right
            }
          }}
          name={`children[${parentId}][${index}].c_bal_amt_org`}
          fullWidth
          value={formateAmount(formik.values.children[parentId][index].c_bal_amt_org, lcur_decimal_nos) ?? 0} // Display balance amount
        />
      </TableCell>
      {/*----------------------amount-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled} // Disable if disabled
          type="number"
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            const inputValue = event.target.value;
            if (inputValue.charAt(0) !== '-') {
              formik.handleChange(event); // Handle change
            }
          }}
          size="small"
          name={`children[${parentId}][${index}].amount`}
          fullWidth
          value={formateAmount(formik.values.children[parentId][index].amount, lcur_decimal_nos)} // Display amount
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' } // Align text to the right
            },
            endAdornment: (
              <Select
                disabled={disabled} // Disable if disabled
                variant="standard"
                onChange={(e) => {
                  formik.setFieldValue(`children[${parentId}][${index}].sign_ind`, e.target.value); // Handle change for sign indicator
                }}
                name={`children[${parentId}][${index}].sign_ind`}
                value={formik.values.children[parentId][index].sign_ind} // Display sign indicator
              >
                <MenuItem value={-1}>Cr</MenuItem>
                <MenuItem value={1}>Dr</MenuItem>
              </Select>
            )
          }}
        />
      </TableCell>
      {/*----------------------actions-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <IconButton
          color="error"
          onClick={() => handleDeleteChildren(index, parentId)} // Handle delete child item
          disabled={!formik.values.children[parentId][index].IsDeletable || disabled} // Disable if not deletable or disabled
        >
          <DeleteFilled />
        </IconButton>
      </TableCell>
      {/* Render Data Selection Popup */}
      {!!toggleDataSelectionPopup &&
        toggleDataSelectionPopup.is_mounted &&
        ['currency'].includes(toggleDataSelectionPopup.selected.value) && (
          <DataSelection selectedItem={toggleDataSelectionPopup.selected} handleSelection={handleSelected} filter={filter} />
        )}
    </TableRow>
  );
};

export default TransactionInvoiceItem;
