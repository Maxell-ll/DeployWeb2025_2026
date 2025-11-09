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
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface EditFormProps {
    editingProject: Project;
}

const EditForm: React.FC<EditFormProps> = ({ editingProject }) => {
    const { token, logout } = useAuth();
    const { fetchProjects } = useProjects();
    const navigate = useNavigate();

    const [csrfToken, setCsrfToken] = useState("");
    const [projectName, setProjectName] = useState(editingProject.name);
    const [githubOrg, setGithubOrg] = useState(editingProject.githubOrg);
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [minStudents, setMinStudents] = useState(editingProject.minStudents);
    const [maxStudents, setMaxStudents] = useState(editingProject.maxStudents);
    const [groupConvention, setGroupConvention] = useState(editingProject.groupConvention);
    const [generatedUrl] = useState(editingProject.uniqueUrl || "");

    // 🔹 Récupération du token CSRF
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const res = await axios.get(`${API_URL.replace("/api", "")}/api/csrf-token`, {
                    withCredentials: true,
                });
                setCsrfToken(res.data.csrfToken);
            } catch (err) {
                console.error("❌ Erreur lors de la récupération du CSRF token :", err);
            }
        };
        fetchCsrfToken();
    }, []);

    // 🔹 Récupération des organisations GitHub depuis le backend
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await axios.get(`${API_URL}/users/github-orgs`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrganizations(res.data.organizations || []);
            } catch (err: any) {
                if (err.response?.status === 401) return logout();
                console.error("❌ Erreur récupération organisations GitHub :", err);
            }
        };
        fetchOrganizations();
    }, [token, logout]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(
                `${API_URL}/projects/${editingProject.id}`,
                { name: projectName, githubOrg, minStudents, maxStudents, groupConvention },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "X-CSRF-Token": csrfToken,
                    },
                    withCredentials: true,
                }
            );
            await fetchProjects();
            alert("Projet mis à jour 🎉");
            navigate("/dashboard");
        } catch (err: any) {
            if (err.response?.status === 401) return logout();
            const message = err.response?.data?.message || "Erreur inconnue";
            alert("Erreur : " + message);
            console.error("❌ Erreur mise à jour projet :", err);
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
                    Modifier le projet
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
                        label="Convention de nommage des groupes"
                        value={groupConvention}
                        onChange={(e) => setGroupConvention(e.target.value)}
                        required
                    />

                    {generatedUrl && (
                        <TextField
                            label="URL d'accès au projet"
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
                            helperText="Lien d'accès au projet"
                        />
                    )}

                    <Button type="submit" variant="contained" disabled={!csrfToken}>
                        {csrfToken ? "Mettre à jour" : "Chargement sécurité..."}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default EditForm;
