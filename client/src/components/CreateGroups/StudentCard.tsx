import React from "react";
import { Card, TextField, Typography, Button } from "@mui/material";
import { useStudents } from "../../context/StudentContext";
import { Project } from "../../services/projectService";

interface Props {
    index: number;
    project: Project;
}

const StudentCard: React.FC<Props> = ({ index, project }) => {
    const { students, setStudents } = useStudents();
    const student = students[index];

    const handleChange = (field: "fullName" | "githubUsername", value: string) => {
        const updated = [...students];
        updated[index][field] = value;
        setStudents(updated);
    };

    const removeStudent = () => {
        if (students.length <= project.minStudents) {
            alert(`Vous devez remplir au moins ${project.minStudents} étudiants`);
            return;
        }
        setStudents(students.filter((_, i) => i !== index));
    };

    return (
        <Card sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1">Étudiant {index + 1}</Typography>
            <TextField
                label="Nom complet"
                value={student.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                fullWidth
                sx={{ mt: 1 }}
            />
            <TextField
                label="Pseudo GitHub"
                value={student.githubUsername}
                onChange={(e) => handleChange("githubUsername", e.target.value)}
                fullWidth
                sx={{ mt: 1 }}
            />
            <Button variant="outlined" color="error" onClick={removeStudent} sx={{ mt: 1 }}>
                Supprimer
            </Button>
        </Card>
    );
};

export default StudentCard;
