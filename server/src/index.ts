import dotenv from "dotenv";
import app from "./app";
import projectRoutes from "./routes/projectRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

app.use("/api/projects", projectRoutes);

app.use("/api/users", userRoutes);