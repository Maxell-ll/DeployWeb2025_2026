// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#3f51b5' },    // bleu sobre
        secondary: { main: '#90caf9' },  // bleu clair
        background: {
            default: '#1e1e2f',  // fond général
            paper: '#2a2a3d',    // cartes / sections
        },
        text: {
            primary: '#e0e0e0',   // texte principal
            secondary: '#90caf9', // textes secondaires ou labels
        },
    },
    shape: {
        borderRadius: 12, // arrondi général
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#2a2a3d',
                    color: '#e0e0e0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                },
                containedPrimary: {
                    backgroundColor: '#3f51b5',
                    color: '#fff',
                    '&:hover': {
                        backgroundColor: '#303f9f',
                    },
                },
                outlinedPrimary: {
                    borderColor: '#90caf9',
                    color: '#90caf9',
                    '&:hover': {
                        backgroundColor: 'rgba(144, 202, 249, 0.1)',
                    },
                },
                textPrimary: {
                    color: '#90caf9',
                    '&:hover': {
                        backgroundColor: 'rgba(144, 202, 249, 0.1)',
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    color: '#e0e0e0',
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#90caf9',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& fieldset': {
                        borderColor: '#444466',
                    },
                    '&:hover fieldset': {
                        borderColor: '#90caf9',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#90caf9',
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: '#444466',
                },
            },
        },
        MuiCircularProgress: {
            styleOverrides: {
                root: {
                    color: '#90caf9',
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(144, 202, 249, 0.1)',
                    },
                },
            },
        },
    },
});
