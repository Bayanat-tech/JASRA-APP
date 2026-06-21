import { TextField } from '@mui/material'; // Importing TextField component from Material-UI
import { Dispatch } from 'react'; // Importing Dispatch type from React

/**
 * PasswordForm component
 *
 * @param {string} password - The current password value
 * @param {Dispatch<React.SetStateAction<string>>} setPassword - Function to update the password state
 *
 * @returns {JSX.Element} The rendered PasswordForm component
 */
const PasswordForm = ({ password, setPassword }: { password: string; setPassword: Dispatch<React.SetStateAction<string>> }) => {
  return (
    <>
      <TextField
        type="password" // Input type set to password
        value={password} // Controlled component value
        onChange={(e) => setPassword(e.target.value)} // Update password state on change
        fullWidth // Make the input field take full width
        id="outlined-basic" // ID for the input field
        variant="outlined" // Variant of the input field
        name="password" // Name attribute for the input field
      />
    </>
  );
};

export default PasswordForm; // Exporting the PasswordForm component as default
