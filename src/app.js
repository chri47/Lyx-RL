const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('LYX RL Bot Online'));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

// CONFIG - USA I TUOI ID
const CONFIG = {
    TICKET_CATEGORY: '1330144373757597187', // ID categoria ticket
    STAFF_ROLE: '1356144125999001278', // ID ruolo staff
    WEBSITE_URL: 'https://tuosito.com',
    BANNER_URL: 'https://i.imgur.com/3JQ3L8f.png', // Banner rosso funzionante
    LOGO_URL: 'https://i.imgur.com/6RK7Z1p.png'
};

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} è online!`);
    client.user.setActivity('LYX RL Premium', { type: 3 });
});

// COMANDI SETUP
client.on('messageCreate', async message => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    // 1. SETUP TICKET
    if (message.content === '!setupticket') {
        const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎫 LYX RL Support System')
        .setDescription('**Benvenuto nel supporto ufficiale LYX RL**\n\n> Per aprire un ticket di assistenza clicca il pulsante qui sotto.\n> Seleziona la tua lingua preferita per continuare.\n\n`⚠️` Apri un ticket solo se hai problemi con ordini o prodotti.')
        .setImage(CONFIG.BANNER_URL)
        .setFooter({ text: 'LYX RL • Premium Support', iconURL: CONFIG.LOGO_URL })
        .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('Apri Ticket')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Danger)
        );
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    // 2. SETUP STOCK
    if (message.content === '!setupstock') {
        const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🛒 LYX RL Premium Stock')
        .setDescription('**Seleziona un prodotto per acquistare**\n\n> Tutti i prodotti sono Lifetime Warranty\n> Consegna instantanea dopo il pagamento')
        .addFields(
                { name: '🎵 Spotify Premium', value: '`€3.99` Lifetime | Stock: `∞`', inline: true },
                { name: '🎬 Netflix 4K', value: '`€5.99` Lifetime | Stock: `∞`', inline: true },
                { name: '🏰 Disney+ 4K', value: '`€4.99` Lifetime | Stock: `∞`', inline: true }
            )
        .setImage(CONFIG.BANNER_URL)
        .setFooter({ text: 'LYX RL • Premium Products', iconURL: CONFIG.LOGO_URL });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('buy_product')
            .setLabel('Acquista Ora')
            .setEmoji('🛒')
            .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
            .setLabel('Website')
            .setEmoji('🌐')
            .setStyle(ButtonStyle.Link)
            .setURL(CONFIG.WEBSITE_URL)
        );
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    // 3. SETUP WEBSITE
    if (message.content === '!setupwebsite') {
        const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🌐 LYX RL Official Website')
        .setDescription('**Visita il nostro sito ufficiale per:**\n\n> `🛍️` Catalogo completo prodotti\n> `💳` Pagamenti automatici\n> `📦` Consegna istantanea\n> `🎁` Sconti esclusivi')
        .setImage(CONFIG.BANNER_URL)
        .setFooter({ text: 'LYX RL • Official Store', iconURL: CONFIG.LOGO_URL });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setLabel('Vai al Sito')
            .setEmoji('🌐')
            .setStyle(ButtonStyle.Link)
            .setURL(CONFIG.WEBSITE_URL)
        );
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    // 4. SETUP RULES
    if (message.content === '!setuprules') {
        const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('📜 LYX RL Server Rules')
        .setDescription('**Seleziona una categoria dal menu per leggere le regole**\n\n`⚠️` Rispetta tutte le regole per evitare ban.')
        .setImage(CONFIG.BANNER_URL)
        .setFooter({ text: 'LYX RL • Rules', iconURL: CONFIG.LOGO_URL });

        const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('rules_menu')
        .setPlaceholder('📜 Seleziona categoria regole')
        .addOptions([
                { label: 'Regole Generali', value: 'general', emoji: '📋' },
                { label: 'Regole Chat', value: 'chat', emoji: '💬' },
                { label: 'Regole Ticket', value: 'ticket', emoji: '🎫' },
                { label: 'Termini di Servizio', value: 'tos', emoji: '📑' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    // 5. SETUP STATUS
    if (message.content === '!setupstatus') {
        const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🟢 LYX RL Status')
        .addFields(
                { name: 'Bot Status', value: '`🟢 Online`', inline: true },
                { name: 'Ping', value: `\`${client.ws.ping}ms\``, inline: true },
                { name: 'Uptime', value: '`24/7`', inline: true },
                { name: 'Server', value: '`Railway Cloud`', inline: true }
            )
        .setFooter({ text: 'LYX RL • System Status', iconURL: CONFIG.LOGO_URL })
        .setTimestamp();

        await message.channel.send({ embeds: [embed] });
        await message.delete();
    }
});

