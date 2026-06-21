import { FilePdfOutlined } from '@ant-design/icons';
import { CardMedia, IconButton, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { getFileNameFromURL } from 'utils/functions';
import mime from 'mime';

export const universalRenderMedia = (fileUrl: string, index: number) => {
  const mimeType = mime.getType(fileUrl)?.split('/');

  if (mimeType) {
    switch (mimeType[0]) {
      case 'image':
        return <CardMedia component="img" src={fileUrl} alt={`Media ${index + 1}`} loading="lazy" className="h-full" />;
      case 'video':
        return <CardMedia component="video" src={fileUrl} controls className="h-full" />;
      default:
        return (
          <Stack
            className="border-2 h-full"
            alignItems="center"
            justifyContent="center"
            minHeight="150px"
            minWidth="250px"
            height="100%"
            sx={{ gap: 1 }}
          >
            <IconButton sx={{ fontSize: '40px' }}>
              <FilePdfOutlined />
            </IconButton>
            <Typography variant="body2" color="textSecondary" className="text-md font-semibold break-all text-center mx-3">
              {getFileNameFromURL(fileUrl)}.{mimeType[1] || 'unknown'}
            </Typography>
          </Stack>
        );
    }
  }

  return null; // Return null or some fallback UI if mimeType is not determined
};
