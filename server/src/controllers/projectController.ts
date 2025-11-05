import { Request, Response } from "express";
import prisma from "../prisma/client";
import crypto from "crypto";

// 🔹 Récupérer tous les projets de l'utilisateur
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const projects = await prisma.project.findMany({
            where: { userId },
            include: { groups: { include: { students: true } } },
        });
        res.json(projects);
    } catch (err) {
        console.error("❌ Erreur dans getUserProjects:", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};

// 🔹 Créer un projet (avec génération automatique de la clé et de l’URL)
export const createProject = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, githubOrg, minStudents, maxStudents, groupConvention } = req.body;

        if (!name || !githubOrg) {
            return res.status(400).json({ message: "Champs obligatoires manquants" });
        }

        // 1️⃣ Générer une clé unique
        const uniqueKey = crypto.randomBytes(25).toString("hex");

        // 2️⃣ Créer le projet (sans URL pour l’instant)
        const project = await prisma.project.create({
            data: {
                name,
                githubOrg,
                minStudents,
                maxStudents,
                groupConvention,
                uniqueKey,
                uniqueUrl: "", // temporairement vide
                userId,
            },
        });

        // 3️⃣ Construire maintenant l’URL complète avec l’ID du projet
        const baseUrl = process.env.FRONT_URL || "http://localhost:5173";
        const uniqueUrl = `${baseUrl}/CreateGroups/${project.id}/${uniqueKey}`;

        // 4️⃣ Mettre à jour le projet avec l’URL finale
        const updatedProject = await prisma.project.update({
            where: { id: project.id },
            data: { uniqueUrl },
        });

        // 5️⃣ Renvoyer le projet complet avec l’URL finale
        res.status(201).json(updatedProject);
    } catch (err) {
        console.error("❌ Erreur lors de la création du projet :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};


// 🔹 Mettre à jour un projet existant
export const updateProject = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const projectId = Number(req.params.id);
        const { name, githubOrg, minStudents, maxStudents, groupConvention } = req.body;

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ message: "Projet non trouvé" });
        if (project.userId !== userId) return res.status(403).json({ message: "Non autorisé à modifier ce projet" });

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { name, githubOrg, minStudents, maxStudents, groupConvention },
        });

        res.json(updatedProject);
    } catch (err) {
        console.error("❌ Erreur lors de la mise à jour du projet :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};

// 🔹 Supprimer un projet
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const projectId = Number(req.params.id);

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ message: "Projet non trouvé" });
        if (project.userId !== userId) return res.status(403).json({ message: "Non autorisé à supprimer ce projet" });

        await prisma.project.delete({ where: { id: projectId } });
        res.json({ message: "Projet supprimé avec succès" });
    } catch (err) {
        console.error("❌ Erreur lors de la suppression du projet :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};

// 🔹 Récupérer un projet public via ID et clé
export const getProjectPublic = async (req: Request, res: Response) => {
    try {
        const { projectId, uniqueKey } = req.params;

        const project = await prisma.project.findUnique({
            where: { id: Number(projectId) },
            include: { groups: { include: { students: true } } },
        });

        if (!project) return res.status(404).json({ message: "Projet non trouvé" });
        if (project.uniqueKey !== uniqueKey) return res.status(403).json({ message: "Clé invalide" });

        res.json(project);
    } catch (err) {
        console.error("❌ Erreur getProjectPublic:", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};
