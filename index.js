const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events, Partials } = require('discord.js');

console.log('[BOOT] Avvio LYX RL MultiFunzione...');

// CONTROLLO TOKEN
if (!process.env.DISCORD_TOKEN) {
    console.error('[FATAL] DISCORD_TOKEN mancante nelle Variables di Railway!');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates // Per la musica
    ],
    partials: [Partials.Channel, Partials.Message]
});

client.once(Events.ClientReady, c => {
    console.log(`[ONLINE] ${c.user.tag}`);
    console.log(`[INFO] Bot multifunzione attivo su ${c.guilds.cache.size} server`);
});

// ===== GESTORE MESSAGGI =====
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // COMANDO SETUP TICKET
    if (message.content === '!setup-ticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const row = {
            type: 1,
            components: [
                { type: 2, style: 2, label: "Questions", custom_id: "ticket_questions" },
                { type: 2, style: 2, label: "General Support", custom_id: "ticket_general" },
                { type: 2, style: 2, label: "Product Not Received", custom_id: "ticket_product" },
                { type: 2, style: 2, label: "Manual Delivery", custom_id: "ticket_delivery" },
                { type: 2, style: 2, label: "Replacement", custom_id: "ticket_replacement" }
            ]
        };
        await message.channel.send({
            content: "**Support Ticket System**\nClicca un pulsante per aprire un ticket",
            components: [row]
        });
        await message.delete();
        console.log('[CMD] Pannello ticket creato');
        return;
    }

    // ===== QUI METTI I TUOI COMANDI ESISTENTI =====
    // ESEMPIO WELCOME
    if (message.content === '!testwelcome') {
        message.channel.send(`Benvenuto ${message.author}!`);
    }

    // ESEMPIO BAN
    if (message.content.startsWith('!ban')) {
        // TUO CODICE BAN QUI
    }

    // ESEMPIO MUSICA
    if (message.content.startsWith('!play')) {
        // TUO CODICE MUSICA QUI
    }

});

// ===== GESTORE INTERAZIONI UNICO PER TUTTO =====
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        console.log(`[CLICK] ${interaction.user.tag} -> ${interaction.customId}`);

        // ===== SISTEMA TICKET =====
        if (interaction.customId.startsWith('ticket_')) {
            await interaction.deferReply({ flags: 64 }); // 64 = ephemeral, fix warning

            try {
                if (interaction.customId === 'ticket_close') {
                    await interaction.editReply('Chiudo il ticket in 3 secondi...');
                    setTimeout(() => interaction.channel.delete(), 3000);
                    return;
                }

                const ticketType = interaction.customId.replace('ticket_', '');

                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                    ],
                });

                await interaction.editReply(`✅ Ticket creato: ${channel}`);
                await channel.send({
                    content: `<@${interaction.user.id}> Hai aperto un ticket per **${ticketType}**\nUn membro dello staff ti risponderà a breve.`,
                    components: [{
                        type: 1,
                        components: [{ type: 2, style: 4, label: "Chiudi Ticket", custom_id: "ticket_close" }]
                    }]
                });
                console.log(`[TICKET] Creato ${channel.name} per ${ticketType}`);

            } catch (error) {
                console.error('[ERRORE TICKET]', error);
                await interaction.editReply(`❌ ERRORE: ${error.message}`);
            }
            return; // IMPORTANTE: ferma qui se è un ticket
        }

        // ===== QUI METTI I TUOI PULSANTI ESISTENTI =====
        // ESEMPIO GIVEAWAY
        if (interaction.customId === 'giveaway_join') {
            // TUO CODICE GIVEAWAY QUI
            await interaction.reply({ content: 'Sei entrato nel giveaway!', flags: 64 });
            return;
        }

        // ESEMPIO VERIFY
        if (interaction.customId === 'verify_button') {
            // TUO CODICE VERIFY QUI
            return;
        }

        // ESEMPIO MUSIC CONTROLS
        if (interaction.customId === 'music_pause') {
            // TUO CODICE MUSICA QUI
            return;
        }

    }

    // ===== GESTORE SLASH COMMANDS =====
    if (interaction.isChatInputCommand()) {
        // TUO CODICE SLASH COMMANDS QUI
        console.log(`[SLASH] ${interaction.commandName} da ${interaction.user.tag}`);
    }

});

// ===== GESTIONE ERRORI PER NON FAR CRASHARE IL BOT =====
process.on('unhandledRejection', error => {
    console.error('[CRASH] Unhandled rejection:', error);
});

client.on('error', error => {
    console.error('[CLIENT ERROR]', error);
});

client.login(process.env.DISCORD_TOKEN);
