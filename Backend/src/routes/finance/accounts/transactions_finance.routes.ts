// Import required Express framework
import * as express from "express";

// Import transaction-related controller functions
import {
  // Document Creation Controllers
  createChequePaymentDocument, // Creates single cheque payment
  createBulkTransactionDocument, // Creates multiple transactions

  // Information Retrieval Controllers
  getChequeDetail, // Gets cheque-specific information
  getChequePaymentDetail, // Gets payment transaction details
  getChequePaymentHeader, // Gets payment header information
  getChequePaymentReport, // Generates payment reports
  getChildTableName, // Gets related table names
  getCompanyInfo, // Retrieves company information
  getDefaultTransactionDetails, // Gets default transaction values

  // Document Modification Controllers
  updateChequePaymentDocument, // Updates payment documents
  cancelDocument, // Cancels existing documents

  // Document Deletion Controllers
  deleteChildrenItem, // Removes child records
  deleteDetailItem, // Removes detail records
  deleteDocument, // Deletes entire documents

  // Export Controller
  exportTransactionDocument,
  createChequePaymentStoreProcess, // Exports transaction data
} from "../../../controllers/finance/accounts/transactions/transactionFinance.controller";

// Initialize Express router
const router = express.Router();

//-------------Transaction Routes--------------

// GET Routes - Information Retrieval
router.get("/company_info", getCompanyInfo);                    // Get company details
router.get("/default_details", getDefaultTransactionDetails);   // Get default values
router.get("/cheque_detail", getChequeDetail);                  // Get cheque information
router.get("/header/:doc_no", getChequePaymentHeader);          // Get payment header by document number
router.get("/detail/:doc_no", getChequePaymentDetail);          // Get payment details by document number
router.get("/table_name/:ac_code", getChildTableName);          // Get related table name by account code
router.get("/document_report", getChequePaymentReport);         // Generate payment report
router.get("/export", exportTransactionDocument);               // Export transaction data

// POST Routes - Document Creation
router.post("/document/bulk", createBulkTransactionDocument);   // Create multiple transactions
router.post("/document", createChequePaymentDocument);          // Create single cheque payment
router.post("/document/storeProcess", createChequePaymentStoreProcess); 

// PUT Routes - Document Updates
router.put("/document", updateChequePaymentDocument);           // Update payment document
router.put("/cancel_cheque", cancelDocument);                   // Cancel existing document

// DELETE Routes - Record Removal
router.delete("/document/:doc_type", deleteDocument);           // Delete document by type
router.delete("/detail_item/delete", deleteDetailItem);         // Delete detail record
router.delete("/children_item/delete", deleteChildrenItem);     // Delete child records

// Export the configured router
export default router;

/* Router Purpose:
This router manages financial transaction endpoints with:
- Comprehensive cheque payment operations
- Transaction document management
- Information retrieval endpoints
- Report generation capabilities
- Export functionality

Endpoint Groups:
1. Information Retrieval (GET):
   - Company and default information
   - Cheque and payment details
   - Document reports and exports

2. Document Creation (POST):
   - Single cheque payment creation
   - Bulk transaction processing

3. Document Modification (PUT):
   - Payment document updates
   - Cheque cancellation

4. Record Deletion (DELETE):
   - Document removal
   - Detail record deletion
   - Child record removal

Security Considerations:
- Ensure proper authentication for all routes
- Validate document ownership before modifications
- Implement proper authorization checks
- Maintain audit trail for all operations

Error Handling:
- All routes should include proper error handling
- Validate input parameters
- Check for document existence before operations
- Maintain transaction integrity
*/
