import { ReactElement } from 'react';

export type TAvailableActionButtons =
  | 'add_action'
  | 'view'
  | 'delete'
  | 'edit'
  | 'suspend'
  | 'unsuspend'
  | 'print'
  | 'cancel'
  | 'sentback'
  | 'reject';

export type TActionButtonGroupProps = {
  handleActions: (arg0: string) => void;
  buttons?: TAvailableActionButtons[];
  canceled?: string;
  disabled?: { [K in TAvailableActionButtons]?: boolean };
};

export type TActionButtons = {
  action: TAvailableActionButtons;
  icon: ReactElement;
  tooltip?: string;
  disabled?: boolean;
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'secondary' | 'error';
};
