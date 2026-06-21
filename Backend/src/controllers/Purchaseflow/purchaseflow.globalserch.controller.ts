import { Response } from "express";
import constants from "../../helpers/constants";
import { ISearch, RequestWithUser } from "../../interfaces/common.interface";

//import { RequestWithUser } from "../../interfaces/common.interface";

import { IUser } from "../../interfaces/user.interface";

import Costmaster from "../../models/Purchaseflow/costmaster_pf.model";
import ddcurrency from "../../models/Purchaseflow/ddcurrency_pf_models";

import { IddCurrency } from "../../models/Purchaseflow/ddcurrency_pf_models";
import Uommaster from "../../models/Purchaseflow/uommaster_pf.model";
import CustomerMaster from "../../models/Purchaseflow/customermaster_pf_model";

//import { IUommaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import {
  ISupplier,
  IUommaster,
  IMsPsCustomer,
} from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { getSearchFilterQuery } from "../../helpers/functions";
import VProjectmaster from "../../models/Purchaseflow/projectmaster_pf_view.model";
import Itemmaster_pf from "../../models/Purchaseflow/itemmaster_pf_model";
import Divisionmaster from "../../models/Purchaseflow/divisionmaster_pf.model";
import DropdownProjectmaster from "../../models/Purchaseflow/dropdownprojectmaster_pf.model";
import { PurchaseRequestHeader } from "../../models/Purchaseflow/purchaserequest_pf.model";

import { Sequelize } from "sequelize";
import { PurchaseCloseRequest } from "./../../models/Purchaseflow/purchaserequest_pf.model";
import {
  PRRejected,
  POCancel,
} from "./../../models/Purchaseflow/purchaserequest_pf.model";

import { PurchaseRequestHeaderHistory } from "../../models/Purchaseflow/purchaserequest_pf.model";
import IProdmaster from "../../models/Purchaseflow/prodmaster_pf.model";
import { POHeader } from "../../models/Purchaseflow/purchaserequest_pf.model";
import {
  ICostmaster,
  IdropdownProjectmaster,
  IItemtmaster,
} from "../../interfaces/Purchaseflow/Purucahseflow.interface";

import { IVProjectmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { IDivisionmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";

import EmployeeMaster from "../../../src/models/Purchaseflow/ddemployeemaster_pf_model";

//import { QueryTypes, Sequelize } from "sequelize";
//import sequelize from "sequelize";
//import { sequelize } from "../../database/connection"
import { IPurchaseRequestHeader } from "../../models/Purchaseflow/purchaserequest_pf.model";

import { sequelize } from "../../database/connection";
import { Op, QueryTypes } from "sequelize";
import Projectmaster from "../../models/Purchaseflow/projectmaster_pf_model";
import { ISuppliermaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import Suppliermaster from "../../models/Purchaseflow/suppliermaster_pf.model";
import { IPOHeader } from "../../models/Purchaseflow/purchaserequest_pf.model";


const getRequestCancelData = async (
  loginid: string | null | undefined,
  company_code: string | null | undefined
) => {
  try {
    // Validate input parameters
    if (!loginid || !company_code) {
      return {
        data: [],
        message: "Both loginid and company_code are required.",
      };
    }
 
    // Call the procedure
    const procedureCall1 = `
      CALL PROC_POPULATE_GT_CANCEL(:gs_user_id,:gs_company_code );
    `;
    await sequelize.query(procedureCall1, {
      replacements: {
        gs_user_id: loginid,
        gs_company_code: company_code,
      },
    });
 
    return {
      data: [],
      message: "Procedure Cancel executed successfully.",
    };
  } catch (error) {
    return {
      data: [],
      message: "An error occurred while executing the procedure.",
    };
  }
};

const getRequestRejectedData = async (
  loginid: string | null | undefined,
  company_code: string | null | undefined
) => {
  try {
    // Validate input parameters
    if (!loginid || !company_code) {
      return {
        data: [],
        message: "Both loginid and company_code are required.",
      };
    }
 
    // Call the procedure
    const procedureCall2 = `
      CALL PROC_POPULATE_GT_REJECTED(:gs_user_id,:gs_company_code );
    `;
    await sequelize.query(procedureCall2, {
      replacements: {
        gs_user_id: loginid,
        gs_company_code: company_code,
      },
    });
 
    return {
      data: [],
      message: "Procedure Rejected executed successfully.",
    };
  } catch (error) {
    return {
      data: [],
      message: "An error occurred while executing the procedure.",
    };
  }
};
const getPurchaseRequesthistoryData = async (
  loginid: string | null | undefined,
  company_code: string | null | undefined
) => {
  try {
    if (!loginid || !company_code) {
      return {
        data: [],
        message: "Both loginid and company_code are required.",
      };
    }

    // Execute the procedure
    const procedureCall = `CALL PROC_CREATE_MY_HISTORY(:gs_company_code, :gs_user_id)`;
    await sequelize.query(procedureCall, {
      replacements: { gs_user_id: loginid, gs_company_code: company_code },
    });

    // Fetch updated data from GT_MY_HISTORY
    const fetchedData = await PurchaseRequestHeaderHistory.findAll({
      where: { company_code },
    });

    return { data: fetchedData, message: "Data fetched successfully." };
  } catch (error) {
    return { data: [], message: "Error executing PROC_CREATE_MY_HISTORY." };
  }
};
const getRequestCloseData = async (
  loginid: string | null | undefined,
  company_code: string | null | undefined
) => {
  try {
    // Validate input parameters
    if (!loginid || !company_code) {
      return {
        data: [],
        message: "Both loginid and company_code are required.",
      };
    }
 
    // Call the procedure
    const procedureCall1 = `
      CALL PROC_POPULATE_GT_CLOSE(:gs_user_id,:gs_company_code );
    `;
    await sequelize.query(procedureCall1, {
      replacements: {
        gs_user_id: loginid,
        gs_company_code: company_code,
      },
    });
 
    return {
      data: [],
      message: "Procedure executed successfully.",
    };
  } catch (error) {
    return {
      data: [],
      message: "An error occurred while executing the procedure.",
    };
  }
};
const getPurchaseRequestData = async (
  loginid: string | null | undefined,
  company_code: string | null | undefined
) => {
  try {
    // Validate input parameters
    if (!loginid || !company_code) {
      return {
        data: [],
        message: "Both loginid and company_code are required.",
      };
    }

    // Call the procedure
    const procedureCall = `
      CALL PRO_CREATEORINERTGTMYTASK(:gs_company_code, :gs_user_id);
    `;
    await sequelize.query(procedureCall, {
      replacements: {
        gs_user_id: loginid,
        gs_company_code: company_code,
      },
    });

    return {
      data: [],
      message: "Procedure executed successfully.",
    };
  } catch (error) {
    return {
      data: [],
      message: "An error occurred while executing the procedure.",
    };
  }
};


// This is for Purchase flow module
export const getPfglobalsearch = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("Enter in this getPfFunctionINSIDE GLOBAL SEARCH today function..");

 const { master: rawMaster } = req.params;

    // Split if it contains "$$$$"
    const [master, searchVariable = ''] = rawMaster.split('$$$$');

  //  const { master } = req.params;
   //const searchVariable = master.includes('$$$$') ? master.split('$$$$')[1] : '';
    const requestUser: IUser = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = Number(page * limit - limit);
    let fetchedData: unknown[] = [];
    let totalCount = 0;
    const paginationOptions = limit ? { offset: skip, limit: limit } : {};
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};
    console.log("master value:", master);
    const { loginid, company_code } = requestUser;
    const code = req.query.code as string | undefined;
    switch (master) {
      case "division":
        console.log("inside division");
        {
          (fetchedData = await Divisionmaster.findAll({
            where: { company_code: requestUser.company_code },
            offset: skip,
            limit: limit,
          })) as unknown[] as IDivisionmaster[];
        }
        break;
    case "cost_master":
	{
	  const searchTerm = '%'+searchVariable+'%'; // You can also use template literals

 	 fetchedData = await Costmaster.findAll({
  	  where: {
     	 company_code: requestUser.company_code,
      	[Op.or]: [
      	  { cost_code: { [Op.like]: searchTerm } },
       	 { cost_name: { [Op.like]: searchTerm } },
     	 ]
    },
    offset: skip,
    limit: limit,
  }) as unknown[] as ICostmaster[];
}
break;
      case "supplier_master":
        console.log("inside supplier_master:", master);
        fetchedData = (await Suppliermaster.findAll({
          where: { company_code: requestUser.company_code },
          offset: skip,
          limit: limit,
          raw: true, // âœ… Ensures we get plain objects
        })) as unknown as ISupplier[];
        break;
      // customer_master
      case "customer_master":
        console.log("inside customer_master:", master);
        fetchedData = (await CustomerMaster.findAll({
          where: { company_code: requestUser.company_code },
          offset: skip,
          limit: limit,
          raw: true,
        })) as unknown as IMsPsCustomer[];
        break;
  case "ddCurrency":
          {
            (fetchedData = await ddcurrency.findAll({
              where: { company_code: requestUser.company_code },
              ...paginationOptions,
            })) as unknown[] as IddCurrency[];
            console.log(fetchedData);
          }
          break;
      case "item_master":
        console.log("inside item_master:", master);
        fetchedData = (await Itemmaster_pf.findAll({
          where: { company_code: requestUser.company_code },
          offset: skip,
          limit: limit,
          raw: true,
        })) as unknown as IItemtmaster[];
        break;
      case "dropdwonprojectmaster":
        console.log("At backend before fetch Project");
        {
          (fetchedData = await DropdownProjectmaster.findAll({
            attributes: {
              exclude: ["created_at", "updated_at", "company_code"],
            },
            where: { company_code: requestUser.company_code },
            offset: skip,
            limit: limit,
          })) as unknown[] as IdropdownProjectmaster[];
        }
        console.log(fetchedData);
        break;
      /*case "dropdwonprojects";
           const projects = await db.query('SELECT PROJECT_CODE, PROJECT_NAME FROM MS_PS_PROJECT_MASTER');
           res.json(projects);
           } catch (error) {
            res.status(500).json({ message: 'Error retrieving projects' });
           }
           break; */
      case "projectmaster":
      case "project_master":
        console.log("project master case", requestUser.loginid);

        let whereCondition = {};

        if (requestUser.loginid !== "PRAKASH") {
          whereCondition = {
            project_code: {
              [Op.in]: sequelize.literal(
                `(SELECT project_code FROM MS_PROJECT_USER_ASSIGN WHERE user_id = '${requestUser.loginid}')`
              ),
            },
          };
        } else {
          // If "PRAKASH" should see all projects, don't apply any filtering
          whereCondition = {};
        }

        fetchedData = (await VProjectmaster.findAll({
        
          where: whereCondition, // Apply condition dynamically
          offset: skip,
          limit: limit,
          raw: true, // Returns plain objects instead of Sequelize instances
        })) as unknown[] as IVProjectmaster[];

        console.log(requestUser.loginid);
        console.log(fetchedData);
        break;

      /*      console.log("project master case");
        {
          (fetchedData = await VProjectmaster.findAll({
            where: { company_code: requestUser.company_code },
            offset: skip,
            limit: limit,
            raw: true, // This option returns plain objects instead of Sequelize instances
          })) as unknown[] as IVProjectmaster[];
          console.log(requestUser.company_code);
          console.log(fetchedData);
        }
        break;*/
      case "ddcostmaster":
        console.log("Inside ddcostmaster");
        {
          (fetchedData = await Costmaster.findAll({
            where: { company_code: requestUser.company_code },
            offset: skip,
            limit: limit,
          })) as unknown[] as ICostmaster[];
        }
        break;
      case "dduommaster":
        console.log("Inside dduommaster");
        {
          (fetchedData = await Uommaster.findAll({
            where: { company_code: requestUser.company_code },
            offset: skip,
            limit: limit,
          })) as unknown[] as IUommaster[];
        }
        break;
    case "ddCurrency":
          {
            (fetchedData = await ddcurrency.findAll({
              where: { company_code: requestUser.company_code },
              ...paginationOptions,
            })) as unknown[] as IddCurrency[];
            console.log(fetchedData);
          }
          break;
      case "ddprodmaster":
        // Initialize the whereClause with the default condition
        let whereClause: any = { company_code: requestUser.company_code };

        // If 'code' is not undefined, modify the whereClause to include the subquery for 'prin_code'
        if (code !== undefined) {
          whereClause = {
            ...whereClause, // Keep the existing conditions
            prin_code: {
              [Op.in]: sequelize.literal(
                `(SELECT prin_code FROM MS_PRINCIPAL_JASRA WHERE PRIN_DEPT_CODE = '${code}')`
              ),
            },
          };
        }

        try {
          // Fetch data with the updated whereClause
          fetchedData = (await IProdmaster.findAll({
            where: whereClause,
            offset: skip,
            limit: limit,
          })) as IProdmaster[];

          // Handle the case where no data is found
          if (fetchedData.length === 0) {
            console.log("No data found.");
            // You can return a message or handle accordingly, e.g.:
            // res.status(404).json({ message: "No data found" });
          } else {
            console.log("Fetched Data:", fetchedData);
            // Handle the response to the frontend accordingly
            // res.json(fetchedData);
          }
        } catch (error) {
          // Handle any errors during the data fetch
          console.error("Error fetching data:", error);
          // res.status(500).json({ message: "Error fetching data" });
        }
        break;
      case "ddemployeemaster":
        console.log("Inside EmployeeMaster");
        {
          (fetchedData = await EmployeeMaster.findAll({
            where: { company_code: requestUser.company_code },
            offset: skip,
            limit: limit,
          })) as unknown[] as EmployeeMaster[];
        }
        console.log("Inside EmployeeMaster");
        console.log(requestUser.company_code);

        console.log(fetchedData);
        console.log("Inside EmployeeMaster");
        break;

      case "ddsupplier":
        console.log("Inside suppliermastercc");
        {
          (fetchedData = await Suppliermaster.findAll({
            where: { company_code: requestUser.company_code },
            offset: skip,
            limit: limit,
          })) as unknown[] as ISuppliermaster[];
        }
        console.log("Inside suppliermaster1");
        console.log(requestUser.company_code);

        console.log(fetchedData);
        console.log("Inside suppliermaster2");
        break;
      // Commented old po_cancel
      //case "po_cancel":
      //    (fetchedData = await POHeader.findAll({
      //      where: {
      //        company_code: requestUser.company_code,
      //        project_code: {
      //         [Op.in]: Sequelize.literal(
      //            `(SELECT PROJECT_CODE FROM MS_PROJECT_USER_ASSIGN B WHERE B.PROJECT_CODE = POHeader.project_code AND B.USER_ID = '${requestUser.loginid}')`
      //           ),
      //         },
      //       },
      //       offset: skip,
      //        limit: limit,
      //      })) as unknown[] as IPOHeader[];
      //      break;
      case "po_modify1":
        {
          console.log("before");
          const response = await getRequestCloseData(loginid, company_code);
          console.log("after");
 
          {
            let insideQuery: any = [],
              outsideQuery = {
                [Op.and]: [{ company_code: requestUser.company_code }],
              };
 
            outsideQuery = getSearchFilterQuery({
              insideQuery,
 
              filter: filter.search,
 
              outsideQuery,
            });
            totalCount = await POHeader.count({
              where: outsideQuery,
            });
            fetchedData = await POHeader.findAll({
              where: outsideQuery,
              ...(!!filter?.sort &&
                Object.keys(filter?.sort).length > 0 && {
                  order: [
                    [
                      filter?.sort.field_name,
                      filter.sort.desc ? "DESC" : "ASC",
                    ],
                  ],
                }),
              ...paginationOptions,
            });
 
            //  console.log(requestUser.company_code);
            //    console.log(fetchedData);
          }
          break;
        }
        case "po_cancel":
          {
            console.log("before");
            const response = await getRequestCancelData(loginid, company_code);
            console.log("after");
   
            {
              let insideQuery: any = [],
                outsideQuery = {
                  [Op.and]: [{ company_code: requestUser.company_code }],
                };
   
              outsideQuery = getSearchFilterQuery({
                insideQuery,
   
                filter: filter.search,
   
                outsideQuery,
              });
              totalCount = await POCancel.count({
                where: outsideQuery,
              });
              fetchedData = await POCancel.findAll({
                where: outsideQuery,
                ...(!!filter?.sort &&
                  Object.keys(filter?.sort).length > 0 && {
                    order: [
                      [
                        filter?.sort.field_name,
                        filter.sort.desc ? "DESC" : "ASC",
                      ],
                    ],
                  }),
                ...paginationOptions,
              });
   
              //  console.log(requestUser.company_code);
              //    console.log(fetchedData);
            }
            break;
          }
  
  
      case "sentbackrollselection":
        const query = `
            SELECT B.ROLE_NAME as role_name, A.FLOW_LEVEL as flow_level
            FROM MS_PS_FLOW_ROLE_MAPPING A
            JOIN MS_PS_ROLE B ON A.FLOW_ROLE = B.ROLE_CODE
            WHERE A.FLOW_CODE = '001'
            ORDER BY A.FLOW_LEVEL DESC;
          `;

        try {
          // Execute the query with the 'raw' option set to true
          const sentbackrolls = await sequelize.query(query, {
            type: QueryTypes.SELECT, // Select query type
            raw: true, // Forces raw data return
          });

          // Log the result to inspect the raw data
          console.log("Sentbackrolls:", sentbackrolls); // This will now be an array of results

          // Ensure the data is an array and wrap it with success response
          if (Array.isArray(sentbackrolls) && sentbackrolls.length > 0) {
            res.json({
              success: true,
              data: sentbackrolls, // Send data as an array
            });
          } else {
            res.json({
              success: false,
              message: "No roles found for the given flow code.",
            });
          }
        } catch (err) {
          console.error("Error executing query:", err);
          res.status(500).json({
            success: false,
            error: "Internal Server Error",
            //       message: err.message || "An error occurred while executing the query.",
          });
        }
         case "sentbackrollselection_mat":
        const query1 = `
            SELECT B.ROLE_NAME as role_name, A.FLOW_LEVEL as flow_level
            FROM MS_PS_FLOW_ROLE_MAPPING A
            JOIN MS_PS_ROLE B ON A.FLOW_ROLE = B.ROLE_CODE
            WHERE A.FLOW_CODE = '002'
            ORDER BY A.FLOW_LEVEL DESC;
          `;

        try {
          // Execute the query with the 'raw' option set to true
          const sentbackrolls = await sequelize.query(query1, {
            type: QueryTypes.SELECT, // Select query type
            raw: true, // Forces raw data return
          });

          // Log the result to inspect the raw data
          console.log("Sentbackrolls:", sentbackrolls); // This will now be an array of results

          // Ensure the data is an array and wrap it with success response
          if (Array.isArray(sentbackrolls) && sentbackrolls.length > 0) {
            res.json({
              success: true,
              data: sentbackrolls, // Send data as an array
            });
          } else {
            res.json({
              success: false,
              message: "No roles found for the given flow code.",
            });
          }
        } catch (err) {
          console.error("Error executing query:", err);
          res.status(500).json({
            success: false,
            error: "Internal Server Error",
            //       message: err.message || "An error occurred while executing the query.",
          });
        }


      case "My_History":
        console.log("after inside my history1");
        // For creating GT_MY_HISTORY table
        const historyresponse = await getPurchaseRequesthistoryData(
          loginid,
          company_code
        );
        console.log("after inside my history2");

        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ company_code: requestUser.company_code }],
            };

          outsideQuery = getSearchFilterQuery({
            insideQuery,

            filter: filter.search,

            outsideQuery,
          });
          totalCount = await PurchaseRequestHeaderHistory.count({
            where: outsideQuery,
          });
          console.log(totalCount)
          fetchedData = await PurchaseRequestHeaderHistory.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });

          //console.log(requestUser.company_code);
          //  console.log(fetchedData);
        }
        break;
      case "Request_Cancel":
        console.log("✅ Inside Request_Rejected0.5");

        try {
          const RejectedQuery = {
            [Op.and]: [
              { company_code: requestUser?.company_code },
              { created_by: requestUser?.loginid },
              { last_action: "CANCEL" },
            ],
          };

          console.log("✅ Inside Request_Rejected2");

          if (filter?.search) {
            Object.assign(
              RejectedQuery,
              getSearchFilterQuery({
                insideQuery: [],
                filter: filter.search,
                outsideQuery: RejectedQuery,
              })
            );
          }

          console.log("✅ Inside Cancel");
          console.log(
            "🔎 RejectedQuery Before Count:",
            JSON.stringify(RejectedQuery, null, 2)
          );

          // Ensure VW_PURCHASE_SUMMARY_TXN is a valid Sequelize model
          if (!PRRejected || typeof PRRejected.count !== "function") {
            console.error("❌ PRRejected is not a valid Sequelize model");
            res.status(500).json({
              success: false,
              message: "Internal server error - Invalid model",
            });
            return;
          }

          // Validate RejectedQuery
          if (!RejectedQuery || typeof RejectedQuery !== "object") {
            console.error("❌ RejectedQuery is not a valid object");
            res.status(500).json({
              success: false,
              message: "Internal server error - Invalid query",
            });
            return;
          }

          // Count records with error handling
          let totalCount;
          try {
            totalCount = await PRRejected.count({
              where: RejectedQuery,
            });
          } catch (countError) {
            console.error("❌ Error in .count() method:", countError);
            res.status(500).json({
              success: false,
              message: "Internal server error - Failed to count records",
              error:
                countError instanceof Error
                  ? countError.message
                  : "Unknown error",
            });
            return;
          }

          console.log("✅ Total Count:", totalCount);

          // Default pagination to ensure no undefined values
          const pagination = paginationOptions || { limit: 20, offset: 0 };

          const fetchedData = await PRRejected.findAll({
            where: RejectedQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...pagination,
          });

          if (!fetchedData || fetchedData.length === 0) {
            res.status(404).json({
              success: false,
              message: "No Cancel requests found",
            });
            return;
          }

          res.status(200).json({
            success: true,
            tableData: fetchedData,
            totalCount: totalCount,
          });

          console.log("✅ Fetched Data:", fetchedData);
        } catch (error) {
          console.error("❌ Error in Cancel Case:", error);

          res.status(500).json({
            success: false,
            message: "Internal server error - Invalid model",
          });
          return;
        }
        break;
      case "Request_Rejected":
        {
          console.log("before");
          const response = await getRequestRejectedData(loginid, company_code);
          console.log("after");
 
          {
            let insideQuery: any = [],
              outsideQuery = {
                [Op.and]: [{ company_code: requestUser.company_code }],
              };
 
            outsideQuery = getSearchFilterQuery({
              insideQuery,
 
              filter: filter.search,
 
              outsideQuery,
            });
            totalCount = await PRRejected.count({
              where: outsideQuery,
            });
            fetchedData = await PRRejected.findAll({
              where: outsideQuery,
              ...(!!filter?.sort &&
                Object.keys(filter?.sort).length > 0 && {
                  order: [
                    [
                      filter?.sort.field_name,
                      filter.sort.desc ? "DESC" : "ASC",
                    ],
                  ],
                }),
              ...paginationOptions,
            });
 
            //  console.log(requestUser.company_code);
            //    console.log(fetchedData);
          }
          break;
        }

      case "MyItem_ClosedRequest":
        console.log("inside MyItem_ClosedRequest");

        const outsideQuery = {
          [Op.and]: [
            { company_code: requestUser.company_code },
            { CREATED_BY: requestUser.loginid },
            { FINAL_APPROVED: "YES" },
          ],
        };
        console.log("inside MyItem_ClosedRequest1");
        // Add search filter if available
        if (filter?.search) {
          Object.assign(
            outsideQuery,
            getSearchFilterQuery({
              insideQuery: [],
              filter: filter.search,
              outsideQuery,
            })
          );
        }
        console.log("inside MyItem_ClosedRequest2");
        // Get total count
        totalCount = (await PurchaseCloseRequest.count({
          where: outsideQuery,
        })) as unknown as number;
        console.log("After count query");
        console.log("inside MyItem_ClosedRequest3");
        // Fetch filtered and paginated data
        fetchedData = await PurchaseCloseRequest.findAll({
          where: outsideQuery,
          ...(!!filter?.sort &&
            Object.keys(filter?.sort).length > 0 && {
              order: [
                [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
              ],
            }),
          ...paginationOptions,
        });
        console.log("inside MyItem_ClosedRequest4");
        //    return { totalCount1, MyItem_ClosedRequestfetchedData };

        break;

      case "purchase_request":
      case "my_task":
        {
          console.log("before");
          const response = await getPurchaseRequestData(loginid, company_code);
          console.log("after");

          {
            let insideQuery: any = [],
              outsideQuery = {
                [Op.and]: [{ company_code: requestUser.company_code }],
              };

            outsideQuery = getSearchFilterQuery({
              insideQuery,

              filter: filter.search,

              outsideQuery,
            });
            totalCount = await PurchaseRequestHeader.count({
              where: outsideQuery,
            });
            console.log('totalCount',totalCount)
         
            fetchedData = await PurchaseRequestHeader.findAll({
              where: outsideQuery,
              ...(!!filter?.sort &&
                Object.keys(filter?.sort).length > 0 && {
                  order: [
                    [
                      filter?.sort.field_name,
                      filter.sort.desc ? "DESC" : "ASC",
                    ],
                  ],
                }),
              ...paginationOptions,
            });

            //  console.log(requestUser.company_code);
            //    console.log(fetchedData);
          }
          break;
        }
     case "my_itemmaster":
        {
          (fetchedData = await Itemmaster_pf.findAll({
            where: { company_code: requestUser.company_code },
            offset: skip,
            limit: limit,
          })) as unknown[] as IItemtmaster[];
        }
        break;
    }
    console.log("before sending data");
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: { tableData: fetchedData, count: fetchedData?.length },
    });

    return;
  } catch (err) {}
};

