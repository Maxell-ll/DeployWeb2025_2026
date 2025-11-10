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
    Button,
} from "@mui/material";
import { useGroups } from "../../context/GroupContext";
import { useAuth } from "../../context/AuthContext";

interface GroupListProps {
    projectId?: number;
    minStudents: number;
    maxStudents: number;
}

const GroupList: React.FC<GroupListProps> = ({ projectId, minStudents, maxStudents }) => {
    const { groups, fetchGroups, deleteGroup, clearGroups } = useGroups();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!projectId || isNaN(Number(projectId))) return;

        const init = async () => {
            setLoading(true);
            try {
                await fetchGroups(Number(projectId));
            } catch (err) {
                console.error("❌ Erreur chargement groupes :", err);
            } finally {
                setLoading(false);
            }
        };

        init();
        return () => clearGroups();
    }, [projectId]);

    const handleDeleteGroup = async (groupId: number) => {
        if (!token) return alert("Erreur : token manquant !");
        if (!window.confirm("❌ Voulez-vous vraiment supprimer ce groupe ?")) return;

        try {
            await deleteGroup(groupId);
            alert("✅ Groupe supprimé !");
            await fetchGroups(Number(projectId));
        } catch (err: any) {
            console.error("❌ Erreur suppression groupe :", err);
            alert(err.response?.data?.message || "Erreur lors de la suppression du groupe.");
        }
    };

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
                    <Typography color="text.secondary">Aucun groupe n’a encore été créé.</Typography>
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
                                            backgroundColor: "background.paper", // toujours le fond sombre
                                            color: "text.primary",                // texte clair selon thème
                                        }}
                                    >

                                    <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {group.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color={full ? "inherit" : "text.secondary"}
                                                gutterBottom
                                            >
                                                Étudiants : {current}/{maxStudents}
                                                {current < minStudents && (
                                                    <span style={{ color: "#f44336" }}> (Encore {missing} requis)</span>
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

                                            <Divider sx={{ my: 1 }} />

                                            <Box display="flex" justifyContent="flex-end">
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteGroup(group.id!)}
                                                >
                                                    Supprimer
                                                </Button>
                                            </Box>
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
