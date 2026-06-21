// alertSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AlertState {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  open: boolean;
}

const initialState: AlertState = {
  message: '',
  severity: 'info',
  open: false
};

const alertSlice = createSlice({
  name: 'alert',
  initialState, // <-- Initial state is set correctly here
  reducers: {
    // Action to show the alert with a custom message, severity, and open status
    showAlert: (state, action: PayloadAction<AlertState>) => {
      state.message = action.payload.message;
      state.severity = action.payload.severity;
      state.open = true; // Set the alert to open
    },

    // Action to clear the alert
    clearAlert: (state) => {
      state.message = ''; // Reset message
      state.severity = 'info'; // Reset to default severity
      state.open = false; // Set open to false to close the alert
    }
  }
});

export const { showAlert, clearAlert } = alertSlice.actions;
export default alertSlice.reducer;
