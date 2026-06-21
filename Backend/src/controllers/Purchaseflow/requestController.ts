import { Request, Response } from "express";
import { Sequelize, DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";

// Define the model inside the controller
class GT_SESSION_INFO extends Model {
  public REQUEST_NUMBER!: string;
}

GT_SESSION_INFO.init(
  {
    REQUEST_NUMBER: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "GT_SESSION_INFO",
    tableName: "GT_SESSION_INFO",
    timestamps: false, // Disable timestamps if not needed
  }
);

// Fetch the latest request number
export const getLatestRequestNumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const latestRequest = await GT_SESSION_INFO.findOne({
      order: [["ID", "DESC"]], // Order by ID descending to get the latest entry
      attributes: ["REQUEST_NUMBER"], // Select only REQUEST_NUMBER column
    });

    if (latestRequest) {
      res.json({ requestNumber: latestRequest.REQUEST_NUMBER });
    } else {
      res.status(404).json({ message: "No request number found" });
    }
  } catch (error) {
    console.error("Error fetching latest request number:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
