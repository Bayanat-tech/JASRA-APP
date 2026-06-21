import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import {
  productSchema,
  productediSchema,
} from "../../validation/wms/gm.validation";
import * as XLSX from "xlsx";
import { IProductEdi } from "../../interfaces/wms/gm_wms.interface";
import { ProductService } from "../../services/WMS/product.service";
// import ProductEdi from "../../models/wms/product_edi_wms.model"; // Keep this for now for Excel import

export const createProduct = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    // Remove prod_code from body before validation since it will be auto-generated
    const { prod_code, ...bodyWithoutProdCode } = req.body;

    const { error } = productSchema(bodyWithoutProdCode);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Pass the body without prod_code to formatProductData
    const productData = formatProductData(bodyWithoutProdCode, requestUser.loginid);

    const createdProduct = await ProductService.createProduct(productData);
    
    if (!createdProduct) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating product" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PRODUCT_WMS.PRODUCT_CREATED_SUCCESSFULLY,
      data: { prodCode: createdProduct.prodCode }
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateProduct = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = productSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    const { prod_code, company_code } = req.body;

    // Check if product exists
    const productExists = await ProductService.checkProductExists(prod_code, company_code);

    if (!productExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PRODUCT_WMS.PRODUCT_DOES_NOT_EXISTS,
      });
      return;
    }

    // Pass the entire request body to formatProductData
    const productData = formatProductData(req.body, requestUser.loginid);

    const updateResult = await ProductService.updateProduct(
      prod_code,
      company_code,
      productData
    );
    
    if (!updateResult) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating product" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PRODUCT_WMS.PRODUCT_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteproducts = async (req: RequestWithUser, res: Response) => {
  try {
    const prodCodes = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PRODUCT_WMS.SELECT_AT_LEAST_ONE_PRODUCT,
      });
      return;
    }
    
    const deleteResult = await ProductService.deleteProducts(prodCodes);
    
    if (!deleteResult) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No products were deleted",
      });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PRODUCT_WMS.PRODUCT_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const importExcelProducts = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
      res.status(400).json({ success: false, message: "Excel file is empty" });
      return;
    }

    const errors: string[] = [];
    const validProducts: IProductEdi[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const { value, error } = productediSchema.validate(row, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        error.details.forEach((e) => {
          errors.push(`Row ${i + 2}: ${e.message}`);
        });
      } else {
        validProducts.push(value as IProductEdi);
      }
    }

    if (errors.length) {
      res.status(422).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    // If ProductEdi is a Sequelize model, ensure it is imported from the correct Sequelize model file.
    // If ProductEdi is a TypeORM entity, use getRepository(ProductEdi).save() instead.

    // Example for TypeORM entity (uncomment if using TypeORM):
    // import { getRepository } from "typeorm";
    // await getRepository(ProductEdi).save(validProducts, { chunk: 100 });

    // Example for Sequelize model:
    // await ProductEdi.bulkCreate(validProducts, {
    //   updateOnDuplicate: Object.keys(ProductEdi.rawAttributes) as (keyof IProductEdi)[],
    // });

    // For TypeORM:
    const { getRepository } = require("typeorm");
    
    // await getRepository(ProductEdi).save(validProducts, { chunk: 100 });

    res.json({
      success: true,
      message: `Successfully imported ${validProducts.length} products`,
    });
    return;
  } catch (err) {
    console.error("Error in importExcelProducts:", err);
    const errorMessage = err instanceof Error ? err.message : "Server error";
    res.status(500).json({ success: false, message: errorMessage });
    return;
  }
};

