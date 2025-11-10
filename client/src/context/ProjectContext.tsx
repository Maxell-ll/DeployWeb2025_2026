import React, {createContext, useContext, useState, useCallback, ReactNode} from "react";
import {useAuth} from "./AuthContext";
import * as projectService from "../services/projectService";

export type Project = projectService.Project;

interface ProjectContextType {
    projects: Project[];
    publicProject: Project | null;
    fetchProjects: () => Promise<void>;
    fetchPublicProject: (projectId: number, uniqueKey: string) => Promise<void>;
    clearPublicProject: () => void;
    createProject: (data: Partial<Project>) => Promise<Project | null>;
    updateProject: (id: number, data: Partial<Project>) => Promise<Project | null>;
    fetchGithubOrgs: () => Promise<string[]>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const {token, csrfToken} = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [publicProject, setPublicProject] = useState<Project | null>(null);

    // 🔹 Récupération des projets
    const fetchProjects = useCallback(async () => {
        if (!token) return;
        try {
            const data = await projectService.fetchProjects(token);
            setProjects(data);
        } catch (err) {
            console.error("❌ Erreur lors du chargement des projets :", err);
        }
    }, [token]);

    // 🔹 Récupération des organisations GitHub
    const fetchGithubOrgs = useCallback(async (): Promise<string[]> => {
        if (!token) return [];
        try {
            const orgs = await projectService.fetchGithubOrgs(token);
            return orgs;
        } catch (err) {
            console.error("❌ Erreur lors du chargement des organisations GitHub :", err);
            return [];
        }
    }, [token]);

    // 🔹 Création d’un projet
    const createProject = useCallback(
        async (data: Partial<Project>): Promise<Project | null> => {
            if (!token) return null;
            try {
                const newProject = await projectService.createProject(token, data);
                setProjects((prev) => [...prev, newProject]);
                return newProject;
            } catch (err) {
                console.error("❌ Erreur création projet :", err);
                return null;
            }
        },
        [token]
    );

    // 🔹 Mise à jour d’un projet
    const updateProject = useCallback(
        async (id: number, data: Partial<Project>): Promise<Project | null> => {
            if (!token || !csrfToken) return null;
            try {
                const updated = await projectService.updateProject(token, csrfToken, id, data);
                setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
                return updated;
            } catch (err) {
                console.error("❌ Erreur mise à jour projet :", err);
                return null;
            }
        },
        [token, csrfToken]
    );

    // 🔹 Récupération publique (étudiant)
    const fetchPublicProject = useCallback(async (projectId: number, uniqueKey: string) => {
        try {
            const project = await projectService.fetchPublicProject(projectId, uniqueKey);
            setPublicProject(project);
        } catch (err) {
            console.error("❌ Erreur chargement projet public :", err);
            setPublicProject(null);
        }
    }, []);

    const clearPublicProject = useCallback(() => setPublicProject(null), []);

    return (
        <ProjectContext.Provider
            value={{
                projects,
                publicProject,
                fetchProjects,
                fetchPublicProject,
                clearPublicProject,
                createProject,
                updateProject,
                fetchGithubOrgs,
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error("useProjects doit être utilisé dans un ProjectProvider");
    return context;
};
