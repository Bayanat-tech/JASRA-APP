import React, { forwardRef } from 'react';

/**
 * Higher-Order Component to wrap report components
 * Provides isolated container and enhanced print functionality
 * 
 * Usage:
 * ```tsx
 * const IsolatedBudgetReport = withReportContainer(BudgetStatusReport, 'Budget Status Report');
 * 
 * <IsolatedBudgetReport required_values={values} />
 * ```
 */
export const withReportContainer = <P extends Record<string, any>>(
    Component: React.ForwardRefExoticComponent<P & React.RefAttributes<HTMLDivElement>>,
    reportName: string = 'Report'
) => {
    const Wrapped = forwardRef<HTMLDivElement, P>((props, ref) => {
        const handlePrintReport = () => {
            if (!ref || typeof ref === 'function') {
                console.error('Invalid ref');
                return;
            }

            const container = ref.current;
            if (!container) {
                console.error('Container not found');
                return;
            }

            // Find the report page
            const reportPage = container.querySelector('[data-report-page]') as HTMLElement;
            if (!reportPage) {
                console.error('Report page element not found');
                return;
            }

            // Collect all styles
            const styles = Array.from(document.querySelectorAll('style'))
                .map(el => (el as HTMLStyleElement).textContent || '')
                .join('\n');

            // Open print window
            const printWindow = window.open('', '', 'width=1200,height=900');
            if (!printWindow) {
                console.error('Could not open print window');
                return;
            }

            // Clone report
            const clonedPage = reportPage.cloneNode(true) as HTMLElement;

            // Create print-safe HTML
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; margin: 0; padding: 0; background: white; }
        ${styles}
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        [class*="no-print"], [class*="toolbar"], [class*="grand-bar"] { display: none !important; }
    </style>
</head>
<body>${clonedPage.outerHTML}</body>
</html>`;

            printWindow.document.write(html);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                setTimeout(() => printWindow.close(), 500);
            }, 300);
        };

        // Store print function on window for access if needed
        if (typeof window !== 'undefined') {
            (window as any)._reportPrint = handlePrintReport;
        }

        return <Component {...(props as P)} ref={ref} />;
    });

    Wrapped.displayName = `withReportContainer(${Component.displayName || Component.name || 'Component'})`;
    return Wrapped as React.ForwardRefExoticComponent<P & React.RefAttributes<HTMLDivElement>>;
};

export default withReportContainer;
