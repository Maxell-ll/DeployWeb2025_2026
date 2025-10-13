import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";

interface Student {
    fullName: string;
    githubUsername: string;
}

const CreateGroup: React.FC = () => {
    const { projectId, uniqueKey } = useParams<{ projectId: string; uniqueKey: string }>();
    const [students, setStudents] = useState<Student[]>([{ fullName: "", githubUsername: "" }]);
    const [project, setProject] = useState<any>(null);

    // Récupérer les infos du projet via l'API publique
    useEffect(() => {
        if (projectId && uniqueKey) {
            fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}/${uniqueKey}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Projet non trouvé ou clé invalide");
                    return res.json();
                })
                .then((data) => setProject(data))
                .catch((err) => console.error("Erreur récupération projet :", err));
        }
    }, [projectId, uniqueKey]);

    const handleStudentChange = (index: number, field: keyof Student, value: string) => {
        const updated = [...students];
        updated[index][field] = value;
        setStudents(updated);
    };

    const addStudent = () => setStudents([...students, { fullName: "", githubUsername: "" }]);
    const removeStudent = (index: number) => setStudents(students.filter((_, i) => i !== index));

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
                return;
            }

            alert("Groupes créés avec succès !");
            setStudents([{ fullName: "", githubUsername: "" }]);
        } catch (err) {
            console.error("Erreur serveur :", err);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {project ? `Créer un groupe pour : ${project.name}` : "Chargement du projet..."}
                    </Typography>

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
