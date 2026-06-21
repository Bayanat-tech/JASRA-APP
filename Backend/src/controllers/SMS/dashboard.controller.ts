import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import { sequelize } from "../../../src/database/connection";
export const getSalesPipelineSummary = async (req: Request, res: Response) => {
  try {
    const { sales_name } = req.query;
    let query = "SELECT * FROM vw_sales_pipeline_summary";
    if (sales_name) {
      query += " WHERE sales_name = :sales_name";
    }

    const results = await sequelize.query(query, {
      replacements: { sales_name },
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSalesPerformance = async (req: Request, res: Response) => {
  try {
    const { sales_name } = req.query;
    let query = "SELECT * FROM vw_sales_performance";
    if (sales_name) {
      query += " WHERE sales_name = :sales_name";
    }

    const results = await sequelize.query(query, {
      replacements: { sales_name },
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDealProbabilityAnalysis = async (
  req: Request,
  res: Response
) => {
  try {
    const { sales_name } = req.query;
    let query = "SELECT * FROM vw_deal_probability_analysis";
    if (sales_name) {
      query += " WHERE sales_name = :sales_name";
    }

    const results = await sequelize.query(query, {
      replacements: { sales_name },
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyPipelineForecast = async (
  req: Request,
  res: Response
) => {
  try {
    const { sales_name } = req.query;
    let query = "SELECT * FROM vw_monthly_pipeline_forecast";
    if (sales_name) {
      query += " WHERE sales_name = :sales_name";
    }

    const results = await sequelize.query(query, {
      replacements: { sales_name },
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNextActionsOverview = async (req: Request, res: Response) => {
  try {
    const { sales_name } = req.query;
    let query = "SELECT * FROM vw_next_actions_overview";
    if (sales_name) {
      query += " WHERE sales_name = :sales_name";
    }

    const results = await sequelize.query(query, {
      replacements: { sales_name },
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSegmentPerformance = async (req: Request, res: Response) => {
  try {
    const { sales_name } = req.query;
    let query = "SELECT * FROM vw_segment_performance";
    if (sales_name) {
      query += " WHERE sales_name = :sales_name";
    }

    const results = await sequelize.query(query, {
      replacements: { sales_name },
      type: QueryTypes.SELECT,
    });

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
