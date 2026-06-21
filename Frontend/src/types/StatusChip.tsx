import { Chip } from '@mui/material';

const statusColorsMUI: { [key: string]: 'default' | 'primary' | 'success' | 'warning' | 'error' } = {
  'In Progress': 'warning',
  'Final Approved': 'success',
  Rejected: 'error',
  'Save as Draft': 'default',
  Confirm: 'primary',
  Cancel: 'error',
  'Confirmation Pending': 'warning'
};

type StatusChipProps = {
  status?: string; // Status can be undefined
};

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const safeStatus = status ?? 'Unknown'; // Handle undefined cases
  return (
    <Chip
      label={safeStatus}
      variant="outlined"
      color={statusColorsMUI[safeStatus] || 'default'}
      sx={{ minWidth: 120, display: 'flex', justifyContent: 'center' }} // Ensures equal width
    />
  );
};

export default StatusChip;
