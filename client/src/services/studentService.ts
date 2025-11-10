import axios from "axios";
import { fetchCsrfToken } from "./csrfService";

const API_URL = import.meta.env.VITE_API_URL;

export interface Student {
    id?: number;
    fullName: string;
    githubUsername: string;
}

// 🔹 Synchroniser les étudiants pour un projet
export const syncStudents = async (
    students: Student[],
    projectId: number,
    token: string
) => {
    const csrfToken = await fetchCsrfToken();
    const res = await axios.post(
        `${API_URL}/students/sync/${projectId}`,
        { students },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
        }
    );
    return res.data;
};
