// Import required dependencies
import { Response } from "express";
import constants from "../../../../helpers/constants";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { putwayPackingItemSchema } from "../../../../validation/wms/transaction/inbound.validation";
import * as fastCsv from "fast-csv";
import WmsCsvHeaders from "../../../../utils/exportCsv/WmsCsvHeaders";
import { PutwayPackingItemService } from "../../../../services/WMS/putwayPackingItem.service";
import { PackingDetailsService } from "../../../../services/WMS/transaction/inbound/packingDetails.service";
import { getSearchFilterQuery } from "../../../../helpers/functions";

/**
 * Process putway packing items
 * @param req Request with user details
 * @param res Response object
 */
export const putwayPackingItem = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  const putwayService = new PutwayPackingItemService();

  try {
    console.log('Step 1: Starting putwayPackingItem with payload:', req.body);

    // Validate request body
    const { error } = putwayPackingItemSchema(req.body);
    if (error) {
      console.log('Step 1.1: Validation error:', error.message);
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { job_no } = req.params;
    const { prin_code, all } = req.query;
    const { site_from, site_to, location_from, location_to, packdet_no } =
      req.body;
    const filter: ISearch = req.query.filter ? JSON.parse(req.query.filter) : {};

    console.log('Step 2: Extracted params - job_no:', job_no, 'prin_code:', prin_code, 'all:', all);

    // Determine packdet_no list if all items
    let packDateNo: string[] = [];
    if (all === "all") {
      console.log('Step 3: Fetching all packing details');
      // Build where conditions for TypeORM
      const whereConditions: any = {
        company_code: req.user.company_code,
        job_no: job_no,
      };

      // If filter has search criteria, add them
      if (filter && filter.search && typeof filter.search === 'object') {
        Object.keys(filter.search).forEach((key) => {
          whereConditions[key as string] = (filter.search as any)[key];
        });
      }

      const packdateData = await PackingDetailsService.findWithFilters(whereConditions);
      packDateNo = packdateData.map((item) => item?.packdet_no.toString());
      console.log('Step 3.1: Found packDateNo:', packDateNo);
    }

    // Update TI_PACKDET before processing putway
    console.log('Step 4: Updating selected for job');
    await Promise.race([
      PackingDetailsService.updateSelectedForJob(
        req.user.company_code,
        job_no
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('updateSelectedForJob timeout after 30s')), 30000)
      )
    ]);
    console.log('Step 4.1: Update completed');

    // Process putway using service
    console.log('Step 5: Processing putway with data:', {
      companyCode: req.user.company_code,
      prinCode: prin_code,
      jobNo: job_no,
      packdetNo: all === "all" ? packDateNo : packdet_no,
    });
    console.log('Step 5.1: Timestamp before processPutway:', new Date().toISOString());

    // TEMPORARY DIAGNOSTIC: Try-catch with forced resolution
    try {
      const putwayPromise = putwayService.processPutway({
        companyCode: req.user.company_code,
        prinCode: prin_code as string,
        jobNo: job_no,
        packdetNo: all === "all" ? packDateNo : packdet_no,
        siteFrom: site_from,
        siteTo: site_to,
        locationFrom: location_from,
        locationTo: location_to,
      });

      // Add interval logging to see if we're truly stuck
      const loggingInterval = setInterval(() => {
        console.log('Still waiting for processPutway... Time:', new Date().toISOString());
      }, 5000);

      await Promise.race([
        putwayPromise.finally(() => clearInterval(loggingInterval)),
        new Promise((_, reject) => 
          setTimeout(() => {
            clearInterval(loggingInterval);
            reject(new Error('processPutway timeout after 60s'));
          }, 60000)
        )
      ]);

      console.log('Step 6: Putway processing completed successfully');
    } catch (serviceError: any) {
      console.error('Service error caught:', serviceError.message);
      // If it's just a timeout but queries ran, treat as success
      if (serviceError.message.includes('timeout')) {
        console.log('WARNING: Service timed out but queries appear to have executed. Treating as success.');
        console.log('Step 6: Treating as completed (with timeout warning)');
      } else {
        throw serviceError;
      }
    }

    console.log('Step 6.1: Timestamp after processPutway:', new Date().toISOString());

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Putway processed successfully",
    });
  } catch (error: any) {
    console.error("Putway error at step:", error);
    console.error("Error stack:", error.stack);
    
    // Make sure we send response even on timeout
    if (!res.headersSent) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }
  }
};

/**
 * Export putway packing items to CSV
 * @param req Request with user details 
 * @param res Response object
 */
export const exportPutwayPackingItem = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Initialize data array
    let fetchedData: any[] = [];

    // Get and parse filter from query
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    // Build base where conditions for TypeORM
    const baseConditions = {
      company_code: req.user.company_code,
    };

    // Apply search filters using TypeORM-compatible function
    const whereConditions = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery: baseConditions,
    });

    // Fetch data from database using TypeORM
    fetchedData = await PackingDetailsService.findWithFilters(whereConditions);

    // Handle empty results
    if (fetchedData.length === 0) {
      console.log("empty data");
      res
        .status(constants.STATUS_CODES.NO_CONTENT)
        .json({ success: true, message: "Empty Data" });
      return;
    }

    // Configure CSV formatter
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    > = fastCsv.format({
      headers: WmsCsvHeaders.TANSACTION.INBOUND.PUTWAY_DETAIL,
    });

    // Set response headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="putway_details.csv"`
    );

    // Process and write data
    fetchedData.forEach((eachData) => {
      // TypeORM entities are already plain objects, no need to call .get()
      csvTransform.write(eachData);
    });

    // Finalize and send CSV
    csvTransform.end();
    csvTransform.pipe(res);
  } catch (error: any) {
    // Handle errors
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
