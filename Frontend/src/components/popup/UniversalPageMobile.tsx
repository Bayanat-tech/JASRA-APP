import { CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { Button, Dialog, DialogActions, DialogContent, IconButton, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { forwardRef } from 'react';
import { dispatch } from 'store';
import { clearAlert } from 'store/CustomAlert/alertSlice';
import { TUniversalDialogPropsWActions } from 'types/types.UniversalDialog';

// Transition component for the dialog
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

// UniversalDialog component without the AppBar
const UniversalPageMobile = (props: TUniversalDialogPropsWActions) => {
  const { hasPrimaryButton = true, hasSecondaryButton = false, disablePrimaryButton = false, disableSecondaryButton = false } = props;

  const handleClose = () => {
    props?.onClose();
    dispatch(clearAlert());
  };

  // Handler for primary button click
  const handlePrimaryClick = () => {
    props?.onSave && props?.onSave();
  };

  return (
    <Dialog scroll={'paper'} fullScreen {...props.action} TransitionComponent={Transition}>
      {/* Container for sticky elements */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        {/* Close button */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseCircleFilled />
          </IconButton>
        </div>

        {/* Title (if provided) */}
        {props?.title && (
          <div className="text-lg font-semibold mb-4 pt-4 px-4">{typeof props?.title === 'string' ? props.title : props.title}</div>
        )}
      </div>

      {/* Scrollable content area */}
      <DialogContent className={`overflow-y-auto ${hasSecondaryButton || (hasPrimaryButton && 'pb-12')}`}>
        {/* The actual content */}
        {props.children}
      </DialogContent>

      {/* Sticky footer (DialogActions) */}
      {(hasSecondaryButton || hasPrimaryButton) && (
        <div className="sticky bottom-0 bg-white border-t">
          <DialogActions>
            {hasSecondaryButton && (
              <Button color="secondary" variant="text" onClick={() => props?.handleSecondaryClick?.()} disabled={disableSecondaryButton}>
                {props?.secondaryButonTitle || 'Cancel'}
              </Button>
            )}
            {hasPrimaryButton && (
              <Button
                onClick={handlePrimaryClick}
                startIcon={props?.isPrimaryButtonLoading && <LoadingOutlined />}
                variant="shadow"
                size="large"
                className="py-2 px-7"
                disabled={disablePrimaryButton}
                type="button"
              >
                {props?.primaryButonTitle || 'Save'}
              </Button>
            )}
          </DialogActions>
        </div>
      )}
    </Dialog>
  );
};

export default UniversalPageMobile;
