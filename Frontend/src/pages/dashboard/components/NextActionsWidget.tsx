import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

interface Props {
  data: any[];
}

const NextActionsWidget = ({ data }: Props) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
      </Typography>
      <List>
        {data.map((item, index) => (
          <ListItem key={index} divider={index !== data.length - 1}>
            <ListItemText
              primary={item.action}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {item.company}
                  </Typography>
                  {` — Due: ${item.due_date}`}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NextActionsWidget;
