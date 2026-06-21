import { useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, Typography, Drawer, IconButton } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, ChevronRight, Menu, Home, Settings, Users, FileText } from 'lucide-react';
import styles from '../../../../styles/Navigation.module.css';
import MegaMenuSection from './MegaMenuSection';
import MobileSection from './MobileSection';
import Profile from './Profile';
import Localization from './Localization';
import Notification from './Notification';
import useConfig from 'hooks/useConfig';
import { MenuOrientation, ThemeDirection } from 'types/config';
import bayanatLogo from '../../../../assets/bayanatLogo.png';
import { dispatch, useSelector } from 'store';
import useAuth from 'hooks/useAuth';
import { setSelectedApp } from 'store/reducers/customReducer/slice.menuSelectionSlice';
import { getPathNameList } from 'utils/functions';
import { IoMenuOutline } from 'react-icons/io5';
import { Button } from 'antd';
import Help from './Help';


const LucideIcons = {
  Home,
  Settings,
  Users,
  FileText,
  Menu,
  LogOut,
  ChevronDown,
  ChevronRight
} as const;

interface MenuItem {
  id?: string;
  title: string;
  type: 'collapse' | 'group' | 'item';
  icon?: keyof typeof LucideIcons;
  url_path?: string;
  children?: MenuItem[];
}

