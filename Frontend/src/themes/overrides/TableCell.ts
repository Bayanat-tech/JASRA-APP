// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - TABLE ROW & TABLE CELL ||============================== //

export default function TableCell(theme: Theme) {
  return {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#eef8ff' // Light blue 50
          },
          '&:nth-of-type(odd)': {
            backgroundColor: 'white' // Light blue 100
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: 12,
          borderColor: theme.palette.divider,
          color: 'gray'
        },
        sizeSmall: {
          padding: 8
        },
        head: {
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'white',
          backgroundColor: '#082a89',
          borderBottom: `2px solid ${theme.palette.divider}`,
          textAlign: 'center'
        },
        footer: {
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          borderTop: `3px solid ${theme.palette.divider}`
        }
      }
    }
  };
}
