import { ButtonGroup, Radio } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { TExpenseSubType, TExpenseType, TTax } from 'pages/accounts/transaction/types/transaction.types';
import { TAccountChildren } from 'pages/Finance/types/acTree.types';
import { TJobInboundWms } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
import { TPickingItemPreference } from 'pages/WMS/Transaction/outbound/types/pickingDetails.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TDepartment } from 'pages/WMS/types/department-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { TAcPayee, TBankTransaction } from 'types/columns.types';

const useColumn = (selectedItem: string) => {
  const customerColumns = useMemo<ColumnDef<TPickingItemPreference>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.cust_code,

        id: 'cust_code',
        header: () => <FormattedMessage id="Customer Code" />
      },
      {
        accessorFn: (row) => row.cust_name,

        id: 'cust_name',
        header: () => <FormattedMessage id="Customer Name" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const orderColumns = useMemo<ColumnDef<TPickingItemPreference>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.order_no,

        id: 'order_no',
        header: () => <FormattedMessage id="Order no" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const productColumns = useMemo<ColumnDef<TPickingItemPreference>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.prod_code,

        id: 'prod_code',
        header: () => <FormattedMessage id="Product Code" />
      },
      {
        accessorFn: (row) => row.prod_name,

        id: 'prod_name',
        header: () => <FormattedMessage id="Product Name" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const bankColumns = useMemo<ColumnDef<TBankTransaction>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.ac_code,

        id: 'ac_code',
        header: () => <FormattedMessage id="Bank Code" />
      },
      {
        accessorFn: (row) => row.ac_name,

        id: 'ac_name',
        header: () => <FormattedMessage id="Bank Name" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const acPayeeColumns = useMemo<ColumnDef<TAcPayee>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.ac_payee,

        id: 'ac_payee',
        header: () => <FormattedMessage id="Ac Payee" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const divisionColumns = useMemo<ColumnDef<TDivision>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.div_code,

        id: 'div_code',
        header: () => <FormattedMessage id="Code" />
      },
      {
        accessorFn: (row) => row.div_name,

        id: 'div_name',
        header: () => <FormattedMessage id="Division Name" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const currencyColumns = useMemo<ColumnDef<TCurrency>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.curr_code,

        id: 'curr_code',
        header: () => <FormattedMessage id="Code" />
      },
      {
        accessorFn: (row) => row.curr_name,

        id: 'curr_name',
        header: () => <FormattedMessage id="Cuurency Name" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const accountColumns = useMemo<ColumnDef<TAccountChildren>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.ac_code,

        id: 'ac_code',
        header: () => <FormattedMessage id="Code" />
      },
      {
        accessorFn: (row) => row.ac_name,

        id: 'ac_name',
        header: () => <FormattedMessage id="Account Name" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const taxColumns = useMemo<ColumnDef<TTax>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.tx_compntcat_code,

        id: 'tx_compntcat_code',
        header: () => <FormattedMessage id="Tax Code" />
      },
      {
        accessorFn: (row) => row.tx_compntcat_name,

        id: 'tx_compntcat_name',
        header: () => <FormattedMessage id="Tax Description" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const departmentColumns = useMemo<ColumnDef<TDepartment>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.dept_code,

        id: 'dept_code',
        header: () => <FormattedMessage id="Department Code" />
      },
      {
        accessorFn: (row) => row.dept_name,

        id: 'dept_name',
        header: () => <FormattedMessage id="Department Name" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const expenseTypeColumns = useMemo<ColumnDef<TExpenseType>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.exp_code,

        id: 'exp_code',
        header: () => <FormattedMessage id="Expense Code" />
      },
      {
        accessorFn: (row) => row.exp_description,

        id: 'exp_description',
        header: () => <FormattedMessage id="Expense Description" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const expenseSubTypeColumns = useMemo<ColumnDef<TExpenseSubType>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        accessorFn: (row) => row.exp_subtype_code,

        id: 'exp_subtype_code',
        header: () => <FormattedMessage id="Expense Sub Type Code" />
      },
      {
        accessorFn: (row) => row.exp_subtype_description,

        id: 'exp_subtype_description',
        header: () => <FormattedMessage id="Expense Type Description" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const jobNoColumns = useMemo<ColumnDef<TJobInboundWms>[]>(
    () => [
      {
        id: 'select-col',
        cell: ({ row }) => (
          <ButtonGroup>
            <Radio
              key={selectedItem}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </ButtonGroup>
        )
      },
      {
        id: 'job_detail',
        accessorFn: (row) => row.job_no,
        header: () => <FormattedMessage id="Job No" />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedItem]
  );
  const selectedColumn = useMemo(() => {
    switch (selectedItem) {
      case 'cust_code':
        return customerColumns;
      case 'order_no':
        return orderColumns;
      case 'prod_code':
      case 'product':
        return productColumns;
      case 'bank':
        return bankColumns;
      case 'ac_payee':
        return acPayeeColumns;
      case 'division':
        return divisionColumns;
      case 'currency':
        return currencyColumns;
      case 'account':
      case 'ac_code_search':
        return accountColumns;
      case 'tax':
        return taxColumns;
      case 'department':
        return departmentColumns;
      case 'expense_type':
        return expenseTypeColumns;
      case 'expense_sub_type':
        return expenseSubTypeColumns;
      case 'job_detail':
        return jobNoColumns;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);
  return selectedColumn;
};
export default useColumn;
