// Import necessary interfaces and types
import { ISearch, RequestWithUser } from "../../interfaces/common.interface";
import { Response } from "express";
import constants from "../../helpers/constants";
import { employeeSchema } from "../../validation/HR/hr.validation";
import * as fastCsv from "fast-csv";

// Import necessary entities and repositories
import { AppDataSource } from "../../database/connection";
import { HrViewEmp } from "../../views/hr/hr_view_employee";

// Import necessary helper functions
import { getSearchFilterQuery } from "../../helpers/functions";

// Import necessary interfaces
import { IHrViewEmp } from "../../interfaces/Hr/hr_view_employee";
import { IHrEmployee } from "../../interfaces/Hr/hr_employee";
import { IUser } from "../../interfaces/user.interface";

// Import necessary utility classes
import HrCsvHeaders from "../../utils/exportCsv/HrCsvHeaders";
import { In, Like, FindOptionsWhere, FindManyOptions } from "typeorm";
import { HrEmployee } from "../../models/Hr/hr_employee";

// ------------ Create Employee -----------
/**
 * Creates a new employee in the database.
 */
export const createEmployee = async (req: RequestWithUser, res: Response) => {
  try {
    // Validate the employee data using the employee schema.
    const { error } = employeeSchema(req.body);
    const requestUser: IUser = req.user;
    
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Extract the alternate ID and employee code from the request body.
    const { alternate_id, employee_code, ...remainingData } = req.body;
    const employeeRepository = AppDataSource.getRepository(HrEmployee);

    if (alternate_id) {
      // Check if an employee with the same alternate ID already exists.
      const employee = await employeeRepository.findOne({ 
        where: { alternate_id } 
      });
      
      if (employee) {
        res
          .status(constants.STATUS_CODES.CONFLICT)
          .json({ success: false, message: "Alternate ID already exists" });
        return;
      }
    }

    // Create a new employee in the database.
    const newEmployee = employeeRepository.create({
      employee_code: "",
      alternate_id,
      employee_id: "",
      company_code: requestUser.company_code,
      ...remainingData,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const savedEmployee = await employeeRepository.save(newEmployee);

    // Get the session code from the database using TypeORM query builder
    const sessionRepository = AppDataSource.getRepository("GtSessionInfo");
    const getSessionCode = await sessionRepository
      .createQueryBuilder("session")
      .select("session.code")
      .where("session.USERID = :userId", { userId: req.user.loginid })
      .getOne();

    const sessionCode = getSessionCode ? getSessionCode.code : "";

    res.status(constants.STATUS_CODES.CREATED).json({
      success: true,
      message: `${sessionCode} Employee created successfully`,
      data: savedEmployee,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// ------------ Update Employee --------------
/**
 * Updates an existing employee in the database.
 */
export const updateEmployee = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser = req.user;
    const { employeeCode } = req.params;
    const { error } = employeeSchema(req.body);
    const employeeRepository = AppDataSource.getRepository(HrEmployee);

    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Find the employee to update in the database.
    const employee = await employeeRepository.findOne({
      where: {
        company_code: requestUser.company_code,
        employee_code: employeeCode,
      },
    });

    if (!employee) {
      res
        .status(constants.STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: "Employee not found" });
      return;
    }

    // Update the employee in the database.
    const updateResult = await employeeRepository.update(
      { 
        company_code: requestUser.company_code,
        employee_code: employeeCode 
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
      }
    );

    if (updateResult.affected === 0) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to update employee" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// ------------ Get Single Employee -----------
/**
 * Retrieves a single employee from the database based on the provided employee code.
 */
export const getSingleEmployee = async (req: RequestWithUser, res: Response) => {
  try {
    const { employeeCode } = req.params;
    const requestUser: IUser = req.user;
    const employeeRepository = AppDataSource.getRepository(HrEmployee);

    const employee = await employeeRepository.findOne({
      where: {
        company_code: requestUser.company_code,
        employee_code: employeeCode,
      },
    });

    if (!employee) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Employee not found",
      });
      return;
    }

    res
      .status(constants.STATUS_CODES.OK)
      .json({ success: true, data: employee });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: "Error fetching single employee",
    });
  }
};

// ------------ Export Employee ------------
/**
 * Exports employee data from the database in CSV format.
 */
export const exportEmployee = async (req: RequestWithUser, res: Response) => {
  try {
    let fetchedData: any[] = [];
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    const viewEmpRepository = AppDataSource.getRepository(HrViewEmp);
    
    // Build initial where condition
    let whereCondition: any = {
      company_code: req.user.company_code,
    };

    // Apply search filter if exists - use the correct interface expected by getSearchFilterQuery
    if (filter.search) {
      const searchQuery = getSearchFilterQuery({
        insideQuery: [], // Provide empty array or appropriate value
        filter: filter.search,
        outsideQuery: whereCondition, // Use the expected parameter name
      });
      whereCondition = searchQuery;
    }

    // Build find options
    const findOptions: FindManyOptions<HrViewEmp> = {
      where: whereCondition,
    };

    // Apply sorting if exists
    if (filter?.sort && Object.keys(filter.sort).length > 0) {
      findOptions.order = {
        [filter.sort.field_name]: filter.sort.desc ? "DESC" : "ASC",
      };
    }

    fetchedData = await viewEmpRepository.find(findOptions);

    if (!fetchedData || fetchedData.length === 0) {
      res.status(200).json({ success: true, message: "Empty Data" });
      return;
    }

    csvTransform = fastCsv.format({
      headers: HrCsvHeaders.MASTERS.EMPLOYEE,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="employee.csv"`);

    // Write data to the CSV stream
    fetchedData.forEach((eachData) => {
      csvTransform.write(eachData);
    });

    csvTransform.end();
    csvTransform.pipe(res);
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ------------ Create Bulk Employee -------------
/**
 * Creates multiple employees in the database in bulk.
 */
export const createBulkEmployee = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const employeeRepository = AppDataSource.getRepository(HrEmployee);

    // Transform the employee data
    const employeesWithUser = req.body.map((employee: any[]) => ({
      ...employee.reduce((acc: any, value: any, index: number) => {
        acc[constants.CSVFIELDNAME.EMPLOYEE[index]] = value;
        return acc;
      }, {}),
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
      company_code: requestUser.company_code,
    }));

    // Create multiple employees in bulk with ignore duplicates
    await employeeRepository
      .createQueryBuilder()
      .insert()
      .into(HrEmployee)
      .values(employeesWithUser)
      .orIgnore()
      .execute();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Employee " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};