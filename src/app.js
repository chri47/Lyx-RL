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
    if (message.content === '!setup-ticket' && message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
        await message.delete().catch(() => {});
        console.log('[CMD] Pannello ticket creato');
        return;
    }

    // ===== QUI SOTTO RESTA IL TUO CODICE ESISTENTE =====
});

// ===== GESTORE PULSANTI E INTERAZIONI UNICO =====
client.on(Events.InteractionCreate, async interaction => {
    // ===== LOG PER DEBUG =====
    if (interaction.isButton()) {
        console.log(`[CLICK] ${interaction.user.tag} -> ${interaction.customId}`);
    }

    // ===== SISTEMA TICKET =====
    if (interaction.isButton() && interaction.customId.startsWith('ticket_')) {
        // FIX 1: BLOCCA I DM - SE NON SEI IN UN SERVER, ESCI
        if (!interaction.guild) {
            return interaction.reply({ content: '❌ Devi usare i ticket in un server, non in DM!', flags: 64 });
        }

        await interaction.deferReply({ flags: 64 }); // FIX 2: flags: 64 al posto di ephemeral

        try {
            // CHIUDI TICKET
            if (interaction.customId === 'ticket_close') {
                await interaction.editReply('Chiudo il ticket in 3 secondi...');
                setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
                return;
            }

            // CREA TICKET
            const ticketType = interaction.customId.replace('ticket_', '');
            const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

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
            // FIX 3: CONTROLLA SE L'INTERAZIONE È ANCORA VALIDA
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(`❌ ERRORE: ${error.message}`).catch(() => {});
            }
        }
        return;
    }

    // ===== QUI SOTTO LASCIA TUTTI I TUOI PULSANTI ESISTENTI =====
    if (interaction.isButton() && interaction.customId === 'verify_button') {
        // TUO CODICE VERIFY QUI
        return;
    }

    if (interaction.isButton() && interaction.customId === 'giveaway_join') {
        // TUO CODICE GIVEAWAY QUI
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('rr_')) {
        // TUO CODICE REACTION ROLES QUI
        return;
    }

    if (interaction.isButton() && ['music_play', 'music_pause', 'music_skip'].includes(interaction.customId)) {
        // TUO CODICE LAVALINK QUI
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
