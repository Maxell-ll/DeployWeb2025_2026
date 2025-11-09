import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { getGithubOrgs } from "../controllers/userController";

const router = express.Router();

router.get("/github-orgs", verifyToken, getGithubOrgs);

export default router;
