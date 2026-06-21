import { useRef, useState } from 'react';
import { Box, Popper, Paper, ClickAwayListener, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { DRAWER_WIDTH } from 'config';
import { BookOpen } from 'lucide-react';
import { MessageCircleQuestion } from 'lucide-react';
import useAuth from 'hooks/useAuth';

const Help = () => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const privilegedLoginIds = ['00592', '00764', '00153'];
  const isPrivilegedUser = Boolean(user?.loginid && privilegedLoginIds.includes(String(user.loginid)));

  if (!user?.APPLICATION && !isPrivilegedUser) {
    return null;
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const vendorGuide = 'https://bayanattechnology.gitbook.io/bt-vms-user-guide/';
  const employeeGuide = 'https://bayanattechnology.gitbook.io/bt-lms-user-guide/';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="help section"
        ref={anchorRef}
        aria-controls={open ? 'help-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <MessageCircleQuestion size={'24px'} color={isHovered ? 'black' : 'white'} />
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
                minWidth: 200,
                minHeight: 100,
                padding: 2,
                width: {
                  md: `calc(60vw - 100px)`,
                  lg: `calc(60vw - ${DRAWER_WIDTH + 100}px)`,
                  xl: `calc(60vw - ${DRAWER_WIDTH + 140}px)`
                },
                maxWidth: 400
              }}
              className="text-center rounded-b-xl rounded-tl-xl"
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Help Center
                  </Typography>
                  {isPrivilegedUser ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box
                        component="a"
                        href={vendorGuide}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        <BookOpen size={20} />
                        <Typography variant="body1">VMS User Guide</Typography>
                      </Box>
                      <Box
                        component="a"
                        href={employeeGuide}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        <BookOpen size={20} />
                        <Typography variant="body1">LMS User Guide</Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      component="a"
                      href={user?.APPLICATION?.toUpperCase() === 'VENDOR' ? vendorGuide : employeeGuide}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      <BookOpen size={20} />
                      <Typography variant="body1">
                        {user?.APPLICATION?.toUpperCase() === 'VENDOR' ? 'VMS User Guide' : 'LMS User Guide'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Help;
