import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "/DeployWeb2025_2026/", // à modifier selon le nom du dépôt GitHub
    root: ".", // facultatif, "." = le dossier client
    server: {
        port: 5173,
    },
});
