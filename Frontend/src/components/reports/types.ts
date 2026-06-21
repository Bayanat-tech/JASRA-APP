// This file contains TypeScript type definitions for the report items and server details.
interface ReportItem {
  id: string;
  name: string;
  categoryName: string;
  description?: string;
  datasetName?: string;
}

interface ServerDetails {
  serviceUrl: string;
  serverUrl: string;
  token: string;
}

declare global {
  interface Window {
    currentItem?: {
      name: string;
      categoryName: string;
      datasetName?: string;
    };
    items?: ReportItem[];
    info?: ServerDetails;
  }
}

export type { ReportItem, ServerDetails };
