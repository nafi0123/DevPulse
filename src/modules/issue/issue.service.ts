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