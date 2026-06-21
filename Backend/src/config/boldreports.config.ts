export const boldReportsConfig = {
  serverInfo: {
    isHttps: true,
    host: process.env.BOLD_REPORTS_HOST || "localhost",
    port: process.env.BOLD_REPORTS_PORT || "5000",
    site: process.env.BOLD_REPORTS_SITE || "/site/b1879897",
  },
  reportServerAPIUrl: {
    reportRootUrl: `https://${process.env.BOLD_REPORTS_HOST}${process.env.BOLD_REPORTS_SITE}/reports`,
    userKey: `/reporting/api${process.env.BOLD_REPORTS_SITE}/get-user-key`,
    token: `/reporting/api${process.env.BOLD_REPORTS_SITE}/token`,
    export: `/reporting/api${process.env.BOLD_REPORTS_SITE}/v1.0/reports/export`,
    reportList: `/reporting/api${process.env.BOLD_REPORTS_SITE}/v1.0/items?itemtype=Report`,
    categories: `/reporting/api${process.env.BOLD_REPORTS_SITE}/v1.0/items?itemtype=Category`,
  },
  userInfo: {
    username: process.env.BOLD_REPORTS_USERNAME || "prem@bayanattechnology.com",
    password: process.env.BOLD_REPORTS_PASSWORD || "Bayanat@123",
  },
};
