import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export interface Student {
    id?: number;
    fullName: string;
    githubUsername: string;
}

interface StudentContextType {
    students: Student[];
    addStudent: (student: Student) => void;
    removeStudent: (index: number) => void;
    updateStudent: (index: number, field: keyof Student, value: string) => void;
    clearStudents: () => void;
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    syncStudents?: (projectId: number) => Promise<void>; // 🔹 nouvelle fonction (future)
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token, csrfToken, logout } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);

    const addStudent = (student: Student) => setStudents((prev) => [...prev, student]);

    const removeStudent = (index: number) =>
        setStudents((prev) => prev.filter((_, i) => i !== index));

    const updateStudent = (index: number, field: keyof Student, value: string) => {
        setStudents((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const clearStudents = () => setStudents([]);

    /**
     * 🔒 Exemple de fonction sécurisée si tu veux envoyer les étudiants vers ton backend
     */
    const syncStudents = async (projectId: number) => {
        try {
            await axios.post(
                `${API_URL}/students/sync/${projectId}`,
                { students },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                        "X-CSRF-Token": csrfToken || "",
                    },
                }
            );
        } catch (err: any) {
            if (err.response?.status === 401) logout();
            console.error("❌ Erreur syncStudents :", err);
        }
    };

    return (
        <StudentContext.Provider
            value={{
                students,
                addStudent,
                removeStudent,
                updateStudent,
                clearStudents,
                setStudents,
                syncStudents,
            }}
        >
            {children}
        </StudentContext.Provider>
    );
};

export const useStudents = () => {
    const context = useContext(StudentContext);
    if (!context)
        throw new Error("useStudents doit être utilisé à l'intérieur d'un StudentProvider");
    return context;
};
