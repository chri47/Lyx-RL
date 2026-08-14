const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events, Partials } = require('discord.js');

console.log('[BOOT] Avvio LYX RL Modular Bot...');

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
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

client.once(Events.ClientReady, c => {
    console.log(`[ONLINE] ${c.user.tag} PRONTO`);
    console.log(`[INFO] Bot attivo su ${c.guilds.cache.size} server`);
});

// ===== MESSAGGI E COMANDI PREFIX =====
client.on(Events.MessageCreate, async message => {
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
            content: "**🎫 Support Ticket System**\nSeleziona il tipo di supporto di cui hai bisogno:",
            components: [row]
        });
        await message.delete();
        console.log('[CMD] Pannello ticket creato');
        return;
    }

    // ===== QUI SOTTO RESTA IL TUO CODICE ESISTENTE =====
    // ESEMPIO: Welcome, Ban, Music, Level ecc...
    // Non toccare nulla, lascia tutto com'è
});

// ===== GESTORE PULSANTI E INTERAZIONI UNICO =====
client.on(Events.InteractionCreate, async interaction => {
    // ===== LOG PER DEBUG =====
    if (interaction.isButton()) {
        console.log(`[CLICK] ${interaction.user.tag} -> ${interaction.customId}`);
    }

    // ===== SISTEMA TICKET =====
    if (interaction.isButton() && interaction.customId.startsWith('ticket_')) {
        await interaction.deferReply({ flags: 64 }); // 64 = ephemeral

        try {
            // CHIUDI TICKET
            if (interaction.customId === 'ticket_close') {
                await interaction.editReply('Chiudo il ticket in 3 secondi...');
                setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
                return;
            }

            // CREA TICKET
            const ticketType = interaction.customId.replace('ticket_', '');
            const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

            // Controlla se ha già un ticket aperto
            const existing = interaction.guild.channels.cache.find(c => c.name === ticketName);
            if (existing) {
                return interaction.editReply(`❌ Hai già un ticket aperto: ${existing}`);
            }

            const channel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                topic: `Ticket di ${interaction.user.tag} | Tipo: ${ticketType}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                    // AGGIUNGI QUI ID RUOLO STAFF: { id: 'ID_RUOLO_STAFF', allow: [PermissionsBitField.Flags.ViewChannel] }
                ],
            });

            await interaction.editReply(`✅ Ticket creato: ${channel}`);
            await channel.send({
                content: `Ciao <@${interaction.user.id}>! 👋\nHai aperto un ticket per **${ticketType}**\n\nUn membro dello staff ti risponderà il prima possibile.`,
                components: [{
                    type: 1,
                    components: [{ type: 2, style: 4, label: "Chiudi Ticket", custom_id: "ticket_close", emoji: "🔒" }]
                }]
            });
            console.log(`[TICKET] Creato ${channel.name} per ${ticketType}`);

        } catch (error) {
            console.error('[ERRORE TICKET]', error);
            await interaction.editReply(`❌ ERRORE: ${error.message}`);
        }
        return; // IMPORTANTE: ferma qui per non interferire con altri sistemi
    }

    // ===== QUI SOTTO LASCIA TUTTI I TUOI PULSANTI ESISTENTI =====
    // ESEMPIO VERIFY
    if (interaction.isButton() && interaction.customId === 'verify_button') {
        // TUO CODICE VERIFY QUI - NON TOCCARLO
        console.log('[VERIFY] Click verify da', interaction.user.tag);
        //...
        return;
    }

    // ESEMPIO GIVEAWAY
    if (interaction.isButton() && interaction.customId === 'giveaway_join') {
        // TUO CODICE GIVEAWAY QUI - NON TOCCARLO
        console.log('[GIVEAWAY] Join da', interaction.user.tag);
        //...
        return;
    }

    // ESEMPIO REACTION ROLES
    if (interaction.isButton() && interaction.customId.startsWith('rr_')) {
        // TUO CODICE REACTION ROLES QUI - NON TOCCARLO
        return;
    }

    // ESEMPIO MUSICA
    if (interaction.isButton() && ['music_play', 'music_pause', 'music_skip'].includes(interaction.customId)) {
        // TUO CODICE LAVALINK QUI - NON TOCCARLO
        return;
    }

    // ===== SLASH COMMANDS =====
    if (interaction.isChatInputCommand()) {
        console.log(`[SLASH] /${interaction.commandName} da ${interaction.user.tag}`);
        // TUO CODICE SLASH COMMANDS QUI
    }
});

// ===== GESTIONE ERRORI ANTI-CRASH =====
process.on('unhandledRejection', error => {
    console.error('[CRASH] Unhandled rejection:', error);
});
process.on('uncaughtException', error => {
    console.error('[CRASH] Uncaught exception:', error);
});
client.on('error', error => {
    console.error('[CLIENT ERROR]', error);
});

client.login(process.env.DISCORD_TOKEN);
