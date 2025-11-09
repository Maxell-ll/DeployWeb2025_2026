import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { Student } from "./StudentContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface Group {
    id?: number;
    name: string;
    projectId: number;
    students: Student[];
}

interface GroupContextType {
    groups: Group[];
    fetchGroups: (projectId?: number) => Promise<void>;
    createGroup: (projectId: number, uniqueKey: string, students: Student[]) => Promise<void>;
    clearGroups: () => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token, csrfToken, logout } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);

    const fetchGroups = useCallback(
        async (projectId: number | string) => {
            const projectIdNumber = Number(projectId);
            if (isNaN(projectIdNumber)) {
                console.error("projectId invalide :", projectId);
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/groups/project/${projectIdNumber}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                        "X-CSRF-Token": csrfToken || "",
                    },
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                if (!Array.isArray(res.data)) {
                    console.warn("Réponse inattendue pour fetchGroups :", res.data);
                    setGroups([]);
                    return;
                }

                setGroups(res.data);
            } catch (err) {
                console.error("Erreur fetchGroups :", err);
            }
        },
        [token, csrfToken, logout]
    );

    const createGroup = useCallback(
        async (projectId: number, uniqueKey: string, students: Student[]) => {
            try {
                const res = await axios.post(
                    `${API_URL}/groups/${projectId}/${uniqueKey}`,
                    { students },
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                            "Content-Type": "application/json",
                            "X-CSRF-Token": csrfToken || "",
                        },
                    }
                );

                if (res.data?.group) {
                    setGroups((prev) => [...prev, res.data.group]);
                }
            } catch (err) {
                console.error("Erreur createGroup :", err);
            }
        },
        [token, csrfToken]
    );

    const clearGroups = () => setGroups([]);

    return (
        <GroupContext.Provider value={{ groups, fetchGroups, createGroup, clearGroups }}>
            {children}
        </GroupContext.Provider>
    );
};

export const useGroups = () => {
    const context = useContext(GroupContext);
    if (!context) throw new Error("useGroups doit être utilisé à l'intérieur d'un GroupProvider");
    return context;
};
