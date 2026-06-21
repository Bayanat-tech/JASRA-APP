import { Fragment, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
// material-ui
import { useTheme, styled } from '@mui/material/styles';
import {
  Box,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useMediaQuery
} from '@mui/material';

// lucide icons
import { Wallet, CheckCircle, Building2, FileText, ChevronDown, ChevronRight } from 'lucide-react';

// project import
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import SimpleBar from 'components/third-party/SimpleBar';
import Transitions from 'components/@extended/Transitions';

import useConfig from 'hooks/useConfig';
import { dispatch, useSelector } from 'store';
import { activeID, openDrawer } from 'store/reducers/menu';

// types
import { NavItemType } from 'types/menu';
import { MenuOrientation, ThemeMode } from 'types/config';
import { getPathNameList, snakeCaseToTitleCase } from 'utils/functions';

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

interface Props {
  item: NavItemType;
  lastItem: number;
  remItems: NavItemType[];
  lastItemId: string;
  setSelectedItems: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedItems: string | undefined;
  setSelectedLevel: React.Dispatch<React.SetStateAction<number>>;
  selectedLevel: number;
}

type VirtualElement = {
  getBoundingClientRect: () => ClientRect | DOMRect;
  contextElement?: Element;
};

const PopperStyled = styled(Popper)(({ theme }) => ({
  overflow: 'visible',
  zIndex: 1202,
  minWidth: 180,
  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 5,
    left: 32,
    width: 8,
    height: 8,
    transform: 'translateY(-50%) rotate(45deg)',
    zIndex: 120,
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: `${theme.palette.background.paper} transparent transparent ${theme.palette.background.paper}`
  }
}));

