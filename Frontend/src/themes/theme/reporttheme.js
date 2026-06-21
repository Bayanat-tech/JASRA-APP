import { createTheme } from '@mui/material/styles';

const reporttheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2' // Blue color for primary buttons
    },
    secondary: {
      main: '#dc004e' // Red color for secondary buttons
    },
    background: {
      default: '#f5f5f5', // Light gray background
      paper: '#fff'
    },
    text: {
      primary: '#333' // Dark text
    }
  },
  typography: {
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      textDecoration: 'underline',
      color: '#1976d2',
      align: 'center'
    },
    h1: {
      fontSize: '20px',
      fontWeight: 'bold',
      textDecoration: 'underline',
      textAlign: 'center',
      marginBottom: '2px'
    },
    h6: {
      fontSize: '0.75rem',
      fontWeight: 600
    },
    body1: {
      fontSize: '0.71rem',
      lineHeight: 1.5
    },
    button: {
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        },
        contained: {
          borderRadius: '5px'
        },
        outlined: {
          borderRadius: '4px'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '1px',
          textAlign: 'center',
          border: '1px solid #1f1f1f',
          fontSize: '10.5px',
          borderCollapse: 'collapse'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff' // Apply background color to every table row
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          padding: '2px', // Padding for TableContainer
          borderRadius: '2px' // Rounded corners for the TableContainer
        }
      }
    }
  }
});

export default reporttheme;
