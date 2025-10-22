import React, { createContext, useContext, useState, ReactNode } from "react";

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
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

    return (
        <StudentContext.Provider
            value={{ students, addStudent, removeStudent, updateStudent, clearStudents, setStudents }}
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
