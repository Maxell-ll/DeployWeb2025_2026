import { Request, Response } from "express";
import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: "Mot de passe incorrect" });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET!, {
            expiresIn: "1d",
        });

        // 🔹 Affichage du token GitHub dans la console
        console.log("💾 Token GitHub stocké dans la DB :", user.githubToken);
        console.log("🔑 JWT généré :", token);

        res.json({ message: "Connexion réussie", token, githubToken: user.githubToken });
    } catch (err) {
        console.error("❌ Erreur lors du login :", err);
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
};
