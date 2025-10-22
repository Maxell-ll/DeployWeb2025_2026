import React from "react";
import { useLocation } from "react-router-dom";
import ProjectForm from "../components/CreateProject/ProjectForm";
import GroupList from "../components/CreateProject/GroupList";
import { useProjects, Project } from "../context/ProjectContext";

const CreateProject: React.FC = () => {
    const { projects } = useProjects();
    const location = useLocation();

    // 🔹 Récupération du projet en cours depuis location.state (si modification)
    const rawProject = (location.state as any)?.project;
    const editingProject: Project | undefined =
        rawProject && typeof rawProject.id === "number" ? rawProject : undefined;

    return (
        <div style={{ padding: "2rem" }}>
            <ProjectForm editingProject={editingProject} />

            {/* 🔹 Affiche la liste des groupes uniquement si on modifie */}
            {editingProject && (
                <GroupList
                    projectId={editingProject.id}
                    minStudents={editingProject.minStudents}
                    maxStudents={editingProject.maxStudents}
                />
            )}
        </div>
    );
};

export default CreateProject;
