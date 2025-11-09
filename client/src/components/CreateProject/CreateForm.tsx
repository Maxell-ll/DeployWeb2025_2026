import React, { useEffect, useState } from "react";
import {
    TextField,
    Button,
    Grid,
    Typography,
    Card,
    CardContent,
    MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const CreateForm: React.FC = () => {
    const { token, logout } = useAuth();
    const { fetchProjects } = useProjects();
    const navigate = useNavigate();

    const [csrfToken, setCsrfToken] = useState("");
    const [projectName, setProjectName] = useState("");
    const [githubOrg, setGithubOrg] = useState("");
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [minStudents, setMinStudents] = useState(1);
    const [maxStudents, setMaxStudents] = useState(1);
    const [groupConvention, setGroupConvention] = useState("Groupe-XX");

    // 🔹 Récupération du token CSRF dès le chargement du composant
    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const res = await axios.get(`${API_URL.replace("/api", "")}/api/csrf-token`, {
                    withCredentials: true, // important pour recevoir le cookie
                });
                setCsrfToken(res.data.csrfToken);
            } catch (err) {
                console.error("❌ Erreur lors de la récupération du CSRF token :", err);
            }
        };

        fetchCsrfToken();
    }, []);

    // 🔹 Récupération sécurisée des organisations GitHub
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await axios.get(`${API_URL}/users/github-orgs`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setOrganizations(res.data.organizations);
            } catch (err: any) {
                if (err.response?.status === 401) return logout();
                console.error("❌ Erreur GitHub :", err);
            }
        };

        fetchOrganizations();
    }, [token, logout]);

    // 🔹 Soumission du formulaire de création de projet
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectName.trim()) return alert("Le nom du projet est obligatoire.");
        if (!githubOrg.trim()) return alert("Vous devez sélectionner une organisation GitHub.");

        try {
            const body = {
                name: projectName,
                githubOrg,
                minStudents,
                maxStudents,
                groupConvention,
            };

            const res = await axios.post(`${API_URL}/projects`, body, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "X-CSRF-Token": csrfToken, // 🔒 Protection CSRF
                },
                withCredentials: true,
            });

            const savedProject = res.data;
            if (!savedProject?.id) throw new Error("Le backend n’a pas renvoyé d’ID de projet");

            await fetchProjects();
            navigate(`/editProject/${savedProject.id}`);
        } catch (err: any) {
            if (err.response?.status === 401) return logout();
            const message = err.response?.data?.message || "Erreur inconnue";
            alert("Erreur : " + message);
            console.error("❌ Erreur création projet :", err);
        }
    };

    return (
        <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Créer un projet
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
                        helperText='Utilise "XX" comme numéro variable (ex: Groupe-XX, Team_XX, etc.)'
                        required
                    />

                    <Button type="submit" variant="contained" disabled={!csrfToken}>
                        {csrfToken ? "Créer le projet" : "Chargement sécurité..."}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateForm;
