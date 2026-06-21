import { ReactNode } from 'react';

export type JobReportsT = {
  reportid: string;
  reportname: string;
};

export type ActionButton = {
  title: ReactNode | string;
  icon: ReactNode;
  key: string;
  handler?: () => void;
};

export type TableActionButtons = {
  [key: string]: ActionButton;
};
