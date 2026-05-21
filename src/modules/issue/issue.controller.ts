import type { Request, Response } from 'express';
import { createIssueIntoDB } from './issue.service';
import sendResponse from '../../utility/sendResponse';

export const createIssue = async (req: Request, res: Response) => {
  try {
    const reporterId = (req.user as any).id; 
    
    const result = await createIssueIntoDB(req.body, reporterId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message || "Failed to create issue",
      error: error,
    });
  }
};