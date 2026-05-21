import { Router } from "express";
import { createIssue, getAllIssues } from "./issue.controller";
import { USER_ROLE } from "../../types";
import auth from "../../ middleware/auth";


const router = Router();

router.post(
  '/', 
  auth(USER_ROLE.contributor, USER_ROLE.maintainer), 
  createIssue
);

router.get('/', getAllIssues);

export const issueRoutes = router;