import { TextField } from '@mui/material';

interface GlobalSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <TextField
      fullWidth
      label="Search"
      variant="outlined"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      sx={{ mb: 2 }}
    />
  );
};

export default GlobalSearch;
