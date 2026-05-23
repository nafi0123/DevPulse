

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/db/index.ts
var import_pg = require("pg");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
  // refresh_secret: process.env.JWT_REFRESH_SECRET,
};
var config_default = config;

// src/db/index.ts
var pool = new import_pg.Pool({
  connectionString: config_default.connection_string,
  ssl: {
    rejectUnauthorized: false
  }
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
          id SERIAL PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(50) CHECK (type IN ('bug', 'feature_request')),
          status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
          reporter_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("\u{1F418} Database connected and tables initialized successfully!");
  } catch (error) {
    console.log("\u274C Database initialization error:", error);
  }
};

// src/app.ts
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express4 = __toESM(require("express"), 1);

// src/ middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/user/user.route.ts
var import_express = require("express");

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await import_bcryptjs.default.hash(password, 10);
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;
  const values = [name, email, hashedPassword, role || "contributor"];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// src/modules/user/user.controller.ts
var signupUser = async (req, res) => {
  try {
    const result = await createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message || "Registration failed",
      error
    });
  }
};

// src/modules/user/user.route.ts
var router = (0, import_express.Router)();
router.post("/signup", signupUser);
var userRoutes = router;

// src/modules/auth/auth.route.ts
var import_express2 = require("express");

// src/modules/auth/auth.service.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var loginUserFromDB = async (payload) => {
  const { email, password } = payload;
  const userQuery = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(userQuery, [email]);
  const user = result.rows[0];
  if (!user) {
    throw new Error("User not found!");
  }
  const isPasswordMatched = await import_bcryptjs2.default.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Invalid password!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = import_jsonwebtoken.default.sign(jwtPayload, config_default.secret, {
    expiresIn: "10d"
  });
  const { password: _, ...userWithoutPassword } = user;
  return {
    token: accessToken,
    user: userWithoutPassword
  };
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await loginUserFromDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 401,
      // Authentication failure e 401 bhalo
      success: false,
      message: error.message || "Login failed",
      error
    });
  }
};

// src/modules/auth/auth.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/login", loginUser);
var authRoutes = router2;

// src/modules/issue/issue.route.ts
var import_express3 = require("express");

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (payload, reporterId) => {
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
var getAllIssuesFromDB = async (filters) => {
  const { sort, type, status } = filters;
  let query = `SELECT * FROM issues WHERE 1=1`;
  const values = [];
  if (type) {
    values.push(type);
    query += ` AND type = $${values.length}`;
  }
  if (status) {
    values.push(status);
    query += ` AND status = $${values.length}`;
  }
  const sortOrder = sort === "oldest" ? "ASC" : "DESC";
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
      reporter: reporter || null
    };
  });
  return formattedIssues;
};
var getSingleIssueFromDB = async (id) => {
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
    reporter: reporter || null
  };
};
var updateIssueInDB = async (issueId, userId, userRole, payload) => {
  const findQuery = `SELECT * FROM issues WHERE id = $1`;
  const findResult = await pool.query(findQuery, [issueId]);
  const existingIssue = findResult.rows[0];
  if (!existingIssue) {
    throw new Error("Issue not found!");
  }
  if (userRole === "contributor") {
    if (existingIssue.reporter_id !== userId) {
      throw new Error("You can only update your own issues!");
    }
    if (existingIssue.status !== "open") {
      throw new Error("You can only update issues that are still 'open'!");
    }
  }
  const { title, description, type } = payload;
  const updateQuery = `
    UPDATE issues 
    SET title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        type = COALESCE($3, type),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
  `;
  const values = [title, description, type, issueId];
  const result = await pool.query(updateQuery, values);
  return result.rows[0];
};
var deleteIssueFromDB = async (issueId) => {
  const query = `DELETE FROM issues WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [issueId]);
  if (result.rowCount === 0) {
    throw new Error("Issue not found!");
  }
  return result.rows[0];
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const result = await createIssueIntoDB(req.body, reporterId);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error.message || "Failed to create issue",
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const filters = {
      sort: req.query.sort || "newest",
      type: req.query.type,
      status: req.query.status
    };
    const result = await getAllIssuesFromDB(filters);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to retrieve issues",
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getSingleIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: error.message || "Issue not found"
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await updateIssueInDB(id, userId, userRole, req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: error.message.includes("authorized") || error.message.includes("own") ? 403 : 400,
      success: false,
      message: error.message || "Failed to update issue"
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: null
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: error.message === "Issue not found!" ? 404 : 400,
      success: false,
      message: error.message || "Failed to delete issue"
    });
  }
};

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/ middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      const decoded = import_jsonwebtoken2.default.verify(token, config_default.secret);
      const role = decoded.role;
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          message: "You have no permission to access this route"
        });
      }
      req.user = decoded;
      next();
    } catch (err) {
      next(err);
    }
  };
};
var auth_default = auth;

// src/modules/issue/issue.route.ts
var router3 = (0, import_express3.Router)();
router3.post(
  "/",
  auth_default(USER_ROLE.contributor, USER_ROLE.maintainer),
  createIssue
);
router3.get("/", getAllIssues);
router3.get("/:id", getSingleIssue);
router3.patch(
  "/:id",
  auth_default(USER_ROLE.maintainer, USER_ROLE.contributor),
  updateIssue
);
router3.delete(
  "/:id",
  auth_default(USER_ROLE.maintainer),
  deleteIssue
);
var issueRoutes = router3;

// src/app.ts
var app = (0, import_express4.default)();
app.use((0, import_cookie_parser.default)());
app.use(import_express4.default.json());
app.use(import_express4.default.text());
app.use(import_express4.default.urlencoded({ extended: true }));
app.use(
  (0, import_cors.default)({
    origin: "http://localhost:3000"
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse",
    author: "API RUNING"
  });
});
app.use("/api/auth", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.cjs.map