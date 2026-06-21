import { Response } from "express";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { IUser } from "../../../../interfaces/user.interface";
//import { packingDetailsSchema } from "../../../../validation/wms/transaction/inbound.validation";
import { tallyDetailsSchema } from "../../../../validation/wms/transaction/inbound.validation";
import constants from "../../../../helpers/constants";
import { Product } from "../../../../entity/WMS/product.entity";
import { CountryMaster } from "../../../../entity/WMS/country.entity";
import { TiTallyDetail } from "../../../../entity/WMS/TiTallyDetail.entity";
//import { IPackingDetails } from "../../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import { ITallyDetailsWms } from "../../../../interfaces/wms/transaction/inbound/tallyDetails_wms.interface";
import * as fastCsv from "fast-csv";
import WmsCsvHeaders from "../../../../utils/exportCsv/WmsCsvHeaders";
import { getSearchFilterQuery } from "../../../../helpers/functions";
import { Like } from "typeorm";
import { getRepository, AppDataSource } from "../../../../database/connection";

export const getTallyDetail = async (req: RequestWithUser, res: Response) => {
  try {
    const { prin_code, packdet_no, job_no, seq_number } = req.query;

    // console.log(req.query);
    // console.log(
    //   "hum yaha hai tally karne k liye"
    // );

    const tallyDetailsRepo = getRepository(TiTallyDetail);
    const tallyDetails = await tallyDetailsRepo.findOne({
      where: {
        prin_code: prin_code as string,
        packdet_no: Number(packdet_no),
        job_no: job_no as string,
        company_code: req.user.company_code,
        seq_number: Number(seq_number)
      },
    });

    if (!tallyDetails) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Tally Item " + constants.MESSAGES.DOES_NOT_EXISTS,
      });
      return;
    }

    const productRepo = getRepository(Product);
    const productInfo = await productRepo.findOne({
      where: {
        prodCode: tallyDetails.prod_code,
        companyCode: req.user.company_code,
      },
    });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: {
        ...tallyDetails,
        prod_name: productInfo?.prodName,
        uom_count: productInfo?.uomCount,
        uppp: productInfo?.uppp,
      },
    });
    return;
  } catch (error: unknown) {
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: knownError.message });
  }
};
export const createTallyItem = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = tallyDetailsSchema(
      req.body,
      false,
      requestUser.company_code
    );
    const {
      pda_qty_puom,
      pda_qty_luom,
      packdet_no,
      prod_code,
      pda_quantity,
      prin_code,
      job_no
    } = req.body;
    console.log('checkkkk',pda_qty_luom);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    if (!!req.body.prod_code) {
      const productRepo = getRepository(Product);
      const productResponse = await productRepo.findOne({
        where: {
          companyCode: requestUser.company_code,
          prodCode: req.body.prod_code,
        },
      });
      if (!productResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Product " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }
    if (!!req.body.country_code) {
      const countryRepo = getRepository(CountryMaster);
      const countryResponse = await countryRepo.findOne({
        where: {
          company_code: requestUser.company_code,
          country_code: req.body.country_code,
        },
      });
      if (!countryResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Country " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }

    const tallyDetailsRepo = getRepository(TiTallyDetail);
    
    // Get the maximum seq_number for this combination
    const maxSeqResult = await tallyDetailsRepo
      .createQueryBuilder("tally")
      .select("MAX(tally.seq_number)", "max")
      .where("tally.company_code = :company_code", { company_code: requestUser.company_code })
      .andWhere("tally.job_no = :job_no", { job_no })
      .andWhere("tally.prin_code = :prin_code", { prin_code })
      .andWhere("tally.packdet_no = :packdet_no", { packdet_no })
      .getRawOne();
    
    const nextSeqNumber = (maxSeqResult?.max || 0) + 1;
    
    const response = await tallyDetailsRepo.save({
      ...req.body,
      packdet_no: packdet_no,
      seq_number: nextSeqNumber,
      company_code: requestUser.company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const result: any = await AppDataSource.query(
      `UPDATE TI_PACKDET
      SET QTY1_ARRIVED = :v_pda_qty_puom,
          QTY2_ARRIVED = :v_pda_qty_luom,
          QUANTITY_ARRIVED = :v_pda_quantity
      WHERE COMPANY_CODE = :v_company_code
          AND JOB_NO = :v_job_no
          AND PRIN_CODE = :v_prin_code
          AND PROD_CODE = :v_prod_code
          AND PACKDET_NO = :v_packdet_no`,
      [
          pda_qty_puom, 
          pda_qty_luom, 
          pda_quantity,
          requestUser.company_code, 
          job_no, 
          prin_code, 
          prod_code,
          packdet_no
        ]
    );
  

    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Tally Details " + constants.MESSAGES.CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updateTallyItem = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { packdet_no , seq_number} = req.params;
    const { prin_code, job_no } = req.query;
console.log ('seq_number',seq_number);
    const { error } = tallyDetailsSchema(
      req.body,
      false,
      requestUser.company_code
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const tallyDetailsRepo = getRepository(TiTallyDetail);
    const tallyResponse = await tallyDetailsRepo.findOne({
      where: {
        company_code: requestUser.company_code,
        packdet_no: Number(packdet_no),
        prin_code: prin_code as string,
        job_no: job_no as string,
        seq_number: Number(seq_number),
      },
    });
    if (!tallyResponse) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Tally " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }
    if (!!req.body?.prod_code) {
      const productRepo = getRepository(Product);
      const productResponse = await productRepo.findOne({
        where: {
          companyCode: requestUser.company_code,
          prodCode: req.body.prod_code,
        },
      });
      if (!productResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Product " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }

    if (!!req.body?.country_code) {
      const countryRepo = getRepository(CountryMaster);
      const countryResponse = await countryRepo.findOne({
        where: {
          company_code: requestUser.company_code,
          country_code: req.body.country_code,
        },
      });
      if (!countryResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Country " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }

    const response = await tallyDetailsRepo.update(
      {
        company_code: requestUser.company_code,
        packdet_no: Number(packdet_no),
        prin_code: prin_code as string,
        job_no: job_no as string,
        seq_number: Number(seq_number)
      },
      {
        ...req.body,
        packdet_no: Number(packdet_no),
        updated_by: requestUser.loginid,
      }
    );
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Tally Details " + constants.MESSAGES.UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteTallyItem = async (
  req: RequestWithUser,
  res: Response
): Promise<any> => {
  try {
    const { tally_details } = req.body;
    const requestUser = req.user;
    if (tally_details.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one tally item to delete",
      });
    }

    const tallyDetailsRepo = getRepository(TiTallyDetail);
    await Promise.all(
      tally_details.map(
        async (TallyDetail: {
          prin_code: string;
          job_no: string;
          packdet_no: number;
        }) => {
          const { prin_code, job_no, packdet_no } = TallyDetail;

          return await tallyDetailsRepo.delete({
            prin_code,
            job_no,
            packdet_no,
            company_code: requestUser.company_code,
          });
        }
      )
    );

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const createBulkTallyDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = tallyDetailsSchema(
      req.body,
      true,
      requestUser.company_code
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    req.body = req.body.map((tallyDetail: ITallyDetailsWms) => ({
      ...tallyDetail,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
    }));

    const tallyDetailsRepo = getRepository(TiTallyDetail);
    await tallyDetailsRepo.insert(req.body);

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Tally Details " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const exportTallyDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;
    let fetchedData: any[] = [];

    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter as string)
      : {};

    const whereConditions: any = {
      company_code: req.user.company_code,
    };

    // Apply search filters if present
    if (filter.search) {
      // Add TypeORM compatible search filters
      // Example: if searching by prod_code
      Object.keys(filter.search).forEach((key: string) => {
        if ((filter.search as any)[key]) {
          whereConditions[key] = Like(`%${(filter.search as any)[key]}%`);
        }
      });
    }

    const tallyDetailsRepo = getRepository(TiTallyDetail);
    fetchedData = await tallyDetailsRepo.find({
      where: whereConditions,
    });

    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.TANSACTION.INBOUND.TALLY_DETAIL,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tally_details.csv"`
    );

    // Write data to the CSV stream
    fetchedData.forEach((eachData) => {
      csvTransform.write(eachData); // Write each row to the CSV stream
    });

    // End the CSV stream and pipe it to the response
    csvTransform.end(); // Complete the CSV data transformation
    csvTransform.pipe(res); // Pipe CSV data into the HTTP response
  } catch (error: any) {
    console.error("Export Error:", error); // Log the error for debugging
    res.status(400).json({ success: false, message: error.message });
  }
};
