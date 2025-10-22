import express from "express";
import {
    getGroups,
    createGroup,
    getGroupsByProject,
} from "../controllers/groupController";

const router = express.Router();

router.get("/project/:projectId", getGroupsByProject);
// Routes publiques
router.get("/:projectId/:uniqueKey", getGroups);
router.post("/:projectId/:uniqueKey", createGroup);


export default router;
