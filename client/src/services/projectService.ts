import axios from "axios";
import { fetchCsrfToken } from "./csrfService";

const API_URL = import.meta.env.VITE_API_URL;

export interface Project {
    id: number;
    name: string;
    githubOrg: string;
    minStudents: number;
    maxStudents: number;
    groupConvention: string;
    userId?: number;
    uniqueKey?: string;
    uniqueUrl?: string;
    groups?: any[];
}

// 🔹 Public
export const fetchPublicProject = async (projectId: number, uniqueKey: string) => {
    const res = await axios.get(`${API_URL}/projects/public/${projectId}/${uniqueKey}`, {
        withCredentials: true,
    });
    return res.data as Project;
};

// 🔹 CRUD
export const fetchProjects = async (token: string) => {
    const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
    });
    return res.data as Project[];
};

export const fetchProjectById = async (token: string, projectId: number) => {
    const res = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
    });
    return res.data as Project;
};

export const createProject = async (token: string, projectData: Partial<Project>) => {
    const csrfToken = await fetchCsrfToken();
    const res = await axios.post(`${API_URL}/projects`, projectData, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
    });
    return res.data as Project;
};

export const updateProject = async (
    token: string,
    csrfToken: string | null,
    projectId: number,
    projectData: any
) => {
    const res = await axios.put(`${API_URL}/projects/${projectId}`, projectData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": csrfToken || "",
            "Content-Type": "application/json",
        },
        withCredentials: true,
    });
    return res.data;
};

export const deleteProject = async (token: string, projectId: number) => {
    const csrfToken = await fetchCsrfToken();
    await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}`, "X-CSRF-Token": csrfToken },
        withCredentials: true,
    });
};

export const fetchGithubOrgs = async (token: string) => {
    const res = await axios.get(`${API_URL}/users/github-orgs`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
    });
    return res.data.organizations as string[];
};
