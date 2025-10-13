import bcrypt from "bcrypt";
import prisma from "../prisma/client";
import readline from "readline";

// Création de l'interface de lecture dans la console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
    try {
        const username = await askQuestion("Nom d'utilisateur : ");
        const password = await askQuestion("Mot de passe : ");
        const githubToken = await askQuestion("Token GitHub : ");

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                githubToken,
            },
        });

        console.log("✅ Utilisateur créé :", user);
    } catch (err) {
        console.error("❌ Erreur :", err);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main();
