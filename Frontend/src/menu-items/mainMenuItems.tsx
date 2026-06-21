// third-party
import { FormattedMessage } from 'react-intl';

// type
import { NavItemType } from 'types/menu';
import { NavigationItems } from './navigationItems';

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const mainMenuItems: NavItemType = {
  id: 'other',
  title: <FormattedMessage id="Main Menu" />,
  type: 'group',
  children: NavigationItems
};

export default mainMenuItems;
