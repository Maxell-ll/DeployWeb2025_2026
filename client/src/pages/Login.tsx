import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 🔹 Étape 1 : Récupérer le token CSRF du backend
            const csrfRes = await axios.get(`${import.meta.env.VITE_API_URL}/csrf-token`, {
                withCredentials: true, // indispensable pour récupérer le cookie
            });
            const csrfToken = csrfRes.data.csrfToken;

            // 🔹 Étape 2 : Envoyer la requête de login avec le header CSRF
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                { username, password },
                {
                    headers: { "X-CSRF-Token": csrfToken },
                    withCredentials: true, // pour envoyer le cookie CSRF
                }
            );

            const data = res.data;

            // ✅ Stocker le JWT via le contexte
            login(data.token);
            console.log("✅ JWT stocké via AuthContext :", data.token);

            if (data.githubToken) {
                console.log("🐙 Token GitHub depuis DB :", data.githubToken);
            }

            navigate("/dashboard");
        } catch (err: any) {
            console.error("❌ Erreur login :", err.response?.data || err.message);
            alert(err.response?.data?.message || "Échec de la connexion. Vérifie tes identifiants.");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Card sx={{ width: 400, p: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h4" align="center" gutterBottom>
                        Project Hub
                    </Typography>
                    <form
                        onSubmit={handleSubmit}
                        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                    >
                        <TextField
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            required
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