const MenuItemComponent: React.FC<{
  item: MenuItem;
  isCollapsed: boolean;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  setIsCollapsed: (value: boolean) => void;
  expandedItems?: string[];
  setExpandedItems?: (items: string[]) => void;
  onDrawerClose?: () => void;
}> = ({ item, isCollapsed, activeItemId, setActiveItemId, setIsCollapsed, expandedItems = [], setExpandedItems, onDrawerClose }) => {
  const location = useLocation();
  const isActive = item.id === activeItemId;
  const isExpanded = item.id ? expandedItems.includes(item.id) : false;

  useEffect(() => {
    if (item.url_path && location.pathname === item.url_path) {
      setActiveItemId(item.id || null);
      // Expand parent items when child is active
      if (item.id && setExpandedItems) {
        setExpandedItems([...expandedItems, item.id]);
      }
    }
  }, [location.pathname]);

  const renderIcon = (icon: keyof typeof LucideIcons | string) => {
    const iconName = (icon.charAt(0).toUpperCase() + icon.slice(1).toLowerCase()) as keyof typeof LucideIcons;
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? (
      <div className={`${styles.iconWrapper} ${isActive ? styles.activeIcon : ''}`}>
        <IconComponent color={isActive ? '#082a89' : '#fff'} size={24} />
      </div>
    ) : null;
  };

  const handleCollapse = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!item.id || !setExpandedItems) return;

    const newExpanded = isExpanded ? expandedItems.filter((id) => id !== item.id) : [...expandedItems, item.id];
    setExpandedItems(newExpanded);
    setActiveItemId(item.id);
  };

  if (item.type === 'collapse' && item.children) {
    return (
      <li className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}>
        <div
          className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
          onClick={handleCollapse}
          style={{
            position: 'relative',
            ...(isActive
              ? {
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              : {})
          }}
        >
          {isActive && <div className={styles.activeIndicator} />}
          {item.icon && renderIcon(item.icon)}
          <span className={isActive ? styles.activeText : ''}>{item.title}</span>
          {isExpanded ? (
            <ChevronDown size={16} color={isActive ? '#082a89' : '#fff'} />
          ) : (
            <ChevronRight size={16} color={isActive ? '#082a89' : '#fff'} />
          )}
        </div>
        {isExpanded && (
          <ul className={styles.subMenu}>
            {item.children.map((child, idx) => (
              <MenuItemComponent
                key={child.id || idx}
                item={child}
                isCollapsed={isCollapsed}
                activeItemId={activeItemId}
                setActiveItemId={setActiveItemId}
                setIsCollapsed={setIsCollapsed}
                expandedItems={expandedItems}
                setExpandedItems={setExpandedItems}
                onDrawerClose={onDrawerClose}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  if (item.type === 'item') {
    return (
      <li className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}>
        <Link
          to={item.url_path || '#'}
          className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
          onClick={() => {
            setActiveItemId(item.id || null);
            onDrawerClose?.();
          }}
        >
          {isActive && <div className={styles.activeIndicator} />}
          {item.icon && renderIcon(item.icon)}
          <span className={`${styles.menuText} ${isActive ? styles.activeText : ''}`}>{item.title}</span>
        </Link>
      </li>
    );
  }

  if (item.type === 'group' && item.children) {
    return (
      <>
        <div className={styles.groupTitle}>{item.title}</div>
        {item.children.map((child, idx) => (
          <MenuItemComponent
            key={child.id || idx}
            item={child}
            isCollapsed={isCollapsed}
            activeItemId={activeItemId}
            setActiveItemId={setActiveItemId}
            setIsCollapsed={setIsCollapsed}
            expandedItems={expandedItems}
            setExpandedItems={setExpandedItems}
            onDrawerClose={onDrawerClose}
          />
        ))}
      </>
    );
  }

  return null;
};

interface HeaderProps {
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed?: boolean;
}
const HeaderContent = ({ isCollapsed, setIsCollapsed }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const { i18n, menuOrientation, onChangeDirection } = useConfig();
  const location = useLocation();
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { permissionBasedMenuTree } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  // const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const megaMenu = useMemo(() => <MegaMenuSection />, []);
  const localization = useMemo(() => <Localization />, [i18n]);

  const { logout } = useAuth();

  const navigate = useNavigate();
  const handleHomeClick = () => {
    if (app) {
      navigate(`/${app}/dashboard`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (i18n === 'ar') {
      onChangeDirection(ThemeDirection.RTL);
      return;
    }
    onChangeDirection(ThemeDirection.LTR);
  }, [i18n]);

  useEffect(() => {
    const pathNameList = getPathNameList(location.pathname);
    dispatch(setSelectedApp(pathNameList[0]));
  }, [location.pathname]);

  useEffect(() => {
    handlerMenuItem();
  }, [app, permissionBasedMenuTree]);

  const handlerMenuItem = () => {
    if (!app || !permissionBasedMenuTree) {
      setMenuItems([]);
      return;
    }

    const selectAppIndex = permissionBasedMenuTree.findIndex((eachApp) => eachApp?.url_path === app);

    if (selectAppIndex === -1) {
      setMenuItems([]);
      return;
    }

    const { children = [] } = permissionBasedMenuTree[selectAppIndex];

    if (!children.length) {
      setMenuItems([]);
      return;
    }

    try {
      const removeUnderscores = (text: string) => {
        return text.replace(/_/g, ' ');
      };

      const processMenuItems = (items: any[]): MenuItem[] => {
        return items.map((item) => {
          if (!item) {
            return {
              id: String(Math.random()),
              title: 'Invalid Item',
              type: 'item'
            };
          }

          return {
            id: item.id || String(Math.random()),
            title: typeof item.title === 'string' ? removeUnderscores(item.title) : 'Untitled',
            type: item.type || (item.children?.length ? 'collapse' : 'item'),
            url_path: item.url_path,
            icon: item.icon,
            children: item.children ? processMenuItems(item.children) : undefined
          };
        });
      };

      const itemsData = processMenuItems(children);
      setMenuItems(itemsData);
    } catch (error) {
      setMenuItems([]);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
        {downLG && <Button size="middle" onClick={handleDrawerToggle} shape="circle" icon={<Menu style={{ color: '#082a89' }} />} />}
        {/* <img className="w-20 h-10" src={bayanatLogo} alt="logo" /> */}
        {downLG ? (
          <IconButton onClick={handleHomeClick} sx={{ color: 'white' }}>
            <Home size={24} />
          </IconButton>
        ) : (
          // <Button size="middle" onClick={handleHomeClick} shape="circle" icon={<Home style={{ color: '#082a89' }} />} />
          // Main text on home screen
          <>
            <div className="flex bg-white p-2 cursor-pointer w-[180px]" onClick={handleHomeClick}>
              <Typography
                variant="h4"
                sx={{
                  color: '#082a89',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  lineHeight: 1,
                  fontFamily: '"Segoe UI", "Helvetica", "Arial", sans-serif',
                  whiteSpace: 'nowrap',
                  fontSize: '1rem'
                }}
              >
                Bayanat Technology
              </Typography>
            </div>
            <div className="pl-1 cursor-pointer">
              <IoMenuOutline
                size={35}
                color="white"
                onClick={() => {
                  console.log('clicked');
                  setIsCollapsed?.((prev: boolean) => !prev);
                }}
              />
            </div>
          </>
        )}
      </Box>

      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}></Box>
      )}

      {downLG && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: 280,
              background: '#082a89',
              color: 'white',
              borderRight: 'none',
              height: '100%',
              '& > div': {
                height: '100%',
                overflow: 'auto'
              }
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <img className="w-20 h-10" src={bayanatLogo} alt="logo" />
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  lineHeight: 1,
                  fontFamily: '"Segoe UI", "Helvetica", "Arial", sans-serif',
                  whiteSpace: 'nowrap',
                  fontSize: '1rem'
                }}
              >
                Bayanat Technology
              </Typography>
            </Box>

            {/* Drawer Content */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                padding: '14px',
                '& ul': {
                  margin: 0,
                  padding: '16px 0',
                  listStyle: 'none'
                }
              }}
            >
              {menuItems.map((item, index) => (
                <MenuItemComponent
                  key={item.id || index}
                  item={item}
                  isCollapsed={isCollapsed ?? true}
                  activeItemId={activeItemId}
                  setActiveItemId={setActiveItemId}
                  setIsCollapsed={setIsCollapsed ?? (() => {})}
                  expandedItems={expandedItems}
                  setExpandedItems={setExpandedItems}
                  onDrawerClose={handleDrawerToggle}
                />
              ))}
            </Box>

            {/* Logout Button */}
            <Box
              sx={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                p: 2,
                mt: 'auto'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: 1,
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={() => {
                  // Add your logout logic here
                }}
              >
                <LogOut onClick={handleLogout} size={20} color="white" />
                <Typography color="white">Logout</Typography>
              </Box>
            </Box>
          </Box>
        </Drawer>
      )}

      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <div className="flex justify-end items-center w-full">
        {megaMenu}
        {!downLG && localization}
        {!downLG && (
          <IconButton
            sx={{
              backgroundColor: isHovered ? 'white' : 'transparent',
              ':hover': {
                backgroundColor: 'white' // change background to white on hover
              }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="open profile"
            onClick={handleHomeClick}
          >
            <Home size={'20px'} color={isHovered ? 'black' : 'white'} />
          </IconButton>
        )}
        <Notification />
        <Help />
        {!downLG && <Profile />}
        {downLG && <MobileSection />}
      </div>
    </>
  );
};

export default HeaderContent;
