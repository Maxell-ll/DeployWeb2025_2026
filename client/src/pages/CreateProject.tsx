import React from "react";
import { useLocation } from "react-router-dom";
import CreateForm from "../components/CreateProject/CreateForm";
import EditForm from "../components/CreateProject/EditForm";
import GroupList from "../components/CreateProject/GroupList";
import { useProjects, Project } from "../context/ProjectContext";

const CreateProject: React.FC = () => {
    const { projects } = useProjects();
    const location = useLocation();

    // 🔹 Si on vient de cliquer sur "Modifier" dans le dashboard :
    const rawProject = (location.state as any)?.project;
    const editingProject: Project | undefined =
        rawProject && typeof rawProject.id === "number" ? rawProject : undefined;

    return (
        <div style={{ padding: "2rem" }}>
            {/* 🔹 Si on modifie un projet → EditForm */}
            {editingProject ? (
                <>
                    <EditForm editingProject={editingProject} />

                    {/* Affiche la liste des groupes liés */}
                    <GroupList
                        projectId={editingProject.id}
                        minStudents={editingProject.minStudents}
                        maxStudents={editingProject.maxStudents}
                    />
                </>
            ) : (
                // 🔹 Sinon → formulaire de création
                <CreateForm />
            )}
        </div>
    );
};

export default CreateProject;
