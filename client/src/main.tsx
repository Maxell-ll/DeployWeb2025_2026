import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Import des context providers
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { GroupProvider } from "./context/GroupContext";
import { StudentProvider } from "./context/StudentContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ProjectProvider>
                    <GroupProvider>
                        <StudentProvider>
                            <App />
                        </StudentProvider>
                    </GroupProvider>
                </ProjectProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
