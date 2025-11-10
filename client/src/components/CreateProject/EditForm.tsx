import React, { useEffect, useState } from "react";
import {
    TextField,
    Button,
    Grid,
    Typography,
    Card,
    CardContent,
    MenuItem,
    InputAdornment,
    IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProjects, Project } from "../../context/ProjectContext";

interface EditFormProps {
    editingProject: Project;
}

const EditForm: React.FC<EditFormProps> = ({ editingProject }) => {
    const { csrfToken } = useAuth();
    const { updateProject, fetchGithubOrgs } = useProjects();
    const navigate = useNavigate();

    const [projectName, setProjectName] = useState(editingProject.name);
    const [githubOrg, setGithubOrg] = useState(editingProject.githubOrg);
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [minStudents, setMinStudents] = useState(editingProject.minStudents);
    const [maxStudents, setMaxStudents] = useState(editingProject.maxStudents);
    const [groupConvention, setGroupConvention] = useState(editingProject.groupConvention);
    const [generatedUrl] = useState(editingProject.uniqueUrl || "");

    useEffect(() => {
        const loadOrgs = async () => {
            const orgs = await fetchGithubOrgs();
            setOrganizations(orgs);
        };
        loadOrgs();
    }, [fetchGithubOrgs]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updated = await updateProject(editingProject.id, {
            name: projectName,
            githubOrg,
            minStudents,
            maxStudents,
            groupConvention,
        });

        if (updated) {
            alert("✅ Projet mis à jour !");
            navigate("/dashboard");
        } else {
            alert("❌ Erreur lors de la mise à jour.");
        }
    };

    const handleCopyUrl = async () => {
        if (!generatedUrl) return;
        await navigator.clipboard.writeText(generatedUrl);
        alert("URL copiée !");
    };

    return (
        <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Modifier le projet
                </Typography>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <TextField
                        label="Nom du projet"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />

                    <TextField
                        select
                        label="Organisation GitHub"
                        value={githubOrg}
                        onChange={(e) => setGithubOrg(e.target.value)}
                    >
                        {organizations.map((org) => (
                            <MenuItem key={org} value={org}>
                                {org}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                type="number"
                                label="Min étudiants"
                                value={minStudents}
                                onChange={(e) => setMinStudents(Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                type="number"
                                label="Max étudiants"
                                value={maxStudents}
                                onChange={(e) => setMaxStudents(Number(e.target.value))}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Convention de nommage"
                        value={groupConvention}
                        onChange={(e) => setGroupConvention(e.target.value)}
                    />

                    {generatedUrl && (
                        <TextField
                            label="URL du projet"
                            value={generatedUrl}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleCopyUrl}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}

                    <Button type="submit" variant="contained" disabled={!csrfToken}>
                        {csrfToken ? "Mettre à jour" : "Chargement..."}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default EditForm;
