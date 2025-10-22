import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Project {
    id: number;
    name: string;
    githubOrg: string;
    minStudents: number;
    maxStudents: number;
    groupConvention: string;
    uniqueUrl: string;
    uniqueKey: string;
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

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) return logout();
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error("Erreur fetchProjects :", err);
        }
    }, [token, logout]);

    const fetchProjectById = useCallback(async (projectId: number) => {
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                logout();
                return null;
            }
            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Erreur fetchProjectById :", err);
            return null;
        }
    }, [token, logout]);

    const clearProjects = () => setProjects([]);

    return (
        <ProjectContext.Provider value={{ projects, fetchProjects, fetchProjectById, clearProjects }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error("useProjects doit être utilisé à l'intérieur d'un ProjectProvider");
    return context;
};
