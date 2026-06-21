import { forwardRef, CSSProperties, ReactNode, Ref } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, CardHeader, Divider, Typography, CardProps, CardHeaderProps, CardContentProps } from '@mui/material';

// types
import { KeyedObject } from 'types/root';
import { ThemeMode } from 'types/config';

// header style
const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

// ==============================|| CUSTOM - MAIN CARD ||============================== //

export interface MainCardProps extends KeyedObject {
  border?: boolean;
  boxShadow?: boolean;
  children: ReactNode | string;
  subheader?: ReactNode | string;
  style?: CSSProperties;
  content?: boolean;
  contentSX?: CardContentProps['sx'];
  darkTitle?: boolean;
  divider?: boolean;
  sx?: CardProps['sx'];
  secondary?: CardHeaderProps['action'];
  shadow?: string;
  elevation?: number;
  title?: ReactNode | string;
  modal?: boolean;
}

const MainCard = forwardRef(
  (
    {
      border = true, // Default value for border
      boxShadow,
      children,
      subheader,
      content = true, // Default value for content
      contentSX = {}, // Default value for contentSX
      darkTitle,
      divider = true, // Default value for divider
      elevation,
      secondary,
      shadow,
      sx = {}, // Default value for sx
      title,
      modal = false, // Default value for modal
      ...others
    }: any,
    ref: Ref<HTMLDivElement>
  ) => {
    const theme = useTheme(); // Get the current theme
    boxShadow = theme.palette.mode === ThemeMode.DARK ? boxShadow || true : boxShadow; // Set boxShadow based on theme mode

    return (
      <Card
        elevation={elevation || 0} // Set elevation
        ref={ref}
        {...others}
        sx={{
          position: 'relative',
          border: border ? '1px solid' : 'none', // Set border
          borderRadius: 1,
          borderColor: theme.palette.mode === ThemeMode.DARK ? theme.palette.divider : theme.palette.grey.A800, // Set border color based on theme mode
          boxShadow: boxShadow && (!border || theme.palette.mode === ThemeMode.DARK) ? shadow || theme.customShadows.z1 : 'inherit', // Set boxShadow
          ':hover': {
            boxShadow: boxShadow ? shadow || theme.customShadows.z1 : 'inherit' // Set boxShadow on hover
          },
          ...(modal && {
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: `calc( 100% - 50px)`, sm: 'auto' },
            '& .MuiCardContent-root': {
              overflowY: 'auto',
              minHeight: 'auto',
              maxHeight: `calc(100vh - 200px)`
            }
          }),
          ...sx
        }}
      >
        {/* card header and action */}
        {!darkTitle && title && (
          <CardHeader
            sx={headerSX}
            titleTypographyProps={{ variant: 'subtitle1' }}
            title={title}
            action={secondary}
            subheader={subheader}
          />
        )}
        {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant="h4">{title}</Typography>} action={secondary} />}

        {/* content & header divider */}
        {title && divider && <Divider />}

        {/* card content */}
        {content && <CardContent sx={contentSX}>{children}</CardContent>}
        {!content && children}
      </Card>
    );
  }
);

export default MainCard;
