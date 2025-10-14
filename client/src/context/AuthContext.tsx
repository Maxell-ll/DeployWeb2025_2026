import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("jwtToken"));

    useEffect(() => {
        if (token) {
            localStorage.setItem("jwtToken", token);
        } else {
            localStorage.removeItem("jwtToken");
        }
    }, [token]);

    const login = (newToken: string) => setToken(newToken);
    const logout = () => setToken(null);

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
