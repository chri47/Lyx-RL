import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// CARICA COMANDI DALLA CARTELLA /commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    if (command.default.data && command.default.execute) {
        client.commands.set(command.default.data.name, command.default);
        console.log(`[OK] Comando caricato: ${command.default.data.name}`);
    } else {
        console.log(`[ERRORE] Manca data o execute in ${file}`);
    }
}

// QUANDO IL BOT È ONLINE
client.once(Events.ClientReady, c => {
    console.log(`[OK] Bot online come ${c.user.tag}`);
});

// GESTORE INTERAZIONI - QUESTO FA FUNZIONARE I BOTTONI
client.on(Events.InteractionCreate, async interaction => {
    // 1. COMANDI SLASH /ticket
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`Errore comando ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Errore durante l\'esecuzione del comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Errore durante l\'esecuzione del comando!', ephemeral: true });
            }
        }
    }

    // 2. BOTTONI DEI TICKET - QUESTA È LA PARTE CHE TI MANCA
    if (interaction.isButton()) {
        // Controlla se è un bottone del sistema ticket
        if (interaction.customId.startsWith('ticket_') || interaction.customId === 'close_ticket' || interaction.customId === 'claim_ticket') {
            const ticketCommand = client.commands.get('ticket');
            if (ticketCommand && ticketCommand.handleButton) {
                try {
                    await ticketCommand.handleButton(interaction, client);
                } catch (error) {
                    console.error('Errore bottone ticket:', error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'Errore col bottone!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Errore col bottone!', ephemeral: true });
                    }
                }
            }
        }
    }
});

client.login(process.env.TOKEN);
