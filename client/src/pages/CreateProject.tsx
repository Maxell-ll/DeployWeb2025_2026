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
import { Octokit } from "@octokit/rest";
import { useLocation, useNavigate } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FRONT_URL = import.meta.env.VITE_FRONT_URL || window.location.origin;

interface Project {
    id: number;
    name: string;
    githubOrg: string;
    minStudents: number;
    maxStudents: number;
    groupConvention: string;
    uniqueUrl: string;
    uniqueKey: string;
}

const CreateProject: React.FC = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const rawProject = (location.state as any)?.project;
    const editingProject =
        rawProject && typeof rawProject.id === "number" ? (rawProject as Project) : undefined;

    const [projectName, setProjectName] = useState(editingProject?.name || "");
    const [githubOrg, setGithubOrg] = useState(editingProject?.githubOrg || "");
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [minStudents, setMinStudents] = useState(editingProject?.minStudents || 1);
    const [maxStudents, setMaxStudents] = useState(editingProject?.maxStudents || 1);
    const [groupConvention] = useState(editingProject?.groupConvention || "Groupe-XX");
    const [generatedUrl, setGeneratedUrl] = useState(editingProject?.uniqueUrl || "");
    const [uniqueKey, setUniqueKey] = useState(editingProject?.uniqueKey || "");

    // Génération d'URL si création d’un nouveau projet
    useEffect(() => {
        if (editingProject) return;

        const fetchNextId = async () => {
            try {
                const res = await fetch(`${API_URL}/projects/next-id`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 401) {
                    logout();
                    return;
                }

                const data = await res.json();
                const array = new Uint8Array(32);
                crypto.getRandomValues(array);
                const key = Array.from(array, (b) => b.toString(16).padStart(2, "0"))
                    .join("")
                    .slice(0, 50);

                setUniqueKey(key);
                setGeneratedUrl(`${FRONT_URL}/CreateGroups/${data.nextId}/${key}`);
            } catch (err) {
                console.error("❌ Erreur récupération nextId :", err);
            }
        };

        fetchNextId();
    }, [editingProject, token, logout]);

    // Récupération des organisations GitHub
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await fetch(`${API_URL}/users/github-token`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 401) {
                    logout();
                    return;
                }

                const data = await res.json();
                if (!data.githubToken) return;

                const octokit = new Octokit({ auth: data.githubToken });
                const orgsRes = await octokit.rest.orgs.listForAuthenticatedUser();
                setOrganizations(orgsRes.data.map((org) => org.login));
            } catch (err) {
                console.error("❌ Erreur GitHub :", err);
            }
        };

        fetchOrganizations();
    }, [token, logout]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isEditing = Boolean(editingProject?.id);
            const method = isEditing ? "PUT" : "POST";
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

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                const err = await response.json();
                alert("Erreur : " + err.message);
                return;
            }

            const data = await response.json();
            alert(isEditing ? "Projet mis à jour 🎉" : "Projet créé 🎉\nLien : " + data.uniqueUrl);
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Erreur création/mise à jour projet :", err);
        }
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(generatedUrl);
            alert("URL copiée dans le presse-papiers !");
        } catch (err) {
            console.error("❌ Erreur copie URL :", err);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {editingProject ? "Modifier le projet" : "Créer un projet"}
                    </Typography>
                    <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }} onSubmit={handleSubmit}>
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
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    type="number"
                                    label="Max Students"
                                    value={maxStudents}
                                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                                />
                            </Grid>
                        </Grid>
                        <TextField label="Group Convention" value={groupConvention} InputProps={{ readOnly: true }} />
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
        </div>
    );
};

export default CreateProject;
