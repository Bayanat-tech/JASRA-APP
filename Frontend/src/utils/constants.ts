import AbcIcon from '@mui/icons-material/Abc';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import BusinessIcon from '@mui/icons-material/Business';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateIcon from '@mui/icons-material/Create';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapIcon from '@mui/icons-material/Map';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { ISearch } from 'components/filters/SearchFilter';

// Icon mapping object
export const iconMapping = {
  AbcIcon: AbcIcon,
  BusinessIcon: BusinessIcon,
  LocationCityIcon: LocationCityIcon,
  AttachMoneyIcon: AttachMoneyIcon,
  MapIcon: MapIcon,
  CreateIcon: CreateIcon,
  LocalShippingIcon: LocalShippingIcon,
  ListAltIcon: ListAltIcon,
  CheckCircleIcon: CheckCircleIcon,
  MoveToInboxIcon: MoveToInboxIcon,
  CheckIcon: CheckIcon,
  AccountTreeIcon: AccountTreeIcon,
  AccountBalanceIcon: AccountBalanceIcon,
  MoneyOffIcon: MoneyOffIcon,
  InsertChartIcon: InsertChartIcon,
  GroupIcon: GroupIcon,
  BarChartIcon: BarChartIcon,
  PaymentIcon: PaymentIcon,
  ReceiptIcon: ReceiptIcon,
  LocalAtmIcon: LocalAtmIcon,
  MonetizationOnIcon: MonetizationOnIcon,
  MenuBookIcon: MenuBookIcon,
  DescriptionIcon: DescriptionIcon
};
export const availableStatus = [
  { value: 1, label: 'Active' },
  { value: 2, label: 'Inactive' },
  { value: 0, label: 'Deleted' }
];
export const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: []
};
export const transactionDocumentType = {
  CHEQUE_PAYMENT: 'BP',
  CHEQUE_RECEIPT: 'BR',
  CASH_RECEIPT: 'CR'
};
