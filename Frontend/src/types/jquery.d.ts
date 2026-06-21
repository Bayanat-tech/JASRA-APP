// Type definitions for jQuerys
declare module 'jquery' {
  interface JQueryStatic {
    (selector: string | Element): JQuery;
  }

  interface JQuery {
    data(key: string): any;
    boldReportDesigner(): any;
  }

  const jQuery: JQueryStatic;
  export = jQuery;
}

declare global {
  interface Window {
    $: JQueryStatic;
    jQuery: JQueryStatic;
  }
}

declare const $: JQueryStatic;
declare const jQuery: JQueryStatic;
