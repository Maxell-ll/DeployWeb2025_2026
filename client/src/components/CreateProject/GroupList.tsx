import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
} from "@mui/material";
import { useGroups } from "../../context/GroupContext";

interface GroupListProps {
    projectId?: number;
    minStudents: number;
    maxStudents: number;
}

const GroupList: React.FC<GroupListProps> = ({ projectId, minStudents, maxStudents }) => {
    const { groups, fetchGroups, clearGroups } = useGroups();
    const [loading, setLoading] = useState(false);

    // 🔹 Chargement des groupes
    useEffect(() => {
        if (!projectId || isNaN(Number(projectId))) {
            console.warn("projectId invalide ou manquant :", projectId);
            return;
        }

        const loadGroups = async () => {
            setLoading(true);
            try {
                await fetchGroups(Number(projectId));
            } catch (err) {
                console.error("❌ Erreur récupération groupes :", err);
            } finally {
                setLoading(false);
            }
        };

        loadGroups();

        return () => clearGroups();
    }, [projectId]); // ✅ plus de dépendances instables

    if (!projectId) return null;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card sx={{ mt: 3, maxWidth: 800, margin: "auto" }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Groupes du projet
                </Typography>

                {!Array.isArray(groups) || groups.length === 0 ? (
                    <Typography color="text.secondary">
                        Aucun groupe n’a encore été créé.
                    </Typography>
                ) : (
                    <Grid container spacing={2}>
                        {groups.map((group) => {
                            const current = group.students.length;
                            const full = current >= maxStudents;
                            const missing = minStudents - current;

                            return (
                                <Grid item xs={12} key={group.id}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            backgroundColor: full ? "#2e7d32" : "background.paper",
                                            color: full ? "white" : "text.primary",
                                        }}
                                    >
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {group.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                Étudiants : {current}/{maxStudents}
                                                {current < minStudents && (
                                                    <span style={{ color: "#f44336" }}>
                                                        {" "} (Encore {missing} requis)
                                                    </span>
                                                )}
                                            </Typography>

                                            <Divider sx={{ my: 1 }} />

                                            <List dense>
                                                {group.students.map((student) => (
                                                    <ListItem key={student.id}>
                                                        <ListItemText
                                                            primary={student.fullName}
                                                            secondary={`GitHub : ${student.githubUsername}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default GroupList;
