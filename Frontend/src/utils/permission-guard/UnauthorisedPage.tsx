import { useTheme } from '@mui/material';
import LogoMain from 'components/logo/LogoMain';
import './unauthorisedPage.css';

const UnauthorisedPage = () => {
  const theme = useTheme();
  //   const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const primaryColor = theme.palette.primary;
  return (
    <div className="page-wrap w-full h-screen">
      <div className="page-not-found space-y-8 flex flex-col items-center">
        <LogoMain />
        <h4 className="text-md w-full min-w-max" style={{ color: primaryColor.main }}>
          Access Denied !
        </h4>
        <h4 className="text-sm text-sm-btm mt-4">
          You don’t have access to this area of application. You can go back to &nbsp;
          <a href={'/apps'}>Home Page</a>
        </h4>
      </div>
    </div>
  );
};

export default UnauthorisedPage;
