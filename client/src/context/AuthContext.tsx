// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { loginRequest, logoutRequest } from "../services/authService";
import { fetchCsrfToken } from "../services/csrfService";

interface AuthContextType {
    token: string | null;
    csrfToken: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    csrfToken: null,
    login: async () => false,
    logout: async () => {},
    isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("jwtToken"));
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    // 🔹 Synchroniser le token avec le localStorage
    useEffect(() => {
        if (token) localStorage.setItem("jwtToken", token);
        else localStorage.removeItem("jwtToken");
    }, [token]);

    // 🔹 Récupérer le CSRF token au démarrage
    useEffect(() => {
        const loadCsrf = async () => {
            try {
                const token = await fetchCsrfToken();
                setCsrfToken(token);
            } catch (err) {
                console.error("❌ Erreur chargement CSRF token :", err);
            }
        };
        loadCsrf();
    }, []);

    // 🔹 Configuration globale d’Axios
    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.defaults.headers.common["Content-Type"] = "application/json";

        if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        else delete axios.defaults.headers.common["Authorization"];

        if (csrfToken) axios.defaults.headers.common["X-CSRF-Token"] = csrfToken;
        else delete axios.defaults.headers.common["X-CSRF-Token"];
    }, [token, csrfToken]);

    // 🔹 Fonction login (appelle le service)
    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const res = await loginRequest(username, password);
            if (res.token) {
                setToken(res.token);
                console.log("login réussi:",res.token);
                return true;
            }
            return false;
        } catch (err) {
            console.error("❌ Erreur login :", err);
            return false;
        }
    };

    // 🔹 Fonction logout
    const logout = async () => {
        try {
            await logoutRequest();
        } finally {
            setToken(null);
            setCsrfToken(null);
            localStorage.removeItem("jwtToken");
            delete axios.defaults.headers.common["Authorization"];
            delete axios.defaults.headers.common["X-CSRF-Token"];
        }
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
