import { To } from 'history';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase, CardMedia } from '@mui/material';
import { SxProps } from '@mui/system';

// project import
import { APP_DEFAULT_PATH } from 'config';
import bayanatLogo from 'assets/images/bayanat.png';

interface Props {
  reverse?: boolean;
  isIcon?: boolean;
  sx?: SxProps;
  to?: To;
}

const BTlogo = ({ sx, to }: Props) => {
  return (
    <ButtonBase disableRipple component={Link} to={to || APP_DEFAULT_PATH} sx={sx}>
      <CardMedia component="img" src={bayanatLogo} sx={{ width: '200px', height: '50px' }} />
    </ButtonBase>
  );
};

export default BTlogo;
