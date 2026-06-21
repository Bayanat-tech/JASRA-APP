import React from 'react';
import { Modal as MuiModal, Box, IconButton, Typography, styled, ModalProps as MuiModalProps } from '@mui/material';
import { CloseCircleFilled } from '@ant-design/icons';

interface ModalProps extends Omit<MuiModalProps, 'children'> {
  title: string;
  width?: number | string;
  children: React.ReactNode;
}

const ModalHeader = styled(Box)({
  backgroundColor: '#082a89',
  color: 'white',
  padding: '4px 16px', // Reduced vertical padding (top/bottom) to 4px, kept horizontal padding at 16px
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTopLeftRadius: '4px',
  borderTopRightRadius: '4px',
  minHeight: '40px' // Set a minimum height to ensure the header doesn't get too small
});

const ModalBody = styled(Box)({
  padding: '16px',
  backgroundColor: 'white',
  borderBottomLeftRadius: '4px',
  borderBottomRightRadius: '4px'
});

const ModalContainer = styled(Box)(({ width }: { width?: number | string }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: width || '400px',
  maxWidth: '98vw',
  outline: 'none',
  maxHeight: '90vh',
  overflowY: 'auto'
}));

export const DialogPop: React.FC<ModalProps> = ({ title, width, children, onClose, ...props }) => {
  return (
    <MuiModal onClose={onClose} {...props}>
      <ModalContainer width={width}>
        <ModalHeader>
          <Typography variant="h6" component="h2" style={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={(e) => onClose?.(e, 'backdropClick')} aria-label="close">
            <CloseCircleFilled />
          </IconButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </MuiModal>
  );
};
