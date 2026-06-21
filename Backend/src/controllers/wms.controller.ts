// Importing necessary modules and interfaces
import { Response } from "express";
import constants from "../helpers/constants";
import oracledb from 'oracledb';

import { oracleDb } from "../../src/database/connection";
// import { QueryTypes } from "sequelize"; 
// import { WhereOptions } from "sequelize";
import { ISearch, RequestWithUser } from "../interfaces/common.interface";
import { ICostmaster } from "../interfaces/Purchaseflow/Purucahseflow.interface";
// import {q
//   IFlowmaster,
//   IRolemaster,
// } from "../interfaces/Security/Security.interfae";
import { IUser } from "../interfaces/user.interface";
import { IActivityUoc } from "../interfaces/wms/activity_uoc_wms.interface";
import { IActivity } from "../interfaces/wms/activity_wms.interface";
import { IActivityGroup } from "../interfaces/wms/activitygroup_wms.interface";
import { IDepartment } from "../interfaces/wms/department_wms.interface";
import {
  IAccountsetup,
  IManufacture,
  IMoc,
  IUoc,
  IUom,
} from "../interfaces/wms/gm_wms.interface";
import { IHarmonize } from "../interfaces/wms/harmonize.interface";
import { ILine } from "../interfaces/wms/line_wms.interface";
import { ILocation } from "../interfaces/wms/location_wms.interface";
import { IPartner } from "../interfaces/wms/partner_wms.interface";
import { IPort } from "../interfaces/wms/port_wms.interface";
import { ISupplier } from "../interfaces/wms/supplier_wms.interface";
import { ITerritory } from "../interfaces/wms/territory_wms.interface";
import { IVessel } from "../interfaces/wms/vessel_wms.interface";

// Importing models for WMS master data
import Accountsetup from "../models/wms/accountsetup_wms.model";
import ActivityBillingTable from "../models/wms/activity_billing_table_wms";
import Activitysubgroup from "../models/wms/activity_subgroup.model";
import ActivityUoc from "../models/wms/activity_uoc.model";
import Activity from "../models/wms/activity_wms.model";
import AirLine from "../models/wms/airline_wms.model";
import Brand from "../models/wms/brand_wms.model";
import Currency from "../models/wms/currency_wms.model";
// REMOVED: import Department from "../models/wms/department_wms.model";
import Harmonize from "../models/wms/harmonize_code.model";
import Location from "../models/wms/location_wms.model";
import Manufacture from "../models/wms/manufacture_wms.model";
import partner from "../models/wms/partner_wms.model";
import Port from "../models/wms/port_wms.model";
import Product from "../models/wms/product_wms.model";
// REMOVED: import Group from "../models/wms/productgroup_wms.model";
import Salesman from "../models/wms/salesman_wms.model";
import Site from "../models/wms/site_wms.model";
import Storage from "../models/wms/storage_wms.model";
import Supplier from "../models/wms/supplier_wms.model";
import Territory from "../models/wms/territory_wms.model";
// import Uom from "../models/wms/uom_wms.model";
// import vessel from "../models/wms/vessel_wms.model";

// --- Database sequelize import ---
import activitygroup from "../models/wms/activitygroup_wms.model";
// import PrincipalWmsView from "../views/wms/principal_wms.view";
// REPLACED: import Principal from "../models/wms/principal_wms.model";
import { PrincipalMaster } from "../entity/WMS/principal.entity";
import { PrincipalService } from "../services/WMS/principal.service";

// import { Op } from "sequelize";
// import { sequelize } from "../database/connection";
import { getSearchFilterQuery } from "../helpers/functions";
import { IActivitysubgroup } from "../interfaces/wms/activity_subgroup_wms.interface";
import { IIndustrysector } from "../interfaces/wms/industrysector_wms.interface";
import { CountryService } from "../services/WMS/country.service";
// Remove ActivityKPI import from here
import Alert from "../models/wms/alert_wms_model";
import Assetgroup from "../models/wms/assetgroup_wms.model";
import Division from "../models/wms/division_wms.model";
import industrysector from "../models/wms/industrysector_wms.model";
import LocationType from "../models/wms/locationtype_wms.model";
import Moc from "../models/wms/moc_wms.model";
import Producttype from "../models/wms/producttype_wms.model";
import ShipmentDetailsInboundWms from "../models/wms/transaction/inbound/shipmantDetails_wms.model";
import Warehouse from "../models/wms/warehouse_wms.model";
import PackingDetailsInboundWmsView from "../views/wms/transportation/inbound/packingDetails_wms.view";
import JobOubListingView from "../views/wms/transportation/outbound/outboundJobWms.view";
import PickingDetailsOutboundWmsView from "../views/wms/transportation/outbound/pickingDetailsWms.view";
// import OrderDetail from "../../src/models/wms/transaction/outbound/toOrderDetail_wms.model"


// Importing additional interfaces and models
import {
  IDepartmentjob,
  IDivisionjob,
  IPrincipaljob,
} from "../interfaces/wms/principal_wms.interface";
import JobInboundWms from "../models/wms/transaction/inbound/inboundJobWms.model";
//import JobInboundWmsview from "../models/wms/transaction/inbound/inbounJobWms.model.view";


import DDdivisionjob from "../views/wms/transportation/inbound/dddivisionobWms";
import DDPrincipaljob from "../views/wms/transportation/inbound/ddprincipalJobWms";
import TallyDetailsInboundWms from "../models/wms/transaction/inbound/tallyDetails_wms.model";
import JobOutboundWms from "../models/wms/transaction/outbound/outboundJobWms.model"; 
import {Categorymaster} from "../models/Hr/hr_category";
import { ICategorymaster } from "../interfaces/Hr/hr_category_interface";
import { Request } from 'express';
import { PortService } from "../services/WMS/port.service";
import { CurrencyService } from "../services/WMS/currency.service";
import { ActivityUOCService } from "../services/WMS/uoc.service"; // Changed from moc2.service to uoc.service
import { LineService } from "../services/WMS/line.service";
import { BrandService } from "../services/WMS/brand.service"; // Add BrandService import
import { GroupService } from "../services/WMS/group.service"; // Add GroupService import
import { HarmonizeService } from "../services/WMS/harmonize.service"; // Import the new HarmonizeService
import { ManufacturerService } from "../services/WMS/manufacturer.service"; // Import ManufacturerService
import { ActivitySubgroupService } from "../services/WMS/activity_subgroup.service"; // Import ActivitySubgroupService
import { AcSetupService } from "../services/WMS/acsetup.service"; // Add import for AcSetupService
import { VesselService } from "../services/WMS/vessel.service"; // Add VesselService import
import { AirlineService } from "../services/WMS/airline.service"; // Add AirlineService import
import {DivisionService} from "../services/WMS/division.service" // Add DivisionService import
import { ProductService } from "../services/WMS/product.service"; // <-- Add this import
import { AlertService } from "../services/WMS/alert.service"; // <-- Add this import
import { LocationTypeService } from "../services/WMS/locationtype.service"; // <-- Add this import
import { ActivityKpiService } from "../services/WMS/activitykpi.service"; // <-- Add this import
import {DepartmentService} from "../services/WMS/department.service" // Add DepartmentService import
import { LocationService } from "../services/WMS/location.service"; // Add LocationService import
import { SalesmanService } from "../services/WMS/salesman.service"; // Add this import
import { PartnerService } from "../services/WMS/partner.service";
import { In } from "typeorm"; // Add this import for the In operator
import { MocService } from "../services/WMS/moc.service"; // Add MocService import
import { UomService } from "../services/WMS/uom.service"; // Add UomService import
import { ActivityGroupService } from "../services/WMS/activitygroup.service"; // Add ActivityGroupService import
import { SupplierService } from "../services/WMS/suppliermaster.service"; // Add SupplierService import
import { getConnection } from "typeorm";
import { FlowMasterService } from "../services/Security/flowmaster.service"; // Add FlowMasterService import
import { AppDataSource, TypeORMService } from "../database/connection";
import { CustomerService } from "../services/WMS/customer.service";

export type TGroup = {
  group_code: string;
  group_name: string;
  company_code?: string;
  prin_code?: string;
  updated_at?: Date;
  updated_by?: string;
  created_by?: string;
  created_at?: Date;
};

export const executeRawSql = async (req: Request, res: Response): Promise<void> => {
  try {
    // Accept SQL string either in body.raw_sql or query.sql
    const rawSql: string = req.body?.raw_sql || req.query?.sql;
    // Optional bind parameters (array) for parameterized queries (Oracle style)
    const params: any[] = req.body?.params || req.query?.params || [];

    if (!rawSql || typeof rawSql !== 'string') {
      res.status(400).json({ error: 'Missing or invalid raw SQL string' });
      return;
    }

    // Use AppDataSource (TypeORM DataSource) and a QueryRunner to execute the SQL
    // Ensure the AppDataSource is initialized; initialize via TypeORMService if needed
    let queryRunner;
    try {
      if (!AppDataSource.isInitialized) {
        await TypeORMService.initialize();
      }

      const connection = AppDataSource;
      queryRunner = connection.createQueryRunner();
      await queryRunner.connect();

      // Start transaction to ensure consistent behavior for DML/DDL if needed
      await queryRunner.startTransaction();

      // Execute the query with optional bind parameters
      // params should be an array when provided; otherwise pass empty array
      const bindParams = Array.isArray(params) ? params : [params];
      const results = await queryRunner.query(rawSql, bindParams);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Prepare totalCount sensibly for result types
      const totalCount = Array.isArray(results) ? results.length : (results && typeof results === 'object' && 'affectedRows' in results ? (results as any).affectedRows : 0);

      res.json({ success: true, data: results, totalCount });
    } catch (error: any) {
      // Rollback on error
      if (queryRunner) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (_) {}
      }
      console.error('SQL Execution Error (QueryRunner):', error);
      res.status(500).json({ error: 'Failed to execute SQL', details: error.message });
    } finally {
      // Release the runner
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (err) {
          console.error("Error releasing queryRunner:", err);
        }
      }
    }
  } catch (error: any) {
    console.error('SQL Execution Error:', error);
    res.status(500).json({ error: 'Failed to execute SQL', details: error.message });
  }
};

