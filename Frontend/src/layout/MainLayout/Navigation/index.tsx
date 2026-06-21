import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../../styles/Navigation.module.css';
import { LogOut, ChevronDown, ChevronRight, Menu, Home, Settings, Users, FileText } from 'lucide-react';
import { dispatch, useSelector } from 'store';
import useAuth from 'hooks/useAuth';
import { setSelectedApp } from 'store/reducers/customReducer/slice.menuSelectionSlice';
import { getPathNameList } from 'utils/functions';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import useScreenSize from 'hooks/useScreenSize';

interface MenuItem {
  id?: string;
  title: string;
  type: 'collapse' | 'group' | 'item';
  icon?: keyof typeof LucideIcons;
  url_path?: string;
  children?: MenuItem[];
}

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

const formatTitle = (title: string) => {
  return title
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const MenuItemComponent: React.FC<{
  item: MenuItem;
  isCollapsed: boolean;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  setIsCollapsed: (value: boolean) => void;
}> = ({ item, isCollapsed, activeItemId, setActiveItemId, setIsCollapsed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const isActive = item.id === activeItemId;

  useEffect(() => {
    // Set active state based on current URL when component mounts
    if (item.url_path && location.pathname === item.url_path) {
      setActiveItemId(item.id || null);
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

  if (item.type === 'collapse' && item.children) {
    return (
      <li className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}>
        <div
          className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
          onClick={() => {
            setIsExpanded(!isExpanded);
            setActiveItemId(item.id || null);
          }}
          title={formatTitle(item.title)} // Add tooltip
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
          {/* items icon */}
          {/* {item.icon && <ChevronRight size={24} strokeWidth={2} color={isActive ? '#082a89' : '#fff'} />} */}
          {!isCollapsed && (
            <span className={isActive ? styles.activeText : ''} style={{ paddingLeft: 16 }}>
              {formatTitle(item.title)}
            </span>
          )}
          {isCollapsed ? (
            <ChevronRight size={16} color={isActive ? '#082a89' : '#fff'} />
          ) : isExpanded ? (
            <ChevronDown size={16} color={isActive ? '#082a89' : '#fff'} />
          ) : (
            <ChevronRight size={16} color={isActive ? '#082a89' : '#fff'} />
          )}
        </div>
        {isExpanded && !isCollapsed && (
          <ul className={styles.subMenu}>
            {item.children.map((child, idx) => (
              <MenuItemComponent
                key={child.id || idx}
                item={child}
                isCollapsed={isCollapsed}
                activeItemId={activeItemId}
                setActiveItemId={setActiveItemId}
                setIsCollapsed={setIsCollapsed}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  if (item.type === 'item') {
    const hasSelectedChild = item.children?.some((child) => {
      const childPath = child.url_path;
      return childPath && location.pathname.startsWith(childPath);
    });

    return (
      <li className={`${styles.navItem} ${isActive || hasSelectedChild ? styles.activeNavItem : ''}`}>
        <Link
          to={item.url_path || '#'}
          className={`${styles.menuItem} ${isActive || hasSelectedChild ? styles.active : ''}`}
          onClick={() => {
            setActiveItemId(item.id || null);
            // setIsCollapsed(true);
          }}
          title={formatTitle(item.title)}
        >
          {(isActive || hasSelectedChild) && <div className={styles.activeIndicator} />}
          {item.icon && <span className={styles.icon}>{renderIcon(item.icon)}</span>}

          {!isCollapsed && (
            <>
              <FiberManualRecordIcon style={{ fontSize: 6, marginLeft: 4 }} fontSize="small" />
              <span className={`${styles.menuText} ${isActive || hasSelectedChild ? styles.activeText : ''}`}>
                {formatTitle(item.title)}
              </span>
            </>
          )}
          {/* sub small items arrow */}
          {/* {!isCollapsed && <ChevronRight size={16} className={styles.chevron} />} */}
        </Link>
      </li>
    );
  }

  if (item.type === 'group' && item.children) {
    return (
      <>
        {!isCollapsed && <div className={styles.groupTitle}>{item.title}</div>}
        {item.children.map((child, idx) => (
          <MenuItemComponent
            key={child.id || idx}
            item={child}
            isCollapsed={isCollapsed}
            activeItemId={activeItemId}
            setActiveItemId={setActiveItemId}
            setIsCollapsed={setIsCollapsed}
          />
        ))}
      </>
    );
  }

  return null;
};

interface NavigationProps {
  isMobile?: boolean;
  onClose?: () => void;
  setIsCollapsed?: (value: boolean) => void;
  isCollapsed?: boolean;
}

const Navigation = ({ onClose, isCollapsed, setIsCollapsed }: NavigationProps) => {
  const location = useLocation();
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { permissionBasedMenuTree } = useAuth();
  // const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [, setWindowWidth] = useState(window.innerWidth);
  const { isMobile } = useScreenSize();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const pathNameList = getPathNameList(location.pathname);
    dispatch(setSelectedApp(pathNameList[0]));
  }, [location.pathname]);

  useEffect(() => {
    handlerMenuItem();
  }, [app, permissionBasedMenuTree]);

  const handlerMenuItem = () => {
    if (!app || !permissionBasedMenuTree) return;

    const selectAppIndex = permissionBasedMenuTree.findIndex((eachApp) => eachApp?.url_path === app);
    if (selectAppIndex === -1) return;

    const { children = [] } = permissionBasedMenuTree[selectAppIndex];

    const itemsData =
      children.length > 4
        ? [
            ...children.slice(0, 4),
            {
              id: `${Date.now()}`,
              url_path: 'other',
              title: 'More',
              type: 'group',
              children: children.slice(4).map((eachMenuItem) => ({
                ...eachMenuItem,
                type: 'collapse',
                title: eachMenuItem.title || 'Untitled' // Fallback for undefined titles.
              }))
            }
          ]
        : children.map((child) => ({
            ...child,
            title: typeof child.title === 'string' ? child.title : 'Untitled' // Ensure title is a string
          }));

    setMenuItems((itemsData as MenuItem[]) || []);
  };

  return (
    <div
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      style={{
        fontFamily: 'Inter, sans-serif',
        zIndex: 1000,
        backgroundColor: '#082a89',
        // backgroundColor: 'red',

        color: '#fff',
        marginTop: isMobile ? '0' : '40px',
        position: isMobile ? 'static' : 'relative',
        height: isMobile ? '100%' : 'calc(100vh - 40px)',
        paddingLeft: 2,
        paddingRight: 2
      }}
    >
      <div
        style={{
          height: isMobile ? 'auto' : 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <ul
            className={styles.navList}
            style={{
              height: '100%',
              overflowY: 'scroll',
              marginRight: '-17px', // Hides scrollbar in most browsers
              paddingRight: '17px' // Compensates for the negative margin
            }}
          >
            {menuItems.map((item, index) => (
              <MenuItemComponent
                key={item.id || index}
                item={{
                  ...item,
                  title: item.title.replace(/\s+/g, ' ').trim() // Normalize whitespace
                }}
                isCollapsed={isCollapsed ?? true}
                activeItemId={activeItemId}
                setActiveItemId={setActiveItemId}
                setIsCollapsed={setIsCollapsed ?? (() => {})}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