// INTERAZIONI - FIX TICKET DEFINITIVO
client.on('interactionCreate', async interaction => {
    try {
        // BOTTONE APRI TICKET
        if (interaction.isButton() && interaction.customId === 'open_ticket') {
            const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_language')
            .setPlaceholder('🌍 Seleziona la tua lingua / Select your language')
            .addOptions([
                    { label: 'Italiano', value: 'it', emoji: '🇮🇹' },
                    { label: 'English', value: 'en', emoji: '🇬🇧' },
                    { label: 'Español', value: 'es', emoji: '🇪🇸' }
                ]);
            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.reply({ content: '**Seleziona la lingua:**', components: [row], ephemeral: true });
        }

        // SCELTA LINGUA - CREA CANALE
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_language') {
            await interaction.deferUpdate();

            const lang = interaction.values[0];
            const cleanUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
            const channelName = `ticket-${cleanUsername}`;

            const existing = interaction.guild.channels.cache.find(c => c.name === channelName);
            if (existing) {
                return interaction.followUp({ content: `❌ Hai già un ticket aperto: ${existing}`, ephemeral: true });
            }

            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: CONFIG.TICKET_CATEGORY,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    { id: CONFIG.STAFF_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] }
                ]
            });

            const messages = {
                it: `Ciao ${interaction.user}, descrivi il tuo problema e uno staffer ti risponderà al più presto.\n\n> Fornisci più dettagli possibili per velocizzare l'assistenza.`,
                en: `Hello ${interaction.user}, describe your issue and staff will reply soon.\n\n> Provide as many details as possible to speed up support.`,
                es: `Hola ${interaction.user}, describe tu problema y el staff responderá pronto.\n\n> Proporciona todos los detalles posibles para acelerar la asistencia.`
            };

            const embedTicket = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🎫 Ticket Aperto')
            .setDescription(messages[lang])
            .setFooter({ text: `User ID: ${interaction.user.id} | LYX RL Support` })
            .setTimestamp();

            const closeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Chiudi Ticket')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Secondary)
            );

            await ticketChannel.send({ content: `${interaction.user} ${interaction.guild.roles.cache.get(CONFIG.STAFF_ROLE)}`, embeds: [embedTicket], components: [closeButton] });
            await interaction.followUp({ content: `✅ Ticket creato: ${ticketChannel}`, ephemeral: true });
        }

        // CHIUDI TICKET
        if (interaction.isButton() && interaction.customId === 'close_ticket') {
            await interaction.reply('🔒 Chiusura ticket in corso...');
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }

        // BOTTONE ACQUISTA
        if (interaction.isButton() && interaction.customId === 'buy_product') {
            await interaction.reply({ content: '**Per acquistare apri un ticket** 🎫\nClicca il pulsante "Apri Ticket" e seleziona la lingua.', ephemeral: true });
        }

        // MENU REGOLE
        if (interaction.isStringSelectMenu() && interaction.customId === 'rules_menu') {
            const rules = {
                general: '**📋 REGOLE GENERALI**\n\n1. Rispetta tutti i membri dello staff e gli utenti\n2. No spam/flood/mass ping\n3. No NSFW o contenuti inappropriati\n4. No pubblicità o self-promo\n5. No discussioni politiche/religiose',
                chat: '**💬 REGOLE CHAT**\n\n1. No bestemmie o linguaggio eccessivo\n2. No flame o tossicità\n3. Usa i canali giusti per ogni argomento\n4. Rispetta lo staff e le decisioni\n5. No spoiler senza tag',
                ticket: '**🎫 REGOLE TICKET**\n\n1. Apri ticket solo per problemi reali con ordini\n2. No spam ticket - 1 ticket alla volta\n3. Sii educato con lo staff\n4. Fornisci prove/screen se richieste\n5. I ticket inattivi vengono chiusi dopo 24h',
                tos: '**📑 TERMINI DI SERVIZIO**\n\n1. Nessun rimborso dopo consegna del prodotto\n2. Garanzia lifetime valida se non cambi password\n3. Ban immediato per chargeback\n4. Non condividere account con altri\n5. Lo staff si riserva il diritto di rifiutare il servizio'
            };
            await interaction.reply({ content: rules[interaction.values[0]], ephemeral: true });
        }
    } catch (error) {
        console.error('Errore interazione:', error);
        if (!interaction.replied &&!interaction.deferred) {
            await interaction.reply({ content: '❌ Errore. Riprova o contatta lo staff.', ephemeral: true }).catch(() => {});
        }
    }
});

// COMANDO SELLS - FIXATO COME VUOI TU
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === 'sells') {
        const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💰 LYX RL SELLS')
        .setDescription('**Cosa vendiamo:**\n\n🎵 **Spotify Premium** Lifetime\n🎬 **Netflix 4K** Lifetime\n🏰 **Disney+ 4K** Lifetime\n📺 **Amazon Prime Video** Lifetime\n\n*e molto altro...*\n\n**Apri un ticket per acquistare** 🎫')
        .setFooter({ text: 'LYX RL • Premium Accounts' })
        .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
