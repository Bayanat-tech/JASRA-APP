// project import
import { useLocation } from 'react-router-dom';
import Routes from 'routes';
import ThemeCustomization from 'themes';
import Locales from 'components/Locales';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
// import CustomAlert from 'components/@extended/CustomAlert';

import Notistack from 'components/third-party/Notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box } from '@mui/material';

// auth-provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import RTLLayout from 'components/RTLLayout';
import Footer from 'layout/MainLayout/Footer';
import SimpleBackDrop from './components/loader/SimpleBackDrop';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //
const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();
  const hideFooterRoutes = ['/login', '/register', '/apps']; // Define routes where footer should be hidden

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
                <Notistack>
                  <Box sx={{ pb: '60px' }}>
                    {' '}
                    {/* Add padding bottom to prevent footer overlap */}
                    <SimpleBackDrop />
                    <Routes />
                    {!hideFooterRoutes.includes(location.pathname) && <Footer />}
                    <Snackbar />
                  </Box>
                </Notistack>
              </AuthProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
    </QueryClientProvider>
  );
};

export default App;
