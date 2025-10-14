import express from "express";
import { getGroups, createGroup } from "../controllers/groupController";

const router = express.Router();

// ⚠️ On expose ces routes sans verifyToken, car elles sont publiques via uniqueKey
router.get("/:projectId/:uniqueKey", getGroups);
router.post("/:projectId/:uniqueKey", createGroup);

export default router;
