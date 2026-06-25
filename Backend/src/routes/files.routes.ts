import * as express from "express";
import multer from "multer";
import passport from "passport";
import {
  deleteFiles,
  editFiles,
  editPFFiles,
  getFiles,
  getpfFiles,
  deleteFilesPF,
  getHrVendorFiles,
  editHrVendorFiles,
  deleteHrVendorFiles,
  getFilesBySrNo,
  getAllVendorFiles,
} from "../controllers/files.controller";
import { checkUserAuthorization } from "../middleware/checkUserAthorization";

import {
  uploadToS3,
  uploadPFToS3,
  uploadVendorAttachmentToS3,
  uploadEmployeeAttachmentToS3,
} from "../services/ociUpload.service";

import { JSdeleteEmployeeFiles, JSeditEmployeeFiles, JSgetEmployeeFiles } from "../jasra/controllers/JSfiles.controller";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    next(null, true);
  },
});
//------------import/export------

//----------file----------
router.get(
  "/:request_number",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getFiles
);

//----------PFfile----------
router.get(
  "/purchaseRequest/:request_number",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getpfFiles
);

//------Vendor files----------
router.get(
  "/vendor/:request_number",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getHrVendorFiles
);

//------Employee files----------
router.put(
  "/editFiles",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  editFiles
);

router.put(
  "/editPFFile",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  editPFFiles
);

router.put(
  "/editVendorFile",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  editHrVendorFiles
);

router.get(
  "/getFilesBySrNo/:request_number/:sr_no",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getFilesBySrNo
);

router.get(
  "/getAllVendorFiles/:request_number",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getAllVendorFiles
);

router.post(
  "/upload",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  upload.single("file"),
  uploadToS3
);

router.post(
  "/uploadFilePf",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  upload.single("file"),
  uploadPFToS3
);

router.post(
  "/uploadVendorAttachment",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  upload.single("file"),
  uploadVendorAttachmentToS3
);

router.post(
  "/uploadEmployeeAttachment",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  upload.single("file"),
  uploadEmployeeAttachmentToS3
);

router.delete(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  deleteFiles
);

router.delete(
  "/deletePF/:request_number/:sr_no",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  deleteFilesPF
);

router.delete(
  "/deleteVendorAttachment/:request_number/:sr_no/:attachment_sr_no?",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  deleteHrVendorFiles
);

//Jasra LMS Files routes 

router.get(
  "/JS/employees/:request_number",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  JSgetEmployeeFiles 
);

router.put(
  "/editEmployeeFile",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  JSeditEmployeeFiles
);

router.delete(
  "/deleteEmployeeFiles/:request_number(.+)/:sr_no",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  JSdeleteEmployeeFiles
);

export default router;
