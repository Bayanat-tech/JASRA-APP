import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import 'assets/css/boldreport-custom.css';

// Fix CSS import path

declare global {
  interface Window {
    $: typeof $;
    jQuery: typeof $;
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    createReactClass: typeof createReactClass;
    currentItem?: {
      name: string;
      categoryName: string;
      datasetName?: string;
    };
  }
}

// Initialize globals
window.$ = window.jQuery = $;
window.React = React;
window.ReactDOM = ReactDOM;
window.createReactClass = createReactClass;

// Now import Bold Reports
require('@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min');
require('@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min');
require('@boldreports/javascript-reporting-controls/Content/v2.0/tailwind-light/bold.report-viewer.min.css');
require('@boldreports/react-reporting-components/Scripts/bold.reports.react.min');

export {};
