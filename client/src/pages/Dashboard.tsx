import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { useAuth } from "../context/AuthContext";

interface Project {
    id: number;
    name: string;
    githubOrg: string;
    minStudents: number;
    maxStudents: number;
    groupConvention: string;
    uniqueUrl: string;
    groups: any[];
}

const Dashboard: React.FC = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProjects = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 401) {
                    logout();
                    return;
                }
                if (!res.ok) throw new Error("Erreur de chargement des projets");

                const data = await res.json();
                setProjects(data);
            } catch (err) {
                console.error("❌ Erreur :", err);
            }
        };

        fetchProjects();
    }, [token, navigate, logout]);

    const handleDelete = async (projectId: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const err = await res.json();
                return alert("Erreur : " + err.message);
            }

            alert("Projet supprimé ✅");
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (project?: Project) => {
        navigate("/create-project", { state: { project } });
    };

    return (
        <div style={{ padding: "2rem" }}>
            <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                <Typography variant="h4">Mes projets</Typography>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <Button variant="contained" onClick={() => handleEdit(undefined)}>
                        + Nouveau projet
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={logout}>
                        Déconnexion
                    </Button>
                </div>
            </header>

            <Grid container spacing={3}>
                {projects.length === 0 ? (
                    <Typography variant="body1" sx={{ margin: "2rem auto" }}>
                        Aucun projet disponible.
                    </Typography>
                ) : (
                    projects.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project.id}>
                            <Card sx={{ cursor: "pointer" }}>
                                <CardContent onClick={() => handleEdit(project)}>
                                    <Typography variant="h6">{project.name}</Typography>
                                    <Typography variant="body2">Groupes : {project.groups.length}</Typography>
                                </CardContent>
                                <CardContent sx={{ display: "flex", justifyContent: "flex-end", pt: 0 }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(project.id);
                                        }}
                                    >
                                        Supprimer
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </div>
    );
};

export default Dashboard;
