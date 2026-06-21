// import Cropper from 'cropperjs';

import { ChangeEvent, useState } from 'react';
// material-ui
import { Button, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { styled } from '@mui/material/styles';
// project import
import IconButton from 'components/@extended/IconButton';
// assets
import { CloseOutlined, CloudUploadOutlined, ExclamationCircleFilled, FileImageOutlined } from '@ant-design/icons';
import CustomTooltip from 'components/CustomTooltip';
import FileUploadServiceInstance from 'service/services.files';
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1.25),
    paddingRight: theme.spacing(2)
  }
}));
export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}
const BootstrapDialogTitle = ({ children, onClose, ...other }: DialogTitleProps) => (
  <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
    {children}
    {onClose ? (
      <IconButton
        aria-label="close"
        onClick={onClose}
        color="secondary"
        sx={{
          position: 'absolute',
          right: 10,
          top: 10
        }}
      >
        <CloseOutlined />
      </IconButton>
    ) : null}
  </DialogTitle>
);
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});
type ImageCropProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (arg0: any) => void;
  dialogTitle: string;
  aspectRatio?: number;
  Image?: string;
};
const ImageCrop = (props: ImageCropProps) => {
  const { open, onClose, onSubmit, dialogTitle = null } = props;
  /** selected image */
  const [selectedImage, setSelectedImage] = useState<string | null | undefined>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [isErrorInUploadImages, setIsErrorInUploadImages] = useState<boolean>(false);
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedImage(null);
    let selectedFile;
    if (event.target.files) {
      selectedFile = event?.target.files[0];
    }
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setIsErrorInUploadImages(true);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          setSelectedImage(e.target.result ? String(e.target.result) : null);
        }
      };
      setSelectedImageName(selectedFile.name);
      reader.readAsDataURL(selectedFile);
    }
  };
  const dataURLtoBlob = (dataURL: string) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };
  const handleFileUploadSubmit = async () => {
    setIsFileUploading(true);
    if (selectedImage) {
      const blob = dataURLtoBlob(selectedImage);
      const response: { success: boolean; data?: any } | undefined = await FileUploadServiceInstance.uploadFile(blob, selectedImageName);
      if (response && response.success) {
        setIsFileUploading(false);
        onSubmit(response?.data);
      }
    }
  };
  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };
  return (
    <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} maxWidth={'sm'} fullWidth>
      <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
        {dialogTitle ? dialogTitle : 'Upload File'}
      </BootstrapDialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <div className="w-full flex flex-col space-y-2">
          {selectedImage ? (
            <CardMedia src={selectedImage} component={'img'} />
          ) : (
            props?.Image && <CardMedia src={props?.Image} component={'img'} />
          )}
          {!selectedImage && (
            <div className="flex justify-center space-x-3">
              <Button component="label" startIcon={<FileImageOutlined />} variant="dashed">
                Upload New File <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImageChange} />
              </Button>
              {isErrorInUploadImages && (
                <CustomTooltip message={`Please upload an image.`}>
                  <ExclamationCircleFilled className="text-xl text-red-500 " />
                </CustomTooltip>
              )}
            </div>
          )}
        </div>
      </DialogContent>
      {selectedImage && (
        <DialogActions>
          <Button
            disabled={!selectedImage || isFileUploading}
            variant="contained"
            onClick={handleFileUploadSubmit}
            startIcon={<CloudUploadOutlined />}
            component="label"
          >
            Upload image
          </Button>
        </DialogActions>
      )}
    </BootstrapDialog>
  );
};
export default ImageCrop;
