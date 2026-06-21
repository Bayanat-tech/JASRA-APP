import { Request, Response } from "express";
import axios from "axios";

interface BoldReportsExportResponse {
  FileContent: string;
  StatusMessage?: string;
}

export class BoldReportsController {
  private static readonly BOLD_REPORTS_CONFIG = {
    username: "prem@bayanattechnology.com",
    password: "Bayanat@123",
    token:
      "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InByZW1AYmF5YW5hdHRlY2hub2xvZ3kuY29tIiwibmFtZWlkIjoiMSIsInVuaXF1ZV9uYW1lIjoiYmJiN2VhMWQtMjUxOS00ZDNiLTkzMGUtZmMzNGQ5NDM1MWUwIiwiSVAiOiIxNDEuMTQ1LjE1Ni42MyIsImlzc3VlZF9kYXRlIjoiMTc3ODE0MTEyOSIsIm5iZiI6MTc3ODE0MTEyOSwiZXhwIjoxODA5NzM0NDAwLCJpYXQiOjE3NzgxNDExMjksImlzcyI6Imh0dHBzOi8vYm9sZHJlcG9ydHMuYmF5YW5hdHRlY2hub2xvZ3kuY29tL3JlcG9ydGluZy9zaXRlL3NpdGUxIiwiYXVkIjoiaHR0cHM6Ly9ib2xkcmVwb3J0cy5iYXlhbmF0dGVjaG5vbG9neS5jb20vcmVwb3J0aW5nL3NpdGUvc2l0ZTEifQ.c3nQp5DU9mUwXUZvCcNkyueZbXRM1RYGVTpqhxDaCNY",
    viewerServiceUrl:
      "https://boldreports.bayanattechnology.com/reporting/reportservice/api/Viewer",
    designerServiceUrl:
      "https://localhost:5000/reporting/reportservice/api/Designer",
    serverUrl:
      "https://boldreports.bayanattechnology.com/reporting/api/site/site1/",
  };

  public async authorize(req: Request, res: Response) {
    try {
      const userInfo = {
        name: "guest",
        organizationId: "1",
        username: BoldReportsController.BOLD_REPORTS_CONFIG.username,
        password: BoldReportsController.BOLD_REPORTS_CONFIG.password,
      };
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ error: "Authorization failed" });
    }
  }

  public async getReportInfo(req: Request, res: Response) {
    try {
      const result = {
        token: BoldReportsController.BOLD_REPORTS_CONFIG.token,
        serviceUrl: BoldReportsController.BOLD_REPORTS_CONFIG.viewerServiceUrl,
        serverUrl: BoldReportsController.BOLD_REPORTS_CONFIG.serverUrl,
        reportPath: req.query.reportPath,
      };
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to get report info" });
    }
  }

  public async getViewerSettings(req: Request, res: Response) {
    try {
      const result = {
        token: BoldReportsController.BOLD_REPORTS_CONFIG.token,
        serviceUrl: BoldReportsController.BOLD_REPORTS_CONFIG.viewerServiceUrl,
        serverUrl: BoldReportsController.BOLD_REPORTS_CONFIG.serverUrl,
        reportPath: req.body.reportPath,
      };
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to get viewer settings" });
    }
  }

  public async getDesignerSettings(req: Request, res: Response) {
    try {
      const result = {
        token: BoldReportsController.BOLD_REPORTS_CONFIG.token,
        serviceUrl:
          BoldReportsController.BOLD_REPORTS_CONFIG.designerServiceUrl,
        serverUrl: BoldReportsController.BOLD_REPORTS_CONFIG.serverUrl,
      };
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to get designer settings" });
    }
  }

  public static async exportPOAsBase64(
    poNumber: string,
    companyCode: string
  ): Promise<string> {
    try {
      const formattedPoNumber = poNumber.replace(/\$/g, "/");
      const token = BoldReportsController.BOLD_REPORTS_CONFIG.token.replace(
        "bearer ",
        ""
      );

      const data = {
        FilterParameters: JSON.stringify({
          Ref_doc_no: [formattedPoNumber],
          Company_code: [companyCode],
        }),
      };

      // ✅ Typed Axios response
      const response = await axios.post<BoldReportsExportResponse>(
        "https://boldreports.bayanattechnology.com/reporting/api/site/site1/v1.0/reports/8bbf46ec-f74e-4eae-8cbb-d75267826dee/pdf/export-filter",
        data,
        {
          responseType: "json",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.data?.FileContent) {
        throw new Error("Missing FileContent in response.");
      }

      const pdfHeader = Buffer.from(
        response.data.FileContent,
        "base64"
      ).toString("ascii", 0, 5);

      if (pdfHeader !== "%PDF-") {
        throw new Error("Invalid PDF content in FileContent.");
      }

      return response.data.FileContent;
    } catch (error: any) {
      console.error("Error exporting PO:", error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  public static async exportPOCANCELAsBase64(
    poNumber: string,
    companyCode: string
  ): Promise<string> {
    try {
      const formattedPoNumber = poNumber.replace(/\$/g, "/");
      const token = BoldReportsController.BOLD_REPORTS_CONFIG.token.replace(
        "bearer ",
        ""
      );

      const data = {
        FilterParameters: JSON.stringify({
          Ref_doc_no: [formattedPoNumber],
          Company_code: [companyCode],
        }),
      };

      // ✅ Typed Axios response
      const response = await axios.post<BoldReportsExportResponse>(
        "https://boldreports.bayanattechnology.com/reporting/api/site/site1/v1.0/reports/8bbf46ec-f74e-4eae-8cbb-d75267826dee/pdf/export-filter",
        data,
        {
          responseType: "json",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.data?.FileContent) {
        throw new Error("Missing FileContent in response.");
      }

      const pdfHeader = Buffer.from(
        response.data.FileContent,
        "base64"
      ).toString("ascii", 0, 5);

      if (pdfHeader !== "%PDF-") {
        throw new Error("Invalid PDF content in FileContent.");
      }

      return response.data.FileContent;
    } catch (error: any) {
      console.error("Error exporting PO Cancel:", error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }
}