const NavGroup = ({ item, lastItem, remItems, lastItemId, setSelectedItems, selectedItems, setSelectedLevel, selectedLevel }: Props) => {
  const theme = useTheme();
  const { pathname } = useLocation();

  const { menuOrientation } = useConfig();
  const menu = useSelector((state) => state.menu);
  const { drawerOpen, selectedID } = menu;

  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const [anchorEl, setAnchorEl] = useState<VirtualElement | (() => VirtualElement) | null | undefined>(null);
  const [currentItem, setCurrentItem] = useState(item);

  const openMini = Boolean(anchorEl);

  useEffect(() => {
    if (lastItem) {
      if (item.id === lastItemId) {
        const localItem: any = { ...item };
        const elements = remItems.map((ele: NavItemType) => ele.elements);
        localItem.children = elements.flat(1);
        setCurrentItem(localItem);
      } else {
        setCurrentItem(item);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, lastItem, downLG]);

  const checkOpenForParent = (child: NavItemType[], id: string) => {
    child.forEach((ele: NavItemType) => {
      if (ele?.children?.length) {
        checkOpenForParent(ele?.children, currentItem.id!);
      }
      if (getPathNameList(pathname).includes(ele.title?.toString().toLowerCase() as string)) {
        dispatch(activeID(id));
      }
    });
  };
  const checkSelectedOnload = (data: NavItemType) => {
    const childrens = data.children ? data.children : [];
    childrens.forEach((itemCheck: NavItemType) => {
      if (itemCheck.children?.length) {
        checkOpenForParent(itemCheck.children, currentItem.id!);
      }
      if (itemCheck.url_path === pathname) {
        dispatch(activeID(currentItem.id!));
      }
    });
  };

  useEffect(() => {
    checkSelectedOnload(currentItem);
    if (openMini) setAnchorEl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentItem]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
    if (!openMini) {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (title: string | undefined) => {
    const iconProps = {
      size: 20,
      strokeWidth: 1.5,
      className: 'nav-icon'
    };

    switch (title) {
      case 'ACCOUNTS':
        return <Wallet {...iconProps} />;
      case 'MASTERS':
        return <CheckCircle {...iconProps} />;
      case 'TRANSACTIONS':
        return <Building2 {...iconProps} />;
      case 'REPORTS':
        return <FileText {...iconProps} />;
      default:
        return null;
    }
  };

  const navCollapse = item?.children?.map((menuItem, index) => {
    switch (menuItem.type) {
      case 'collapse':
        return (
          <NavCollapse
            key={menuItem.id}
            menu={menuItem}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            level={1}
            parentId={currentItem.id!}
          />
        );
      case 'item':
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  const moreItems = remItems.map((itemRem: NavItemType, i) => (
    <Fragment key={i}>
      {itemRem.title && (
        <Typography variant="caption" sx={{ pl: 2 }}>
          {itemRem.title}
        </Typography>
      )}
      {itemRem?.elements?.map((menu) => {
        switch (menu.type) {
          case 'collapse':
            return (
              <NavCollapse
                key={menu.id}
                menu={menu}
                level={1}
                parentId={currentItem.id!}
                setSelectedItems={setSelectedItems}
                setSelectedLevel={setSelectedLevel}
                selectedLevel={selectedLevel}
                selectedItems={selectedItems}
              />
            );
          case 'item':
            return <NavItem key={menu.id} item={menu} level={1} />;
          default:
            return (
              <Typography key={menu.id} variant="h6" color="error" align="center">
                Menu Items Error
              </Typography>
            );
        }
      })}
    </Fragment>
  ));

  const items = currentItem?.children?.map((menu) => {
    switch (menu.type) {
      case 'collapse':
        return (
          <NavCollapse
            key={menu.id}
            menu={menu}
            level={1}
            parentId={currentItem.id!}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
          />
        );
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  const popperId = openMini ? `group-pop-${item.id}` : undefined;

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <List
          subheader={
            item.title && (
              <Box
                sx={{
                  pl: 3,
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    '& .nav-icon': {
                      color: theme.palette.primary.main
                    }
                  }
                }}
                onClick={() => dispatch(openDrawer(!drawerOpen))}
              >
                {getIcon(typeof item.title === 'string' ? item.title : String(item.title))}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: theme.palette.mode === ThemeMode.DARK ? 'text.secondary' : 'text.primary',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
            )
          }
          sx={{
            mt: drawerOpen && item.title ? 1.5 : 0,
            py: 0,
            zIndex: 0,
            '& .MuiListItemButton-root': {
              borderRadius: 1,
              mb: 0.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: theme.palette.primary.lighter,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main
                }
              }
            }
          }}
        >
          {navCollapse}
        </List>
      ) : (
        <List>
          <ListItemButton
            selected={selectedID === currentItem.id}
            sx={{
              p: 1,
              my: 0.5,
              mr: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'inherit',
              '&.Mui-selected': {
                bgcolor: 'transparent'
              }
            }}
            onMouseEnter={handleClick}
            onClick={handleClick}
            onMouseLeave={handleClose}
            aria-describedby={popperId}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {currentItem.id === lastItemId ? (
                <ChevronDown size={16} />
              ) : (
                getIcon(typeof currentItem.title === 'string' ? currentItem.title : String(currentItem.title))
              )}
            </ListItemIcon>
            <ListItemText
              sx={{ mr: 1 }}
              primary={
                <Typography
                  variant="body1"
                  color={selectedID === currentItem.id ? theme.palette.primary.main : theme.palette.secondary.dark}
                >
                  {currentItem.id === lastItemId ? 'More Items' : snakeCaseToTitleCase(currentItem.title as string)}
                </Typography>
              }
            />
            {openMini ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {anchorEl && (
              <PopperStyled
                id={popperId}
                open={openMini}
                anchorEl={anchorEl}
                placement="bottom-start"
                style={{
                  zIndex: 2001
                }}
              >
                {({ TransitionProps }) => (
                  <Transitions in={openMini} {...TransitionProps}>
                    <Paper
                      sx={{
                        mt: 0.5,
                        py: 1.25,
                        boxShadow: theme.shadows[8],
                        backgroundImage: 'none'
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <SimpleBar
                          sx={{
                            overflowX: 'hidden',
                            overflowY: 'auto',
                            maxHeight: 'calc(100vh - 170px)',
                            width: 225,
                            textWrap: 'auto'
                          }}
                        >
                          {currentItem.id !== lastItemId ? items : moreItems}
                        </SimpleBar>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </PopperStyled>
            )}
          </ListItemButton>
        </List>
      )}
    </>
  );
};

export default NavGroup;
