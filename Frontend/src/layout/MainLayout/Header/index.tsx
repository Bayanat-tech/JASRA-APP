import { ReactNode, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { AppBar, useMediaQuery, AppBarProps } from '@mui/material';
import AppBarStyled from './AppBarStyled';
import HeaderContent from './HeaderContent';
import { useSelector } from 'store';
// import { ThemeMode } from 'types/config';


interface HeaderProps {
 setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed?: boolean;
}

const Header = ({ isCollapsed, setIsCollapsed}: HeaderProps) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const menu = useSelector((state) => state.menu);
  const { drawerOpen } = menu;

  const headerContent = useMemo(() => <HeaderContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />, []);

  // const mainHeader: ReactNode = <Toolbar sx={{ minHeight: 28 }}>{headerContent}</Toolbar>;
  const mainHeader: ReactNode = <div className="flex">{headerContent}</div>;

  const appBar: AppBarProps = {
    position: 'fixed',
    color: 'inherit',
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      zIndex: 1200,
      width: { xs: '100%' },
      backgroundColor: '#082a89'
    }
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled open={drawerOpen} {...appBar}>
          {mainHeader}
        </AppBarStyled>
      ) : (
        <AppBar {...appBar}>{mainHeader}</AppBar>
      )}
    </>
  );
};

export default Header;
