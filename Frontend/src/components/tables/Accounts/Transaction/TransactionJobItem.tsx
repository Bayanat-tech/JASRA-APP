import { DeleteFilled, SearchOutlined } from '@ant-design/icons';
import { alpha, IconButton, TableCell, TableRow, TextField, useTheme } from '@mui/material';
import { ISearch } from 'components/filters/SearchFilter';
import DataSelection from 'components/popup/DataSelection';
import { useEffect, useState } from 'react';
import { TDataSelection, TPair } from 'types/common';

// Import necessary components and hooks from various libraries
const TransactionJobItem = ({
  setChildAmountData,
  parentId,
  index,
  formik,
  handleDeleteChildren,
  disabled
}: {
  setChildAmountData: React.Dispatch<React.SetStateAction<number>>;
  parentId: string;
  index: number;
  formik: any;
  handleDeleteChildren: (index: number, parentId: string) => void;
  disabled: boolean;
}) => {
  //-----------constants-----
  const theme = useTheme(); // Get the current theme
  const backColor = alpha(theme.palette.primary.lighter, 0.1); // Set background color with alpha
  const filter: ISearch = {
    search: []
  }; // Initialize filter for search

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
  const handleSelected = (selectedItem: TPair<'doc_ref'>) => {
    switch (toggleDataSelectionPopup.selected.value) {
      case 'job_detail':
        formik.setFieldValue(`children[${parentId}][${index}].job_no`, selectedItem.label); // Set job number
        formik.setFieldValue(`children[${parentId}][${index}].doc_refno`, selectedItem.doc_ref); // Set document reference number

        setToggleDataSelectionPopup((prev) => ({
          data: { curr_name: selectedItem.label },
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
    }
  };

  //------------------useEffect----------------

  /* 
    Effect to update child amount data whenever the amount or sign indicator changes.
  */
  useEffect(() => {
    setChildAmountData((prev) => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.children?.[parentId]?.[index]?.amount, formik.values.children?.[parentId]?.[index]?.sign_ind]);
  return (
    <TableRow
      sx={{
        bgcolor: backColor, // Set background color
        '&:hover': { bgcolor: `${backColor} !important` } // Change background color on hover
      }}
      hover
    >
      {/* -------------------------No.---------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        {index + 1} {/* Display row number */}
      </TableCell>
      {/*----------------------Job No-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          size="small"
          name={`children[${parentId}][${index}].job_no`}
          id={`children[${parentId}][${index}].job_no`}
          disabled
          fullWidth
          value={formik.values.children?.[parentId]?.[index]?.job_no ?? ''} // Display job number
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={disabled} // Disable if disabled
                size="small"
                onClick={() => handleToggleDataSelectionPopup({ label: 'Job', value: 'job_detail' })} // Open data selection popup for job
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </TableCell>

      {/*----------------------Doc Refno-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled} // Disable if disabled
          onChange={formik.handleChange} // Handle change
          size="small"
          name={`children[${parentId}][${index}].doc_refno`}
          fullWidth
          value={formik.values.children?.[parentId]?.[index]?.doc_refno} // Display document reference number
        />
      </TableCell>
      {/*----------------------Doc Refno2-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled} // Disable if disabled
          onChange={formik.handleChange} // Handle change
          size="small"
          name={`children[${parentId}][${index}].doc_refno_2`}
          fullWidth
          value={formik.values.children?.[parentId]?.[index]?.doc_refno_2} // Display second document reference number
        />
      </TableCell>
      {/*----------------------amount-------------------------- */}
      <TableCell className="p-1 text-xs" size="small">
        <TextField
          disabled={disabled} // Disable if disabled
          size="small"
          type="number"
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
          name={`children[${parentId}][${index}].amount`}
          fullWidth
          value={formik.values.children?.[parentId]?.[index]?.amount} // Display amount
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
        ['job_detail'].includes(toggleDataSelectionPopup.selected.value) && (
          <DataSelection selectedItem={toggleDataSelectionPopup.selected} handleSelection={handleSelected} filter={filter} />
        )}
    </TableRow>
  );
};

export default TransactionJobItem;
