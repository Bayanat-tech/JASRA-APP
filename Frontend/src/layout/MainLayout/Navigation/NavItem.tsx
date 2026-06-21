import { forwardRef, useEffect, ForwardRefExoticComponent, RefAttributes } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Chip, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material';

// project import
import Dot from 'components/@extended/Dot';
import useConfig from 'hooks/useConfig';
import { dispatch, useSelector } from 'store';
import { activeItem, openDrawer } from 'store/reducers/menu';

// types
import { LinkTarget, NavItemType } from 'types/menu';
import { MenuOrientation, ThemeMode } from 'types/config';
import { getPathNameList, snakeCaseToTitleCase } from 'utils/functions';

//ICONS FOR LEVEL 3
//---FINANCE MODULE ICONS---
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

//--- WMS MODULE ICONS---
import PublicIcon from '@mui/icons-material/Public';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SellIcon from '@mui/icons-material/Sell';
import GroupIcon from '@mui/icons-material/Group';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import StraightenIcon from '@mui/icons-material/Straighten';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AnchorIcon from '@mui/icons-material/Anchor';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PaidIcon from '@mui/icons-material/Paid';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import InsightsIcon from '@mui/icons-material/Insights';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupsIcon from '@mui/icons-material/Groups';
import SyncIcon from '@mui/icons-material/Sync';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import TaskIcon from '@mui/icons-material/Task';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining';
import AirlinesIcon from '@mui/icons-material/Airlines';
import SafetyDividerIcon from '@mui/icons-material/SafetyDivider';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import FactoryIcon from '@mui/icons-material/Factory';
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import PaymentsIcon from '@mui/icons-material/Payments';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import WorkIcon from '@mui/icons-material/Work';
import CancelIcon from '@mui/icons-material/Cancel';
import NoCrashIcon from '@mui/icons-material/NoCrash';
import AodIcon from '@mui/icons-material/Aod';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
interface Props {
  item: NavItemType;
  level: number;
  type?: string;
}

