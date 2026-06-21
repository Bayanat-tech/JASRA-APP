// third-party
import { combineReducers } from 'redux';

// project import
import menu from './menu';
import snackbar from './snackbar';
import menuSelectionSlice from './customReducer/slice.menuSelectionSlice';
import backdropSlice from './backdropSlice';
import alert from '../CustomAlert/alertSlice';
// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  menu,
  snackbar,
  menuSelectionSlice,
  backdropSlice,
  alert
});

export default reducers;
