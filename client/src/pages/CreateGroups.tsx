import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import { useStudents } from "../context/StudentContext";
import { useProjects } from "../context/ProjectContext";

interface ProjectPublic {
    id: number;
    name: string;
    minStudents: number;
    maxStudents: number;
}

export const CreateGroup: React.FC = () => {
    const { projectId, uniqueKey } = useParams<{ projectId: string; uniqueKey: string }>();
    const { students, setStudents, clearStudents } = useStudents();
    const { projects, fetchProjects } = useProjects();

    const [project, setProject] = useState<ProjectPublic | null>(null);

    // 🔹 Récupération du projet via le context si déjà chargé ou via l'API publique
    useEffect(() => {
        const loadProject = async () => {
            if (!projectId || !uniqueKey) return;

            // Vérifie si le projet existe déjà dans le context
            const existing = projects.find((p) => p.id === Number(projectId));
            if (existing) {
                setProject(existing);
                setStudents(
                    Array.from({ length: existing.minStudents }, () => ({
                        fullName: "",
                        githubUsername: "",
                    }))
                );
                return;
            }

            // Sinon, fetch public
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/public/${projectId}/${uniqueKey}`);
                if (!res.ok) throw new Error("Projet non trouvé ou clé invalide");
                const data = await res.json();
                setProject(data);

                // Initialise les étudiants
                setStudents(
                    Array.from({ length: data.minStudents }, () => ({
                        fullName: "",
                        githubUsername: "",
                    }))
                );
            } catch (err) {
                console.error("Erreur récupération projet :", err);
            }
        };

        loadProject();
    }, [projectId, uniqueKey, projects, setStudents]);

    const handleStudentChange = (index: number, field: "fullName" | "githubUsername", value: string) => {
        const updated = [...students];
        updated[index][field] = value;
        setStudents(updated);
    };

    const addStudent = () => {
        if (!project) return;
        if (students.length >= project.maxStudents) {
            alert(`Nombre maximum d'étudiants atteint (${project.maxStudents})`);
            return;
        }
        setStudents([...students, { fullName: "", githubUsername: "" }]);
    };

    const removeStudent = (index: number) => {
        if (!project) return;
        if (students.length <= project.minStudents) {
            alert(`Vous devez remplir au moins ${project.minStudents} étudiants`);
            return;
        }
        setStudents(students.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !uniqueKey) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/groups/${projectId}/${uniqueKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ students }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                console.error("Erreur création groupes :", data.message);
                alert(data.message || "Erreur lors de la création du groupe.");
                return;
            }

            alert("Groupe créé avec succès !");
            if (project)
                setStudents(
                    Array.from({ length: project.minStudents }, () => ({
                        fullName: "",
                        githubUsername: "",
                    }))
                );
        } catch (err) {
            console.error("Erreur serveur :", err);
        }
    };

    useEffect(() => {
        return () => {
            clearStudents();
        };
    }, []);

    return (
        <div style={{ padding: "2rem" }}>
            <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {project ? `Créer un groupe pour : ${project.name}` : "Chargement du projet..."}
                    </Typography>
                    {project && (
                        <Typography variant="body2" gutterBottom>
                            Remplir au moins {project.minStudents} étudiants, maximum {project.maxStudents}.
                        </Typography>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                    >
                        {students.map((student, index) => (
                            <Card key={index} sx={{ p: 2, mt: 2 }}>
                                <Typography variant="subtitle1">Étudiant {index + 1}</Typography>
                                <TextField
                                    label="Nom complet"
                                    value={student.fullName}
                                    onChange={(e) => handleStudentChange(index, "fullName", e.target.value)}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                                <TextField
                                    label="Pseudo GitHub"
                                    value={student.githubUsername}
                                    onChange={(e) => handleStudentChange(index, "githubUsername", e.target.value)}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => removeStudent(index)}
                                    sx={{ mt: 1 }}
                                >
                                    Supprimer
                                </Button>
                            </Card>
                        ))}

                        <Button variant="contained" color="secondary" onClick={addStudent}>
                            + Ajouter un étudiant
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            Créer le groupe
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateGroup;
