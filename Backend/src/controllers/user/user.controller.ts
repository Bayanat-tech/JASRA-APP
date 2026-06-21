import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { userSchema } from "../../validation/user/user.validation";
import { UserService } from "../../services/user.service";

/**
 * Updates the language preference of a user.
 */
export const updateLanguagePreference = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Get the user's information from the request object
    const requestUser: IUser = req.user;

    // Extract the language preference from the request body
    const { lang_pref } = req.body;

    // Validate the request body using the user schema
    const { error } = userSchema(req.body);
    if (error) {
      throw new Error(error.message);
    }

    // NEW: Use UserService instead of direct model
    const user = await UserService.findUserByLoginId(requestUser.loginid);

    // If the user is not found, throw an error
    if (!user) {
      throw new Error(constants.MESSAGES.USER.REQUEST_USER_NOT_FOUND);
    }

    // NEW: Use UserService to update language preference
    const updateResult = await UserService.updateLanguagePreference(
      requestUser.loginid,
      lang_pref,
      requestUser.loginid
    );

    // If the update fails, throw an error
    if (!updateResult) {
      throw new Error("Failed to update language preference");
    }

    // Send a successful response back to the client
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.USER.LANG_PREF_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    // If an error occurs, send a failed response back to the client
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
