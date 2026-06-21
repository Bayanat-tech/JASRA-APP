// material-ui
import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';

// project import
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { DeleteFilled } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

// types
interface Props {
  title: number | string;
  open: boolean;
  handleClose: (status: boolean) => void;
  handleDelete: () => void;
}

// ==============================|| KANBAN BOARD - ITEM DELETE ||============================== //

export default function UniversalDelete({ title, open, handleClose, handleDelete }: Props) {
  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)} // Close dialog on close
      TransitionComponent={PopupTransition} // Use custom transition
      keepMounted
      maxWidth="xs"
      aria-labelledby="item-delete-title"
      aria-describedby="item-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          {/* Avatar with delete icon */}
          <Avatar color="primary" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <DeleteFilled />
          </Avatar>
          <Stack spacing={2}>
            {/* Confirmation message */}
            <Typography variant="h4" align="center">
              <FormattedMessage id="Are you sure you want to delete?" />
            </Typography>
            <Typography align="center">
              <FormattedMessage id="By deleting" />
              <Typography variant="subtitle1" component="span">
                {' '}
                {title}{' '}
              </Typography>
              <FormattedMessage id="row, Its details will also be deleted." />
            </Typography>
          </Stack>

          {/* Action buttons */}
          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={() => handleClose(false)} color="secondary" variant="outlined">
              <FormattedMessage id="Cancel" />
            </Button>
            <Button fullWidth color="primary" variant="contained" onClick={() => handleDelete()} autoFocus>
              <FormattedMessage id="Delete" />
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
