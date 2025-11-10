import axios from "axios";
import { Student } from "../context/StudentContext";
import { fetchCsrfToken } from "./csrfService";

const API_URL = import.meta.env.VITE_API_URL;

export interface Group {
    id?: number;
    name?: string;
    projectId: number;
    students: Student[];
}

// 🔹 Récupérer les groupes d’un projet (admin)
export const fetchGroups = async (token: string, projectId: number) => {
    if (!projectId) throw new Error("projectId invalide pour fetchGroups");
    const csrfToken = await fetchCsrfToken();
    const res = await axios.get(`${API_URL}/groups/project/${projectId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
    });
    return res.data as Group[];
};

// 🔹 Créer un groupe
export const createGroup = async (
    token: string,
    projectId: number,
    uniqueKey: string,
    students: Student[]
) => {
    if (!projectId || !uniqueKey) throw new Error("projectId ou uniqueKey invalide pour createGroup");

    const csrfToken = await fetchCsrfToken();
    const res = await axios.post(
        `${API_URL}/groups/${projectId}/${uniqueKey}`,
        { students },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-CSRF-Token": csrfToken,
                "Content-Type": "application/json",
            },
            withCredentials: true,
        }
    );
    return res.data.group as Group;
};

// 🔹 Supprimer un groupe
export const deleteGroup = async (token: string, groupId: number) => {
    if (!groupId) throw new Error("groupId invalide pour deleteGroup");
    const csrfToken = await fetchCsrfToken();
    const res = await axios.delete(`${API_URL}/groups/${groupId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
    });
    return res.data;
};
