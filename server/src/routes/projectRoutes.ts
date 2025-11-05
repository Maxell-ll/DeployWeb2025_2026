import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import {
    getUserProjects,
    createProject,
    getProjectPublic,
    updateProject, deleteProject
} from "../controllers/projectController";

const router = express.Router();

// Récupérer les projets de l'utilisateur
router.get("/", verifyToken, getUserProjects);

// Créer un projet
router.post("/", verifyToken, createProject);

router.put("/:id", verifyToken, updateProject);

router.delete("/:id", verifyToken, deleteProject);

router.get("/public/:projectId/:uniqueKey", getProjectPublic);

export default router;
