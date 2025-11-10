import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

let csrfTokenCache: string | null = null;

export const fetchCsrfToken = async (): Promise<string> => {
    if (csrfTokenCache) return csrfTokenCache; // cache pour éviter appels multiples
    const res = await axios.get(`${BASE_URL}/api/csrf-token`, { withCredentials: true });
    csrfTokenCache = res.data.csrfToken;
    return csrfTokenCache;
};

export const clearCsrfToken = () => {
    csrfTokenCache = null;
};
