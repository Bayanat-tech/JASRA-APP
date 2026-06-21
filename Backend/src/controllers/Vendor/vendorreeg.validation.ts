import Joi from "joi";
import { TVendor } from "./vendore.interface";

export const vendorSchema = (data: TVendor) => {
  const schema = Joi.object({
    COMPANY_CODE: Joi.string().max(10).required(),
    VENDOR_CODE: Joi.string().max(50).required(),
    CURR_CODE: Joi.string().max(3).optional().allow(null, ""),
    AC_CODE: Joi.string().max(30).optional().allow(null, ""),
    COUNTRY_CODE: Joi.string().max(5).optional().allow(null, ""),
    VENDOR_NAME: Joi.string().max(50).optional().allow(null, ""),
    CR_NUMBER: Joi.string().max(30).optional().allow(null, ""),
    CREDIT_PERIOD: Joi.string().max(30).optional().allow(null, ""),
    BANK_SWIFT: Joi.string().max(30).optional().allow(null, ""),
    BANK_AC_CODE: Joi.string().max(30).optional().allow(null, ""),
    BANK_NAME: Joi.string().max(30).optional().allow(null, ""),
    //  TERRITORY_CODE: string().max(30).optional().allow(null, ""),
    TERRITORY_CODE: Joi.string().max(30).optional().allow(null, ""),
    BI_MAIN_GROUP: Joi.string().max(30).optional().allow(null, ""),
    BI_SUB_GROUP: Joi.string().max(30).optional().allow(null, ""),
    BI_PL_BS_IND: Joi.string().max(30).optional().allow(null, ""),
    BI_DEPT: Joi.string().max(30).optional().allow(null, ""),
    BI_EXP_TYPE: Joi.string().max(30).optional().allow(null, ""),
    BS_CODE: Joi.string().max(30).optional().allow(null, ""),
    TAX_COUNTRY: Joi.string().max(30).optional().allow(null, ""),
    VAT_NO: Joi.string().max(30).optional().allow(null, ""),
    SALESMAN_CODE: Joi.string().max(30).optional().allow(null, ""),
    SECTOR_CODE: Joi.string().max(30).optional().allow(null, ""),
    CREDIT_AMOUNT: Joi.string().max(30).optional().allow(null, ""),
    VENDOR_ADDR1: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_ADDR2: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_ADDR3: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_ADDR4: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_CITY: Joi.string().max(50).optional().allow(null, ""),

    VENDOR_CONTACT1: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_TELNO1: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_FAXNO1: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_EMAIL1: Joi.string().email().max(200).optional().allow(null, ""),

    VENDOR_CONTACT2: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_TELNO2: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_FAXNO2: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_EMAIL2: Joi.string().email().max(50).optional().allow(null, ""),

    VENDOR_CONTACT3: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_TELNO3: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_FAXNO3: Joi.string().max(50).optional().allow(null, ""),

    VENDOR_REF1: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_REF2: Joi.string().max(50).optional().allow(null, ""),
    VENDOR_REF3: Joi.string().max(50).optional().allow(null, ""),

    SERVICE_DATE: Joi.date().optional().allow(null, ""),
    SECLOGINID: Joi.string().max(20).optional().allow(null, ""),
  });
  console.log("check inside before validate1");
  return schema.validate(data);
  console.log("check inside before validate2");
};
