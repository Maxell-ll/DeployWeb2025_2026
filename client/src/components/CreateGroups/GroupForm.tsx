import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useStudents } from "../../context/StudentContext";
import * as groupService from "../../services/groupService";
import StudentCard from "./StudentCard";
import { Project } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";

interface Props {
    project: Project;
}

const GroupForm: React.FC<Props> = ({ project }) => {
    const { students, setStudents } = useStudents();
    const { token } = useAuth(); // 🔹 Récupération du token

    useEffect(() => {
        // Initialisation des étudiants selon le nombre minimum
        setStudents(
            Array.from({ length: project.minStudents }, () => ({
                fullName: "",
                githubUsername: "",
            }))
        );
    }, [project]);

    const addStudent = () => {
        if (students.length >= project.maxStudents) {
            alert(`Nombre maximum d'étudiants atteint (${project.maxStudents})`);
            return;
        }
        setStudents([...students, { fullName: "", githubUsername: "" }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            alert("❌ Vous n'êtes pas connecté !");
            return;
        }

        if (!project.uniqueKey) {
            alert("❌ Clé unique du projet manquante !");
            return;
        }

        try {
            console.log("Création groupe avec :", {
                token,
                projectId: project.id,
                uniqueKey: project.uniqueKey,
                students,
            });

            // 🔹 Appel correct de createGroup
            await groupService.createGroup(token, project.id, project.uniqueKey, students);

            alert("✅ Groupe créé avec succès !");
            setStudents(
                Array.from({ length: project.minStudents }, () => ({
                    fullName: "",
                    githubUsername: "",
                }))
            );
        } catch (err: any) {
            console.error("❌ Erreur création groupe :", err);
            alert(err.response?.data?.message || "Erreur lors de la création du groupe.");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {students.map((_, index) => (
                <StudentCard key={index} index={index} project={project} />
            ))}

            <Button variant="contained" color="secondary" onClick={addStudent}>
                + Ajouter un étudiant
            </Button>
            <Button type="submit" variant="contained" color="primary">
                Créer le groupe
            </Button>
        </form>
    );
};

export default GroupForm;
