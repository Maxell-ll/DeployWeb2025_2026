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
import { Octokit } from "@octokit/rest";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const CreateForm: React.FC = () => {
    const { token, logout } = useAuth();
    const { fetchProjects } = useProjects();
    const navigate = useNavigate();

    const [projectName, setProjectName] = useState("");
    const [githubOrg, setGithubOrg] = useState("");
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [minStudents, setMinStudents] = useState(1);
    const [maxStudents, setMaxStudents] = useState(1);
    const [groupConvention, setGroupConvention] = useState("Groupe-XX");

    // 🔹 Récupérer les organisations GitHub
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
                },
            });

            const savedProject = res.data;

            if (!savedProject?.id) {
                throw new Error("Le backend n’a pas renvoyé d’ID de projet");
            }

            await fetchProjects();

            // ✅ Redirige directement vers la page d’édition
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


                    <Button type="submit" variant="contained">
                        Créer le projet
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateForm;
