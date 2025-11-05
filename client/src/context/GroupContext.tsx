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
    const { token, logout } = useAuth();
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
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 401) return logout();

                const data = res.data;
                if (!Array.isArray(data)) {
                    console.warn("Réponse inattendue pour fetchGroups :", data);
                    setGroups([]);
                    return;
                }

                setGroups(data);
            } catch (err) {
                console.error("Erreur fetchGroups :", err);
            }
        },
        [token, logout]
    );

    const createGroup = useCallback(
        async (projectId: number, uniqueKey: string, students: Student[]) => {
            try {
                const res = await axios.post(
                    `${API_URL}/groups/${projectId}/${uniqueKey}`,
                    { students },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setGroups((prev) => [...prev, res.data.group]);
            } catch (err) {
                console.error("Erreur createGroup :", err);
            }
        },
        [token]
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
