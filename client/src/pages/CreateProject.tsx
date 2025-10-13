import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FRONT_URL = import.meta.env.VITE_FRONT_URL || window.location.origin;

const CreateProject: React.FC = () => {
    const [projectName, setProjectName] = useState("");
    const [githubOrg, setGithubOrg] = useState("");
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [minStudents, setMinStudents] = useState(1);
    const [maxStudents, setMaxStudents] = useState(5);
    const [groupConvention] = useState("Groupe-XX");
    const [generatedUrl, setGeneratedUrl] = useState("");
    const [uniqueKey, setUniqueKey] = useState("");
    const [nextProjectId, setNextProjectId] = useState(0);
    const navigate = useNavigate();

    // Récupérer le prochain ID depuis le backend et générer URL
    useEffect(() => {
        const fetchNextIdAndGenerateUrl = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) return;

            try {
                const res = await fetch(`${API_URL}/projects/next-id`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const data = await res.json();
                setNextProjectId(data.nextId);

                // Générer clé unique ≥50 caractères
                const array = new Uint8Array(32);
                crypto.getRandomValues(array);
                const key = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 50);
                setUniqueKey(key);

                setGeneratedUrl(`${FRONT_URL}/CreateGroups/${data.nextId}/${key}`);
            } catch (err) {
                console.error("❌ Erreur récupération nextId :", err);
            }
        };

        fetchNextIdAndGenerateUrl();
    }, []);

    // Récupérer organisations GitHub
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch(`${API_URL}/users/github-token`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) return;
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
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                alert("Vous devez être connecté");
                return;
            }

            const response = await fetch(`${API_URL}/projects`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    name: projectName,
                    githubOrg,
                    minStudents,
                    maxStudents,
                    groupConvention,
                    uniqueKey,
                    uniqueUrl: generatedUrl,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                alert("Erreur : " + err.message);
                return;
            }

            const data = await response.json();
            alert("Projet créé avec succès 🎉\nLien : " + data.uniqueUrl);
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Erreur création projet :", err);
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
                    <Typography variant="h5" gutterBottom>Create Project</Typography>
                    <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }} onSubmit={handleSubmit}>
                        <TextField label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                        <TextField select label="GitHub Organization" value={githubOrg} onChange={(e) => setGithubOrg(e.target.value)} required>
                            {organizations.map((org) => <MenuItem key={org} value={org}>{org}</MenuItem>)}
                        </TextField>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><TextField type="number" label="Min Students" value={minStudents} onChange={(e) => setMinStudents(Number(e.target.value))} /></Grid>
                            <Grid item xs={6}><TextField type="number" label="Max Students" value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} /></Grid>
                        </Grid>
                        <TextField label="Group Convention" value={groupConvention} InputProps={{ readOnly: true }} />
                        <TextField
                            label="Project Access URL"
                            value={generatedUrl}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleCopyUrl}><ContentCopyIcon /></IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            helperText="Lien à partager avec les étudiants"
                        />
                        <Button type="submit" variant="contained">Save Project</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateProject;