const NavItem = ({ item, level, type }: Props) => {
  //-------------constants----------------
  const theme = useTheme();
  const navigate = useNavigate();

  const menu = useSelector((state) => state.menu);
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));
  const { drawerOpen, openItem } = menu;

  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  let itemTarget: LinkTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  let listItemProps: {
    component: ForwardRefExoticComponent<RefAttributes<HTMLAnchorElement>> | string;
    href?: string;
    target?: LinkTarget;
  } = {
    component: forwardRef((props, ref) => <Link {...props} to={item.url_path!} target={itemTarget} ref={ref} />)
  };
  if (item?.external) {
    listItemProps = { component: 'a', href: item.url_path, target: itemTarget };
  }

  const Icon = item.icon!;
  const itemIcon = item.icon ? <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} /> : false;
  console.log('this is item', item);

  const isSelected = openItem.findIndex((id) => id === item.id) > -1;

  const { pathname } = useLocation();
  //-------------useEffects----------------

  // active menu item on page load
  useEffect(() => {
    if (getPathNameList(pathname).includes(item.title?.toString().toLowerCase() as string)) {
      dispatch(activeItem({ openItem: [item.id] }));
    }
    // eslint-disable-next-line
  }, [pathname]);

  const textColor = theme.palette.mode === ThemeMode.DARK ? 'grey.400' : 'text.primary';
  const iconSelectedColor = theme.palette.mode === ThemeMode.DARK && drawerOpen ? 'text.primary' : 'primary.main';

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        // level3
        <ListItemButton
          // {...listItemProps}
          onClick={() => {
            console.log('url', item.url_path);
            navigate(`${item.url_path}`);
            // dispatch(activeItem({ openItem: [item.id] }));
          }}
          disabled={item.disabled}
          selected={isSelected}
          sx={{
            zIndex: 1201,
            pl: drawerOpen ? `${level * 28}px` : 1.5,
            py: !drawerOpen && level === 1 ? 1.25 : 1,
            ...(drawerOpen && {
              '&:hover': {
                bgcolor: theme.palette.mode === ThemeMode.DARK ? 'divider' : 'primary.lighter'
              },
              '&.Mui-selected': {
                bgcolor: theme.palette.mode === ThemeMode.DARK ? 'divider' : 'primary.lighter',
                borderRight: `2px solid ${theme.palette.primary.main}`,
                color: iconSelectedColor,
                '&:hover': {
                  color: iconSelectedColor,
                  bgcolor: theme.palette.mode === ThemeMode.DARK ? 'divider' : 'primary.lighter'
                }
              }
            }),
            ...(!drawerOpen && {
              '&:hover': {
                bgcolor: 'transparent'
              },
              '&.Mui-selected': {
                '&:hover': {
                  bgcolor: 'transparent'
                },
                bgcolor: 'transparent'
              }
            })
          }}
          {...(matchDownLg && {
            onClick: () => dispatch(openDrawer(false))
          })}
        >
          {itemIcon && (
            <>
              <ListItemIcon
                sx={{
                  minWidth: 28,
                  color: isSelected ? iconSelectedColor : textColor,
                  ...(!drawerOpen && {
                    borderRadius: 1.5,
                    width: 36,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.light' : 'secondary.lighter'
                    }
                  }),
                  ...(!drawerOpen &&
                    isSelected && {
                      bgcolor: theme.palette.mode === ThemeMode.DARK ? 'primary.900' : 'primary.lighter',
                      '&:hover': {
                        bgcolor: theme.palette.mode === ThemeMode.DARK ? 'primary.darker' : 'primary.lighter'
                      }
                    })
                }}
              >
                {itemIcon}
              </ListItemIcon>
            </>
          )}
          {(drawerOpen || (!drawerOpen && level !== 1)) && (
            <ListItemText
              onClick={() => {
                navigate(`${item.url_path}`);
                dispatch(openDrawer(!drawerOpen)); //Drawer toggling added here
              }}
              primary={
                //level 3 icon rendering
                type === 'group' ? (
                  <Typography
                    variant="subtitle2"
                    color={theme.palette.mode === ThemeMode.DARK ? 'textSecondary' : 'text.secondary'}
                    sx={{ fontWeight: 'bold', fontSize: '14px', color: '#151C62' }} // Increased font size
                  >
                    {item.title}
                  </Typography>
                ) : (
                  <Typography variant="h6" sx={{ color: isSelected ? iconSelectedColor : textColor }}>
                    {item.title === 'A-C_TREE' && <AccountTreeIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'CHEQUE-PAYMENT' && <PaymentIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'CHEQUE-RECEIPT' && <ReceiptIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'CASH-RECEIPT' && <ReceiptLongIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'COUNTRY' && <PublicIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'DEPARTMENT' && <ApartmentIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'PRINCIPAL' && <PersonIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'LOCATION' && <LocationOnIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'SALESMAN' && <SellIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'PARTNER' && <GroupIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'MOC' && <ChangeHistoryIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'UOM' && <StraightenIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'ACTIVITYGROUP' && <Diversity3Icon sx={{ marginRight: 1 }} />}
                    {item.title === 'SUPPLIER' && <LocalShippingIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'PORT' && <AnchorIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'CURRENCY' && <CurrencyExchangeIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'BILLINGACTIVITY' && <PaidIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'MOC2' && <ChangeCircleIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'LINE' && <HorizontalRuleIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'BRAND' && <InsightsIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'UOC' && <AttachMoneyIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'GROUP' && <GroupsIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'HARMONIZE' && <SyncIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'MANUFACTURER' && <WarehouseIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'ACTIVITYSUBGROUP' && <TaskIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'ACCOUNTSETUP' && <ManageAccountsIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'VESSEL' && <TakeoutDiningIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'AIRLINE' && <AirlinesIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'DIVISION' && <SafetyDividerIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'PRODUCT' && <ProductionQuantityLimitsIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'ALERT' && <AddAlertIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'WAREHOUSE' && <FactoryIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'LOCATIONTYPE' && <NotListedLocationIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'PRODUCTTYPE' && <WorkOutlineIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'ACTIVITYKPI' && <LocalActivityIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'BILLING_ACTIVITY' && <PaymentsIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'JOBS' && <WorkHistoryIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'JOBS_OUB' && <WorkIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'CANCEL_JOBS_OUB' && <CancelIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'ORDER-ENTRY' && <NoCrashIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'ORDER-DETAILS' && <AodIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'JOB-PICKING' && <LocalShippingOutlinedIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'SUMMARYSTOCK' && <SummarizeOutlinedIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'DETAILSTOCK' && <DvrOutlinedIcon sx={{ marginRight: 1 }} />}
                    {item.title === 'AGING' && <DateRangeOutlinedIcon sx={{ marginRight: 1 }} />}

                    {snakeCaseToTitleCase(item.title as string)}
                  </Typography>
                )
              }
            />
          )}
          {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
            <Chip
              color={item.chip.color}
              variant={item.chip.variant}
              size={item.chip.size}
              label={item.chip.label}
              avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
            />
          )}
        </ListItemButton>
      ) : (
        <ListItemButton
          {...listItemProps}
          disabled={item.disabled}
          selected={isSelected}
          sx={{
            zIndex: 1201,
            ...(drawerOpen && {
              '&:hover': {
                bgcolor: 'transparent'
              },
              '&.Mui-selected': {
                bgcolor: 'transparent',
                color: iconSelectedColor,
                '&:hover': {
                  color: iconSelectedColor,
                  bgcolor: 'transparent'
                }
              }
            }),
            ...(!drawerOpen && {
              '&:hover': {
                bgcolor: 'transparent'
              },
              '&.Mui-selected': {
                '&:hover': {
                  bgcolor: 'transparent'
                },
                bgcolor: 'transparent'
              }
            })
          }}
        >
          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: 36,
                ...(!drawerOpen && {
                  borderRadius: 1.5,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    bgcolor: 'transparent'
                  }
                }),
                ...(!drawerOpen &&
                  isSelected && {
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: 'transparent'
                    }
                  })
              }}
            >
              {itemIcon}
            </ListItemIcon>
          )}
          {!itemIcon && (
            <ListItemIcon
              sx={{
                color: isSelected ? 'primary.main' : 'secondary.main',
                ...(!drawerOpen && {
                  borderRadius: 1.5,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    bgcolor: 'transparent'
                  }
                }),
                ...(!drawerOpen &&
                  isSelected && {
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: 'transparent'
                    }
                  })
              }}
            >
              <Dot size={4} color={isSelected ? 'primary' : 'secondary'} />
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <Typography variant="h6" color="inherit">
                {snakeCaseToTitleCase(item.title as string)}
              </Typography>
            }
          />
          {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
            <Chip
              color={item.chip.color}
              variant={item.chip.variant}
              size={item.chip.size}
              label={item.chip.label}
              avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
            />
          )}
        </ListItemButton>
      )}
    </>
  );
};

export default NavItem;
