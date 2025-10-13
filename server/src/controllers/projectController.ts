import { Request, Response } from "express";
import prisma from "../prisma/client";
import crypto from "crypto";

// 🔹 Récupérer tous les projets de l'utilisateur
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const projects = await prisma.project.findMany({
            where: { userId },
            include: {
                groups: {
                    include: { students: true },
                },
            },
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
        const { name, githubOrg, minStudents, maxStudents, groupConvention } = req.body;

        if (!name || !githubOrg) {
            return res.status(400).json({ message: "Champs obligatoires manquants" });
        }

        // Génère une clé unique aléatoire pour l'URL
        const uniqueKey = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

        // Crée le projet sans URL finale
        const project = await prisma.project.create({
            data: {
                name,
                githubOrg,
                minStudents,
                maxStudents,
                groupConvention,
                userId,
                uniqueUrl: "", // temporaire
            },
        });

        // Crée l’URL finale
        const finalUrl = `${req.protocol}://${req.get("host")}/CreateGroups/${project.id}/${uniqueKey}`;

        // Met à jour le projet avec cette URL
        const updatedProject = await prisma.project.update({
            where: { id: project.id },
            data: { uniqueUrl: finalUrl },
        });

        res.status(201).json(updatedProject);
    } catch (err) {
        console.error("❌ Erreur lors de la création du projet :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};