export const executeRawSqlbody = async (req: Request, res: Response): Promise<void> => {
  let connection: any = null;
  let rawSql: string | undefined = undefined;
  try {
    const { query_parameter, query_where, query_updatevalues } = req.body;

    if (!query_parameter || !query_where) {
      res.status(400).json({
        error: "Missing query_parameter or query_where",
      });
      return;
    }

    const cleanWhere = query_where.replace(/`/g, "").trim();
    const cleanUpdate = (query_updatevalues || "").replace(/`/g, "").trim();

    console.log("Final WHERE string:", cleanWhere);
    console.log("Final UPDATE values string:", cleanUpdate);

    const parameterMatch = query_parameter.match(/^([^$]+)\$+(.+)$/);
    const extractedParameter = parameterMatch ? parameterMatch[1] : query_parameter;
    const extractedCompanyCode = parameterMatch ? parameterMatch[2] : "unknown";
    
    console.log("Extracted Parameter:", extractedParameter);
    console.log("Extracted Company Code:", extractedCompanyCode);

    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `
      DECLARE
        v_sql VARCHAR2(32767);
      BEGIN
        SP_CREATE_SQL_change(
          :parameter,
          :where_clause,
          :update_values,
          v_sql
        );
        :out_sql := v_sql;
      END;
      `,
      {
        parameter: query_parameter,
        where_clause: cleanWhere,
        update_values: cleanUpdate,
        out_sql: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 }
      }
    );

    const outBinds = result.outBinds as any;
    let rawSql: string = outBinds?.out_sql;

    console.log("Procedure output_sql (raw):", rawSql);

    if (!rawSql || rawSql.toLowerCase().includes("no sql") || rawSql.toLowerCase().includes("error")) {
      console.error("Procedure returned an error or invalid SQL:", rawSql);
      res.status(400).json({ 
        error: "Invalid or missing SQL template", 
        details: rawSql || "No SQL returned from procedure",
        requiredTemplate: {
          parameter: extractedParameter,
          companyCode: extractedCompanyCode,
          message: `Template required in TBL_SQL_STRING_INFO with PARAMETER='${extractedParameter}' and COMPANY_CODE='${extractedCompanyCode}'`
        },
        parameters: { query_parameter, cleanWhere, cleanUpdate }
      });
      return;
    }

    rawSql = rawSql.trim().replace(/;$/, "");
    console.log("Generated rawSql:", rawSql);

    const dataResult = await connection.execute(rawSql, [], {
      outFormat: oracledb.OUT_FORMAT_ARRAY
    }) as any;

    const tableData =
      dataResult.rows?.map((row: any) => {
        const obj: Record<string, any> = {};
        dataResult.metaData?.forEach((col: any, i: number) => {
          obj[col.name.toLowerCase()] = row[i];
        });
        return obj;
      }) || [];

    console.log("Query executed successfully, rows returned:", tableData.length);
    res.json({
      success: true,
      data: tableData,
      totalCount: tableData.length,
    });
  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    console.error("Error details - Code:", error.code, "Message:", error.message);
    
    // For ORA-00904 (invalid identifier), provide column debugging info
    if (error.code === 904) {
      console.error("Invalid column name in ORDER BY or SELECT clause");
      console.error("Generated SQL:", rawSql);
      
      res.status(400).json({
        error: "Invalid column in generated SQL",
        details: error.message,
        code: error.code,
        generatedSql: rawSql,
        hint: "Check that the ORDER_BY column exists in the view/table. Verify TBL_SQL_STRING_INFO template has valid column names.",
        parameters: { query_parameter: req.body?.query_parameter }
      });
    } else {
      res.status(500).json({
        error: "Failed to execute SQL",
        details: error.message,
        code: error.code || "UNKNOWN",
      });
    }
  } finally {
    // Close connection
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
};

export const proc_build_dynamic_sql_wms = async (req: Request, res: Response): Promise<void> => {

  let connection: oracledb.Connection | undefined;
 connection = await oracleDb.getConnection(); // ✅ assign first
  try {
    const {
      parameter,
      loginid,
      code1,
      code2,
      code3,
      code4,
      number1,
      number2,
      number3,
      number4,
      date1,
      date2,
      date3,
      date4
    } = req.body;
    
    console.log('check dynamic sql', req.body);

    if (!parameter) {
      res.status(400).json({ error: "Missing required parameter 'parameter'" });
      return;
    }

    // Use raw Oracle connection - no TypeORM dependency
    connection = await oracledb.getConnection();

    // 1️⃣ Call procedure to generate SQL using proper Oracle syntax
    const result = await connection.execute(
      `
      DECLARE
        v_sql VARCHAR2(32767);
      BEGIN
        PROC_BUILD_DYNAMIC_SQL_WMS(
          :parameter,
          :loginid,
          :code1,
          :code2,
          :code3,
          :code4,
          :number1,
          :number2,
          :number3,
          :number4,
          :date1,
          :date2,
          :date3,
          :date4,
          v_sql
        );
        :out_sql := v_sql;
      END;
      `,
      {
        parameter,
        loginid,
        code1,
        code2,
        code3,
        code4,
        number1,
        number2,
        number3,
        number4,
        date1,
        date2,
        date3,
        date4,
        out_sql: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 }
      }
    );

    const outBinds = result.outBinds as any;
    let rawSql: string = outBinds?.out_sql;

    console.log("Procedure output_sql (raw):", rawSql);

    if (!rawSql || 
        rawSql.toLowerCase().includes("no sql") || 
        rawSql.toLowerCase().includes("error") ||
        rawSql.toLowerCase().includes("invalid parameter")) {
      console.error("Procedure returned an error or invalid SQL:", rawSql);
      res.status(400).json({ 
        error: "Invalid parameter or missing SQL template", 
        details: rawSql || "No SQL returned from procedure",
        parameters: { parameter, loginid, code1, code2, code3, code4, number1, number2, number3, number4, date1, date2, date3, date4 }
      });
      return;
    }

    // 🧹 Strip trailing semicolon
    rawSql = rawSql.trim().replace(/;$/, "");
    console.log("Generated rawSql:", rawSql);

    // 2️⃣ Execute the SELECT statement returned by procedure
    const dataResult = await connection.execute(rawSql, [], {
      outFormat: oracledb.OUT_FORMAT_ARRAY
    }) as any;

    // Safely map rows to lowercase keys
    const tableData =
      dataResult.rows?.map((row: any) => {
        const obj: Record<string, any> = {};
        dataResult.metaData?.forEach((col: any, i: number) => {
          obj[col.name.toLowerCase()] = row[i];
        });
        return obj;
      }) || [];

    console.log("Query executed successfully, rows returned:", tableData.length);

    // 3️⃣ Send rows to frontend
    res.json({
      success: true,
      data: tableData,
      totalCount: tableData.length,
    });

  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    console.error("Error details - Code:", error.code, "Message:", error.message);
    res.status(500).json({
      error: "Failed to execute SQL",
      details: error.message,
      code: error.code || "UNKNOWN",
    });
  } finally {
    // Close connection
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
};

