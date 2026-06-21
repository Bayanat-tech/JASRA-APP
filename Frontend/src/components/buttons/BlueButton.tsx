import React from 'react';
import Button from '@mui/material/Button';
import { ButtonProps } from '@mui/material/Button';

interface BlueButtonProps extends ButtonProps {
  children: React.ReactNode;
  startIcon?: React.ReactNode;
  sx?: object;
}

const BlueButton: React.FC<BlueButtonProps> = ({ 
  children, 
  startIcon, 
  onClick, 
  sx = {}, 
  disabled = false,
  ...props 
}) => (
  <Button
    startIcon={startIcon}
    sx={{
      background: disabled 
        ? '#e0e0e0' // Grey background when disabled
        : 'linear-gradient(to right, #082a89, #082a89)',
      color: disabled 
        ? '#a8a8a8' // Grey text when disabled
        : '#fff',
      '&:hover': {
        background: disabled 
          ? '#e0e0e0' // Keep grey on hover when disabled
          : 'linear-gradient(to right, #1675f2, #1675f2)'
      },
      '&.Mui-disabled': {
        color: '#a8a8a8', // Explicit disabled text color
        background: '#e0e0e0' // Explicit disabled background
      },
      ...sx
    }}
    variant="contained"
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </Button>
);

export default BlueButton;