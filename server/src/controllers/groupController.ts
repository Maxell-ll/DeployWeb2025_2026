// src/controllers/groupController.ts
import { Request, Response } from "express";
import prisma from "../prisma/client";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN, // optionnel, mais conseillé
});

// 🔹 GET /groups/:projectId/:uniqueKey
export const getGroups = async (req: Request, res: Response) => {
    const { projectId, uniqueKey } = req.params;

    if (!projectId || !uniqueKey) {
        return res.status(400).json({ message: "Paramètres manquants" });
    }

    const projectIdNumber = Number(projectId);
    if (isNaN(projectIdNumber)) {
        return res.status(400).json({ message: "projectId invalide" });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectIdNumber },
            include: { groups: { include: { students: true } } },
        });

        if (!project) return res.status(404).json({ message: "Projet non trouvé" });
        if (!project.uniqueUrl?.includes(uniqueKey))
            return res.status(403).json({ message: "Clé invalide" });

        res.json(project.groups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 🔹 POST /groups/:projectId/:uniqueKey
export const createGroup = async (req: Request, res: Response) => {
    const { projectId, uniqueKey } = req.params;
    const { students } = req.body;

    if (!projectId || !uniqueKey || !students || !Array.isArray(students)) {
        return res.status(400).json({ message: "Données manquantes ou invalides" });
    }

    const projectIdNumber = Number(projectId);
    if (isNaN(projectIdNumber)) {
        return res.status(400).json({ message: "projectId invalide" });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectIdNumber },
        });

        if (!project || !project.uniqueUrl.includes(uniqueKey)) {
            return res.status(403).json({ message: "Projet non trouvé ou clé invalide" });
        }

        // 🧠 Vérification GitHub des étudiants
        for (const s of students) {
            try {
                await octokit.users.getByUsername({ username: s.githubUsername });
            } catch (error: any) {
                if (error.status === 404) {
                    return res
                        .status(400)
                        .json({ message: `Le compte GitHub "${s.githubUsername}" n'existe pas.` });
                }
                console.error("Erreur lors de la vérification GitHub :", error);
                return res.status(500).json({ message: "Erreur lors de la vérification GitHub" });
            }
        }

        // ✅ Tous les comptes GitHub existent, on crée le groupe
        const group = await prisma.group.create({
            data: {
                name: `Groupe du projet ${project.name}`,
                projectId: projectIdNumber,
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

// 🔹 GET /groups/project/:projectId
export const getGroupsByProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
        return res.status(400).json({ message: "projectId manquant" });
    }

    const projectIdNumber = Number(projectId);
    if (isNaN(projectIdNumber)) {
        return res.status(400).json({ message: "projectId invalide" });
    }

    try {
        const groups = await prisma.group.findMany({
            where: { projectId: projectIdNumber },
            include: { students: true },
        });

        res.json(groups);
    } catch (err) {
        console.error("Erreur récupération groupes :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
