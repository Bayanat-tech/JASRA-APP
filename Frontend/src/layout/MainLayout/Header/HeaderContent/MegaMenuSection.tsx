import { useRef, useState } from 'react';

// material-ui
import { Box, Popper, Paper, ClickAwayListener, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { DRAWER_WIDTH } from 'config';

// assets
// import { WindowsOutlined } from '@ant-design/icons';

import { Grid2x2Plus } from 'lucide-react';
// import { Bell } from 'lucide-react';

// types
import AppIcon from 'components/AppIcon';
import useAuth from 'hooks/useAuth';
// import { ThemeMode } from 'types/config';

// ==============================|| HEADER CONTENT - MEGA MENU SECTION ||============================== //

const MegaMenuSection = () => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'grey.200' : 'grey.300';
  // const iconBackColor = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'grey.100';
  const { permissionBasedMenuTree } = useAuth();
  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Grid2x2Plus color={isHovered ? 'black' : 'white'} />
      </IconButton>
      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [-180, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                minWidth: 450,
                minHeight: 150,
                padding: 3,
                width: {
                  md: `calc(60vw - 100px)`,
                  lg: `calc(60vw - ${DRAWER_WIDTH + 100}px)`,
                  xl: `calc(60vw - ${DRAWER_WIDTH + 140}px)`
                },
                maxWidth: 1024
              }}
              className="text-center rounded-b-xl rounded-tl-xl"
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Grid container spacing={2}>
                  {permissionBasedMenuTree.map((eachPermission) => (
                    <Grid item xs={12} sm={4}>
                      <AppIcon setOpen={setOpen} item={eachPermission} />
                    </Grid>
                  ))}
                </Grid>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default MegaMenuSection;
