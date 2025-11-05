import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export interface Project {
    id: number;
    name: string;
    githubOrg: string;
    minStudents: number;
    maxStudents: number;
    groupConvention: string;
    userId: number;
    uniqueKey?: string;     // ✅ ajouté
    uniqueUrl?: string;     // ✅ ajouté
}


interface ProjectContextType {
    projects: Project[];
    fetchProjects: () => Promise<void>;
    fetchProjectById: (projectId: number) => Promise<Project | null>;
    clearProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token, logout } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);

    // 🔹 Récupération de tous les projets
    const fetchProjects = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(res.data);
        } catch (err: any) {
            if (err.response?.status === 401) logout();
            console.error("Erreur fetchProjects :", err);
        }
    }, [token, logout]);

    // 🔹 Récupération d’un projet spécifique
    const fetchProjectById = useCallback(
        async (projectId: number) => {
            try {
                const res = await axios.get(`${API_URL}/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return res.data;
            } catch (err: any) {
                if (err.response?.status === 401) logout();
                console.error("Erreur fetchProjectById :", err);
                return null;
            }
        },
        [token, logout]
    );

    const clearProjects = () => setProjects([]);

    return (
        <ProjectContext.Provider
            value={{ projects, fetchProjects, fetchProjectById, clearProjects }}
        >
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context)
        throw new Error("useProjects doit être utilisé à l'intérieur d'un ProjectProvider");
    return context;
};
