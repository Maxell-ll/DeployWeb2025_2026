import express from "express";
import {
    getGroups,
    createGroup,
    getGroupsByProject,
} from "../controllers/groupController";
import {verifyToken} from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/project/:projectId", verifyToken,getGroupsByProject);
// Routes publiques
router.get("/:projectId/:uniqueKey", getGroups);
router.post("/:projectId/:uniqueKey", createGroup);


export default router;
