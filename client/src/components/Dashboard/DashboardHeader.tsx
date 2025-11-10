// src/pages/Dashboard/DashboardHeader.tsx
import React from "react";
import { Button, Typography } from "@mui/material";

interface DashboardHeaderProps {
    onCreateProject: () => void;
    onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
                                                             onCreateProject,
                                                             onLogout,
                                                         }) => {
    return (
        <header
            style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2rem",
            }}
        >
            <Typography variant="h4">Mes projets</Typography>
            <div style={{ display: "flex", gap: "1rem" }}>
                <Button variant="contained" onClick={onCreateProject}>
                    + Nouveau projet
                </Button>
                <Button variant="outlined" color="secondary" onClick={onLogout}>
                    Déconnexion
                </Button>
            </div>
        </header>
    );
};

export default DashboardHeader;
