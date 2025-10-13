import { Request, Response } from "express";

export const getGroups = (req: Request, res: Response) => {
    res.json({ message: "Liste des groupes" });
};

export const createGroup = (req: Request, res: Response) => {
    res.json({ message: "Groupe créé" });
};
