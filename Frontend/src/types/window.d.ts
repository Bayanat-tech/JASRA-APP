// This file is used to extend the Window interface in TypeScript.
interface Window {
  currentItem?: {
    name: string;
    categoryName: string;
    datasetName?: string;
  };
  info?: {
    serviceUrl: string;
    serverUrl: string;
    token: string;
  };
}
