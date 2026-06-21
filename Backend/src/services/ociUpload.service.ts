import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import constants from "../helpers/constants";
import { UploadToS3ObjectInterface } from "../interfaces/common.interface";

// Configure S3 client for OCI S3 Compatibility API
const s3Client = new S3Client({
  region: constants.OCI_S3_COMPATIBILITY.REGION,
  endpoint: constants.OCI_S3_COMPATIBILITY.ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: constants.OCI_S3_COMPATIBILITY.ACCESS_KEY_ID,
    secretAccessKey: constants.OCI_S3_COMPATIBILITY.SECRET_ACCESS_KEY,
  },
});

// AWS S3 client for PF module uploads (uses standard AWS credentials)
// We previously used a separate AWS S3 client for PF uploads.
// PF uploads now use the same OCI-compatible S3 client configured above (`s3Client`).
let awsS3Client: S3Client | null = null; // kept for backward compatibility but not used

export const uploadToS3 = async (req: any, res: any) => {
  const file = req.file;

  const fileName: string = `uploads/${new Date().getFullYear()}/${
    new Date().getMonth() + 1
  }/${file.originalname}`;

  const objectParams: UploadToS3ObjectInterface = {
    Bucket: constants.OCI_S3_COMPATIBILITY.BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(objectParams));

    const URL: string = constants.OCI_S3_COMPATIBILITY.getObjectUrl(fileName);

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: URL,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadPFToS3 = async (req: any, res: any) => {
  const file = req.file;
  const requestNumber = req.body.request_number;
  const requestType = req.body.type;

  const fileName: string = `PMSFiles/${requestType}/${new Date().getFullYear()}/${
    new Date().getMonth() + 1
  }/${requestNumber}/${file.originalname}`;
  try {
    const params = {
      Bucket: constants.OCI_S3_COMPATIBILITY.BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const URL: string = constants.OCI_S3_COMPATIBILITY.getObjectUrl(fileName);

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: URL,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteFileFromS3 = async (awsFileLocation: string) => {
  const params = {
    Bucket: constants.OCI_S3_COMPATIBILITY.BUCKET_NAME,
    Key: awsFileLocation,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete file from OCI: ${error.message}`);
    } else {
      throw new Error("Failed to delete file from OCI: Unknown error occurred");
    }
  }
};

// Delete PF file from AWS S3 (PF uploads use AWS S3)
export const deletePFFromS3 = async (awsFileLocation: string) => {
  if (!awsFileLocation) return;

  // awsFileLocation may be a full URL or a key. Try to extract the key.
  const ociBaseUrl = process.env.OCI_S3_URL ? String(process.env.OCI_S3_URL) : "";
  let key = awsFileLocation;

  if (ociBaseUrl && awsFileLocation.startsWith(ociBaseUrl)) {
    key = awsFileLocation.substring(ociBaseUrl.length + (ociBaseUrl.endsWith("/") ? 0 : 1));
  } else {
    // If URL contains the bucket name, strip up to and including the bucket name
    const bucketName = constants.OCI_S3_COMPATIBILITY.BUCKET_NAME;
    const idx = awsFileLocation.indexOf(bucketName);
    if (idx !== -1) {
      key = awsFileLocation.substring(idx + bucketName.length + 1);
    }
  }

  const params = {
    Bucket: constants.OCI_S3_COMPATIBILITY.BUCKET_NAME,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete PF file from OCI S3: ${error.message}`);
    } else {
      throw new Error("Failed to delete PF file from OCI S3: Unknown error occurred");
    }
  }
};

export const uploadVendorAttachmentToS3 = async (req: any, res: any) => {
  const file = req.file;
  const docNo = req.body.doc_no;

  const fileName: string = `VendorDocument/${docNo}/${file.originalname}`;

  const objectParams: UploadToS3ObjectInterface = {
    Bucket: constants.OCI_S3_COMPATIBILITY.BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(objectParams));

    const URL: string = constants.OCI_S3_COMPATIBILITY.getObjectUrl(fileName);

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: URL,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteVendorAttachmentFromS3 = async (req: any, res: any) => {
  const docNo = req.params.doc_no;
  const fileName = `VendorDocument/${docNo}`;

  const params = {
    Bucket: constants.OCI_S3_COMPATIBILITY.BUCKET_NAME,
    Key: fileName,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadEmployeeAttachmentToS3 = async (req: any, res: any) => {
  const file = req.file;
  const requestNumber = req.body.request_number;

  const fileName: string = `LeaveDocument/${requestNumber}/${file.originalname}`;

  const objectParams: UploadToS3ObjectInterface = {
    Bucket: constants.OCI_S3_COMPATIBILITY.BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(objectParams));

    const URL: string = constants.OCI_S3_COMPATIBILITY.getObjectUrl(fileName);

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: URL,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteEmployeeAttachmentFromS3 = async (req: any, res: any) => {
  const empId = req.params.emp_id;
  const fileName = `LeaveDocument/${empId}`;

  const params = {
    Bucket: constants.OCI_S3_COMPATIBILITY.BUCKET_NAME,
    Key: fileName,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
