import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useStudents } from "../context/StudentContext";
import { useProjects } from "../context/ProjectContext";

interface ProjectPublic {
    id: number;
    name: string;
    minStudents: number;
    maxStudents: number;
}

const CreateGroup: React.FC = () => {
    const { projectId, uniqueKey } = useParams<{ projectId: string; uniqueKey: string }>();
    const { students, setStudents, clearStudents } = useStudents();
    const { projects } = useProjects();

    const [project, setProject] = useState<ProjectPublic | null>(null);
    const [csrfToken, setCsrfToken] = useState<string>("");

    // 🔹 Récupération du projet (via context ou API publique)
    useEffect(() => {
        const loadProject = async () => {
            if (!projectId || !uniqueKey) return;

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

            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/projects/public/${projectId}/${uniqueKey}`,
                    { withCredentials: true }
                );
                const data = res.data;
                setProject(data);

                setStudents(
                    Array.from({ length: data.minStudents }, () => ({
                        fullName: "",
                        githubUsername: "",
                    }))
                );
            } catch (err: any) {
                console.error(
                    "❌ Erreur récupération projet :",
                    err.response?.data || err.message
                );
                alert(err.response?.data?.message || "Erreur lors du chargement du projet.");
            }
        };

        loadProject();
    }, [projectId, uniqueKey, projects, setStudents]);

    // 🔹 Récupération du CSRF token
    useEffect(() => {
        const getCsrfToken = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL.replace("/api", "")}/api/csrf-token`,
                    { withCredentials: true }
                );
                setCsrfToken(res.data.csrfToken);
            } catch (err) {
                console.error("❌ Erreur récupération CSRF token :", err);
            }
        };

        getCsrfToken();
    }, []);

    const handleStudentChange = (
        index: number,
        field: "fullName" | "githubUsername",
        value: string
    ) => {
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

    // 🔹 Soumission du groupe
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !uniqueKey) return;

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/groups/${projectId}/${uniqueKey}`,
                { students },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken || "",
                    },
                    withCredentials: true,
                }
            );

            alert("✅ Groupe créé avec succès !");
            if (project) {
                setStudents(
                    Array.from({ length: project.minStudents }, () => ({
                        fullName: "",
                        githubUsername: "",
                    }))
                );
            }
        } catch (err: any) {
            console.error(
                "❌ Erreur création groupe :",
                err.response?.data || err.message
            );
            alert(err.response?.data?.message || "Erreur lors de la création du groupe.");
        }
    };

    // 🔹 Nettoyage du state students à la sortie
    useEffect(() => {
        return () => clearStudents();
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
                                    onChange={(e) =>
                                        handleStudentChange(index, "fullName", e.target.value)
                                    }
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                                <TextField
                                    label="Pseudo GitHub"
                                    value={student.githubUsername}
                                    onChange={(e) =>
                                        handleStudentChange(index, "githubUsername", e.target.value)
                                    }
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
                        <Button type="submit" variant="contained" color="primary" disabled={!csrfToken}>
                            {csrfToken ? "Créer le groupe" : "Chargement sécurité..."}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateGroup;
