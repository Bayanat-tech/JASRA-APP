import { Request, Response } from "express";
import { Op } from "sequelize";
import constants from "../helpers/constants";
import User from "../models/user";
import { notifyUser } from "../helpers/functions";

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
       res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email_id: email }, { loginid: email }],
        active_flag: "Y",
      },
    });

    if (!user) {
      return res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Send password reset email
    await notifyUser({
      event: constants.EVENTS.FORGOT_PASSWORD,
      request_users: user.dataValues.email_id,
      subject: "Password Reset Instructions",
      htmlMessage: `
        <p>Dear User,</p>
        <p>Please click on the following link to reset your password:</p>
        <p><a href="${process.env.FRONTEND_URL}/reset-password?email=${user.dataValues.email_id}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p>Bayanat Technology</p>
      `,
    });

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Password reset instructions have been sent to your email",
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "An error occurred",
    });
  }
};

