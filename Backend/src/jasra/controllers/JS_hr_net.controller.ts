import { Request, Response } from "express";
import { HrService } from "../service/JS_hr.service";

export const getJSEmployeesHandler = async (req: Request, res: Response) => {
  try {
    console.log('in getEmployeesHandler')
    const { supervisor_empid } = req.query;
    const data = await HrService.getEmployeesUnder(
      supervisor_empid as string
    );
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const JSgetLeaveEntitleHandler = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const data = await HrService.getLeaveEntitle(employeeId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const JSleaveDaysCntHandler = async (req: Request, res: Response) => {
  try {
    const {
      leaveStartDate,
      leaveEndDate,
      leaveType,
    } = req.query;

    const data = await HrService.JSLeaveDaysCount({
      leaveStartDate: leaveStartDate as string,
      leaveEndDate: leaveEndDate as string,
      leaveType: leaveType as string,
    });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const JSvalidateLeaveHandler = async (req: Request, res: Response) => {
  try {
    const {
      companyCode,
      employeeId,
      leaveStartDate,
      leaveEndDate,
      leaveType,
      leaveDays,
    } = req.query;

    const data = await HrService.JSvalidateLeave({
      companyCode: companyCode as string,
      employeeId: employeeId as string,
      leaveStartDate: leaveStartDate as string,
      leaveEndDate: leaveEndDate as string,
      leaveType: leaveType as string,
      leaveDays: parseInt(leaveDays as string, 10),
    });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const newvalidateLeaveHandler = async (req: Request, res: Response) => {
  try {
    const {
      leaveStartDate,employeeId,leaveType
    } = req.query;

    const data = await HrService.newValidaterequest({
      leaveStartDate: leaveStartDate as string,
      employeeId: employeeId as string,
      leaveType: leaveType as string,

    });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message }); 
  }
};

// export const getLeaveRequestsWithErpDocHandler = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { employee_code } = req.query;
//     if (!employee_code || typeof employee_code !== "string") {
//       res.status(400).json({ error: "employee_code is required" });
//     } else {
//       const data = await HrService.getLeaveRequestsWithErpDoc(employee_code);
//       res.json(data);
//     }
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const insertUploadedFileEmployeeHandler = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const data = req.body;

//   if (!data || Object.keys(data).length === 0) {
//     res.status(400).json({ error: "No data provided for insert" });
//     return;
//   }

//   // Validate required fields
//   const requiredFields = [
//     "REQUEST_NUMBER",
//     "SR_NO",
//     "ORG_FILE_NAME",
//     "AWS_FILE_LOCN",
//     "EXTENSIONS",
//     "USER_FILE_NAME",
//   ];
//   const missingFields = requiredFields.filter((field) => !data[field]);
//   if (missingFields.length > 0) {
//     res.status(400).json({ error: "Missing required fields", fields: missingFields });
//     return;
//   }

//   try {
//     const result = await HrService.insertUploadedFileEmployee(data);
//     res.status(200).json({ success: true, data: result });
//   } catch (error: any) {
//     res.status(500).json({
//       error: "Failed to insert uploaded file data",
//       message: error.message,
//     });
//   }
// };

