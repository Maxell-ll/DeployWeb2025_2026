import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import {darkTheme} from "./theme";

// Import des context providers
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { GroupProvider } from "./context/GroupContext";
import { StudentProvider } from "./context/StudentContext";
import {ThemeProvider, CssBaseline} from "@mui/material";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
<ThemeProvider theme={darkTheme}>
        <BrowserRouter>
            <AuthProvider>
                <ProjectProvider>
                    <GroupProvider>
                        <StudentProvider>
                                <CssBaseline />
                            <App />
                        </StudentProvider>
                    </GroupProvider>
                </ProjectProvider>
            </AuthProvider>
        </BrowserRouter>
        </ThemeProvider>

    </React.StrictMode>
);
