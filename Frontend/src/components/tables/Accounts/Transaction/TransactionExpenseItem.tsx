import { DeleteFilled, SearchOutlined } from '@ant-design/icons';
import { alpha, IconButton, TableCell, TableRow, TextField, useTheme } from '@mui/material';
import { ISearch } from 'components/filters/SearchFilter';
import DataSelection from 'components/popup/DataSelection';
import { useEffect, useState } from 'react';
import { TDataSelection, TPair } from 'types/common';

// Import necessary components and hooks from various libraries
const TransactionExpenseItem = ({
  setChildAmountData,
  parentId,
  index,
  formik,
  handleDeleteChildren,
  expenseTypeCode,
  disabled
}: {
  setChildAmountData: React.Dispatch<React.SetStateAction<number>>;
  parentId: string;
  index: number;
  formik: any;
  handleDeleteChildren: (index: number, parentId: string) => void;
  expenseTypeCode: string;
  disabled: boolean;
}) => {
  //-----------constants-----
  const theme = useTheme(); // Get the current theme
  const backColor = alpha(theme.palette.primary.lighter, 0.1); // Set background color with alpha
  const filter: ISearch = {
    search: [[{ field_name: 'exp_type_code', field_value: expenseTypeCode, operator: 'exactmatch' }]]
  }; // Initialize filter for search with expense type code

  const [toggleDataSelectionPopup, setToggleDataSelectionPopup] = useState<TDataSelection>({
    is_mounted: false,
    selected: { label: '', value: '' },
    data: { dept_name: '' }
  }); // State to manage data selection popup

  //------------------handlers----------------

  /* 
    Handler to toggle the data selection popup.
    It updates the state to show or hide the popup.
  */
  const handleToggleDataSelectionPopup = (selectedItem: TPair<''>) => {
    setToggleDataSelectionPopup((prev) => ({
      ...prev,
      selected: { label: !prev.is_mounted ? selectedItem.label : '', value: !prev.is_mounted ? selectedItem.value : '' },
      is_mounted: !prev.is_mounted
    }));
  };

  /* 
    Handler to handle the selection of data from the popup.
    It updates the formik values based on the selected item.
  */
  const handleSelected = (selectedItem: TPair<''>) => {
    switch (toggleDataSelectionPopup.selected.value) {
      case 'expense_type': {
        formik.setFieldValue(`children[${parentId}][${index}].exp_code`, selectedItem.value); // Set expense code
        formik.setFieldValue(`children[${parentId}][${index}].exp_description`, selectedItem.label); // Set expense description

        setToggleDataSelectionPopup((prev) => ({
          ...prev,
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
      case 'expense_sub_type': {
        formik.setFieldValue(`children[${parentId}][${index}].exp_subtype_code`, selectedItem.value); // Set expense subtype code
        formik.setFieldValue(`children[${parentId}][${index}].exp_subtype_description`, selectedItem.label); // Set expense subtype description

        setToggleDataSelectionPopup((prev) => ({
          ...prev,
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
    }
  };

  //------------------useEffect----------------

  /* 
    Effect to update child amount data whenever the amount or sign indicator changes.
  */
  useEffect(() => {
    setChildAmountData((prev) => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.children[parentId][index]?.amount, formik.values.children[parentId][index]?.sign_ind]);
  return (
    <TableRow
      hover
      sx={{
        bgcolor: backColor, // Set background color
        '&:hover': { bgcolor: `${backColor} !important` } // Change background color on hover
      }}
    >
      {/* --------------------No.--------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        {index + 1} {/* Display row number */}
      </TableCell>
      {/*----------------------Exp Subtype Code-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          size="small"
          name={`children[${parentId}][${index}].exp_subtype_code`}
          id={`children[${parentId}][${index}].exp_subtype_code`}
          disabled
          fullWidth
          value={formik.values.children[parentId][index].exp_subtype_code ?? ''} // Display expense subtype code
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={() => handleToggleDataSelectionPopup({ label: 'Expense Sub Type', value: 'expense_sub_type' })} // Open data selection popup for expense subtype
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </TableCell>

      {/*----------------------Exp Subtype Description-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled
          onChange={formik.handleChange} // Handle change
          size="small"
          name={`children[${parentId}][${index}].exp_subtype_description`}
          fullWidth
          value={formik.values.children[parentId][index].exp_subtype_description} // Display expense subtype description
        />
      </TableCell>

      {/*----------------------Exp Code-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          size="small"
          name={`children[${parentId}][${index}].exp_code`}
          id={`children[${parentId}][${index}].exp_code`}
          disabled
          fullWidth
          value={formik.values.children[parentId][index].exp_code ?? ''} // Display expense code
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={() => handleToggleDataSelectionPopup({ label: 'Expense Type', value: 'expense_type' })} // Open data selection popup for expense type
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </TableCell>

      {/*----------------------Exp Description-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled
          onChange={formik.handleChange} // Handle change
          size="small"
          name={`children[${parentId}][${index}].exp_description`}
          fullWidth
          value={formik.values.children[parentId][index].exp_description} // Display expense description
        />
      </TableCell>

      {/*----------------------Job No.-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled} // Disable if disabled
          onChange={formik.handleChange} // Handle change
          size="small"
          name={`children[${parentId}][${index}].job_no`}
          fullWidth
          value={formik.values.children[parentId][index].job_no} // Display job number
        />
      </TableCell>

      {/*----------------------Amount-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled} // Disable if disabled
          name={`children[${parentId}][${index}].amount`}
          id="outlined-basic"
          type="number"
          variant="outlined"
          value={formik.values.children[parentId][index].amount} // Display amount
          inputProps={{ min: 0 }}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            const inputValue = event.target.value;
            if (inputValue.charAt(0) !== '-') {
              formik.handleChange(event); // Handle change
            }
          }}
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' } // Align text to the right
            }
          }}
          fullWidth
          size="small"
        />
      </TableCell>

      {/*----------------------actions-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <IconButton
          disabled={disabled} // Disable if disabled
          color="error"
          onClick={() => handleDeleteChildren(index, parentId)} // Handle delete child item
        >
          <DeleteFilled />
        </IconButton>
      </TableCell>

      {/* Render Data Selection Popup */}
      {!!toggleDataSelectionPopup &&
        toggleDataSelectionPopup.is_mounted &&
        ['expense_type', 'expense_sub_type'].includes(toggleDataSelectionPopup.selected.value) && (
          <DataSelection selectedItem={toggleDataSelectionPopup.selected} handleSelection={handleSelected} filter={filter} />
        )}
    </TableRow>
  );
};

export default TransactionExpenseItem;
