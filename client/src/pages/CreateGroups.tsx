import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";

const CreateGroup: React.FC = () => {
    const [students, setStudents] = useState([{ fullName: "", githubUsername: "" }]);

    const handleStudentChange = (index: number, field: "fullName" | "githubUsername", value: string) => {
        const updated = [...students];
        updated[index][field] = value;
        setStudents(updated);
    };

    const addStudent = () => setStudents([...students, { fullName: "", githubUsername: "" }]);
    const removeStudent = (index: number) => setStudents(students.filter((_, i) => i !== index));

    return (
        <div style={{ padding: "2rem" }}>
            <Card sx={{ maxWidth: 600, margin: "auto", p: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Create Group</Typography>
                    <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                        {students.map((student, index) => (
                            <Card key={index} sx={{ p: 2, mt: 2 }}>
                                <Typography variant="subtitle1">Student {index + 1}</Typography>
                                <TextField
                                    label="Full Name"
                                    value={student.fullName}
                                    onChange={(e) => handleStudentChange(index, "fullName", e.target.value)}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                                <TextField
                                    label="GitHub Username"
                                    value={student.githubUsername}
                                    onChange={(e) => handleStudentChange(index, "githubUsername", e.target.value)}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                />
                                <Button variant="outlined" color="error" onClick={() => removeStudent(index)} sx={{ mt: 1 }}>
                                    Remove
                                </Button>
                            </Card>
                        ))}

                        <Button variant="contained" color="secondary" onClick={addStudent}>
                            + Add Student
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            Create Group
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateGroup;
