// service/services.download.ts
/**
 * Pure frontend download utility for OCI public URLs
 * No backend required for download operations
 */

export interface DownloadOptions {
  fileName?: string;
  url: string;
  useBlob?: boolean;
}

class DownloadService {
  private static instance: DownloadService;

  private constructor() {}

  static getInstance(): DownloadService {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }
    return DownloadService.instance;
  }

  /**
   * Method 1: Direct download via anchor tag (Most reliable)
   * Works for all file types, no CORS issues
   */
  downloadDirect(options: DownloadOptions): void {
    const { url, fileName } = options;

    if (!url) {
      console.error('No URL provided for download');
      return;
    }

    const link = document.createElement('a');
    link.href = url;

    // Set download attribute with proper filename
    if (fileName) {
      link.download = this.sanitizeFileName(fileName);
    } else {
      // Extract filename from URL if not provided
      const urlFileName = this.extractFileNameFromUrl(url);
      link.download = urlFileName;
    }

    // Set target for external URLs
    if (url.startsWith('http')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
  }

  /**
   * Download single file with OCI URL
   */
  downloadFile(file: any): void {
    const fileUrl = file.awsFileLocn || file.aws_file_locn;
    const fileName = file.userFileName || file.user_file_name || file.orgFileName || file.org_file_name || 'download';

    if (!fileUrl) {
      console.error('No file URL found for download');
      return;
    }

    this.downloadDirect({ url: fileUrl, fileName });
  }

  /**
   * Download group of files (by SR_NO)
   */
  downloadGroup(files: any[], groupName: string = 'files'): void {
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      // Single file: download directly
      this.downloadFile(files[0]);
    } else {
      // Multiple files: download sequentially with delay
      files.forEach((file, index) => {
        setTimeout(() => {
          const fileUrl = file.awsFileLocn || file.aws_file_locn;
          const fileName = `${groupName}_${index + 1}_${file.userFileName || file.orgFileName || 'file'}`;

          if (fileUrl) {
            this.downloadDirect({ url: fileUrl, fileName: this.sanitizeFileName(fileName) });
          }
        }, index * 500); // Stagger downloads by 500ms
      });
    }
  }

  /**
   * Download all files with organization by SR_NO
   */
  downloadAllFiles(files: any[]): void {
    if (!files || files.length === 0) {
      console.warn('No files to download');
      return;
    }

    // Group files by SR_NO
    const groups: Record<string, any[]> = {};

    files.forEach((file) => {
      const srNo = file.srNo || file.sr_no || 0;
      const key = srNo === 0 ? 'Global' : `SR_${srNo}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(file);
    });

    // Download each group with delay between groups
    Object.entries(groups).forEach(([groupName, groupFiles], groupIndex) => {
      setTimeout(() => {
        this.downloadGroup(groupFiles, groupName);
      }, groupIndex * 1000); // 1 second delay between groups
    });
  }

  /**
   * View file in new tab (for viewable files like PDF, images)
   */
  viewFile(file: any): void {
    const fileUrl = file.awsFileLocn || file.aws_file_locn;
    if (fileUrl) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Check if file is viewable in browser
   */
  isViewableInBrowser(file: any): boolean {
    const fileUrl = file.awsFileLocn || file.aws_file_locn;
    if (!fileUrl) return false;

    const ext = this.getFileExtension(fileUrl);
    const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'txt', 'html', 'htm'];
    return viewableExtensions.includes(ext.toLowerCase());
  }

  /**
   * Helper: Extract filename from URL
   */
  private extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      return fileName || 'download';
    } catch {
      // If URL parsing fails, use last part of the string
      const parts = url.split('/');
      return parts[parts.length - 1] || 'download';
    }
  }

  /**
   * Helper: Sanitize filename for download
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_') // Remove invalid characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .trim();
  }

  /**
   * Get file extension from URL
   */
  private getFileExtension(url: string): string {
    const fileName = this.extractFileNameFromUrl(url);
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }
}

export default DownloadService.getInstance();
