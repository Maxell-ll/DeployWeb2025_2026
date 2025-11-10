// src/pages/Dashboard/ProjectList.tsx
import React from "react";
import { Grid } from "@mui/material";
import { Project } from "../../services/projectService";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
    projects: Project[];
    onEdit: (project: Project) => void;
    onDelete: (projectId: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
                                                     projects,
                                                     onEdit,
                                                     onDelete,
                                                 }) => {
    return (
        <>
            {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <ProjectCard project={project} onEdit={onEdit} onDelete={onDelete} />
                </Grid>
            ))}
        </>
    );
};

export default ProjectList;
