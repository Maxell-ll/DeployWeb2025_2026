// src/controllers/groupController.ts
import { Request, Response } from "express";
import prisma from "../prisma/client";
import { Octokit } from "@octokit/rest";

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

    if (!projectId || !uniqueKey || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: "Données manquantes ou invalides" });
    }

    // 🧠 Vérifie que tous les étudiants ont un nom complet et un pseudo GitHub
    for (const s of students) {
        if (!s.fullName || s.fullName.trim() === "") {
            return res.status(400).json({ message: "Chaque étudiant doit avoir un nom complet." });
        }
        if (!s.githubUsername || s.githubUsername.trim() === "") {
            return res.status(400).json({ message: "Chaque étudiant doit avoir un identifiant GitHub." });
        }
    }

    const projectIdNumber = Number(projectId);
    if (isNaN(projectIdNumber)) {
        return res.status(400).json({ message: "projectId invalide" });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectIdNumber },
            include: { user: true, groups: { include: { students: true } } },
        });

        if (!project || !project.uniqueUrl.includes(uniqueKey)) {
            return res.status(403).json({ message: "Projet non trouvé ou clé invalide" });
        }

        const prof = project.user;
        if (!prof.githubToken) {
            return res.status(400).json({ message: "Le professeur n’a pas de token GitHub valide." });
        }

        const octokit = new Octokit({ auth: prof.githubToken });

        // 🔹 Vérification GitHub : chaque pseudo doit exister
        for (const s of students) {
            const username = s.githubUsername.trim();
            try {
                const response = await octokit.users.getByUsername({ username });
                if (!response?.data?.login) {
                    return res.status(400).json({
                        message: `Le compte GitHub "${username}" n'existe pas.`,
                    });
                }
            } catch (err: any) {
                if (err.status === 404) {
                    return res.status(400).json({
                        message: `Le compte GitHub "${username}" n'existe pas.`,
                    });
                }
                console.error(`Erreur API GitHub pour "${username}" :`, err);
                return res.status(500).json({
                    message: `Erreur lors de la vérification du compte GitHub "${username}".`,
                });
            }
        }

        // 🔹 Vérifie les doublons d’étudiants dans le même projet
        const existingStudents = project.groups.flatMap((g) => g.students);
        const existingGitHubs = new Set(existingStudents.map((s) => s.githubUsername.toLowerCase()));

        const duplicate = students.find((s) => existingGitHubs.has(s.githubUsername.toLowerCase()));
        if (duplicate) {
            return res.status(400).json({
                message: `L'étudiant "${duplicate.githubUsername}" est déjà présent dans un groupe de ce projet.`,
            });
        }

        // 🔹 Génère le nom du groupe
        const existingCount = project.groups.length;
        const nextNumber = (existingCount + 1).toString().padStart(2, "0");
        let groupName = project.groupConvention.replace("XX", nextNumber);

        // Vérifie que le repo n’existe pas déjà dans l’organisation
        const org = project.githubOrg;
        try {
            await octokit.repos.get({ owner: org, repo: groupName });
            groupName = `${groupName}-2`;
        } catch {
            // Repo n'existe pas → OK
        }

        // 🔹 Crée le repo avant la transaction
        try {
            await octokit.repos.createInOrg({
                org,
                name: groupName,
                private: true,
                description: `Repository pour le groupe ${groupName} du projet ${project.name}`,
            });
        } catch (err: any) {
            console.error("⚠️ Erreur création repo :", err.response?.data || err);
            return res.status(500).json({ message: "Erreur lors de la création du dépôt GitHub" });
        }

        // 🔹 Transaction Prisma : création du groupe et des étudiants
        const group = await prisma.$transaction(async (tx) => {
            return tx.group.create({
                data: {
                    name: groupName,
                    projectId: projectIdNumber,
                    students: {
                        connectOrCreate: students.map((s: any) => ({
                            where: { githubUsername: s.githubUsername },
                            create: {
                                fullName: s.fullName.trim(),
                                githubUsername: s.githubUsername.trim(),
                            },
                        })),
                    },
                },
                include: { students: true },
            });
        });

        // 🔹 Ajout des étudiants comme collaborateurs du repo
        for (const student of group.students) {
            try {
                await octokit.repos.addCollaborator({
                    owner: org,
                    repo: groupName,
                    username: student.githubUsername,
                    permission: "push",
                });
            } catch (err) {
                console.warn(`⚠️ Impossible d’ajouter ${student.githubUsername} :`, err);
            }
        }

        res.status(201).json({
            message: `Groupe "${groupName}" créé avec succès et dépôt GitHub associé.`,
            group,
        });
    } catch (err) {
        console.error("❌ Erreur création groupe :", err);
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
