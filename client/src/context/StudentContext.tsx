// src/context/StudentContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import * as studentService from "../services/studentService";

interface StudentContextType {
    students: studentService.Student[];
    addStudent: (student: studentService.Student) => void;
    removeStudent: (index: number) => void;
    updateStudent: (index: number, field: keyof studentService.Student, value: string) => void;
    clearStudents: () => void;
    setStudents: React.Dispatch<React.SetStateAction<studentService.Student[]>>;
    syncStudents: (projectId: number) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token, csrfToken, logout } = useAuth();
    const [students, setStudents] = useState<studentService.Student[]>([]);

    const addStudent = (student: studentService.Student) => setStudents(prev => [...prev, student]);
    const removeStudent = (index: number) => setStudents(prev => prev.filter((_, i) => i !== index));
    const updateStudent = (index: number, field: keyof studentService.Student, value: string) => {
        setStudents(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };
    const clearStudents = () => setStudents([]);

    const syncStudents = async (projectId: number) => {
        if (!token) return;
        try {
            await studentService.syncStudents(students, projectId, token, csrfToken);
        } catch (err: any) {
            console.error("Erreur syncStudents :", err);
            if (err.response?.status === 401) logout();
        }
    };

    return (
        <StudentContext.Provider
            value={{ students, addStudent, removeStudent, updateStudent, clearStudents, setStudents, syncStudents }}
        >
            {children}
        </StudentContext.Provider>
    );
};

export const useStudents = () => {
    const context = useContext(StudentContext);
    if (!context) throw new Error("useStudents doit être utilisé à l'intérieur d'un StudentProvider");
    return context;
};
