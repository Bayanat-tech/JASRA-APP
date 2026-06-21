import Backdrop from '@mui/material/Backdrop';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
// import { styled } from '@mui/material/styles';
// import { LiaSpinnerSolid } from "react-icons/lia";
import { Spin } from 'antd';

// const SpinningIcon = styled(LiaSpinnerSolid)(({ theme }) => ({
//     animation: 'spin 1s linear infinite',
//     fontSize: '40px',
//     '@keyframes spin': {
//         '0%': {
//             transform: 'rotate(0deg)',
//         },
//         '100%': {
//             transform: 'rotate(360deg)',
//         },
//     },
// }));

export default function SimpleBackDrop() {
  const { open } = useSelector((state: RootState) => state.backdropSlice);

  return (
    <Backdrop
      sx={(theme) => ({
        color: '#1675f2',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: theme.zIndex.modal + 1
      })}
      open={open}
    >
      <Spin size="large" />
    </Backdrop>
  );
}
