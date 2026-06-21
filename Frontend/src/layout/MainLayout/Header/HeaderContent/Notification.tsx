import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears
} from 'date-fns';
import { useRef, useState } from 'react';
// material-ui
import {
  Avatar,
  Badge,
  Box,
  ClickAwayListener,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';

// assets
import { CheckCircleOutlined } from '@ant-design/icons';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import { Bell } from 'lucide-react';

// types
import { Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import NotificationSerivceInstance from 'service/service.notification';
// import { ThemeMode } from 'types/config';
import { TlogData } from 'types/logs.types';
// import dayjs from 'dayjs';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',

  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const Notification = () => {
  const theme = useTheme();
  const currentDate = new Date();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);
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

  //-----------handlers------------
  const handleAllLogRead = async () => {
    await NotificationSerivceInstance.allReadLog();
    refetchLogCount();
  };

  //---------------useQuery--------------
  const { data: logCount, refetch: refetchLogCount } = useQuery({
    queryKey: ['log_count'],
    queryFn: async () => {
      const response = await NotificationSerivceInstance.getReadLog();
      if (response) {
        return {
          count: response.count
        };
      }
      return { count: 0 }; // Handle undefined case
    }
  });

  const { data: logData } = useQuery({
    queryKey: ['log_data', open],
    queryFn: async () => {
      const response = await NotificationSerivceInstance.getLog();
      if (response) {
        return {
          tableData: response.tableData as TlogData[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    },
    enabled: open === true
  });

  //--------test function --------
  const handlerDateTime = (prevDate: Date) => {
    const years: any = differenceInYears(currentDate, prevDate);
    const months: any = differenceInMonths(currentDate, prevDate);
    const weeks: any = differenceInWeeks(currentDate, prevDate);
    const days: any = differenceInDays(currentDate, prevDate);
    const hours: any = differenceInHours(currentDate, prevDate);
    const minutes: any = differenceInMinutes(currentDate, prevDate);
    const seconds: any = differenceInSeconds(currentDate, prevDate);
    if (years > 0) {
      return (years + ' Years') as string;
    } else if (months > 0) {
      return (months + ' Months') as string;
    } else if (weeks > 0) {
      return (weeks + ' Weeks') as string;
    } else if (days > 0) {
      return (days + ' Days') as string;
    } else if (hours > 0) {
      return (hours + ' Hours') as string;
    } else if (minutes > 0) {
      return (minutes + ' Minutes') as string;
    } else if (seconds > 0) {
      return (seconds + ' Seconds') as string;
    }
  };
  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        // color="secondary"
        // variant="light"
        // sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={logCount?.count} color="primary">
          <Bell size={'20px'} color={isHovered ? 'black' : 'white'} />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
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
                offset: [matchesXs ? -5 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} sx={{ overflow: 'hidden' }} in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: '100%',
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: {
                  maxWidth: 285
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title={'Notification'}
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {(logCount?.count as number) > 0 && (
                        <Tooltip title="Mark as all read">
                          <IconButton color="success" size="small" onClick={handleAllLogRead}>
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  {!logData ? (
                    <List className="w-full">
                      {Array.from({ length: 4 }).map(() => (
                        <Skeleton height={50} className="w-full" component={ListItem} />
                      ))}
                    </List>
                  ) : (
                    <List
                      // component="nav"
                      sx={{
                        maxHeight: '300px',
                        overflowY: 'scroll',
                        p: 0,
                        '& .MuiListItemButton-root': {
                          py: 0.5,
                          '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                          '& .MuiAvatar-root': avatarSX,
                          '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                        }
                      }}
                    >
                      {logData?.tableData.map((item, index) => (
                        <ListItem divider>
                          <ListItemButton selected={(logCount?.count as number) > 0}>
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  color: 'success.main',
                                  bgcolor: 'success.lighter'
                                }}
                              >
                                <NoteAddOutlinedIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6" className="tracking-[0.05em]">
                                  {item.description}
                                </Typography>
                              }
                              secondary={handlerDateTime(item?.updated_at as Date) + ' Ago'}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {differenceInDays(currentDate, item.updated_at) === 0 ? dayjs(item.updated_at).format('HH:mm A') : null}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                  <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" color="primary">
                          View All
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Notification;
