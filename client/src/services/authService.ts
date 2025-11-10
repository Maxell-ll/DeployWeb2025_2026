import axios from "axios";
import { fetchCsrfToken, clearCsrfToken } from "./csrfService";

const API_URL = import.meta.env.VITE_API_URL;

interface LoginResponse {
    token: string;
    githubToken?: string;
}

export const loginRequest = async (username: string, password: string): Promise<LoginResponse> => {
    const csrfToken = await fetchCsrfToken();
    const res = await axios.post(
        `${API_URL}/auth/login`,
        { username, password },
        {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
        }
    );
    return res.data;
};

export const logoutRequest = async (): Promise<void> => {
    try {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        clearCsrfToken(); // on vide le cache CSRF après déconnexion
    } catch (err) {
        console.warn("⚠️ Erreur logout :", err);
    }
};
