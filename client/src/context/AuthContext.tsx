import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
    token: string | null;
    csrfToken: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    csrfToken: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
});

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("jwtToken"));
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    // 🔹 Gestion du token JWT dans le localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem("jwtToken", token);
        } else {
            localStorage.removeItem("jwtToken");
        }
    }, [token]);

    // 🔹 Récupération du CSRF token dès le chargement du front
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const res = await axios.get(`${API_URL.replace("/api", "")}/api/csrf-token`, {
                    withCredentials: true,
                });
                setCsrfToken(res.data.csrfToken);
            } catch (err) {
                console.error("❌ Erreur récupération CSRF token :", err);
            }
        };

        fetchCsrfToken();
    }, []);

    // 🔹 Configuration globale d’Axios
    useEffect(() => {
        axios.defaults.withCredentials = true; // permet l’envoi automatique des cookies (CSRF + session)
        axios.defaults.headers.common["Content-Type"] = "application/json";

        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }

        if (csrfToken) {
            axios.defaults.headers.common["X-CSRF-Token"] = csrfToken;
        }
    }, [token, csrfToken]);

    const login = (newToken: string) => setToken(newToken);

    const logout = () => {
        setToken(null);
        setCsrfToken(null);
        localStorage.removeItem("jwtToken");
        delete axios.defaults.headers.common["Authorization"];
        delete axios.defaults.headers.common["X-CSRF-Token"];
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                csrfToken,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
