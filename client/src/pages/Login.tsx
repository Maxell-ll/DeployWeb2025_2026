import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await login(username, password);
            if (success) navigate("/dashboard");
            else alert("Identifiants incorrects. Réessaie !");
        } catch (err: any) {
            console.error("Erreur login :", err);
            alert("Une erreur est survenue pendant la connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "background.default", // utilise le thème sombre
                p: 2,
            }}
        >
            <Card
                sx={{
                    width: 400,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "background.paper", // gris sombre du thème
                    boxShadow: 4,
                }}
            >
                <CardContent>
                    <Typography variant="h4" align="center" gutterBottom>
                        Project Hub
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                            {loading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginPage;
