const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events, Partials } = require('discord.js');

console.log('[BOOT] Avvio LYX RL Modular Bot...');

if (!process.env.DISCORD_TOKEN) {
    console.error('[FATAL] DISCORD_TOKEN mancante!');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

client.once(Events.ClientReady, c => {
    console.log(`[ONLINE] ${c.user.tag} PRONTO`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

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
            content: "**🎫 Support Ticket System**",
            components: [row]
        }).catch(() => {});
        await message.delete().catch(() => {});
        console.log('[CMD] Pannello ticket creato');
        return;
    }
});

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (!interaction.isButton()) return;
        
        console.log(`[CLICK] ${interaction.user.tag} -> ${interaction.customId}`);

        // ===== SISTEMA TICKET CON 100% GUARD =====
        if (interaction.customId.startsWith('ticket_')) {
            // GUARD 1: Se sei in DM, blocca subito
            if (!interaction.guild) {
                return interaction.reply({ content: '❌ Usa i ticket nel server, non in DM!', flags: 64 }).catch(() => {});
            }

            // GUARD 2: Se la guild non è in cache
            if (!interaction.guild.available) {
                return interaction.reply({ content: '❌ Server non disponibile, riprova.', flags: 64 }).catch(() => {});
            }

            await interaction.deferReply({ flags: 64 });

            // CHIUDI TICKET
            if (interaction.customId === 'ticket_close') {
                await interaction.editReply('Chiudo il ticket...').catch(() => {});
                return interaction.channel?.delete().catch(() => {});
            }

            // CREA TICKET
            const ticketType = interaction.customId.replace('ticket_', '');
            const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

            // GUARD 3: Controlla se esiste già
            const existing = interaction.guild.channels.cache.find(c => c.name === ticketName);
            if (existing) {
                return interaction.editReply(`❌ Hai già un ticket: ${existing}`).catch(() => {});
            }

            const channel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                topic: `Ticket di ${interaction.user.tag} | Tipo: ${ticketType}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                ],
            }).catch(e => { throw e; });

            await interaction.editReply(`✅ Ticket creato: ${channel}`).catch(() => {});
            await channel.send({
                content: `Ciao <@${interaction.user.id}>! Ticket per **${ticketType}**`,
                components: [{
                    type: 1,
                    components: [{ type: 2, style: 4, label: "Chiudi Ticket", custom_id: "ticket_close" }]
                }]
            }).catch(() => {});
            console.log(`[TICKET] Creato ${channel.name}`);
            return;
        }

        // ===== QUI RESTA IL TUO CODICE VECCHIO =====
        // VERIFY, GIVEAWAY, MUSIC ECC... NON TOCCARLO
        // Esempio:
        if (interaction.customId === 'verify_button') {
            // tuo codice verify
            return;
        }

    } catch (error) {
        console.error('[ERRORE GLOBALE INTERACTION]', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ Errore interno.' }).catch(() => {});
        } else {
            await interaction.reply({ content: '❌ Errore interno.', flags: 64 }).catch(() => {});
        }
    }
});

process.on('unhandledRejection', error => console.error('[CRASH]', error));
process.on('uncaughtException', error => console.error('[CRASH]', error));

client.login(process.env.DISCORD_TOKEN);
