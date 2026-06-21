import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false
};

const backdropSlice = createSlice({
  name: 'backdrop',
  initialState,
  reducers: {
    openBackdrop: (state) => {
      state.open = true;
    },
    closeBackdrop: (state) => {
      state.open = false;
    }
  }
});

export const { openBackdrop, closeBackdrop } = backdropSlice.actions;
export default backdropSlice.reducer;
