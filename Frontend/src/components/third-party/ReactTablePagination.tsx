import { LeftOutlined, RightOutlined, VerticalLeftOutlined, VerticalRightOutlined } from '@ant-design/icons';
import { Box, IconButton, useTheme } from '@mui/material';

// Define the props for the TablePaginationActions component
interface TablePaginationActionsProps {
  count: number; // Total number of items
  page: number; // Current page number
  rowsPerPage: number; // Number of rows per page
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void; // Function to handle page change
}

const TablePaginationActions = (props: TablePaginationActionsProps) => {
  const theme = useTheme(); // Get the current theme
  const { count, page, rowsPerPage, onPageChange } = props; // Destructure props

  // Handler for first page button click
  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0); // Go to the first page
  };

  // Handler for back button click
  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1); // Go to the previous page
  };

  // Handler for next button click
  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1); // Go to the next page
  };

  // Handler for last page button click
  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1)); // Go to the last page
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      {/* First page button */}
      <IconButton id="1" onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === 'rtl' ? <VerticalLeftOutlined /> : <VerticalRightOutlined />}
      </IconButton>
      {/* Previous page button */}
      <IconButton id="2" onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <RightOutlined /> : <LeftOutlined />}
      </IconButton>
      {/* Next page button */}
      <IconButton id="3" onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page">
        {theme.direction === 'rtl' ? <LeftOutlined /> : <RightOutlined />}
      </IconButton>
      {/* Last page button */}
      <IconButton id="4" onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page">
        {theme.direction === 'rtl' ? <VerticalRightOutlined /> : <VerticalLeftOutlined />}
      </IconButton>
    </Box>
  );
};

export default TablePaginationActions;
