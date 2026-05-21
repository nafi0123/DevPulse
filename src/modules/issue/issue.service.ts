import { pool } from "../../db";
import type { IIssuePayload } from "./issue.interface";

export const createIssueIntoDB = async (payload: IIssuePayload, reporterId: number) => {
  const { title, description, type } = payload;

  const query = `
    INSERT INTO issues (title, description, type, status, reporter_id)
    VALUES ($1, $2, $3, 'open', $4)
    RETURNING *;
  `;

  const values = [title, description, type, reporterId];
  const result = await pool.query(query, values);

  return result.rows[0];
};

export const getAllIssuesFromDB = async (filters: any) => {
  const { sort, type, status } = filters;

  let query = `SELECT * FROM issues WHERE 1=1`;
  const values: any[] = [];

  if (type) {
    values.push(type);
    query += ` AND type = $${values.length}`;
  }
  if (status) {
    values.push(status);
    query += ` AND status = $${values.length}`;
  }

  const sortOrder = sort === 'oldest' ? 'ASC' : 'DESC';
  query += ` ORDER BY created_at ${sortOrder}`;

  const result = await pool.query(query, values);
  const issues = result.rows;

  if (issues.length === 0) return [];


  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];

  const userQuery = `SELECT id, name, role FROM users WHERE id = ANY($1)`;
  const userResult = await pool.query(userQuery, [reporterIds]);
  const users = userResult.rows;

  const formattedIssues = issues.map((issue) => {
    const reporter = users.find((u) => u.id === issue.reporter_id);
    const { reporter_id, ...issueData } = issue; 
    return {
      ...issueData,
      reporter: reporter || null,
    };
  });

  return formattedIssues;
};


export const getSingleIssueFromDB = async (id: string) => {
  const issueQuery = `SELECT * FROM issues WHERE id = $1`;
  const issueResult = await pool.query(issueQuery, [id]);
  const issue = issueResult.rows[0];

  if (!issue) {
    throw new Error("Issue not found!");
  }

  const userQuery = `SELECT id, name, role FROM users WHERE id = $1`;
  const userResult = await pool.query(userQuery, [issue.reporter_id]);
  const reporter = userResult.rows[0];

  const { reporter_id, ...issueData } = issue;
  
  return {
    ...issueData,
    reporter: reporter || null,
  };
};