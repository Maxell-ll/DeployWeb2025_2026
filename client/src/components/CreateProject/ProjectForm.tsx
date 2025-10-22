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
import { Octokit } from "@octokit/rest";
import { useAuth } from "../../context/AuthContext";
import { useProjects, Project } from "../../context/ProjectContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FRONT_URL = import.meta.env.FRONT_URL || window.location.origin;

interface ProjectFormProps {
    editingProject?: Project;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ editingProject }) => {
    const { token, logout } = useAuth();
    const { fetchProjects } = useProjects();
    const navigate = useNavigate();

    const [projectName, setProjectName] = useState(editingProject?.name || "");
    const [githubOrg, setGithubOrg] = useState(editingProject?.githubOrg || "");
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [minStudents, setMinStudents] = useState(editingProject?.minStudents || 1);
    const [maxStudents, setMaxStudents] = useState(editingProject?.maxStudents || 1);
    const [groupConvention] = useState(editingProject?.groupConvention || "Groupe-XX");
    const [generatedUrl, setGeneratedUrl] = useState(editingProject?.uniqueUrl || "");
    const [uniqueKey, setUniqueKey] = useState(editingProject?.uniqueKey || "");

    // 🔹 Génération URL & clé uniquement si création
    useEffect(() => {
        if (editingProject) return;

        const fetchNextId = async () => {
            try {
                const res = await axios.get(`${API_URL}/projects/next-id`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = res.data;

                const array = new Uint8Array(32);
                crypto.getRandomValues(array);
                const key = Array.from(array, (b) => b.toString(16).padStart(2, "0"))
                    .join("")
                    .slice(0, 50);

                setUniqueKey(key);
                setGeneratedUrl(`${FRONT_URL}/CreateGroups/${data.nextId}/${key}`);
            } catch (err: any) {
                if (err.response?.status === 401) return logout();
                console.error("❌ Erreur récupération nextId :", err);
            }
        };

        fetchNextId();
    }, [editingProject, token, logout]);

    // 🔹 Fetch des organisations GitHub
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await axios.get(`${API_URL}/users/github-token`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = res.data;
                if (!data.githubToken) return;

                const octokit = new Octokit({ auth: data.githubToken });
                const orgsRes = await octokit.rest.orgs.listForAuthenticatedUser();
                setOrganizations(orgsRes.data.map((org) => org.login));
            } catch (err: any) {
                if (err.response?.status === 401) return logout();
                console.error("❌ Erreur GitHub :", err);
            }
        };

        fetchOrganizations();
    }, [token, logout]);

    // 🔹 Soumission formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const isEditing = Boolean(editingProject?.id);
            const url = isEditing
                ? `${API_URL}/projects/${editingProject!.id}`
                : `${API_URL}/projects`;

            const body: any = {
                name: projectName,
                githubOrg,
                minStudents,
                maxStudents,
                groupConvention,
            };

            if (!isEditing) {
                body.uniqueKey = uniqueKey;
                body.uniqueUrl = generatedUrl;
            }

            const res = await axios({
                method: isEditing ? "put" : "post",
                url,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                data: body,
            });

            await fetchProjects(); // Actualiser la liste globale des projets

            alert(
                isEditing
                    ? "Projet mis à jour 🎉"
                    : `Projet créé 🎉\nLien : ${res.data.uniqueUrl}`
            );
            navigate("/dashboard");
        } catch (err: any) {
            if (err.response?.status === 401) return logout();

            const message = err.response?.data?.message || "Erreur inconnue";
            alert("Erreur : " + message);
            console.error("❌ Erreur création/mise à jour projet :", err);
        }
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(generatedUrl);
            alert("URL copiée !");
        } catch (err) {
            console.error("❌ Erreur copie :", err);
        }
    };

    return (
        <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    {editingProject ? "Modifier le projet" : "Créer un projet"}
                </Typography>

                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                    <TextField
                        label="Nom du projet"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                    />

                    <TextField
                        select
                        label="Organisation GitHub"
                        value={githubOrg}
                        onChange={(e) => setGithubOrg(e.target.value)}
                        required
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
                                label="Min Students"
                                value={minStudents}
                                onChange={(e) => setMinStudents(Number(e.target.value))}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                type="number"
                                label="Max Students"
                                value={maxStudents}
                                onChange={(e) => setMaxStudents(Number(e.target.value))}
                                inputProps={{ min: minStudents }}
                                helperText={`Minimum requis : ${minStudents}`}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Group Convention"
                        value={groupConvention}
                        InputProps={{ readOnly: true }}
                    />

                    <TextField
                        label="Project Access URL"
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
                        helperText="Lien à partager avec les étudiants"
                    />

                    <Button type="submit" variant="contained">
                        {editingProject ? "Mettre à jour" : "Créer le projet"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default ProjectForm;
