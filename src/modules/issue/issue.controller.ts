import type { Request, Response } from 'express';
import { createIssueIntoDB, deleteIssueFromDB, getAllIssuesFromDB, getSingleIssueFromDB, updateIssueInDB } from './issue.service';
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

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const filters = {
      sort: req.query.sort || 'newest',
      type: req.query.type,
      status: req.query.status,
    };

    const result = await getAllIssuesFromDB(filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to retrieve issues",
      error: error,
    });
  }
};

export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const result = await getSingleIssueFromDB(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 404, 
      success: false,
      message: error.message || "Issue not found",
    });
  }
};


export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role;

    const result = await updateIssueInDB(id as string, userId, userRole, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.message.includes("authorized") || error.message.includes("own") ? 403 : 400,
      success: false,
      message: error.message || "Failed to update issue",
    });
  }
};


export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteIssueFromDB(id as string);
 
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: null, 
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.message === "Issue not found!" ? 404 : 400,
      success: false,
      message: error.message || "Failed to delete issue",
    });
  }
};