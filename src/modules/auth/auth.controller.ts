import type { Request, Response } from 'express';
import { loginUserFromDB } from './auth.service';
import sendResponse from '../../utility/sendResponse';

export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await loginUserFromDB(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 401, // Authentication failure e 401 bhalo
      success: false,
      message: error.message || "Login failed",
      error: error,
    });
  }
};