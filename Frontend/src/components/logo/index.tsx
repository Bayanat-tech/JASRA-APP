import { To } from 'history';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';
import { SxProps } from '@mui/system';

// project import
import { APP_DEFAULT_PATH } from 'config';
// import aljasraLogo from 'assets/images/aljasra-logo.png';

interface Props {
  reverse?: boolean;
  isIcon?: boolean;
  sx?: SxProps;
  to?: To;
}

const LogoSection = ({ sx, to }: Props) => {
  return (
    <ButtonBase disableRipple component={Link} to={to || APP_DEFAULT_PATH} sx={sx}>
      {/* <CardMedia component="img" src={aljasraLogo} sx={{ width: '200px', height: '50px' }} /> */}
    </ButtonBase>
  );
};

export default LogoSection;
