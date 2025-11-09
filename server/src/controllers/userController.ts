// src/controllers/userController.ts
import { Request, Response } from "express";
import prisma from "../prisma/client";
import { Octokit } from "@octokit/rest";

// 🔹 Récupère les organisations GitHub de l'utilisateur connecté
export const getGithubOrgs = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id; // récupéré depuis le JWT
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { githubToken: true }
        });

        if (!user || !user.githubToken) {
            return res.status(404).json({ message: "Token GitHub non trouvé pour cet utilisateur" });
        }

        const octokit = new Octokit({ auth: user.githubToken });
        const orgsRes = await octokit.rest.orgs.listForAuthenticatedUser();

        const organizations = orgsRes.data.map(o => o.login);
        res.json({ organizations });
    } catch (err: any) {
        console.error("❌ Erreur getGithubOrgs:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
