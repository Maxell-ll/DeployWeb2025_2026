import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import groupRoutes from "./routes/groupRoutes";
import { errorHandler } from "./middlewares/errorHandler"; // note le pluriel "middlewares"

const app = express();

app.use(cors());
app.use(express.json());

// Routes principales
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/groups", groupRoutes);

// Middleware global d’erreur
app.use(errorHandler);

export default app;
