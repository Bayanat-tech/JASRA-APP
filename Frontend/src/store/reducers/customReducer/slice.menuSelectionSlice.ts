import { createSlice } from '@reduxjs/toolkit';

type MenuSelectionState = {
  mastersList: { label: string; value: string }[];
  app: string;
  level1: string;
  level2: string;
  level3: string;
};

const initialState: MenuSelectionState = {
  mastersList: [],
  app: '',
  level1: '',
  level2: '',
  level3: ''
};

const menuSelectionSlice = createSlice({
  initialState,
  name: 'menu_selection',
  reducers: {
    setMastersList(state, action) {
      state.app = action.payload;
    },
    setSelectedApp(state, action) {
      state.app = action.payload;
    },
    setSelectedLevel1Item(state, action) {
      state.level1 = action.payload;
    },
    setSelectedLevel2Item(state, action) {
      state.level2 = action.payload;
    },
    setSelectedLevel3Item(state, action) {
      state.level3 = action.payload;
    }
  }
});

export default menuSelectionSlice.reducer;
export const { setMastersList, setSelectedApp, setSelectedLevel1Item, setSelectedLevel2Item, setSelectedLevel3Item } =
  menuSelectionSlice.actions;
