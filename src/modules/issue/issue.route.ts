import { Router } from "express";
import { createIssue, getAllIssues, getSingleIssue, updateIssue } from "./issue.controller";
import { USER_ROLE } from "../../types";
import auth from "../../ middleware/auth";


const router = Router();

router.post(
  '/', 
  auth(USER_ROLE.contributor, USER_ROLE.maintainer), 
  createIssue
);

router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);

router.patch(
  '/:id', 
  auth(USER_ROLE.maintainer, USER_ROLE.contributor), 
  updateIssue
);
export const issueRoutes = router;