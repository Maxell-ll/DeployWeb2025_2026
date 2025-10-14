import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
    const { login } = useAuth(); // ✅ On récupère la fonction login depuis le contexte
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Erreur login :", data.message);
                alert("Échec de la connexion : " + data.message);
                return;
            }

            // ✅ On stocke le token via le contexte
            login(data.token);

            console.log("✅ JWT stocké via AuthContext :", data.token);

            if (data.githubToken) {
                console.log("🐙 Token GitHub depuis DB :", data.githubToken);
            }

            navigate("/dashboard");
        } catch (err) {
            console.error("Erreur serveur :", err);
            alert("Erreur lors de la connexion.");
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Card sx={{ width: 400, p: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h4" align="center" gutterBottom>
                        Project Hub
                    </Typography>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
