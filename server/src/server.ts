// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import { errorHandler } from "./middlewares/errorHandler";

import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import groupRoutes from "./routes/groupRoutes";
import userRoutes from "./routes/userRoutes";

// 🔹 Chargement des variables d’environnement
dotenv.config();

// 🔹 Initialisation de l’app Express
const app = express();

// 🧱 Sécurité avec Helmet
app.use(
    helmet({
        contentSecurityPolicy: false, // désactive CSP strict pour React
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// 🌍 Configuration CORS dynamique
const allowedOrigins = [
    "http://localhost:5173",              // pour ton environnement local
    "https://maxell-ll.github.io",        // ton site GitHub Pages
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// 🔹 Parse les cookies et le JSON
app.use(cookieParser());
app.use(express.json());

// 🔹 Protection CSRF
const csrfProtection = csurf({
    cookie: {
        httpOnly: true,   // token inaccessible depuis JS
        secure: process.env.NODE_ENV === "development", //
        sameSite: "none", // ✅ "none" pour autoriser les cookies cross-site (GitHub Pages)
    },
});

// Applique CSRF sur toutes les routes POST/PUT/DELETE
app.use(csrfProtection);

// 🔹 Route pour récupérer le token CSRF
app.get("/api/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// 🔹 Routes principales
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/users", userRoutes);

// ⚠️ Middleware global d’erreur
app.use(errorHandler);

// 🔹 Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur sécurisé en cours d’exécution sur port ${PORT}`);
});
