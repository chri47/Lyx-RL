const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Map();

// CARICA COMANDI SLASH - se hai la cartella commands
const commandsPath = './commands';
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`${commandsPath}/${file}`);
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
            console.log(`[OK] Comando caricato: ${command.data.name}`);
        }
    }
}

client.once(Events.ClientReady, c => {
    console.log(`[OK] Bot online come ${c.user.tag}`);
    console.log(`[OK] ID Bot: ${c.user.id}`);
});

// GESTIONE INTERAZIONI - FIXATO PER TUTTI I PULSANTI
client.on(Events.InteractionCreate, async interaction => {
    
    // 1. COMANDI SLASH /ticket
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`Errore comando ${interaction.commandName}:`, error);
            const reply = { content: 'Errore durante l\'esecuzione del comando!', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    // 2. PULSANTI TICKET - ORA FUNZIONA CON TUTTO
    if (interaction.isButton()) {
        
        console.log('[DEBUG] Pulsante cliccato:', interaction.customId); // Per debug nei log
        
        // Pulsanti per CREARE ticket - accetta tutti questi nomi
        const ticketButtons = [
            'replacement', 'refund', 'general',
            'ticket_general', 'ticket_product', 'ticket_payment',
            'ticket_replacement', 'ticket_refund', 'ticket_create'
        ];
        
        if (ticketButtons.includes(interaction.customId)) {
            
            // Mappa i nomi in categorie leggibili
            let category = "Supporto";
            if (interaction.customId.includes('replacement')) category = "Replacement";
            if (interaction.customId.includes('refund')) category = "Refund";
            if (interaction.customId.includes('product')) category = "Product Not Received";
            if (interaction.customId.includes('payment')) category = "Manual Delivery";
            if (interaction.customId.includes('general')) category = "General Support";
            
            try {
                await interaction.deferReply({ ephemeral: true }); // Evita "bot non risponde"
                
                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        },
                        {
                            id: client.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
                        }
                    ],
                });
                
                await interaction.editReply({ 
                    content: `✅ Ticket creato: ${channel}` 
                });
                
                await channel.send({
                    content: `Ciao ${interaction.user}, hai aperto un ticket per: **${category}**\nUn membro dello staff ti risponderà al più presto.`,
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            style: 4, // Rosso
                            label: "Chiudi Ticket",
                            custom_id: "close_ticket"
                        }]
                    }]
                });
                
            } catch (error) {
                console.error('Errore creazione ticket:', error);
                const errorMsg = 'Errore nella creazione del ticket. Controlla che il bot abbia il permesso `Manage Channels`.';
                if (interaction.deferred) {
                    await interaction.editReply({ content: errorMsg });
                } else {
                    await interaction.reply({ content: errorMsg, ephemeral: true });
                }
            }
            return;
        }

        // Pulsante per CHIUDERE ticket
        if (interaction.customId === 'close_ticket') {
            await interaction.reply('Chiusura ticket in corso...');
            setTimeout(() => {
                interaction.channel.delete().catch(err => console.error('Errore eliminazione canale:', err));
            }, 3000);
            return;
        }
    }
});

// USA DISCORD_TOKEN PERCHÉ COSÌ CE L'HAI SU RAILWAY
client.login(process.env.DISCORD_TOKEN);
