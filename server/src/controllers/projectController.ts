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

// 🔹 Récupérer le prochain ID de projet
export const getNextProjectId = async (req: Request, res: Response) => {
    try {
        const lastProject = await prisma.project.findFirst({
            orderBy: { id: "desc" },
        });
        const nextId = (lastProject?.id || 0) + 1;
        res.json({ nextId });
    } catch (err) {
        console.error("❌ Erreur getNextProjectId:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 🔹 Créer un projet
export const createProject = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, githubOrg, minStudents, maxStudents, groupConvention, uniqueKey, uniqueUrl } = req.body;

        if (!name || !githubOrg || !uniqueKey || !uniqueUrl) {
            return res.status(400).json({ message: "Champs obligatoires manquants" });
        }

        const project = await prisma.project.create({
            data: {
                name,
                githubOrg,
                minStudents,
                maxStudents,
                groupConvention,
                userId,
                uniqueUrl,
            },
        });

        res.status(201).json(project);
    } catch (err) {
        console.error("❌ Erreur lors de la création du projet :", err);
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

        if (!project.uniqueUrl?.includes(uniqueKey)) {
            return res.status(403).json({ message: "Clé invalide" });
        }

        res.json(project);
    } catch (err) {
        console.error("❌ Erreur getProjectPublic:", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};