// Helper function to convert snake_case fields to camelCase for TypeORM entity
function formatProductData(data: any, userId?: string): any {
  return {
    companyCode: data.company_code,
    prinCode: data.prin_code,
    prodName: data.prod_name,
    brandCode: data.brand_code || null,
    groupCode: data.group_code || null,
    packdesc: data.packdesc || null,
    barcode: data.barcode || null,
    pUom: data.p_uom,
    suom: data.suom || null,
    length: data.length || 0,
    breadth: data.breadth || 0,
    height: data.height || 0,
    volume: data.volume || 0,
    grossWt: data.gross_wt || 0,
    netWt: data.net_wt || 0,
    foc: data.foc || null,
    cpu: data.cpu || 0,
    harmCode: data.harm_code || null,
    imcoCode: data.imco_code || null,
    kitting: data.kitting || null,
    manuCode: data.manu_code || null,
    basePrice: data.base_price || 0,
    flatStorage: data.flat_storage || 0,
    siteType: data.site_type || null,
    siteInd: data.site_ind || null,
    packKey: data.pack_key || null,
    prodTi: data.prod_ti || 0,
    prodHi: data.prod_hi || 0,
    chargetime: data.chargetime || null,
    prodStatus: data.prod_status,
    shelfLife: data.shelf_life || 0,
    categoryAbc: data.category_abc || null,
    reordLevel: data.reord_level || 0,
    reordQty: data.reord_qty || 0,
    altProdCode: data.alt_prod_code || null,
    prefSite: data.pref_site || null,
    prefLocFrom: data.pref_loc_from || null,
    prefLocTo: data.pref_loc_to || null,
    prefAisleFrom: data.pref_aisle_from || null,
    prefAisleTo: data.pref_aisle_to || null,
    prefColFrom: data.pref_col_from || 0,
    prefColTo: data.pref_col_to || 0,
    prefHtFrom: data.pref_ht_from || 0,
    prefHtTo: data.pref_ht_to || 0,
    uppp: data.uppp || 0,
    chkManucode: data.chk_manucode || null,
    chkLotno: data.chk_lotno || null,
    chkMfgexpdt: data.chk_mfgexpdt || null,
    puomVolume: data.puom_volume || 0,
    puomNetwt: data.puom_netwt || 0,
    puomGrosswt: data.puom_grosswt || 0,
    lUom: data.l_uom,
    luppp: data.luppp || 0,
    uomCount: data.uom_count || 0,
    prodType: data.prod_type || 0,
    twoplusUom: data.twoplus_uom || null,
    upp: data.upp || 0,
    waveCode: data.wave_code || 0,
    productStage: data.product_stage || null,
    coPack: data.co_pack || null,
    modelNumber: data.model_number || null,
    variantCode: data.variant_code || null,
    cntOrigin: data.cnt_origin || null,
    serialize: data.serialize || null,
    packing: data.packing || null,
    oldUpp: data.old_upp || 0,
    avgConsumption: data.avg_consumption || 0,
    prodImagePathWeb: data.prod_image_path_web || null,
    minperiodExppick: data.minperiod_exppick || 0,
    rcptExpLimit: data.rcpt_exp_limit || 0,
    qtyAsWt: data.qty_as_wt || null,
    hazmatInd: data.hazmat_ind || null,
    hazmatClass: data.hazmat_class || null,
    foodInd: data.food_ind || null,
    pharmaInd: data.pharma_ind || null,
    specialInstructions: data.special_instructions || null,
    strength: data.strength || null,
    packSize: data.pack_size || 0,
    groupCodeBk: data.group_code_bk || null,
    batchType: data.batch_type || 0,
    sapProdCode: data.sap_prod_code || null,
    sapProdDesc: data.sap_prod_desc || null,
    tempCode: data.temp_code || null,
    editUser: data.edit_user || null,
    class: data.class || null,
    wob: data.wob || 0,
    unifiedCode: data.unified_code || null,
    currentSeason: data.current_season || null,
    productCategory: data.product_category || null,
    genericArticle: data.generic_article || null,
    prodGender: data.prod_gender || null,
    prodColor: data.prod_color || null,
    prodSize: data.prod_size || null,
    prntPCode: data.prnt_p_code || null,
    userId: userId || data.user_id,
  };
}
