import { useRef, useCallback } from 'react';

/**
 * Hook to isolate report components in their own container
 * Provides print functionality that only prints the report, not the entire page
 */
export const useReportContainer = (reportName: string = 'Report') => {
    const containerRef = useRef<HTMLDivElement>(null);

    const printReport = useCallback(() => {
        if (!containerRef.current) {
            console.error('Container ref not available');
            return;
        }

        // Find the report page element (adjust selector based on report component)
        const reportPage = containerRef.current.querySelector('[data-report-page]') as HTMLElement;
        
        if (!reportPage) {
            console.error('Report page element not found');
            return;
        }

        // Get all styles from the document
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(el => {
                if (el.tagName === 'STYLE') {
                    return (el as HTMLStyleElement).textContent || '';
                }
                return '';
            })
            .join('\n');

        // Create a new window for printing
        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) {
            console.error('Could not open print window');
            return;
        }

        // Clone only the report page
        const clonedPage = reportPage.cloneNode(true) as HTMLElement;

        // Create clean print HTML
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportName} - Print</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        ${styles}
        
        body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        [class*="no-print"],
        [class*="toolbar"],
        [class*="grand-bar"],
        .no-print {
            display: none !important;
        }
    </style>
</head>
<body>
    ${clonedPage.outerHTML}
</body>
</html>`;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load and then print
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            // Don't close immediately to let user see print dialog
            setTimeout(() => {
                printWindow.close();
            }, 500);
        }, 300);
    }, [reportName]);

    return {
        containerRef,
        printReport,
    };
};

export default useReportContainer;
