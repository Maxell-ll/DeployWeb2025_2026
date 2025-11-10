// src/pages/Dashboard/ProjectCard.tsx
import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { Project } from "../../services/projectService";

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (projectId: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
    const handleDelete = () => {
        if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
            onDelete(project.id);
        }
    };

    return (
        <Card sx={{ cursor: "pointer" }}>
            <CardContent onClick={() => onEdit(project)}>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2">
                    Groupes : {project.groups.length}
                </Typography>
            </CardContent>
            <CardContent sx={{ display: "flex", justifyContent: "flex-end", pt: 0 }}>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                >
                    Supprimer
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProjectCard;
