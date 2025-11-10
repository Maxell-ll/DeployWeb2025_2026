// src/pages/Dashboard/Dashboard.tsx
import React, { useEffect } from "react";
import { Typography, Grid } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import ProjectList from "../components/Dashboard/ProjectList";


const Dashboard: React.FC = () => {
    const { token, logout } = useAuth();
    const { projects, fetchProjects } = useProjects();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchProjects();
    }, [token, fetchProjects, navigate]);

    return (
        <div style={{ padding: "2rem" }}>
            <DashboardHeader
                onCreateProject={() => navigate("/create-project")}
                onLogout={logout}
            />

            <Grid container spacing={3}>
                {projects.length === 0 ? (
                    <Typography variant="body1" sx={{ margin: "2rem auto" }}>
                        Aucun projet disponible.
                    </Typography>
                ) : (
                    <ProjectList
                        projects={projects}
                        onEdit={(project) => navigate("/create-project", { state: { project } })}
                    />
                )}
            </Grid>
        </div>
    );
};

export default Dashboard;
