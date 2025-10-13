import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import CreateGroups from "./pages/CreateGroups";

const App: React.FC = () => {
    const token = localStorage.getItem("jwtToken");

    return (
        <Routes>
            {/* Page de connexion */}
            <Route path="/login" element={<LoginPage />} />

            {/* Page CreateGroups accessible sans connexion */}
            <Route path="/CreateGroups/:projectId/:uniqueKey" element={<CreateGroups />} />

            {/* Si pas de token, redirige vers /login pour toutes les autres routes */}
            {!token ? (
                <Route path="*" element={<Navigate to="/login" replace />} />
            ) : (
                <>
                    {/* Routes accessibles après connexion */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-project" element={<CreateProject />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </>
            )}
        </Routes>
    );
};

export default App;
