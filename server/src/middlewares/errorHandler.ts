import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Erreur:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
};
