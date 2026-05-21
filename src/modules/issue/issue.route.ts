import { Router } from "express";
import { createIssue } from "./issue.controller";
import { USER_ROLE } from "../../types";
import auth from "../../ middleware/auth";


const router = Router();

// Contributor ebong Maintainer duijonei issue create korte parbe
router.post(
  '/', 
  auth(USER_ROLE.contributor, USER_ROLE.maintainer), 
  createIssue
);

export const issueRoutes = router;