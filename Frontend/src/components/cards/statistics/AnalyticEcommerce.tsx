// material-ui
import { Box, Chip, ChipProps, Grid, Stack, Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// assets
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { snakeCaseToTitleCase } from 'utils/functions';

// ==============================|| STATISTICS - ECOMMERCE CARD  ||============================== //

interface Props {
  title: string;
  count: string;
  percentage?: number | null | string;
  isLoss?: boolean;
  color?: ChipProps['color'];
  extra: number;
  time?: string;
  orders?: number;
}

const AnalyticEcommerce = ({ color = 'primary', title, count, percentage, isLoss, extra, time, orders }: Props) => (
  <MainCard contentSX={{ p: 2.25 }}>
    <Stack spacing={0.5}>
      <Typography variant="h6" color="textSecondary">
        {title}. {orders} Orders
      </Typography>
      <Typography variant="h6" color="textSecondary"></Typography>
      <Grid container alignItems="center">
        <Grid item>
          <Typography variant="h4" color="inherit">
            {count}
          </Typography>
        </Grid>
        {percentage ? (
          <Grid item>
            <Chip
              variant="combined"
              color={color}
              icon={
                <>
                  {!isLoss && <RiseOutlined style={{ fontSize: '0.75rem', color: 'inherit' }} />}
                  {isLoss && <FallOutlined style={{ fontSize: '0.75rem', color: 'inherit' }} />}
                </>
              }
              label={`${percentage}%`}
              sx={{ ml: 1.25, pl: 1 }}
              size="small"
            />
          </Grid>
        ) : (
          <Grid item>
            <Chip
              variant="combined"
              color={color}
              icon={
                <>
                  <RiseOutlined style={{ fontSize: '0.75rem', color: 'inherit' }} />
                </>
              }
              label={`${0}%`}
              sx={{ ml: 1.25, pl: 1 }}
              size="small"
            />
          </Grid>
        )}
      </Grid>
    </Stack>
    <Box sx={{ pt: 2.25 }}>
      <Typography variant="caption" color="textSecondary">
        You made an extra{' '}
        <Typography component="span" variant="caption" sx={{ color: `${color || 'primary'}.main` }}>
          {extra}
        </Typography>{' '}
        {!!time && time !== 'custom' && `this ${snakeCaseToTitleCase(time)}`}
      </Typography>
    </Box>
  </MainCard>
);

export default AnalyticEcommerce;
