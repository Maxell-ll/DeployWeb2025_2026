import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { getGithubToken } from "../controllers/userController";

const router = express.Router();

router.get("/github-token", verifyToken, getGithubToken);

export default router;
