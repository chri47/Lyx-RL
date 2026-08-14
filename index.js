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

// CARICA COMANDI SLASH - se li hai
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`[OK] Comando caricato: ${command.data.name}`);
    } else {
        console.log(`[ERRORE] Manca data o execute in ${file}`);
    }
}

client.once(Events.ClientReady, c => {
    console.log(`[OK] Bot online come ${c.user.tag}`);
});

// GESTIONE INTERAZIONI - QUESTO FA FUNZIONARE I BOTTONI
client.on(Events.InteractionCreate, async interaction => {
    
    // 1. GESTISCE I COMANDI SLASH /ticket
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

    // 2. GESTISCE I PULSANTI DEI TICKET - QUESTA È LA PARTE CHE MANCAVA
    if (interaction.isButton()) {
        
        // Pulsanti per creare ticket
        if (interaction.customId === 'ticket_general' || 
            interaction.customId === 'ticket_product' || 
            interaction.customId === 'ticket_payment') {
            
            let category = "General Support";
            if (interaction.customId === 'ticket_product') category = "Product Not Received";
            if (interaction.customId === 'ticket_payment') category = "Manual Delivery";
            
            try {
                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: null, // metti l'ID di una categoria se vuoi: 'ID_CATEGORIA'
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: client.user.id, // Il bot deve vedere il canale
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        }
                    ],
                });
                
                await interaction.reply({ 
                    content: `Ticket creato: ${channel}`, 
                    ephemeral: true 
                });
                
                await channel.send(`Ciao ${interaction.user}, hai aperto un ticket per: **${category}**\nUn membro dello staff ti risponderà al più presto.`);
                
            } catch (error) {
                console.error('Errore creazione ticket:', error);
                await interaction.reply({ 
                    content: 'Errore nella creazione del ticket. Contatta un admin.', 
                    ephemeral: true 
                });
            }
            return;
        }

        // Pulsante per chiudere ticket
        if (interaction.customId === 'close_ticket') {
            await interaction.reply('Chiusura ticket in corso...');
            setTimeout(() => interaction.channel.delete(), 3000);
            return;
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
