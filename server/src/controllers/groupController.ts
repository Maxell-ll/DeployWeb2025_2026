// groupController.ts
import { Request, Response } from "express";
import prisma from "../prisma/client";

// GET /groups/:projectId/:uniqueKey
export const getGroups = async (req: Request, res: Response) => {
    const { projectId, uniqueKey } = req.params;

    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(projectId) },
            include: { groups: { include: { students: true } } },
        });

        if (!project) return res.status(404).json({ message: "Projet non trouvé" });
        if (!project.uniqueUrl?.includes(uniqueKey)) return res.status(403).json({ message: "Clé invalide" });

        res.json(project.groups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// POST /groups/:projectId/:uniqueKey
export const createGroup = async (req: Request, res: Response) => {
    try {
        const { projectId, uniqueKey } = req.params;
        const { students } = req.body;

        if (!projectId || !students || !Array.isArray(students)) {
            return res.status(400).json({ message: "Données manquantes" });
        }

        // Récupérer le projet public via uniqueKey
        const project = await prisma.project.findUnique({
            where: { id: Number(projectId) },
        });

        if (!project || !project.uniqueUrl.includes(uniqueKey)) {
            return res.status(403).json({ message: "Projet non trouvé ou clé invalide" });
        }

        // Créer un groupe avec nom obligatoire
        const group = await prisma.group.create({
            data: {
                name: `Groupe du projet ${project.name}`, // obligatoire
                projectId: Number(projectId),
                students: {
                    create: students.map((s: any) => ({
                        fullName: s.fullName,
                        githubUsername: s.githubUsername,
                    })),
                },
            },
            include: { students: true },
        });

        res.status(201).json({ message: "Groupe créé", group });
    } catch (err) {
        console.error("Erreur création groupe :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};

