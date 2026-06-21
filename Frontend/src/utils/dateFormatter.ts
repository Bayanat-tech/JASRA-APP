export const formatDateOnly = (value: string | null): string => {
  if (!value) return '';
  try {
    // Handle DD-MM-YYYY format
    if (value.includes('-')) {
      const [day, month, year] = value.split('-');
      return `${day}/${month}/${year}`;
    }
    // Handle DD/MM/YYYY format
    if (value.includes('/')) {
      return value;
    }
    // Handle ISO dates
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
};

export const convertToInputFormat = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  try {
    // Handle DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    // Handle DD-MM-YYYY format
    if (dateStr.includes('-')) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  } catch {
    return '';
  }
};

export const formatDateForGrid = (value: string | null | undefined): string => {
  if (!value) return '';
  try {
    // Handle DD-MM-YYYY format
    if (value.includes('-')) {
      return value; // Return as is
    }
    // Handle DD/MM/YYYY format
    if (value.includes('/')) {
      const [day, month, year] = value.split('/');
      return `${day}-${month}-${year}`;
    }
    // Handle other formats
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '';
  }
};
