import bcrypt from "bcryptjs";
import { pool } from "../../db";

export const createUserIntoDB = async (payload: any) => {
  const { name, email, password, role } = payload;

  // 1. Password Hashing
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Query execution
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;

  const values = [name, email, hashedPassword, role || 'contributor'];
  const result = await pool.query(query, values);

  return result.rows[0];
};
