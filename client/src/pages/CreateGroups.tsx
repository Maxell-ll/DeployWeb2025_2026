import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, Typography } from "@mui/material";
import { useProjects } from "../context/ProjectContext";
import { useStudents } from "../context/StudentContext";
import GroupForm from "../components/CreateGroups/GroupForm";

const CreateGroup: React.FC = () => {
    const { projectId, uniqueKey } = useParams<{ projectId: string; uniqueKey: string }>();
    const { publicProject, fetchPublicProject, clearPublicProject } = useProjects();
    const { clearStudents } = useStudents();

    useEffect(() => {
        if (projectId && uniqueKey) fetchPublicProject(Number(projectId), uniqueKey);
        return () => {
            clearPublicProject();
            clearStudents();
        };
    }, [projectId, uniqueKey]);

    if (!publicProject) return <Typography>Chargement du projet...</Typography>;

    return (
        <div style={{ padding: "2rem" }}>
            <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Créer un groupe pour : {publicProject.name}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Remplir au moins {publicProject.minStudents} étudiants, maximum {publicProject.maxStudents}.
                    </Typography>

                    <GroupForm project={publicProject} />
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateGroup;
