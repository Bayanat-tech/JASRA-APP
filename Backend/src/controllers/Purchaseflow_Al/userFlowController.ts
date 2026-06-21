import { Request, Response } from "express";
import { sequelize } from "../../database/connection";
import { QueryTypes } from "sequelize";

// Controller to check if the user has any flow available
export const checkUserFlow = async (req: Request, res: Response) => {
  const { userCode } = req.params;

  try {
    const result = await sequelize.query(
      `SELECT COUNT(*) as count FROM VW_USER_FLOW WHERE USER_CODE = :userCode`,
      {
        replacements: { userCode },
        type: QueryTypes.SELECT,
      }
    );

    res.json(result[0]);
  } catch (error) {
    console.error("Error checking user flow:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to fetch the flow options for a specific user
export const getUserFlowOptions = async (req: Request, res: Response) => {
  const { userCode } = req.params;

  try {
    const flowOptions = await sequelize.query(
      `SELECT FLOW_CODE as flow_code, FLOW_DESCRIPTION as flow_description 
       FROM VW_USER_FLOW WHERE USER_CODE = :userCode`,
      {
        replacements: { userCode },
        type: QueryTypes.SELECT,
      }
    );

    res.json(flowOptions);
  } catch (error) {
    console.error("Error fetching flow options:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
