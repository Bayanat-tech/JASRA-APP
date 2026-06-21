import { styled } from '@mui/material/styles';

const FooterWrapper = styled('div')(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  width: '100%',
  // backgroundColor: '#fff',
  zIndex: 1000,
  boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.05)',
  borderTop: '1px solid #fff',
  padding: '6px 0',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '16px',
  lineHeight: '15px',
  color: '#fff',
  backgroundColor: '#082A89',
  fontWeight: 'normal',
  [theme.breakpoints.down('sm')]: {
    fontSize: '12px'
  }
}));

const Footer = () => <FooterWrapper>{`© 2025 Bayanat Technology All rights Reserved. Version 1.0.0.0`}</FooterWrapper>;

export default Footer;