// Retrieves master data (country,Port , department, territory, etc.) with optional pagination based on the `master` type.
export const getWmsMaster = async (req: RequestWithUser, res: Response) => {
  try {
   // Extracting master type from request parameters
const { master } = req.params;
console.log("master", master);

// Extracting user information from request
const requestUser: IUser = req.user;

// Extracting unique codes from query parameters
const uniqueCode = req.query.code;
const uniqueCode2 = req.query.code2;

// Extracting pagination parameters from query
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 100;
const skip = Number(page * limit - limit);

// Initializing variables to store fetched data and total count
let fetchedData: unknown[] = [],
  totalCount = 0;

// Creating pagination options based on limit
const paginationOptions = limit ? { offset: skip, limit: limit } : {};
// function removeAllocatedFilters(condition: any): any {
//   if (Array.isArray(condition)) {
//     return condition
//       .map(removeAllocatedFilters)
//       .filter(
//         (cond) =>
//           !(
//             typeof cond === "object" &&
//             cond !== null &&
//             cond.allocated === "N"
//           )
//       );
//   } else if (typeof condition === "object" && condition !== null) {
//     const newCond: Record<string, any> = {};
//     for (const key in condition) {
//       if (key === "allocated" && condition[key] === "N") continue;

//       if (key === Op.and.toString() || key === Op.or.toString()) {
//         newCond[key] = removeAllocatedFilters(condition[key]);
//       } else {
//         newCond[key] = condition[key];
//       }
//     }
//     return newCond;
//   }
//   return condition;
// }
// Extracting filter from query and parsing it to JSON
const filter: ISearch = req.query.filter
  ? JSON.parse(req.query.filter)
  : {};
    switch (master) {
      //----------------------wms----------------
      //---------------gm----------
     // Fetching country data using CountryService
    case "country": {
      try {
        // Prepare filters for TypeORM
        const filters: any = { company_code: requestUser.company_code };
        
        // Apply search filter if present
        if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
          // Handle country name search
          const nameSearch = filter.search.find((s: any) => s.field === 'country_name' && s.values);
          if (nameSearch) {
            filters.country_name = nameSearch.values;
          }
          
          // Handle country code search
          const codeSearch = filter.search.find((s: any) => s.field === 'country_code' && s.values);
          if (codeSearch) {
            filters.country_code = codeSearch.values;
          }
        }
        
        // Use CountryService to fetch countries
        const countries = await CountryService.findAll();
        
        // Filter the results based on company_code and any search criteria
        const filteredCountries = countries.filter(country => {
          // Check company code match
          if (country.company_code !== requestUser.company_code) {
            return false;
          }
          
          // Apply additional filters if they exist
          if (filters.country_name && !country.country_name.includes(filters.country_name)) {
            return false;
          }
          
          if (filters.country_code && !country.country_code.includes(filters.country_code)) {
            return false;
          }
          
          return true;
        });
        
        // Apply pagination
        const startIndex = skip;
        const endIndex = skip + limit;
        fetchedData = filteredCountries.slice(startIndex, endIndex);
        totalCount = filteredCountries.length;
      } catch (error) {
        console.error("Error fetching countries:", error);
        fetchedData = [];
        totalCount = 0;
      }
    }
    break;
// case "producttype":
//   {
//     // Initialize inside and outside query variables
//     let insideQuery: any = [],
//       outsideQuery = {
//         [Op.and]: [{ company_code: requestUser.company_code }],
//       };

//     // Apply search filter to the outside query
//     outsideQuery = getSearchFilterQuery({
//       insideQuery,
//       filter: filter.search,
//       outsideQuery,
//     });

//     // Count the total number of records
//     totalCount = await Producttype.count({ where: outsideQuery });

//     // Fetch product type data with optional pagination and sorting
//     fetchedData = await Producttype.findAll({
//       where: outsideQuery,
//       ...(!!filter?.sort &&
//         Object.keys(filter?.sort).length > 0 && {
//           order: [
//             [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
//           ],
//         }),
//       ...paginationOptions,
//     });
//   }

//   break;
case "alert":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;

    // Prepare filters for TypeORM entity property names
    const filters: any = { companyCode: requestUser.company_code };

    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      const opTypeSearch = filter.search.find((s: any) => s.field === 'op_type' && s.values);
      if (opTypeSearch) {
        filters.opType = opTypeSearch.values;
      }
      const opCodeSearch = filter.search.find((s: any) => s.field === 'op_code' && s.values);
      if (opCodeSearch) {
        filters.opCode = opCodeSearch.values;
      }
      const opDescSearch = filter.search.find((s: any) => s.field === 'op_desc' && s.values);
      if (opDescSearch) {
        filters.opDesc = opDescSearch.values;
      }
    }

    try {
      // Use AlertService to fetch alert data with pagination
      const { data: alertData, total } = await AlertService.getAlerts(
        filters,
        page,
        pageLimit
      );

      // Map entity fields to match the interface fields expected by the frontend if needed
      fetchedData = alertData.map(item => ({
        company_code: item.companyCode,
        op_type: item.opType,
        op_code: item.opCode,
        op_desc: item.opDesc,
        op_sequence: item.opSequence,
        instruction: item.instruction,
        op_mode: item.opMode,
        op_module: item.opModule
      }));

      totalCount = total;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;
case "port":
  {
    console.log("Fetching port data..."); // Debug log
    console.log("Request user company_code:", requestUser.company_code); // Debug log
    
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters - use snake_case for entity property names
    // Start with just the company_code which is required
    const filters: any = { company_code: requestUser.company_code };
    
    console.log("Initial filters:", filters); // Debug log
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      console.log("Search filters:", filter.search); // Debug log
      
      // Handle port name search - only add if value is valid
      const nameSearch = filter.search.find((s: any) => s.field === 'port_name' && s.values);
      if (nameSearch && nameSearch.values) {
        const val = String(nameSearch.values).trim();
        if (val && val !== 'undefined' && val !== 'null') {
          filters.port_name = val;
        }
      }
      
      // Handle port code search - only add if value is valid
      const codeSearch = filter.search.find((s: any) => s.field === 'port_code' && s.values);
      if (codeSearch && codeSearch.values) {
        const val = String(codeSearch.values).trim();
        if (val && val !== 'undefined' && val !== 'null') {
          filters.port_code = val;
        }
      }
      
      // Handle country code search - only add if value is valid
      const countrySearch = filter.search.find((s: any) => s.field === 'country_code' && s.values);
      if (countrySearch && countrySearch.values) {
        const val = String(countrySearch.values).trim();
        if (val && val !== 'undefined' && val !== 'null') {
          filters.country_code = val;
        }
      }
    }
    
    console.log("Final filters:", filters); // Debug log
    
    try {
      // Use the port service to fetch port data with pagination
      const { data: portData, total } = await PortService.getPorts(
        filters, 
        page, 
        pageLimit
      );
      
      console.log("Port data fetched:", portData.length, "Total:", total); // Debug log
      
      fetchedData = portData;
      totalCount = total;
    } catch (error) {
      console.error("Error fetching ports:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

case "product":
  {
    console.log("🚀 Fetching product data...");
    console.log("👤 Request user company_code:", requestUser.company_code);
    
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;

    console.log("📄 Pagination - Page:", page, "Limit:", pageLimit);

    // Prepare filters for TypeORM entity property names (use snake_case)
    const filters: any = { company_code: requestUser.company_code };

    console.log("🔍 Initial filters:", filters);

    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      console.log("🔎 Search filters received:", filter.search);
      
      const prodNameSearch = filter.search.find((s: any) => s.field === 'prod_name' && s.values);
      if (prodNameSearch) {
        filters.prod_name = prodNameSearch.values;
        console.log("✅ Added prod_name filter:", prodNameSearch.values);
      }
      
      const prodCodeSearch = filter.search.find((s: any) => s.field === 'prod_code' && s.values);
      if (prodCodeSearch) {
        filters.prod_code = prodCodeSearch.values;
        console.log("✅ Added prod_code filter:", prodCodeSearch.values);
      }
    }

    console.log("🎯 Final filters before service call:", filters);

    try {
      // Use ProductService to fetch product data with pagination
      const { data: productData, total } = await ProductService.getProducts(
        filters,
        page,
        pageLimit
      );

      console.log("✅ ProductService returned:", productData.length, "products, Total:", total);

      // Map entity fields to match the interface fields expected by the frontend if needed
      fetchedData = productData;
      totalCount = total;
      
      if (fetchedData.length > 0) {
        console.log("📦 Sample product data:", JSON.stringify(fetchedData[0], null, 2));
      } else {
        console.warn("⚠️ No products found for company_code:", requestUser.company_code);
      }
    } catch (error: any) {
      console.error("❌ Error fetching products:", error.message);
      console.error("Stack trace:", error.stack);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching account setup data from the AcSetupService
case "accountsetup":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters - using camelCase for TypeORM entity property names
    const filters: any = { companyCode: requestUser.company_code };
    
    try {
      // Use AcSetupService to fetch account setup data with pagination
      const { data: acSetupData, total } = await AcSetupService.getAcSetups(
        filters, 
        page, 
        pageLimit
      );
      
      // Map TypeORM entity fields to match the interface fields expected by the frontend
      fetchedData = acSetupData.map(item => ({
        company_code: item.companyCode,
        pdc_receipt_code: item.pdcReceiptCode,
        pdc_issue_code: item.pdcIssueCode,
        doc_date_editable: item.docDateEditable,
        ac_code: item.acCode,
        bank_name: item.bankName,
        ac_name: item.acName,
        swift_code: item.swiftCode,
        base_curr_code: item.baseCurrCode,
        price_decimal_nos: item.priceDecimalNos,
        amount_decimal_nos: item.amountDecimalNos,
        lcur_decimal_nos: item.lcurDecimalNos,
        qty_decimal_nos: item.qtyDecimalNos,
        financial_yr_start: item.financialYrStart,
        financial_yr_end: item.financialYrEnd,
        doc_edit_from: item.docEditFrom,
        doc_edit_to: item.docEditTo,
        job_class: item.jobClass,
        exchange_diff_ac: item.exchangeDiffAc,
        principal_ac_group: item.principalAcGroup,
        created_by: item.createdBy,
        created_at: item.createdAt,
        updated_by: item.updatedBy,
        updated_at: item.updatedAt
      }));
      
      totalCount = total;
    } catch (error: any) {
      // Handle duplicate entry error
      if (
        error &&
        typeof error.message === "string" &&
        error.message.includes("Duplicate entry")
      ) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }
      console.error("Error fetching account setup data:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching manufacturer data from the Manufacture model
case "manufacturer":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { companyCode: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle manufacturer name search
      const nameSearch = filter.search.find((s: any) => s.field === 'manu_name' && s.values);
      if (nameSearch) {
        filters.manuName = nameSearch.values;
      }
      
      // Handle manufacturer code search
      const codeSearch = filter.search.find((s: any) => s.field === 'manu_code' && s.values);
      if (codeSearch) {
        filters.manuCode = codeSearch.values;
      }
    }
    
    try {
      // Use ManufacturerService to fetch manufacturer data with pagination
      const { data: manufacturerData, total } = await ManufacturerService.getManufacturers(
        filters, 
        page, 
        pageLimit
      );
      
      // Map entity fields to match the interface expected by the frontend
      fetchedData = manufacturerData.map(item => ({
        company_code: item.companyCode,
        prin_code: item.prinCode,
        manu_code: item.manuCode,
        manu_name: item.manuName,
        country_code: item.countryCode,
        manu_addr1: item.manuAddr1,
        manu_addr2: item.manuAddr2,
        manu_addr3: item.manuAddr3,
        manu_addr4: item.manuAddr4,
        manu_city: item.manuCity,
        manu_contact: item.manuContact,
        manu_telno1: item.manuTelno1,
        manu_faxno1: item.manuFaxno1,
        manu_email1: item.manuEmail1,
        created_by: item.createdBy,
        created_at: item.createdAt,
        updated_by: item.updatedBy,
        updated_at: item.updatedAt
      }));
      
      totalCount = total;
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching category data from the Manufacture model for dropdown
// case "ddcategory": {
//   (fetchedData = await Categorymaster.findAll({
//     where: { company_code: requestUser.company_code },
//     ...paginationOptions,
//   })) as unknown[] as ICategorymaster[];
// }
// break;
  
// Fetching group data using GroupService
case "ddgroup": {
  let queryRunner;

  const sql = `
    SELECT
      group_code AS "group_code",
      group_name AS "group_name",
      prin_code AS "prin_code"
    FROM ms_prodgroup
    WHERE company_code = :company_code
    ORDER BY group_name
  `;

  const params = [
    requestUser.company_code
  ];

  try {
    if (!AppDataSource.isInitialized) {
      await TypeORMService.initialize();
    }

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    const results = await queryRunner.query(sql, params);

    fetchedData = results as TGroup[];
    console.log(fetchedData);
  } catch (error) {
    console.error("Error fetching ddgroup:", error);
    fetchedData = [];
  } finally {
    if (queryRunner) {
      try {
        await queryRunner.release();
      } catch (_) {}
    }
  }
}
break;




  
case "group":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { 
      companyCode: requestUser.company_code 
    };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Example: add search conditions based on your filter structure
      const groupNameSearch = filter.search.find((s: any) => s.field === 'groupName' && s.values);
      if (groupNameSearch) {
        filters.groupName = groupNameSearch.values;
      }
      
      const groupCodeSearch = filter.search.find((s: any) => s.field === 'groupCode' && s.values);
      if (groupCodeSearch) {
        filters.groupCode = groupCodeSearch.values;
      }
    }
    
    try {
      // Use GroupService to fetch group data with pagination
      const { data: groupData, total } = await GroupService.getGroups(
        filters, 
        page, 
        pageLimit
      );
      
      // Map entity fields to match the interface fields expected by the frontend if needed
      fetchedData = groupData.map(item => ({
        company_code: item.companyCode,
        prin_code: item.prinCode,
        group_code: item.groupCode,
        group_name: item.groupName,
        pref_site: item.prefSite,
        pref_loc_from: item.prefLocFrom,
        pref_loc_to: item.prefLocTo,
        pref_aisle_from: item.prefAisleFrom,
        pref_aisle_to: item.prefAisleTo,
        pref_col_from: item.prefColFrom,
        pref_col_to: item.prefColTo,
        pref_ht_from: item.prefHtFrom,
        pref_ht_to: item.prefHtTo,
        expiry_cons_days: item.expiryConsDays,
        created_by: item.createdBy,
        created_at: item.createdAt,
        updated_by: item.updatedBy,
        updated_at: item.updatedAt
      }));
      
      totalCount = total;
    } catch (error) {
      console.error("Error fetching groups:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching asset group data from the Assetgroup model
// case "assetgroup":
//   {
//     // Initialize inside and outside query variables
//     let insideQuery: any = [],
//       outsideQuery = {
//         [Op.and]: [{ company_code: requestUser.company_code }],
//       };
//     // Apply search filter to the outside query
//     outsideQuery = getSearchFilterQuery({
//       insideQuery,
//       filter: filter.search,
//       outsideQuery,
//     });
//     // Count the total number of records
//     totalCount = await Assetgroup.count({ where: outsideQuery });

//           (fetchedData = await DDPrincipaljob.findAll({
//             where: { company_code: requestUser.company_code },
//           })) as unknown[] as IPrincipaljob[];
//           console.log(fetchedData);
//         }
//         break;
    case "ddepartment": {
  let queryRunner; // declare outside try for finally block

  const sql = `
    SELECT
      dept_code AS "dept_code",
      dept_name AS "dept_name"
    FROM ms_hr_department
    WHERE company_code = :company_code
  `;

  const params = [requestUser.company_code];

  try {
    if (!AppDataSource.isInitialized) {
      await TypeORMService.initialize();
    }

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const results = await queryRunner.query(sql, params);

    await queryRunner.commitTransaction();

    fetchedData = results as IDepartmentjob[]; // replace with your TS type
    console.log(fetchedData);
  } catch (error) {
    if (queryRunner) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (_) {}
    }
    console.error("Error fetching ddepartment:", error);
    fetchedData = [];
  } finally {
    if (queryRunner) {
      try {
        await queryRunner.release();
      } catch (_) {}
    }
  }
}
break;

        
        break;
  case "dddivision": {
  let queryRunner; // ✅ declare outside try so finally can access it

  const sql = `
    SELECT
      div_code AS "div_code",
      div_name AS "div_name"
    FROM ms_hr_division
    WHERE company_code = :company_code
  `;

  const params = [requestUser.company_code];

  try {
    if (!AppDataSource.isInitialized) {
      await TypeORMService.initialize();
    }

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const results = await queryRunner.query(sql, params);

    await queryRunner.commitTransaction();

    fetchedData = results as IDivisionjob[];
    console.log(fetchedData);
  } catch (error) {
    if (queryRunner) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (_) {}
    }
    console.error("Error fetching dddivision:", error);
    fetchedData = [];
  } finally {
    if (queryRunner) {
      try {
        await queryRunner.release();
      } catch (_) {}
    }
  }
}
break;



  //     case "assePrincipal":
  //       {
  //         let insideQuery: any = [],
  //           outsideQuery = {
  //             [Op.and]: [
  //               { company_code: requestUser.company_code },
  //               // { user_id: requestUser.loginid },

  //             ],
  //           };
  //         outsideQuery = getSearchFilterQuery({
  //           insideQuery,
  //           filter: filter.search,
  //           outsideQuery,
  //         });
  //         totalCount = await PrincipalWmsView.count({ where: outsideQuery });
  //   // Fetch asset group data with optional pagination and sorting
  //   fetchedData = await Assetgroup.findAll({
  //     where: outsideQuery,
  //     ...(!!filter?.sort &&
  //       Object.keys(filter?.sort).length > 0 && {
  //         order: [
  //           [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
  //         ],
  //       }),
  //     ...paginationOptions,
  //   });
  // }
  // break;

// Fetching brand data from the Brand model
case "brand":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { companyCode: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Example: Add search conditions as needed
      // Cast to any[] and check both possible property names to satisfy TS types
      const searchItem = (filter.search as any[]).find((s: any) => s.field === 'brandName' || s.field_name === 'brandName');
      if (searchItem && searchItem.values) {
        filters.brandName = searchItem.values;
      }
    }
    
    try {
      // Use BrandService to fetch brand data with pagination
      const { data: brandData, total } = await BrandService.getBrands(
        filters, 
        page, 
        pageLimit
      );
      
      fetchedData = brandData;
      totalCount = total;
    } catch (error) {
      console.error("Error fetching brands:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching department data from the Department model
case "department":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters - match entity property names
    const filters: any = { company_code: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle department name search
      const nameSearch = filter.search.find((s: any) => s.field === 'dept_name' && s.values);
      if (nameSearch) {
        filters.dept_name = nameSearch.values;
      }
      
      // Handle department code search
      const codeSearch = filter.search.find((s: any) => s.field === 'dept_code' && s.values);
      if (codeSearch) {
        filters.dept_code = codeSearch.values;
      }
    }
    
    try {
      // Get all departments from service
      const allDepartments = await DepartmentService.findAll();
      
      // Filter departments based on company code and search criteria
      let filteredDepartments = allDepartments.filter(dept => {
        // Check company code match
        if (dept.company_code !== requestUser.company_code) {
          return false;
        }
        
        // Apply name filter if it exists
        if (filters.dept_name && dept.dept_name && !dept.dept_name.includes(filters.dept_name)) {
          return false;
        }
        
        // Apply code filter if it exists
        if (filters.dept_code && !dept.dept_code.includes(filters.dept_code)) {
          return false;
        }
        
        return true;
      });
      
      // Apply sorting if requested
      if (filter?.sort && Object.keys(filter.sort).length > 0) {
        const { field_name, desc } = filter.sort;
        filteredDepartments.sort((a: any, b: any) => {
          if (desc) {
            return a[field_name] < b[field_name] ? 1 : -1;
          } else {
            return a[field_name] > b[field_name] ? 1 : -1;
          }
        });
      }
      
      // Get total count before pagination
      totalCount = filteredDepartments.length;
      
      // Apply pagination
      const startIndex = (page - 1) * pageLimit;
      const endIndex = startIndex + pageLimit;
      fetchedData = filteredDepartments.slice(startIndex, endIndex);
    } catch (error) {
      console.error("Error fetching departments:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching supplier data from the Supplier model
case "supplier":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { company_code: requestUser.company_code };
    
    // Check if a specific supplier code is requested
    const specificSupplierCode = req.query.supplierCode || uniqueCode;
    
    try {
      // If a specific supplier is requested by code
      if (specificSupplierCode) {
        // Get the single supplier by code
        const supplier = await SupplierService.findByCode(
          specificSupplierCode.toString(),
          requestUser.company_code
        );
        
        if (supplier) {
          fetchedData = [supplier];
          totalCount = 1;
        } else {
          fetchedData = [];
          totalCount = 0;
        }
      } else {
        // Apply search filter if present
        if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
          // Handle supplier name search
          const nameSearch = filter.search.find((s: any) => s.field === 'supp_name' && s.values);
          if (nameSearch) {
            filters.supp_name = nameSearch.values;
          }
          
          // Handle supplier code search
          const codeSearch = filter.search.find((s: any) => s.field === 'supp_code' && s.values);
          if (codeSearch) {
            filters.supp_code = codeSearch.values;
          }
        }
        
        // Get all suppliers for the company
        const allSuppliers = await SupplierService.findByCompany(requestUser.company_code);
        
        // Filter suppliers based on search criteria
        let filteredSuppliers = allSuppliers.filter(supplier => {
          // Apply name filter if it exists
          if (filters.supp_name && supplier.supp_name && 
              !supplier.supp_name.toLowerCase().includes(filters.supp_name.toLowerCase())) {
            return false;
          }
          
          // Apply code filter if it exists
          if (filters.supp_code && 
              !supplier.supp_code.toLowerCase().includes(filters.supp_code.toLowerCase())) {
            return false;
          }
          
          return true;
        });
        
        // Apply sorting if requested
        if (filter?.sort && Object.keys(filter.sort).length > 0) {
          const { field_name, desc } = filter.sort;
          filteredSuppliers.sort((a: any, b: any) => {
            if (desc) {
              return a[field_name] < b[field_name] ? 1 : -1;
            } else {
              return a[field_name] > b[field_name] ? 1 : -1;
            }
          });
        }
        
        // Get total count before pagination
        totalCount = filteredSuppliers.length;
        
        // Apply pagination
        const startIndex = (page - 1) * pageLimit;
        const endIndex = startIndex + pageLimit;
        fetchedData = filteredSuppliers.slice(startIndex, endIndex);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching ddprincipal data from the DDPrincipaljob model
// case "ddprincipal":
//   {
//     // Fetch ddprincipal data with company code
//     (fetchedData = await DDPrincipaljob.findAll({
//       where: { company_code: requestUser.company_code },
//     })) as unknown[] as IPrincipaljob[];
//     // Log fetched data for debugging purposes
//     console.log(fetchedData);
//   }
//   break;
// Fetching ddepartment data from the DDdepartmentjob model
// case "ddepartment":
//   {
//     // Fetch ddepartment data with company code and optional pagination
//     (fetchedData = await DDdepartmentjob.findAll({
//       where: { company_code: requestUser.company_code },
//       ...paginationOptions,
//     })) as unknown[] as IDepartmentjob[];
//     // Log fetched data for debugging purposes
//     console.log(fetchedData);
//   }
//   break;
// Fetching dddivision data from the DDdivisionjob model
// case "dddivision":
//   {
//     // Fetch dddivision data with company code and optional pagination
//     (fetchedData = await DDdivisionjob.findAll({
//       where: { company_code: requestUser.company_code },
//       ...paginationOptions,
//     })) as unknown[] as IDivisionjob[];
//     // Log fetched data for debugging purposes
//     console.log(fetchedData);
//   }
//   break;
// Fetching principal data from the PrincipalMaster model
case "principal":
  {
    console.log("Fetching principal data..."); // Debug log
    console.log("Request user company_code:", requestUser.company_code); // Debug log
    
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { company_code: requestUser.company_code };
    
    console.log("Initial filters:", filters); // Debug log
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      console.log("Search filters:", filter.search); // Debug log
      
      // Handle principal name search
      const nameSearch = filter.search.find((s: any) => s.field === 'prin_name' && s.values);
      if (nameSearch && nameSearch.values) {
        const val = String(nameSearch.values).trim();
        if (val && val !== 'undefined' && val !== 'null') {
          filters.prin_name = val;
        }
      }
      
      // Handle principal code search
      const codeSearch = filter.search.find((s: any) => s.field === 'prin_code' && s.values);
      if (codeSearch && codeSearch.values) {
        const val = String(codeSearch.values).trim();
        if (val && val !== 'undefined' && val !== 'null') {
          filters.prin_code = val;
        }
      }
    }
    
    console.log("Final filters:", filters); // Debug log
    
    try {
      // Get all principals from service
      const allPrincipals = await PrincipalService.findAll();
      
      console.log("Total principals from service:", allPrincipals.length); // Debug log
      
      // Filter principals based on company code and search criteria
      let filteredPrincipals = allPrincipals.filter(principal => {
        // Check company code match
        if (principal.company_code !== requestUser.company_code) {
          return false;
        }
        
        // Apply name filter if it exists
        if (filters.prin_name && principal.prin_name && 
            !principal.prin_name.toLowerCase().includes(filters.prin_name.toLowerCase())) {
          return false;
        }
        
        // Apply code filter if it exists
        if (filters.prin_code && 
            !principal.prin_code.toLowerCase().includes(filters.prin_code.toLowerCase())) {
          return false;
        }
        
        return true;
      });
      
      console.log("Filtered principals count:", filteredPrincipals.length); // Debug log
      
      // Apply sorting if requested
      if (filter?.sort && Object.keys(filter.sort).length > 0) {
        const { field_name, desc } = filter.sort;
        filteredPrincipals.sort((a: any, b: any) => {
          if (desc) {
            return a[field_name] < b[field_name] ? 1 : -1;
          } else {
            return a[field_name] > b[field_name] ? 1 : -1;
          }
        });
      }
      
      // Get total count before pagination
      totalCount = filteredPrincipals.length;
      
      // Apply pagination
      const startIndex = (page - 1) * pageLimit;
      const endIndex = startIndex + pageLimit;
      fetchedData = filteredPrincipals.slice(startIndex, endIndex);
      
      console.log("Principal data fetched:", fetchedData.length, "Total:", totalCount); // Debug log
    } catch (error) {
      console.error("Error fetching principals:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching territory data from the Territory model
// case "territory":
//   {
//     // Fetch territory data with company code and optional pagination
//     (fetchedData = await Territory.findAll({
//       where: { company_code: requestUser.company_code },
//       ...paginationOptions,
//     })) as unknown[] as ITerritory[];
//   }
//   break;
// Fetching currency data from the Currency model
case "currency":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;

    // Prepare filters
    const filters: any = { company_code: requestUser.company_code };

    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      const nameSearch = filter.search.find((s: any) => s.field === 'curr_name' && s.values);
      if (nameSearch) {
        filters.curr_name = nameSearch.values;
      }
      const codeSearch = filter.search.find((s: any) => s.field === 'curr_code' && s.values);
      if (codeSearch) {
        filters.curr_code = codeSearch.values;
      }
    }

    try {
      // Use CurrencyService to fetch currencies with pagination
      const currencyData = await CurrencyService.findAll();

      
      //       const { data: currencyData, total } = await CurrencyService.getCurrencies(
      //   filters,
      //   page,
      //   pageLimit
      // );


      // Map entity fields to expected frontend shape if needed
      fetchedData = currencyData.map((item: any) => ({
        company_code: item.companyCode ?? item.company_code,
        curr_code: item.currCode ?? item.curr_code,
        curr_name: item.currName ?? item.curr_name,
        curr_symbol: item.currSymbol ?? item.curr_symbol,
        decimals: item.decimals ?? item.decimals,
        created_by: item.createdBy ?? item.created_by,
        created_at: item.createdAt ?? item.created_at,
        updated_by: item.updatedBy ?? item.updated_by,
        updated_at: item.updatedAt ?? item.updated_at,
      }));

      totalCount = currencyData.length;
    } catch (error) {
      console.error("Error fetching currencies:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }

  break;
// case "site":
//   {
//     // Initialize inside and outside query variables
//     let insideQuery: any = [], // Initialize inside query as an empty array
//       outsideQuery = {
//         [Op.and]: [{ company_code: requestUser.company_code }], // Initialize outside query with company code
//       };

//     // Apply search filter to the outside query
//     outsideQuery = getSearchFilterQuery({
//       insideQuery,
//       filter: filter.search,
//       outsideQuery,
//     });

//     // Count the total number of records
//     totalCount = await Site.count({ where: outsideQuery });

//     // Fetch site data with optional pagination and sorting
//     fetchedData = await Site.findAll({
//       where: outsideQuery,
//       ...(!!filter?.sort && // Check if filter.sort is not null or undefined
//         Object.keys(filter?.sort).length > 0 && { // Check if filter.sort has at least one key
//           order: [
//             [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"], // Sort by field name in descending or ascending order
//           ],
//         }),
//       ...paginationOptions, // Apply pagination options
//     });
//   }

//   break;
// case "industrysector":
//   {
//     // Fetch industry sector data with company code and optional pagination
//     (fetchedData = await industrysector.findAll({
//       where: { company_code: requestUser.company_code },
//       offset: skip,
//       limit: limit,
//     })) as unknown[] as IIndustrysector[];
//   }
//   break;

// case "costmaster":
//   {
//     // Fetch cost master data with company code and optional pagination
//     (fetchedData = await Country.findAll({
//       where: { company_code: requestUser.company_code },
//       offset: skip,
//       limit: limit,
//     })) as unknown[] as ICostmaster[];
//   }
//   break;
// case "rolemaster":
//   {
//     // Fetch role master data with company code and optional pagination
//     (fetchedData = await Country.findAll({
//       where: { company_code: requestUser.company_code },
//       offset: skip,
//       limit: limit,
//     })) as unknown[] as IRolemaster[];
//   }
//   break;
case "flowmaster":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    try {
      // Get the repository through FlowMasterService
      const repository = FlowMasterService.getFlowMasterRepository();
      
      // Create query builder with company code filter
      let queryBuilder = repository.createQueryBuilder("flowMaster")
        .where("flowMaster.company_code = :companyCode", { companyCode: requestUser.company_code });
      
      // Apply search filter if present
      if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
        // Handle flow description search
        const descSearch = filter.search.find((s: any) => s.field === 'flow_description' && s.values);
        if (descSearch) {
          queryBuilder = queryBuilder.andWhere("flowMaster.flow_description LIKE :description", 
            { description: `%${descSearch.values}%` });
        }
        
        // Handle flow code search
        const codeSearch = filter.search.find((s: any) => s.field === 'flow_code' && s.values);
        if (codeSearch) {
          queryBuilder = queryBuilder.andWhere("flowMaster.flow_code LIKE :code", 
            { code: `%${codeSearch.values}%` });
        }
      }
      
      // Get total count before pagination
      totalCount = await queryBuilder.getCount();
      
      // Apply sorting if requested
      if (filter?.sort && Object.keys(filter.sort).length > 0) {
        const { field_name, desc } = filter.sort;
        queryBuilder = queryBuilder.orderBy(
          `flowMaster.${field_name}`, 
          desc ? "DESC" : "ASC"
        );
      }
      
      // Apply pagination
      queryBuilder = queryBuilder
        .skip((page - 1) * pageLimit)
        .take(pageLimit);
      
      // Execute query
      const flowMasters = await queryBuilder.getMany();
      
      // Map to the expected interface format if needed
      fetchedData = flowMasters;
      
    } catch (error) {
      console.error("Error fetching flow masters:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching activity group data using ActivityGroupService
case "activitygroup": {
  try {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Get all activity groups for the company
    const allActivityGroups = await ActivityGroupService.findByCompany(requestUser.company_code);
    
    // Apply search filter if present
    let filteredActivityGroups = allActivityGroups;
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle activity group name search
      const nameSearch = filter.search.find((s: any) => s.field === 'act_group_name' && s.values);
      if (nameSearch && typeof nameSearch.values === 'string') {
        filteredActivityGroups = filteredActivityGroups.filter(group => 
          group.act_group_name &&
          typeof group.act_group_name === 'string' &&
          group.act_group_name.toLowerCase().includes((nameSearch.values as any).toLowerCase())
        );
      }
      
      // Handle activity group code search
      const codeSearch = filter.search.find((s: any) => s.field === 'activity_group_code' && s.values);
      if (codeSearch && typeof codeSearch.values === 'string') {
        filteredActivityGroups = filteredActivityGroups.filter(group => 
          group.activity_group_code.toLowerCase().includes((codeSearch.values as any).toLowerCase())
        );
      }
    }
    
    // Apply sorting if requested
    if (filter?.sort && Object.keys(filter.sort).length > 0) {
      const { field_name, desc } = filter.sort;
      filteredActivityGroups.sort((a: any, b: any) => {
        if (desc) {
          return a[field_name] < b[field_name] ? 1 : -1;
        } else {
          return a[field_name] > b[field_name] ? 1 : -1;
        }
      });
    }
    
    // Get total count before pagination
    totalCount = filteredActivityGroups.length;
    
    // Apply pagination manually
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    fetchedData = filteredActivityGroups.slice(startIndex, endIndex);
    
    // Cast to expected interface type
    fetchedData = fetchedData as unknown[] as IActivityGroup[];
  } catch (error) {
    console.error("Error fetching activity groups:", error);
    fetchedData = [];
    totalCount = 0;
  }
}
break;

// Fetching line data using LineService
case "line":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { company_code: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Add search conditions based on search parameters
      // This is a simplified example - adjust according to your search requirements
      const searchValue = filter.search.find(s => s.values)?.values;
      if (searchValue) {
        filters.line_name = searchValue;
      }
    }
    
    try {
      // Use LineService to fetch line data with pagination
      const { data: lineData, total } = await LineService.getLines(
        filters, 
        page, 
        pageLimit
      );
      
      fetchedData = lineData;
      totalCount = total;
    } catch (error) {
      console.error("Error fetching lines:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching vessel data from the vessel model
case "vessel":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;

    // Prepare filters
    const filters: any = { companyCode: requestUser.company_code };

    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle vessel name search
      const nameSearch = filter.search.find((s: any) => s.field === 'vessel_name' && s.values);
      if (nameSearch) {
        filters.vesselName = nameSearch.values;
      }

      // Handle vessel code search
      const codeSearch = filter.search.find((s: any) => s.field === 'vessel_code' && s.values);
      if (codeSearch) {
        filters.vesselCode = codeSearch.values;
      }
    }

    try {
      // Use VesselService to fetch vessel data with pagination
      const { data: vesselData, total } = await VesselService.getVessels(
        filters,
        page,
        pageLimit
      );

      // Map entity fields to match the interface expected by the frontend
      fetchedData = vesselData.map(item => ({
        company_code: item.companyCode,
        vessel_code: item.vesselCode,
        vessel_name: item.vesselName,
        line_code: item.lineCode,
        contact_person: item.contactPerson,
        address: item.address,
        tel_no: item.telNo,
        fax_no: item.faxNo,
        email: item.email,
        created_by: item.createdBy,
        created_at: item.createdAt,
        updated_by: item.updatedBy,
        updated_at: item.updatedAt
      }));

      totalCount = total;
    } catch (error) {
      console.error("Error fetching vessels:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching airline data using AirlineService (TypeORM)
case "airline":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;

    // Prepare filters
    const filters: any = { companyCode: requestUser.company_code };

    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      const airlineNameSearch = filter.search.find((s: any) => s.field === 'airlineName' && s.values);
      if (airlineNameSearch) {
        filters.airlineName = airlineNameSearch.values;
      }
      const airlineCodeSearch = filter.search.find((s: any) => s.field === 'airlineCode' && s.values);
      if (airlineCodeSearch) {
        filters.airlineCode = airlineCodeSearch.values;
      }
    }

    try {
      // Use AirlineService to fetch airline data with pagination
      const { data: airlineData, total } = await AirlineService.getAirlines(
        filters,
        page,
        pageLimit
      );

      fetchedData = airlineData.map(item => ({
        company_code: item.companyCode,
        airline_code: item.airlineCode,
        airline_name: item.airlineName,
        airline_no: item.airlineNo,
        contact_person: item.contactPerson,
        address: item.address,
        tel_no: item.telNo,
        fax_no: item.faxNo,
        email: item.email,
        // created_by: item.createdBy,
        // updated_by: item.updatedBy,
        // user_date: item.userDate,
        // user_id: item.userId
      }));

      totalCount = total;
    } catch (error) {
      console.error("Error fetching airlines:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;
case "partner":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { company_code: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      const nameSearch = filter.search.find((s: any) => s.field === 'broker_name' && s.values);
      if (nameSearch) {
        filters.broker_name = nameSearch.values;
      }
      
      const codeSearch = filter.search.find((s: any) => s.field === 'broker_code' && s.values);
      if (codeSearch) {
        filters.broker_code = codeSearch.values;
      }
    }
    
    try {
      // Use PartnerService to fetch partner data with pagination
      const { data: partnerData, total } = await PartnerService.getPartners(
        filters, 
        page, 
        pageLimit
      );
      
      fetchedData = partnerData;
      totalCount = total;
    } catch (error) {
      console.error("Error fetching partners:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

case "salesman":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { company_code: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle salesman name search
      const nameSearch = filter.search.find((s: any) => s.field === 'salesman_name' && s.values);
      if (nameSearch) {
        filters.salesman_name = nameSearch.values;
      }
      
      // Handle salesman code search
      const codeSearch = filter.search.find((s: any) => s.field === 'salesman_code' && s.values);
      if (codeSearch) {
        filters.salesman_code = codeSearch.values;
      }
    }
    
    try {
      // Get all salesmen from company
      const allSalesmen = await SalesmanService.findAll();
      
      // Filter salesmen based on company code and search criteria
      let filteredSalesmen = allSalesmen.filter(salesman => {
        // Check company code match
        if (salesman.company_code !== requestUser.company_code) {
          return false;
        }
        
        // Apply name filter if it exists
        if (filters.salesman_name && salesman.salesman_name && 
            !salesman.salesman_name.toLowerCase().includes(filters.salesman_name.toLowerCase())) {
          return false;
        }
        
        // Apply code filter if it exists
        if (filters.salesman_code && 
            !salesman.salesman_code.toLowerCase().includes(filters.salesman_code.toLowerCase())) {
          return false;
        }
        
        return true;
      });
      
      // Apply sorting if requested
      if (filter?.sort && Object.keys(filter.sort).length > 0) {
        const { field_name, desc } = filter.sort;
        filteredSalesmen.sort((a: any, b: any) => {
          if (desc) {
            return a[field_name] < b[field_name] ? 1 : -1;
          } else {
            return a[field_name] > b[field_name] ? 1 : -1;
          }
        });
      }
      
      // Get total count before pagination
      totalCount = filteredSalesmen.length;
      
      // Apply pagination
      const startIndex = (page - 1) * pageLimit;
      const endIndex = startIndex + pageLimit;
      fetchedData = filteredSalesmen.slice(startIndex, endIndex);
    } catch (error) {
      console.error("Error fetching salesmen:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching activity subgroup data from the Activitysubgroup model
case "activitysubgroup":
  {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters
    const filters: any = { companyCode: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle subgroup name search
      const nameSearch = filter.search.find((s: any) => s.field === 'act_subgroup_name' && s.values);
      if (nameSearch) {
        filters.actSubgroupName = nameSearch.values;
      }
      
      // Handle subgroup code search
      const codeSearch = filter.search.find((s: any) => s.field === 'activity_subgroup_code' && s.values);
      if (codeSearch) {
        filters.activitySubgroupCode = codeSearch.values;
      }
    }
    
    try {
      // Use ActivitySubgroupService to fetch activity subgroup data with pagination
      const { data: activitySubgroupData, total } = await ActivitySubgroupService.getActivitySubgroups(
        filters, 
        page, 
        pageLimit
      );
      
      // Map entity fields to match the interface fields expected by the frontend
      fetchedData = activitySubgroupData.map(item => ({
        company_code: item.companyCode,
        activity_subgroup_code: item.activitySubgroupCode,
        act_subgroup_name: item.actSubgroupName,
        act_group_code: item.actGroupCode,
        account_code: item.accountCode,
        mandatory_flag: item.mandatoryFlag,
        validate_flag: item.validateFlag,
        user_id: item.userId,
        user_dt: item.userDt,
        created_by: item.createdBy,
        created_at: item.createdAt,
        updated_by: item.updatedBy,
        updated_at: item.updatedAt
      }));
      
      totalCount = total;
    } catch (error) {
      console.error("Error fetching activity subgroups:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;

// Fetching billing activity data from the ActivityBillingTable model
// case "billing_activity":
//   {
//     // Initialize inside and outside query variables
//     let insideQuery: any = [],
//       outsideQuery = {
//         [Op.and]: [
//           { company_code: requestUser.company_code },
//           {
//             ...(!!uniqueCode && {
//               prin_code: uniqueCode,
//             }),
//           },
//           {
//             user_id: requestUser.loginid,
//           },
//         ],
//       };

//     // Apply search filter to the outside query
//     outsideQuery = getSearchFilterQuery({
//       insideQuery,
//       filter: filter.search,
//       outsideQuery,
//     });

//     // Count the total number of records
//     totalCount = await ActivityBillingTable.count({
//       where: outsideQuery,
//     });

//     // Fetch billing activity data with optional pagination and sorting
//     fetchedData = await ActivityBillingTable.findAll({
//       where: outsideQuery,
//       ...(!!filter?.sort &&
//         Object.keys(filter?.sort).length > 0 && {
//           order: [
//             [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
//           ],
//         }),
//       ...paginationOptions,
//     });
//   }
//   break;
// Fetching activity data from the Activity model
// case "activity": {
//   // Fetching data using the Activity model
//   fetchedData = (await Activity.findAll({
//     attributes: ["activity_code", "activity", "activity_group_code"],
//     where: {
//       company_code: requestUser.company_code,
//     },
//     ...paginationOptions,
//   })) as unknown[] as IActivity[];

//   break;
// }

// Fetching activity KPI data from the ActivityKPI model
case "activitykpi": {
  try {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters - convert snake_case to camelCase for TypeORM entity
    const filters: any = { companyCode: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Map search fields from snake_case to camelCase
      const prinCodeSearch = filter.search.find((s: any) => s.field === 'prin_code' && s.values);
      if (prinCodeSearch) {
        filters.prinCode = prinCodeSearch.values;
      }
      
      const jobTypeSearch = filter.search.find((s: any) => s.field === 'job_type' && s.values);
      if (jobTypeSearch) {
        filters.jobType = jobTypeSearch.values;
      }
      
      const actCodeSearch = filter.search.find((s: any) => s.field === 'act_code' && s.values);
      if (actCodeSearch) {
        filters.actCode = actCodeSearch.values;
      }
    }
    
    // Use ActivityKpiService to fetch activity KPI data with pagination
    const { data: activityKpiData, total } = await ActivityKpiService.getActivityKpis(
      filters, 
      page, 
      pageLimit
    );
    
    // Map entity fields back to snake_case for frontend compatibility
    fetchedData = activityKpiData.map(item => ({
      company_code: item.companyCode,
      prin_code: item.prinCode,
      job_type: item.jobType,
      act_code: item.actCode,
      cust_code: item.custCode,
      exp_hours: item.expHours,
      user_dt: item.userDt,
      user_id: item.userId
    }));
    
    totalCount = total;
  } catch (error) {
    console.error("Error fetching activity KPIs:", error);
    fetchedData = [];
    totalCount = 0;
  }
  break;
}

// Fetching location data from the Location model
case "location": {
  // Get pagination parameters
  const page = Number(req.query.page) || 1;
  const pageLimit = Number(req.query.limit) || 100;
  
  // Prepare filters
  const filters: any = { company_code: requestUser.company_code };
  
  // Apply search filter if present
  if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
    // Handle location name search
    const nameSearch = filter.search.find((s: any) => s.field === 'location_name' && s.values);
    if (nameSearch) {
      filters.location_name = nameSearch.values;
    }
    
    // Handle location code search
    const codeSearch = filter.search.find((s: any) => s.field === 'location_code' && s.values);
    if (codeSearch) {
      filters.location_code = codeSearch.values;
    }
  }
  
  try {
    // Get all locations from service
    const allLocations = await LocationService.findAll();
    
    // Filter locations based on company code and search criteria
    let filteredLocations = allLocations.filter(location => {
      // Check company code match
      if (location.company_code !== requestUser.company_code) {
        return false;
      }
      
      // Apply name filter if it exists
      if (filters.location_name && location.loc_desc && 
          !location.loc_desc.includes(filters.location_name)) {
        return false;
      }
      
      // Apply code filter if it exists
      if (filters.location_code && !location.location_code.includes(filters.location_code)) {
        return false;
      }
      
      return true;
    });
    
    // Apply sorting if requested
    if (filter?.sort && Object.keys(filter.sort).length > 0) {
      const { field_name, desc } = filter.sort;
      filteredLocations.sort((a: any, b: any) => {
        if (desc) {
          return a[field_name] < b[field_name] ? 1 : -1;
        } else {
          return a[field_name] > b[field_name] ? 1 : -1;
        }
      });
    }
    
    // Get total count before pagination
    totalCount = filteredLocations.length;
    
    // Apply pagination
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    fetchedData = filteredLocations.slice(startIndex, endIndex);
  } catch (error) {
    console.error("Error fetching locations:", error);
    fetchedData = [];
    totalCount = 0;
  }
}
break;

case "locationtype": {
  try {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters - using camelCase for TypeORM entity property names
    const filters: any = { companyCode: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle location type name search
      const nameSearch = filter.search.find((s: any) => s.field === 'loc_name' && s.values);
      if (nameSearch) {
        filters.locName = nameSearch.values;
      }
      
      // Handle location type code search
      const codeSearch = filter.search.find((s: any) => s.field === 'loc_type' && s.values);
      if (codeSearch) {
        filters.locType = codeSearch.values;
      }
    }
    
    // Use LocationTypeService to fetch location type data with pagination
    const { data: locationTypeData, total } = await LocationTypeService.getLocationTypes(
      filters,
      page,
      pageLimit
    );
    
    // Map entity fields to match the interface fields expected by the frontend
    fetchedData = locationTypeData.map(item => ({
      company_code: item.companyCode,
      loc_type: item.locType,
      loc_name: item.locName,
      loc_cbm: item.locCbm,
      loc_wt: item.locWt,
      push_level: item.pushLevel,
      user_id: item.userId,
      user_dt: item.userDt
    }));
    
    totalCount = total;
  } catch (error) {
    console.error("Error fetching location types:", error);
    fetchedData = [];
    totalCount = 0;
  }
}
break;

case "uom": {
  try {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Get all UOMs for the company
    const allUoms = await UomService.findByCompany(requestUser.company_code);
    
    // Apply search filter if present
    let filteredUoms = allUoms;
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle UOM name search
      const nameSearch = filter.search.find((s: any) => s.field === 'uom_name' && s.values);
      if (nameSearch) {
        filteredUoms = filteredUoms.filter(uom => 
          uom.uom_name &&
          uom.uom_name.toLowerCase().includes((nameSearch.values as unknown as string).toLowerCase())
        );
      }
      
      // Handle UOM code search
      const codeSearch = filter.search.find((s: any) => s.field === 'uom_code' && s.values);
      if (codeSearch) {
        const searchVal = (codeSearch.values as unknown as string).toLowerCase();
        filteredUoms = filteredUoms.filter(uom =>
          !!uom.uom_code && String(uom.uom_code).toLowerCase().includes(searchVal)
        );
      }
    }
    
    // Apply sorting if requested
    if (filter?.sort && Object.keys(filter.sort).length > 0) {
      const { field_name, desc } = filter.sort;
      filteredUoms.sort((a: any, b: any) => {
        if (desc) {
          return a[field_name] < b[field_name] ? 1 : -1;
        } else {
          return a[field_name] > b[field_name] ? 1 : -1;
        }
      });
    }
    
    // Get total count before pagination
    totalCount = filteredUoms.length;
    
    // Apply pagination manually
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    fetchedData = filteredUoms.slice(startIndex, endIndex);
    
    console.log("Fetched UOM data:", fetchedData); // Log the fetched data
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    fetchedData = [];
    totalCount = 0;
  }
}
break;

// Fetching harmonize data
case "harmonize":
   {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    
    // Prepare filters
    const filters: any = { companyCode: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle description search
      const descSearch = filter.search.find((s: any) => s.field === 'harm_desc' && s.values);
      if (descSearch) {
        filters.harmDesc = descSearch.values;
      }
      
      // Handle code search
      const codeSearch = filter.search.find((s: any) => s.field === 'harm_code' && s.values);
      if (codeSearch) {
        filters.harmCode = codeSearch.values;
      }
    }
    
    try {
      // Use HarmonizeService to fetch harmonize codes with pagination
      const { data: harmonizeCodes, total } = await HarmonizeService.getHarmonizeCodes(
        filters, 
        page, 
        pageLimit
      );
      
      // Map entity fields to match the interface fields expected by the frontend
      fetchedData = harmonizeCodes.map(item => ({
        company_code: item.companyCode,
        harm_code: item.harmCode,
        harm_desc: item.harmDesc,
        short_desc: item.shortDesc,
        uom: item.uom,
        permit_reqd: item.permitReqd,
        unit: item.unit,
        created_by: item.createdBy,
        created_at: item.createdAt,
        updated_by: item.updatedBy,
        updated_at: item.updatedAt
      }));
      
      totalCount = total;
    } catch (error) {
      console.error("Error fetching harmonize codes:", error);
      fetchedData = [];
      totalCount = 0;
    }
  }
  break;
case "uoc": {
  try {
    // Get pagination parameters
    const page = Number(req.query.page) || 1;
    const pageLimit = Number(req.query.limit) || 100;
    
    // Prepare filters - note the companyCode property name for TypeORM
    const filters: any = { companyCode: requestUser.company_code };
    
    // Apply search filter if present
    if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
      // Handle description search
      const descriptionSearch = (filter.search as any[]).find(s => s.field === 'description' && s.values);
      if (descriptionSearch) {
        filters.description = descriptionSearch.values;
      }
      
      // Handle charge type search
      const chargeTypeSearch = (filter.search as any[]).find((s: any) => s.field === 'charge_type' && s.values);
      if (chargeTypeSearch) {
        filters.chargeType = chargeTypeSearch.values;
      }
      
      // Handle charge code search
      const chargeCodeSearch = filter.search.find((s: any) => s.field === 'charge_code' && s.values);
      if (chargeCodeSearch) {
        filters.chargeCode = chargeCodeSearch.values;
      }
    }
    
    // Use ActivityUOCService to fetch activity UOC data with pagination
    const { data: activityUocData, total } = await ActivityUOCService.getActivityUOCs(
      filters, 
      page, 
      pageLimit
    );
    
    // Map entity fields to match the interface fields expected by the frontend
    fetchedData = activityUocData.map(item => ({
      company_code: item.companyCode,
      charge_type: item.chargeType,
      charge_code: item.chargeCode,
      description: item.description,
      activity_group_code: item.activityGroupCode,
      created_by: item.createdBy,
      created_at: item.createdAt,
      updated_by: item.updatedBy,
      updated_at: item.updatedAt
    }));
    
    totalCount = total;
  } catch (error) {
    console.error("Error fetching UOC data:", error);
    fetchedData = [];
    totalCount = 0;
  }
}
break;
      
    // Fetching MOC (Mode of Charge) data using MocService
    case "moc": {
      try {
        // Get pagination parameters
        const page = Number(req.query.page) || 1;
        const pageLimit = Number(req.query.limit) || 100;
        
        // Get all MOCs for the company
        const allMocs = await MocService.findByCompany(requestUser.company_code);
        
        // Apply search filter if present
        let filteredMocs = allMocs;
        if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
          // Handle MOC name search
          const nameSearch = filter.search.find((s: any) => s.field === 'moc_name' && s.values);
          if (nameSearch && typeof nameSearch.values === 'string') {
            filteredMocs = filteredMocs.filter(moc => 
              moc.moc_name &&
              moc.moc_name.toLowerCase().includes((nameSearch.values as unknown as string).toLowerCase())
            );
          }
          
          // Handle MOC code search
          const codeSearch = filter.search.find((s: any) => s.field === 'moc_code' && s.values);
          if (codeSearch && typeof codeSearch.values === 'string') {
            filteredMocs = filteredMocs.filter(moc => 
              moc.moc_code.toLowerCase().includes((codeSearch.values as unknown as string).toLowerCase())
            );
          }
        }
        
        // Apply sorting if requested
        if (filter?.sort && Object.keys(filter.sort).length > 0) {
          const { field_name, desc } = filter.sort;
          filteredMocs.sort((a: any, b: any) => {
            if (desc) {
              return a[field_name] < b[field_name] ? 1 : -1;
            } else {
              return a[field_name] > b[field_name] ? 1 : -1;
            }
          });
        }
        
        // Get total count before pagination
        totalCount = filteredMocs.length;
        
        // Apply pagination manually
        const startIndex = (page - 1) * pageLimit;
        const endIndex = startIndex + pageLimit;
        fetchedData = filteredMocs.slice(startIndex, endIndex);
        
        console.log("Fetched MOC data:", fetchedData);
      } catch (error) {
        console.error("Error fetching MOCs:", error);
        fetchedData = [];
        totalCount = 0;
      }
    }
    break;
      
    // Fetching MOC2 (Activity UOC) data using ActivityUOCService
    case "moc2": {
      try {
        console.log('Fetching MOC2 data...');
        
        // Get pagination parameters
        const page = Number(req.query.page) || 1;
        const pageLimit = Number(req.query.limit) || 100;
        
        // Build filters in camelCase for the public service method
        const filtersForService: any = { companyCode: requestUser.company_code };
        
        // Apply search filter if present (map snake_case to camelCase)
        if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
          console.log('Search filters:', filter.search);
          
          const descSearch = filter.search.find((s: any) => s.field === 'description' && s.values);
          if (descSearch && typeof descSearch.values === 'string') {
            filtersForService.description = descSearch.values;
          }
          
          const chargeTypeSearch = filter.search.find((s: any) => s.field === 'charge_type' && s.values);
          if (chargeTypeSearch && typeof chargeTypeSearch.values === 'string') {
            filtersForService.chargeType = chargeTypeSearch.values;
          }
          
          const chargeCodeSearch = filter.search.find((s: any) => s.field === 'charge_code' && s.values);
          if (chargeCodeSearch && typeof chargeCodeSearch.values === 'string') {
            filtersForService.chargeCode = chargeCodeSearch.values;
          }
          
          const activityGroupSearch = filter.search.find((s: any) => s.field === 'activity_group_code' && s.values);
          if (activityGroupSearch && typeof activityGroupSearch.values === 'string') {
            filtersForService.activityGroupCode = activityGroupSearch.values;
          }
        }
        
        console.log('Filters for service call:', filtersForService);
        
        // Use public service method which handles pagination and returns { data, total }
        const { data: moc2Data, total } = await ActivityUOCService.getActivityUOCs(
          filtersForService,
          page,
          pageLimit
        );
        
        // Map entity fields to frontend shape (same as 'uoc' case)
        fetchedData = moc2Data.map(item => ({
          company_code: item.companyCode,
          charge_type: item.chargeType,
          charge_code: item.chargeCode,
          description: item.description,
          activity_group_code: item.activityGroupCode,
          created_by: item.createdBy,
          created_at: item.createdAt,
          updated_by: item.updatedBy,
          updated_at: item.updatedAt
        }));
        
        totalCount = total;
        
        console.log("Fetched MOC2 data:", fetchedData.length, "Total:", totalCount);
      } catch (error) {
        console.error("Error fetching MOC2s:", error);
        fetchedData = [];
        totalCount = 0;
      }
    }
    break;
      
    // Fetching division data from the Division model
    case "division":
      {
        // Get pagination parameters
        const page = Number(req.query.page) || 1;
        const pageLimit = Number(req.query.limit) || 100;

        // Prepare filters
        const filters: any = { companyCode: requestUser.company_code };

        // Apply search filter if present
        if (filter.search && Array.isArray(filter.search) && filter.search.length > 0) {
          const divNameSearch = filter.search.find((s: any) => s.field === 'divName' && s.values);
          if (divNameSearch) {
            filters.divName = divNameSearch.values;
          }
          const divCodeSearch = filter.search.find((s: any) => s.field === 'divCode' && s.values);
          if (divCodeSearch) {
            filters.divCode = divCodeSearch.values;
          }
        }

        try {
          // Use DivisionService to fetch division data with pagination
          const { data: divisionData, total } = await DivisionService.getDivisions(
            filters,
            page,
            pageLimit
          );

          fetchedData = divisionData.map(item => ({
            company_code: item.companyCode,
            div_code: item.divCode,
            div_name: item.divName,
            div_short_name: item.divShortName,
            div_address1: item.divAddress1,
            div_address2: item.divAddress2,
            div_address3: item.divAddress3,
            country_code: item.countryCode,
            phone: item.phone,
            fax: item.fax,
            email: item.email,
            div_head_id: item.divHeadId,
            remarks: item.remarks,
            status: item.status,
            user_id: item.userId,
            user_dt: item.userDate,
            enterprice_code: item.enterpriceCode,
            payroll_date: item.payrollDate,
            payroll_status: item.payrollStatus,
            normal_working_hrs: item.normalWorkingHours,
            day_off1: item.dayOff1,
            day_off2: item.dayOff2,
            hr_representative: item.hrRepresentative,
            pay_month: item.payMonth,
            pay_year: item.payYear,
            payroll_calc_type: item.payrollCalcType,
            day_off1_half_day: item.dayOff1HalfDay,
            day_off2_half_day: item.dayOff2HalfDay,
            fin_year_start: item.finYearStart,
            fin_year_end: item.finYearEnd,
            bank_name_inv: item.bankNameInv,
            ac_code_inv: item.acCodeInv,
            reference_no_inv: item.referenceNoInv,
            bank_address_inv: item.bankAddressInv,
            swift_code_inv: item.swiftCodeInv,
            emp_document_path: item.empDocumentPath,
            payroll_cutoff_date: item.payrollCutoffDate,
            payroll_day: item.payrollDay,
            emp_acgroup: item.empAcgroup,
            emp_cnt: item.empCnt,
            trn_no: item.trnNo
          }));

          totalCount = total;
        } catch (error) {
          console.error("Error fetching divisions:", error);
          fetchedData = [];
          totalCount = 0;
        }
      }
      break;
    case "customer":
      {
        console.log ('Fetching customer data...');
        const page = Number(req.query.page) || 1;
        const pageLimit = Number(req.query.limit) || 1000;
        const filters: any = { company_code: requestUser.company_code };

          const { data, total } = await CustomerService.getCustomers(
            filters,
            page,
            pageLimit
          );

          fetchedData = data;
          totalCount = total;
        }
        break;
      }

// Return a successful response with the fetched data and total count
res.status(constants.STATUS_CODES.OK).json({
  // Indicate that the operation was successful
  success: true,
  // Return the fetched data and total count
  data: { tableData: fetchedData, count: totalCount },
});
// Exit the function
return;
  }catch (err) {
  // Log the error for debugging purposes
 
  console.error(err);
  
  // Return a response with a 500 status code (Internal Server Error) and a JSON object
  res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    // Indicate that the operation was not successful
    success: false,
    // Provide a generic error message
   
   
    message: "Error occurred while fetching data",
  });
}
};

// Delete master data (country,Port , department, territory, etc.) with optional pagination based on the `master` type.
export const deleteWmsMaster = async (req: RequestWithUser, res: Response) => {
  try {
    // Extract master type from request parameters
    const { master } = req.params;
    
    // Extract user information from request
    const requestUser: IUser = req.user;
    
    // Extract port code and ids from req
    const { ids } = req.body;
    
    // Check if ids are provided
    if (!ids || ids.length === 0) {
      throw new Error("countryCode is required");
    }
    
    // Switch statement to handle different master types
    switch (master) {
      // Delete country data using CountryService
      case "country":
        {
          // Use CountryService to delete country data
          if (Array.isArray(ids)) {
            // If ids is an array, delete multiple countries
            for (const countryCode of ids) {
              await CountryService.deleteCountry(countryCode);
            }
          } else {
            // If ids is a single value, delete one country
            await CountryService.deleteCountry(ids);
          }
        }
        break;

      // Delete alert data
      // case "alert":
      //   {
      //     // Destroy alert data with company code and op code
      //     await Alert.destroy({
      //       where: {
      //         company_code: requestUser.company_code,
      //         op_code: ids,
      //       },
      //     });
      //   }
      //   break;

      // Delete department data
      case "department":
        {
          // Check if ids are provided
          if (ids && ids.length > 0) {
            // If ids is an array of department codes
            if (Array.isArray(ids)) {
              for (const deptCode of ids) {
                await DepartmentService.deleteDepartment(deptCode, requestUser.company_code);
              }
            } else {
              // If ids is a single department code
              await DepartmentService.deleteDepartment(ids, requestUser.company_code);
            }
          } else {
            throw new Error("Department code is required");
          }
        }
        break;

      // Delete location data
      case "location":
        {
          // Check if ids are provided
          if (ids && ids.length > 0) {
            // If ids is an array of location codes
            if (Array.isArray(ids)) {
              for (const locationCode of ids) {
                await LocationService.deleteLocation(locationCode);
              }
            } else {
              // If ids is a single location code

              await LocationService.deleteLocation(ids);
            }
          } else {
            throw new Error("Location code is required");
          }
        }
        break;

      // Delete supplier data
      case "supplier":
        {
          // Check if ids are provided
          if (ids && ids.length > 0) {
            // If ids is an array of supplier codes
            if (Array.isArray(ids)) {
              for (const suppCode of ids) {
                await SupplierService.deleteSupplier(suppCode, requestUser.company_code);
              }
            } else {
              // If ids is a single supplier code
              await SupplierService.deleteSupplier(ids, requestUser.company_code);
            }
          } else {
            throw new Error("Supplier code is required");
          }
        }
        break;

      // Delete currency data
      // case "currecy":
      //   {
      //     // Destroy currency data with company code and curr code
         
      //     await Currency.destroy({
      //       where: {
      //         company_code: requestUser.company_code,
      //         curr_code: ids,
      //       },
      //     });
      //   }
      //   break;
      // // Delete brand data
      case "brand":
        {
          // Check if ids are provided instead of port_code
          if (ids && ids.length > 0) {
            // Convert flat array of brand codes to array of objects with composite key parts
            const brandKeys = (ids as string[]).map((brandCode: string) => ({
              companyCode: requestUser.company_code,
              prinCode: req.body.prin_code || '',  // Get from request body or use default
              groupCode: req.body.group_code || '', // Get from request body or use default
              brandCode: brandCode
            }));
            
            // Use BrandService to delete brands
            await BrandService.deleteBrands(brandKeys);
          } 
          // Handle the case where port_code is provided (use req.body.port_code)
          else if (req.body && req.body.port_code) {
            await PortService.deletePorts([req.body.port_code]);
          } else {
            throw new Error("Port code is required");
          }
        }
        break;

      // Delete principal data
      case "principal":
        {
          // Check if ids are provided
          if (ids && ids.length > 0) {
            // If ids is an array of principal codes
            if (Array.isArray(ids)) {
              for (const prinCode of ids) {
                await PrincipalService.deletePrincipal(prinCode);
              }
            } else {
              // If ids is a single principal code
              await PrincipalService.deletePrincipal(ids);
            }
          } else {
            throw new Error("Principal code is required");
          }
        }
        break;

      // Delete product data
      case "product":
        {
          // Use ProductService to delete products by prod_code(s)
          if (ids && ids.length > 0) {
            await ProductService.deleteProducts(ids);
          } else {
            throw new Error("Product code(s) required");
          }
        }
        break;

      // Delete activity group data
      case "activitygroup":
        {
          // Check if ids are provided
          if (ids && ids.length > 0) {
            // If ids is an array of activity group codes
            if (Array.isArray(ids)) {
              for (const groupCode of ids) {
                await ActivityGroupService.deleteActivityGroup(groupCode);
              }
            } else {
              // If ids is a single activity group code
              await ActivityGroupService.deleteActivityGroup(ids);
            }
          } else {
            throw new Error("Activity group code is required");
          }
        }
        break;

            // Delete line data
            case "line":
                {
                  // Use LineService to delete lines
                  if (ids && ids.length > 0) {
                    await LineService.deleteLines(ids);
                  } else {
                    throw new Error("Line code is required");
                  }
                }
                break;

            // Delete salesman data
            case "salesman":
                {
                  // Check if ids are provided
                  if (ids && ids.length > 0) {
                    // If ids is an array of salesman codes
                    if (Array.isArray(ids)) {
                      for (const salesmanCode of ids) {
                        await SalesmanService.deleteSalesman(salesmanCode);
                      }
                    } else {
                      // If ids is a single salesman code
                      await SalesmanService.deleteSalesman(ids);
                    }
                  } else {
                    throw new Error("Salesman code is required");
                  }
                }
                break;

                  // Delete MOC data
                  case "moc":
                    {
                      // Validate ids input
                      if (!ids || (Array.isArray(ids) && ids.length === 0)) {
                        throw new Error("MOC code is required");
                      }
      
                      // If array, delete each; otherwise delete single code
                      if (Array.isArray(ids)) {
                        for (const mocCode of ids) {
                          await MocService.deleteMoc(mocCode);
                        }
                      } else {
                        await MocService.deleteMoc(ids);
                      }
                    }
                    break;
            }
      
            // Return a successful response after deletion
            res.status(constants.STATUS_CODES.OK).json({
              success: true,
              message: "Deleted successfully",
            });
            return;
          } catch (err) {
            console.error(err);
            res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
              success: false,
              message: "Error occurred while deleting data",
            });
          }
        };