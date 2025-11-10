import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import * as groupService from "../services/groupService";

interface GroupContextType {
    groups: groupService.Group[];
    fetchGroups: (projectId: number) => Promise<void>;
    createGroup: (projectId: number, uniqueKey: string, students: any[]) => Promise<void>;
    deleteGroup: (groupId: number) => Promise<void>;
    clearGroups: () => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token, logout } = useAuth();
    const [groups, setGroups] = useState<groupService.Group[]>([]);

    const fetchGroupsContext = useCallback(
        async (projectId: number) => {
            if (!token || !projectId) return;
            try {
                const data = await groupService.fetchGroups(token, projectId);
                setGroups(data);
            } catch (err: any) {
                console.error("Erreur fetchGroups :", err.response?.data || err);
                if (err.response?.status === 401) logout();
            }
        },
        [token, logout]
    );

    const createGroupContext = useCallback(
        async (projectId: number, uniqueKey: string, students: any[]) => {
            if (!token || !projectId || !uniqueKey) return;
            try {
                const group = await groupService.createGroup(token, projectId, uniqueKey, students);
                setGroups((prev) => [...prev, group]);
            } catch (err: any) {
                console.error("Erreur createGroup :", err.response?.data || err);
                if (err.response?.status === 401) logout();
            }
        },
        [token, logout]
    );

    const deleteGroupContext = useCallback(
        async (groupId: number) => {
            if (!token) return;
            try {
                await groupService.deleteGroup(token, groupId);
                setGroups((prev) => prev.filter((g) => g.id !== groupId));
            } catch (err: any) {
                console.error("Erreur deleteGroup :", err.response?.data || err);
                if (err.response?.status === 401) logout();
                throw err; // pour que GroupList affiche l'erreur
            }
        },
        [token, logout]
    );

    const clearGroups = () => setGroups([]);

    return (
        <GroupContext.Provider
            value={{
                groups,
                fetchGroups: fetchGroupsContext,
                createGroup: createGroupContext,
                deleteGroup: deleteGroupContext,
                clearGroups,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
};

export const useGroups = () => {
    const context = useContext(GroupContext);
    if (!context) throw new Error("useGroups doit être utilisé à l'intérieur d'un GroupProvider");
    return context;
};
