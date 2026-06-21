import React, { ReactElement } from 'react';

// material-ui
import { AppBar, Box, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import useConfig from 'hooks/useConfig';
import Navigation from '../Navigation';

// ==============================|| HORIZONTAL MENU LIST ||============================== //

interface ElevationScrollProps {
  children: ReactElement;
  window?: Window | Node;
}

function ElevationScroll({ children, window }: ElevationScrollProps) {
  const theme = useTheme();
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  // const trigger = useScrollTrigger({
  //   disableHysteresis: true,
  //   threshold: 0,
  //   target: window!
  // });

  theme.shadows[4] = theme.customShadows.z1;

  return React.cloneElement(children, {
    // elevation: trigger ? 4 : 0
  });
}

// ==============================|| HORIZONTAL MENU LIST ||============================== //

const CustomAppBar = () => {
  const theme = useTheme();
  const { container } = useConfig();

  return (
    <ElevationScroll>
      <AppBar
        sx={{
          top: 60,
          bgcolor: theme.palette.background.paper,
          width: '100%',
          height: 62,
          justifyContent: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 1098,
          color: theme.palette.grey[500]
        }}
      >
        <Container
          maxWidth={container ? 'xl' : false}
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Navigation />
          </Box>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

export default CustomAppBar;
