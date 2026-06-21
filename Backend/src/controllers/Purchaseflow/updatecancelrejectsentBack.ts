import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";
import { notifyUser } from "../../helpers/functions";

interface OutCodeResult {
  outCode: string;
}

interface EmailRow {
  EMAIL_ID: string;
}



export const updateCancelRejectSentBack = async (req: Request, res: Response): Promise<void> => {
    // Sandeep changes made on 23042026 for connection error.
  let connection: oracledb.Connection | undefined;
 connection = await oracleDb.getConnection(); // ✅ assign first
 // changes end.

  try {
    const { LAST_ACTION, REQUEST_NUMBER, COMPANY_CODE, loginid, REMARKS, CREATEPR, LEVEL } = req.body;

   let emailSubject = "";
   let emailMessage = "";
   let eventType = "";
   let finalUserEmails = "";
   let ccEmail = "";

    if (!LAST_ACTION || !REQUEST_NUMBER || !COMPANY_CODE || !loginid || !REMARKS) {
      res.status(400).json({ success: false, message: "Invalid request data" });
      return;
    }

    connection = await oracleDb.getConnection();
    await connection.execute("ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS'");

    const requestNoForDb = REQUEST_NUMBER.replace(/\//g, "$");
    let generatedRequestNumber: string | null = null;

    console.log("STEP:1 Start");
    console.log(`Request Number: ${requestNoForDb}, Last Action: ${LAST_ACTION}`);

   // 1. PO CANCELLATION
    if (REQUEST_NUMBER.includes("PO$")) {
      const formattedDate = new Date().toISOString().split("T")[0];

      await connection.execute(
        `UPDATE PURCHASE_REQUEST_DETAILS
            SET PO_CANCEL = 'Y',
                REASON_FOR_PO_CANCEL = :remarks,
                CANCEL_PO_BY = :loginid,
                PO_CANCEL_DATE = TO_DATE(:dateStr,'YYYY-MM-DD'),
                UPDATED_AT = SYSDATE
          WHERE REF_DOC_NO = :reqNumber
            AND COMPANY_CODE = :companyCode`,
        {
          remarks: REMARKS,
          loginid,
          dateStr: formattedDate,
          reqNumber: requestNoForDb,
          companyCode: COMPANY_CODE,
        }
      );

      console.log("STEP:2 Cancellation Updated");

     if (CREATEPR === "Y") {
        const spResult = await connection.execute(
          `BEGIN PRO_GEN_PR_FOR_CANCEL_PO(:companyCode, :reqNumber, 'BUYER', 'FULL', :outCode); END;`,
          {
            companyCode: COMPANY_CODE,
            reqNumber: requestNoForDb,
            outCode: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
          }
        );

        generatedRequestNumber = (spResult.outBinds as OutCodeResult).outCode || null;
      }

      await connection.execute(
        `BEGIN PROC_LOADMESSAGEBOX(:screen, :type, :doc, :userId, ''); END;`,
        {
          screen: "POCANCEL",
          type: "success",
          doc: "",
          userId: loginid
        }
      );

      await connection.commit();

      await notifyUser({
      event: eventType,
      subject: emailSubject,
      message: emailMessage,
      request_users: finalUserEmails,
      cc: ccEmail,
      htmlMessage: emailMessage,
    });

    res.status(200).json({
        success: true,
        message: generatedRequestNumber
          ? `New PR Generated: ${generatedRequestNumber}`
          : "PO Cancelled Successfully",
        generatedRequestNumber,
      });

      return;
    }

    console.log("STEP:3 PR Sentback Handling");

    // 2. MATERIAL REQUEST SENT BACK
    if (LAST_ACTION === "SENTBACK" && REQUEST_NUMBER.includes("MAT$")) {
      await connection.execute(
        `UPDATE MATERIAL_REQUEST_HEADER
            SET LAST_ACTION = :lastAction,
                UPDATED_AT = SYSDATE,
                UPDATED_BY = :loginid,
                FLOW_LEVEL_RUNNING = :level,
                SENDBACK_HISTRY = NVL(SENDBACK_HISTRY,'') || '; ' || :remarks
          WHERE REQUEST_NUMBER = :reqNumber
            AND COMPANY_CODE = :companyCode`,
        {
          lastAction: LAST_ACTION,
          loginid,
          level: LEVEL,
          remarks: REMARKS,
          reqNumber: requestNoForDb,
          companyCode: COMPANY_CODE,
        }
      );

      await connection.commit();
      res.status(200).json({ 
        success: true, 
        message: "Updated Successfully" 
      });
      return;
    }
   console.log('befor sentback');
   // create a local variable to avoid using reserved word 'level'
   const l_level = LEVEL;

    // 3. NORMAL PR SENT BACK
    if (LAST_ACTION === "SENTBACK") {
      await connection.execute(
       `UPDATE PURCHASE_REQUEST_HEADER
        SET LAST_ACTION = :lastAction,
           UPDATED_AT = SYSDATE,
           UPDATED_BY = :loginid,
           FLOW_LEVEL_RUNNING = :l_level,
           SENDBACK_HISTRY = NVL(SENDBACK_HISTRY,'') || '; ' || TO_CHAR(:remarks)
        WHERE REQUEST_NUMBER = :reqNumber
        AND COMPANY_CODE = :companyCode`,
     {
       lastAction: LAST_ACTION,
       loginid,
       l_level: LEVEL,
       remarks: REMARKS,
       reqNumber: requestNoForDb,
       companyCode: COMPANY_CODE,
      }
    );

     console.log('sentback :', LAST_ACTION, requestNoForDb, COMPANY_CODE, LEVEL);
      console.log('sentback updated');
      await connection.execute(
        `BEGIN PROC_LOADMESSAGEBOX(:screen, :type, :doc, :userId, ''); END;`,
        {
          screen: "PRSENTBACK",
          type: "success",
          doc: "",
          userId: loginid
        }
      );
    } else {
      // other actions (APPROVE/REJECT etc)
      await connection.execute(
        `UPDATE PURCHASE_REQUEST_HEADER
         SET LAST_ACTION = :lastAction,
             UPDATED_AT = SYSDATE,
             UPDATED_BY = :loginid
         WHERE REQUEST_NUMBER = :reqNumber
           AND COMPANY_CODE = :companyCode`,
        {
          lastAction: LAST_ACTION,
          loginid,
          reqNumber: requestNoForDb,
          companyCode: COMPANY_CODE,
        }
      );
    }

    console.log('after other actions:', LAST_ACTION, requestNoForDb, loginid);
    console.log("STEP:4 PR Updated");

    await connection.commit();

    // 4. FETCH CC EMAIL
    const ccResult = await connection.execute<EmailRow>(
      `SELECT sl.email_id AS EMAIL_ID
         FROM PURCHASE_REQUEST_HEADER prh
         LEFT JOIN SEC_LOGIN sl 
           ON prh.CREATED_BY = sl.user_id
        WHERE prh.REQUEST_NUMBER = :reqNumber
          AND ROWNUM = 1`,
      { reqNumber: requestNoForDb },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let ccEmails = ccResult.rows?.[0]?.EMAIL_ID || "";

    console.log('ccResult', ccResult.rows);

    // 5. FETCH USER EMAIL (LAST_UPDATED)
    const emailResult = await connection.execute<EmailRow>(
      `SELECT email_id AS EMAIL_ID
         FROM SEC_LOGIN
        WHERE LOGINID IN (
              SELECT DISTINCT LAST_UPDATED
              FROM PURCHASE_REQUST_RUNING_STATS
              WHERE REQUEST_NUMBER = :reqNumber
        )`,
      { reqNumber: requestNoForDb },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

     const userEmail = emailResult.rows?.[0]?.EMAIL_ID || "";

    console.log("CC Email found:", userEmail);

    if (userEmail.length > 0) {
      let emailSubject = "";
      let emailMessage = "";
      let eventType = "";

      const displayRequestNumber = REQUEST_NUMBER.replace(/\$/g, "/");

      switch (LAST_ACTION.toUpperCase()) {
        case "CANCELLED":
          eventType = "CANCEL";
          emailSubject = `Purchase Request ${displayRequestNumber} Cancelled`;
          emailMessage = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
              /* Reset styles */
              * { 
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body { 
                  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #333;
                  -webkit-text-size-adjust: 100%;
                  margin: 0;
                  padding: 10px;
                  background-color: #f5f5f5;
              }
              
              .container { 
                  max-width: 600px; 
                  width: 100%;
                  margin: 0 auto; 
                  background-color: #ffffff; 
                  border-radius: 8px; 
                  border: 1px solid #2c3e50;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              @media screen and (max-width: 480px) {
                  body {
                      padding: 5px;
                  }
                  
                  .container {
                      margin: 0;
                      border-radius: 0;
                      border-left: none;
                      border-right: none;
                  }
                  
                  .content {
                      padding: 10px !important;
                  }
                  
                  .detail-row {
                      padding: 8px 5px !important;
                  }
                  
                  .detail-label, .detail-value {
                      font-size: 13px !important;
                  }
                  
                  .header h1 {
                      font-size: 16px !important;
                  }
                  
                  .notification-header {
                      font-size: 14px !important;
                      padding: 8px 5px !important;
                  }
                  
                  .footer {
                      font-size: 11px !important;
                      padding: 10px 5px !important;
                  }
              }
              
              .header { 
                  background-color: #2c3e50; 
                  color: white; 
                  padding: 15px 10px;
                  text-align: center;
              }
              
              .header h1 { 
                  margin: 0;
                  font-size: clamp(16px, 4vw, 20px);
                  word-spacing: 4px;
              }
              
              .notification-header { 
                  background-color: #ecf0f1; 
                  padding: 12px 10px;
                  text-align: center; 
                  font-weight: bold;
                  font-size: clamp(14px, 3.5vw, 16px);
                  color: #666;
              }
              
              .content { 
                  padding: 15px;
              }
              
              .detail-row { 
                  margin-bottom: 8px; 
                  display: flex; 
                  flex-direction: column;
                  padding: 8px;
                  border-bottom: 1px solid #eee;
              }
              
              @media screen and (max-width: 480px) {
                .no-border-mobile {
                    border-bottom: none !important;
                }
              }
              
              @media screen and (min-width: 481px) {
                  .detail-row {
                      flex-direction: row;
                      align-items: flex-start;
                  }
                  
                  .detail-label {
                      width: 150px;
                      padding-right: 15px;
                      text-align: right;
                  }
                  
                  .detail-value {
                      flex: 1;
                  }
              }
              
              .detail-label { 
                  font-weight: bold; 
                  color: #7f8c8d;
                  margin-bottom: 4px;
                  font-size: clamp(13px, 3.2vw, 15px);
              }
              
              .detail-value { 
                  padding-left: 8px;
                  font-size: clamp(13px, 3.2vw, 15px);
                  word-break: break-word;
              }
              
              .footer { 
                  padding: 15px 10px;
                  text-align: center;
                  font-size: clamp(11px, 2.8vw, 13px);
                  color: #000000;
                  border-top: 1px solid #2c3e50;
                  background-color: transparent;
              }
              
              .link { 
                  color: #3498db; 
                  text-decoration: none;
                  word-break: break-all;
                  display: inline-block;
                  padding: 4px 0;
              }
              
              .link:hover {
                  text-decoration: underline;
              }

              /* Tablet Styles */
              @media screen and (min-width: 768px) {
                  .detail-row {
                      flex-direction: row;
                      align-items: center;
                  }
                  
                  .detail-label {
                      width: 150px;
                      margin-bottom: 0;
                      padding-right: 15px;
                  }
                  
                  .footer {
                      text-align: right;
                  }
              }
          </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>N O T I F I C A T I O N</h1>
                    </div>
                    <div class="notification-header">
                        Purchase Request Cancelled
                    </div>
                    <div class="content">
                        <div class="detail-row no-border-mobile">
                            <span class="detail-label">Request Number:</span>
                            <span class="detail-value">${REQUEST_NUMBER}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">Cancelled</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Remarks:</span>
                            <span class="detail-value">${REMARKS}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Action By:</span>
                            <span class="detail-value">${loginid}</span>
                        </div>
                        <div class="detail-row no-border-mobile">
                            <span class="detail-label">Action Date:</span>
                            <span class="detail-value">${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="footer">
                        Powered by Bayanat Technology – Procurement Management System (PMS)
                    </div>
                </div>
            </body>
            </html>`;
          break;
        case "SENTBACK":
          eventType = "SENTBACK";
          emailSubject = `Purchase Request ${displayRequestNumber} Sent Back`;
          emailMessage = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
              /* Reset styles */
              * { 
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body { 
                  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #333;
                  -webkit-text-size-adjust: 100%;
                  margin: 0;
                  padding: 10px;
                  background-color: #f5f5f5;
              }
              
              .container { 
                  max-width: 600px; 
                  width: 100%;
                  margin: 0 auto; 
                  background-color: #ffffff; 
                  border-radius: 8px; 
                  border: 1px solid #2c3e50;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              @media screen and (max-width: 480px) {
                  body {
                      padding: 5px;
                  }
                  
                  .container {
                      margin: 0;
                      border-radius: 0;
                      border-left: none;
                      border-right: none;
                  }
                  
                  .content {
                      padding: 10px !important;
                  }
                  
                  .detail-row {
                      padding: 8px 5px !important;
                  }
                  
                  .detail-label, .detail-value {
                      font-size: 13px !important;
                  }
                  
                  .header h1 {
                      font-size: 16px !important;
                  }
                  
                  .notification-header {
                      font-size: 14px !important;
                      padding: 8px 5px !important;
                  }
                  
                  .footer {
                      font-size: 11px !important;
                      padding: 10px 5px !important;
                  }
              }
              
              .header { 
                  background-color: #2c3e50; 
                  color: white; 
                  padding: 15px 10px;
                  text-align: center;
              }
              
              .header h1 { 
                  margin: 0;
                  font-size: clamp(16px, 4vw, 20px);
                  word-spacing: 4px;
              }
              
              .notification-header { 
                  background-color: #ecf0f1; 
                  padding: 12px 10px;
                  text-align: center; 
                  font-weight: bold;
                  font-size: clamp(14px, 3.5vw, 16px);
                  color: #666;
              }
              
              .content { 
                  padding: 15px;
              }
              
              .detail-row { 
                  margin-bottom: 8px; 
                  display: flex; 
                  flex-direction: column;
                  padding: 8px;
                  border-bottom: 1px solid #eee;
              }
              
              @media screen and (max-width: 480px) {
                .no-border-mobile {
                    border-bottom: none !important;
                }
              }
              
              @media screen and (min-width: 481px) {
                  .detail-row {
                      flex-direction: row;
                      align-items: flex-start;
                  }
                  
                  .detail-label {
                      width: 150px;
                      padding-right: 15px;
                      text-align: right;
                  }
                  
                  .detail-value {
                      flex: 1;
                  }
              }
              
              .detail-label { 
                  font-weight: bold; 
                  color: #7f8c8d;
                  margin-bottom: 4px;
                  font-size: clamp(13px, 3.2vw, 15px);
              }
              
              .detail-value { 
                  padding-left: 8px;
                  font-size: clamp(13px, 3.2vw, 15px);
                  word-break: break-word;
              }
              
              .footer { 
                  padding: 15px 10px;
                  text-align: center;
                  font-size: clamp(11px, 2.8vw, 13px);
                  color: #000000;
                  border-top: 1px solid #2c3e50;
                  background-color: transparent;
              }
              
              .link { 
                  color: #3498db; 
                  text-decoration: none;
                  word-break: break-all;
                  display: inline-block;
                  padding: 4px 0;
              }
              
              .link:hover {
                  text-decoration: underline;
              }

              /* Tablet Styles */
              @media screen and (min-width: 768px) {
                  .detail-row {
                      flex-direction: row;
                      align-items: center;
                  }
                  
                  .detail-label {
                      width: 150px;
                      margin-bottom: 0;
                      padding-right: 15px;
                  }
                  
                  .footer {
                      text-align: right;
                  }
              }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>N O T I F I C A T I O N</h1>
                    </div>
                    <div class="notification-header">
                        Purchase Request Sent Back
                    </div>
                    <div class="content">
                        <div class="detail-row no-border-mobile">
                            <span class="detail-label">Request Number:</span>
                            <span class="detail-value">${REQUEST_NUMBER}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">Sent Back</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Remarks:</span>
                            <span class="detail-value">${REMARKS}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Action By:</span>
                            <span class="detail-value">${loginid}</span>
                        </div>
                        <div class="detail-row no-border-mobile">
                            <span class="detail-label">Action Date:</span>
                            <span class="detail-value">${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="footer">
                        Powered by Bayanat Technology – Procurement Management System (PMS)
                    </div>
                </div>
            </body>
            </html>`;
          break;
        case "REJECTED":
          eventType = "REJECT";
          emailSubject = `Purchase Request ${displayRequestNumber} Rejected`;
          emailMessage = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
              /* Reset styles */
              * { 
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body { 
                  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #333;
                  -webkit-text-size-adjust: 100%;
                  margin: 0;
                  padding: 10px;
                  background-color: #f5f5f5;
              }
              
              .container { 
                  max-width: 600px; 
                  width: 100%;
                  margin: 0 auto; 
                  background-color: #ffffff; 
                  border-radius: 8px; 
                  border: 1px solid #2c3e50;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              
              @media screen and (max-width: 480px) {
                  body {
                      padding: 5px;
                  }
                  
                  .container {
                      margin: 0;
                      border-radius: 0;
                      border-left: none;
                      border-right: none;
                  }
                  
                  .content {
                      padding: 10px !important;
                  }
                  
                  .detail-row {
                      padding: 8px 5px !important;
                  }
                  
                  .detail-label, .detail-value {
                      font-size: 13px !important;
                  }
                  
                  .header h1 {
                      font-size: 16px !important;
                  }
                  
                  .notification-header {
                      font-size: 14px !important;
                      padding:  8px 5px !important;
                  }
                  
                  .footer {
                      font-size: 11px !important;
                      padding: 10px 5px !important;
                  }
              }
              
              .header { 
                  background-color: #2c3e50; 
                  color: white; 
                  padding: 15px 10px;
                  text-align: center;
              }
              
              .header h1 { 
                  margin: 0;
                  font-size: clamp(16px, 4vw, 20px);
                  word-spacing: 4px;
              }
              
              .notification-header { 
                  background-color: #ecf0f1; 
                  padding: 12px 10px;
                  text-align: center; 
                  font-weight: bold;
                  font-size: clamp(14px, 3.5vw, 16px);
                  color: #666;
              }
              
              .content { 
                  padding: 15px;
              }
              
              .detail-row { 
                  margin-bottom: 8px; 
                  display: flex; 
                  flex-direction: column;
                  padding: 8px;
                  border-bottom: 1px solid #eee;
              }
              
              @media screen and (max-width: 480px) {
                .no-border-mobile {
                    border-bottom: none !important;
                }
              }
              
              @media screen and (min-width: 481px) {
                  .detail-row {
                      flex-direction: row;
                      align-items: flex-start;
                  }
                  
                  .detail-label {
                      width: 150px;
                      padding-right: 15px;
                      text-align: right;
                  }
                  
                  .detail-value {
                      flex: 1;
                  }
              }
              
              .detail-label { 
                  font-weight: bold; 
                  color: #7f8c8d;
                  margin-bottom: 4px;
                  font-size: clamp(13px, 3.2vw, 15px);
              }
              
              .detail-value { 
                  padding-left: 8px;
                  font-size: clamp(13px, 3.2vw, 15px);
                  word-break: break-word;
              }
              
              .footer { 
                  padding: 15px 10px;
                  text-align: center;
                  font-size: clamp(11px, 2.8vw, 13px);
                  color: #000000;
                  border-top: 1px solid #2c3e50;
                  background-color: transparent;
              }
              
              .link { 
                  color: #3498db; 
                  text-decoration: none;
                  word-break: break-all;
                  display: inline-block;
                  padding: 4px 0;
              }
              
              .link:hover {
                  text-decoration: underline;
              }
          </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>N O T I F I C A T I O N</h1>
                    </div>
                    <div class="notification-header">
                        Purchase Request Rejected
                    </div>
                    <div class="content">
                        <div class="detail-row no-border-mobile">
                            <span class="detail-label">Request Number:</span>
                            <span class="detail-value">${REQUEST_NUMBER}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">Rejected</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Remarks:</span>
                            <span class="detail-value">${REMARKS}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Action By:</span>
                            <span class="detail-value">${loginid}</span>
                        </div>
                        <div class="detail-row no-border-mobile">
                            <span class="detail-label">Action Date:</span>
                            <span class="detail-value">${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="footer">
                        Powered by Bayanat Technology – Procurement Management System (PMS)
                    </div>
                </div>
            </body>
            </html>`;
          break;
        }
      console.log(`Sending email notification for event: ${eventType}`);
      console.log("Email subject:", emailSubject);

    if (emailSubject && emailMessage && eventType) {
        try {
          await notifyUser({
            event: eventType,
            subject: emailSubject,
            message: emailMessage,
            request_users: userEmail,
            cc: ccEmail,
            htmlMessage: emailMessage,
          });
          console.log("Email notification sent successfully");
        } catch (error) {
          console.error("Failed to send email notification:", error);
        }
      }
    } else {
      console.log("No email addresses found for notification");
    }

    res.status(200).json({
      success: true,
      message: "Updated Successfully",
      ccEmail
    });
  
  } catch (error) {
    console.error("Error occurred, rolling back transaction:", error);
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: "Update Unsuccessful" });
  } finally {
    if (connection) await connection.close();
  }
};
