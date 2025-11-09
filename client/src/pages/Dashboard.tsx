import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";
import axios from "axios";
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
    const [csrfToken, setCsrfToken] = useState<string>("");

    // 🔹 Récupération du token CSRF au chargement
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/csrf-token`, {
                    withCredentials: true,
                });
                setCsrfToken(res.data.csrfToken);
            } catch (err) {
                console.error("❌ Erreur récupération CSRF token :", err);
            }
        };

        fetchCsrfToken();
    }, []);

    // 🔹 Récupération des projets
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProjects = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProjects(res.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    logout();
                    return;
                }
                console.error("❌ Erreur récupération projets :", err.response?.data || err.message);
                alert(err.response?.data?.message || "Erreur lors du chargement des projets.");
            }
        };

        fetchProjects();
    }, [token, navigate, logout]);

    // 🔹 Suppression sécurisée d’un projet
    const handleDelete = async (projectId: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;

        try {
            // Si pas de token CSRF, on le recharge
            let tokenToUse = csrfToken;
            if (!tokenToUse) {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/csrf-token`, {
                    withCredentials: true,
                });
                tokenToUse = res.data.csrfToken;
                setCsrfToken(tokenToUse);
            }

            await axios.delete(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-CSRF-Token": tokenToUse,
                },
                withCredentials: true,
            });

            alert("✅ Projet supprimé avec succès !");
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
        } catch (err: any) {
            console.error("❌ Erreur suppression projet :", err.response?.data || err.message);
            alert(err.response?.data?.message || "Erreur lors de la suppression du projet.");
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
                                    <Typography variant="body2">
                                        Groupes : {project.groups.length}
                                    </Typography>
                                </CardContent>
                                <CardContent
                                    sx={{ display: "flex", justifyContent: "flex-end", pt: 0 }}
                                >
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
