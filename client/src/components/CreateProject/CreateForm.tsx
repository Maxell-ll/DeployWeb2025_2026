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

const CreateForm: React.FC = () => {
    const { csrfToken } = useAuth();
    const { fetchGithubOrgs, createProject } = useProjects();
    const navigate = useNavigate();

    const [projectName, setProjectName] = useState("");
    const [githubOrg, setGithubOrg] = useState("");
    const [organizations, setOrganizations] = useState<string[]>([]);
    const [minStudents, setMinStudents] = useState(1);
    const [maxStudents, setMaxStudents] = useState(1);
    const [groupConvention, setGroupConvention] = useState("Groupe-XX");

    // 🔹 Charger les organisations GitHub
    useEffect(() => {
        const loadOrgs = async () => {
            const orgs = await fetchGithubOrgs();
            setOrganizations(orgs);
        };
        loadOrgs();
    }, [fetchGithubOrgs]);

    // 🔹 Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectName || !githubOrg) return alert("Tous les champs sont requis.");

        const newProject = await createProject({
            name: projectName,
            githubOrg,
            minStudents,
            maxStudents,
            groupConvention,
        });

        if (newProject) {
            alert("✅ Projet créé !");
            navigate(`/editProject/${newProject.id}`);
        } else {
            alert("❌ Erreur lors de la création du projet.");
        }
    };

    return (
        <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Créer un projet
                </Typography>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                                label="Min étudiants"
                                value={minStudents}
                                onChange={(e) => setMinStudents(Number(e.target.value))}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                type="number"
                                label="Max étudiants"
                                value={maxStudents}
                                onChange={(e) => setMaxStudents(Number(e.target.value))}
                                inputProps={{ min: minStudents }}
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Convention de nommage"
                        value={groupConvention}
                        onChange={(e) => setGroupConvention(e.target.value)}
                        helperText='Utilise "XX" comme variable (ex : Groupe-XX)'
                    />

                    <Button type="submit" variant="contained" disabled={!csrfToken}>
                        {csrfToken ? "Créer le projet" : "Chargement..."}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateForm;
