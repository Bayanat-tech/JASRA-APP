import { SortingState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import { Dayjs } from 'dayjs';
import { TTreeItem } from 'pages/Finance/AcTreeFinancePage';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { AuthProps } from 'types/auth';

export const isUserAuthorized = (
  pathName: string[],
  user_permission: AuthProps['user_permission'],
  permissions: AuthProps['permissions']
): boolean => {
  const userPermissionSet = new Set(Object.keys(user_permission ?? {}));

  const result = pathName.some((eachPathname) => {
    const permission = permissions[eachPathname];

    if (permission && !userPermissionSet.has(permission.serial_number.toString())) {
      return true;
    }

    if (permission?.children) {
      return Object.keys(permission.children).some((childKey) => {
        const childPermission = permission.children[childKey];
        return !userPermissionSet.has(childPermission.serial_number.toString());
      });
    }

    return false;
  });

  return result;
};
export const getPathNameList = (pathname: string) => {
  return pathname.split('/').filter(Boolean);
};
export const updatePath = (current_pathname: string, level: number, new_url_path: string) => {
  let currentPathParts = current_pathname.split('/').filter(Boolean);

  if (level <= 0) {
  }

  const adjustedLevel = level;

  if (adjustedLevel >= currentPathParts.length) {
    currentPathParts.push(...Array(adjustedLevel - currentPathParts.length + 1).fill(''));
  }

  currentPathParts = currentPathParts.slice(0, adjustedLevel).concat(new_url_path);

  return `/${currentPathParts.join('/')}`.replace(/\/+$/, '');
};
export const getAccessToken = () => {
  const accessToken = window.localStorage.getItem('serviceToken');
  if (accessToken !== null) {
    return accessToken;
  }
  return window.localStorage.getItem('serviceToken');
};
export const removeExtension = (fileName: string) => {
  return fileName.replace(/\.[^.]+$/, '');
};

export const getFileNameFromURL = (url: string) => {
  const startIndex = url.indexOf('zippfleet-file-');
  const endIndex = url.indexOf('-&-', startIndex + 14);
  const fileName = url.substring(startIndex + 15, endIndex);
  return fileName;
};
export const handleDownload = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = getFileNameFromURL(url);
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error: unknown) {
    const knownError = error as { message: string };
    dispatch(
      openSnackbar({
        open: true,
        message: knownError.message,
        variant: 'alert',
        alert: {
          color: 'error'
        },
        severity: 'error',
        close: true
      })
    );
  }
};
export const titleCase = (sentence: string) => {
  return sentence
    ?.toLowerCase()
    ?.split(' ')
    ?.map(function (word) {
      return word?.replace(word[0], word[0]?.toUpperCase());
    })
    ?.join(' ');
};
export function convertTreeToReverseHierarchy(tree: TTreeItem[]): { [key: string]: string[] } {
  const reverseHierarchy: { [key: string]: string[] } = {};

  function traverseTree(node: TTreeItem, parentLabels: string[]) {
    reverseHierarchy[node.id] = [...parentLabels, node.label];

    for (const child of node.children) {
      traverseTree(child, [...parentLabels, node.label]);
    }
  }

  tree.forEach((node) => {
    traverseTree(node, []);
  });

  return reverseHierarchy;
}
export const handleFilterChange = (value: ISearch['search'], setFilterData: (value: React.SetStateAction<ISearch>) => void) => {
  setFilterData((prevData) => {
    return {
      ...prevData,
      search: value
    };
  });
};
export const handleSortingChange = (sorting: SortingState, setFilterData: (value: React.SetStateAction<ISearch>) => void) => {
  setFilterData((prevData) => {
    return {
      ...prevData,
      sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
    };
  });
};
export const handleChangePagination = (
  page: number,
  rowsPerPage: number,
  setPaginationData: (
    value: React.SetStateAction<{
      page: number;
      rowsPerPage: number;
    }>
  ) => void
) => {
  setPaginationData({ page, rowsPerPage });
};
export const formateAmount = (amount: string | number, digit: number = 2) => {
  return Number.parseFloat((amount ?? 0).toString()).toFixed(digit);
};
export const handleDateChange = (newValue: Dayjs | null, formik: any, field_name: string) => {
  if (newValue?.isValid()) formik.setFieldValue(`${field_name}`, newValue.toISOString());
};
export const snakeCaseToTitleCase = (input: string): string => {
  return input
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
