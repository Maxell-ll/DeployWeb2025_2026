import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Grid, Chip } from "@mui/material";

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
    const [projects, setProjects] = useState<Project[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("⚠️ Aucun token trouvé, redirection vers login");
                navigate("/login");
                return;
            }

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    console.error("Erreur API :", res.status);
                    return;
                }

                const data = await res.json();
                console.log("✅ Projets récupérés :", data);
                setProjects(data);
            } catch (err) {
                console.error("Erreur réseau :", err);
            }
        };

        fetchProjects();
    }, [navigate]);

    return (
        <div style={{ padding: "2rem" }}>
            <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                <Typography variant="h4">Mes projets</Typography>
                <Button variant="contained" onClick={() => navigate("/create-project")}>
                    + Nouveau projet
                </Button>
            </header>

            <Grid container spacing={3}>
                {projects.map((project) => (
                    <Grid item xs={12} sm={6} md={4} key={project.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{project.name}</Typography>
                                <Typography variant="body2">Organisation : {project.githubOrg}</Typography>
                                <Typography variant="body2">
                                    Étudiants : {project.minStudents}–{project.maxStudents}
                                </Typography>
                                <Typography variant="body2">
                                    Groupes : {project.groups.length}
                                </Typography>
                                <Typography variant="caption">
                                    URL unique : {project.uniqueUrl}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default Dashboard;
