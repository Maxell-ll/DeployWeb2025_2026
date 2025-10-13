import { Request, Response } from "express";
import prisma from "../prisma/client";

export const getGithubToken = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { githubToken: true }
        });

        res.json(user || {});
    } catch (err) {
        console.error("❌ Erreur getGithubToken:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
