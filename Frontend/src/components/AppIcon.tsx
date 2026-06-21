import { SunOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import { dispatch } from 'store';
import { setSelectedApp } from 'store/reducers/customReducer/slice.menuSelectionSlice';
import { NavItemType } from 'types/menu';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import SellIcon from '@mui/icons-material/Sell';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import { activeID, activeItem } from 'store/reducers/menu';
const AppIcon = ({ item, setOpen }: { item: NavItemType; setOpen?: Dispatch<SetStateAction<boolean>> }) => {
  const navigate = useNavigate();
  let location = useLocation();
  const customLocation = location.pathname.split('/');
  console.log('pf', item.title);

  return (
    <div
      className={
        customLocation[1].toUpperCase() === item.title
          ? 'flex flex-col  cursor-pointer p-3 rounded-lg   bg-gray-100 hover:bg-gray-50'
          : 'flex flex-col  cursor-pointer p-3 rounded-lg   hover:bg-gray-50'
      }
      onClick={() => {
        dispatch(setSelectedApp(item.url_path));
        dispatch(activeID(null));
        dispatch(activeItem({ openItem: [''] }));
        navigate(`${item.url_path}/dashboard`);
        if (setOpen) {
          setOpen(false);
        }
      }}
    >
      {item.icon ? (
        // <IconComponent icon={item.icon as keyof typeof iconMapping} style={{ fontSize: 20 }} />
        <></>
      ) : (
        <>
          <SunOutlined />
        </>
      )}
      <span>{item.title === 'FINANCE' && <AttachMoneyIcon />}</span>
      <span>{item.title === 'WMS' && <WarehouseOutlinedIcon />}</span>
      <span>{item.title === 'SECURITY' && <SecurityOutlinedIcon />}</span>
      <span>{item.title === 'PF' && <SavingsOutlinedIcon />}</span>
      <span>{item.title === 'HR' && <PeopleOutlineOutlinedIcon />}</span>
      <span>{item.title === 'ACCOUNTS' && <AccountBoxOutlinedIcon />}</span>
      <span>{item.title === 'SMS' && <SellIcon />} </span>
      <span>{item.title === 'VENDOR' && <StorefrontOutlinedIcon />} </span>
      <span>{item.title === 'ATTENDANCE' && <CalendarMonthOutlinedIcon />} </span>
      <span>
        <FormattedMessage id={item.title as string} />
      </span>
    </div>
  );
};
export default AppIcon;
