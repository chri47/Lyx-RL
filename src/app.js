const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionsBitField, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const express = require('express');
const translate = require('translate'); // NUOVA LIBRERIA

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('LYX RL Bot Online'));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

const CONFIG = {
    TICKET_CATEGORY: '1530144375575679187',
    STAFF_ROLE: '1530144125599612978',
    WEBSITE_URL: 'https://lyxrlservices.mysellauth.com/',
    BANNER_URL: 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428',
    LOGO_URL: 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428'
};

const LANG = {
    it: { welcome: 'Ciao {user}, benvenuto nel supporto LYX RL.\n\n> Seleziona il motivo del ticket dal menu qui sotto.', close: 'Chiudi Ticket', selectReason: '📋 Seleziona il motivo del ticket', reasons: { support: 'Supporto Generale', replace: 'Sostituzione Account', notdelivered: 'Ordine Non Ricevuto', other: 'Altro' }, ticketCreated: '✅ Ticket creato: {channel}', alreadyOpen: '❌ Hai già un ticket aperto: {channel}' },
    en: { welcome: 'Hello {user}, welcome to LYX RL support.\n\n> Select the reason for your ticket from the menu below.', close: 'Close Ticket', selectReason: '📋 Select ticket reason', reasons: { support: 'General Support', replace: 'Account Replacement', notdelivered: 'Order Not Received', other: 'Other' }, ticketCreated: '✅ Ticket created: {channel}', alreadyOpen: '❌ You already have an open ticket: {channel}' },
    es: { welcome: 'Hola {user}, bienvenido al soporte de LYX RL.\n\n> Selecciona el motivo del ticket en el menú de abajo.', close: 'Cerrar Ticket', selectReason: '📋 Selecciona el motivo del ticket', reasons: { support: 'Soporte General', replace: 'Reemplazo de Cuenta', notdelivered: 'Pedido No Recibido', other: 'Otro' }, ticketCreated: '✅ Ticket creado: {channel}', alreadyOpen: '❌ Ya tienes un ticket abierto: {channel}' }
};

const translationCache = new Map();

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} è online!`);
    client.user.setActivity('LYX RL Premium', { type: 3 });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commands = [
        new SlashCommandBuilder().setName('talk').setDescription('Traduci e invia un messaggio').toJSON(),
        new SlashCommandBuilder()
         .setName('clean')
         .setDescription('Elimina tutti i messaggi del canale')
         .addIntegerOption(option =>
                option.setName('quantità')
                  .setDescription('Quanti messaggi eliminare (max 100)')
                  .setRequired(false))
         .toJSON()
    ];

    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ Comandi /talk e /clean registrati!');
    } catch (error) {
        console.error('Errore registrazione comandi:', error);
    }
});

// TUTTI I TUOI!setup rimangono uguali...
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    if (message.content === '!setupticket') {
        const embed = new EmbedBuilder().setColor('#FF0000').setTitle('🎫 LYX RL Support System').setDescription('**Benvenuto nel supporto ufficiale LYX RL**\n\n> Per aprire un ticket di assistenza clicca il pulsante qui sotto.\n> Seleziona la tua lingua preferita per continuare.\n\n`⚠️` Apri un ticket solo se hai problemi con ordini o prodotti.').setImage(CONFIG.BANNER_URL).setFooter({ text: 'LYX RL • Premium Support', iconURL: CONFIG.LOGO_URL });
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('open_ticket').setLabel('Apri Ticket').setEmoji('🎫').setStyle(ButtonStyle.Danger));
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    if (message.content === '!setupstock') {
        const embed = new EmbedBuilder().setColor('#FF0000').setTitle('🛒 LYX RL Premium Stock').setDescription('**Seleziona un prodotto per acquistare**\n\n> Tutti i prodotti sono Lifetime Warranty\n> Consegna instantanea dopo il pagamento').addFields({ name: '🎵 Spotify Premium', value: '`€5` Lifetime | Stock: `∞`', inline: true },{ name: '🎬 Netflix 4K', value: '`€3` Lifetime | Stock: `∞`', inline: true },{ name: '🏰 Disney+ 4K', value: '`€0.70` Lifetime | Stock: `∞`', inline: true }).setImage(CONFIG.BANNER_URL).setFooter({ text: 'LYX RL • Premium Products', iconURL: CONFIG.LOGO_URL });
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('buy_product').setLabel('Acquista Ora').setEmoji('🛒').setStyle(ButtonStyle.Danger), new ButtonBuilder().setLabel('Website').setEmoji('🌐').setStyle(ButtonStyle.Link).setURL(CONFIG.WEBSITE_URL));
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    if (message.content === '!setupwebsite') {
        const embed = new EmbedBuilder().setColor('#FF0000').setTitle('🌐 LYX RL Official Website').setDescription('**Visita il nostro sito ufficiale per:**\n\n> `🛍️` Catalogo completo prodotti\n> `💳` Pagamenti automatici\n> `📦` Consegna istantanea\n> `🎁` Sconti esclusivi').setImage(CONFIG.BANNER_URL).setFooter({ text: 'LYX RL • Official Store', iconURL: CONFIG.LOGO_URL });
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Vai al Sito').setEmoji('🌐').setStyle(ButtonStyle.Link).setURL(CONFIG.WEBSITE_URL));
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    if (message.content === '!setuprules') {
        const embed = new EmbedBuilder().setColor('#FF0000').setTitle('📜 LYX RL Server Rules').setDescription('**Seleziona una categoria dal menu per leggere le regole**\n\n`⚠️` Rispetta tutte le regole per evitare ban.').setImage(CONFIG.BANNER_URL).setFooter({ text: 'LYX RL • Rules', iconURL: CONFIG.LOGO_URL });
        const selectMenu = new StringSelectMenuBuilder().setCustomId('rules_menu').setPlaceholder('📜 Seleziona categoria regole').addOptions([{ label: 'Regole Generali', value: 'general', emoji: '📋' },{ label: 'Regole Chat', value: 'chat', emoji: '💬' },{ label: 'Regole Ticket', value: 'ticket', emoji: '🎫' },{ label: 'Termini di Servizio', value: 'tos', emoji: '📑' }]);
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    if (message.content === '!setupstats') {
        const uptime = Math.floor(client.uptime / 1000);
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const embed = new EmbedBuilder().setColor('#FF0000').setTitle('📊 LYX RL Live Statistics').setDescription('**Statistiche in tempo reale del server LYX RL**').setThumbnail(CONFIG.LOGO_URL).addFields({ name: '🤖 Bot Status', value: '`🟢 Online`', inline: true },{ name: '📡 Ping', value: `\`${client.ws.ping}ms\``, inline: true },{ name: '⏱️ Uptime', value: `\`${days}g ${hours}h ${minutes}m\``, inline: true },{ name: '👥 Membri Totali', value: `\`${message.guild.memberCount}\``, inline: true },{ name: '💬 Canali', value: `\`${message.guild.channels.cache.size}\``, inline: true },{ name: '🎭 Ruoli', value: `\`${message.guild.roles.cache.size}\``, inline: true },{ name: '🖥️ Server', value: '`Railway Cloud`', inline: true },{ name: '📅 Creazione Server', value: `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:R>`, inline: true },{ name: '⚡ Node.js', value: `\`${process.version}\``, inline: true }).setImage(CONFIG.BANNER_URL).setFooter({ text: 'LYX RL • Auto-Update ogni comando', iconURL: CONFIG.LOGO_URL }).setTimestamp();
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('refresh_stats').setLabel('Aggiorna Stats').setEmoji('🔄').setStyle(ButtonStyle.Danger), new ButtonBuilder().setLabel('Website').setEmoji('🌐').setStyle(ButtonStyle.Link).setURL(CONFIG.WEBSITE_URL));
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    if (message.content.toLowerCase() === 'sells') {
        const embed = new EmbedBuilder().setColor('#FF0000').setTitle('💰 LYX RL SELLS').setDescription('**Cosa vendiamo:**\n\n🎵 **Spotify Premium** Lifetime\n🎬 **Netflix 4K** Lifetime\n🏰 **Disney+ 4K** Lifetime\n📺 **Amazon Prime Video** Lifetime\n\n*e molto altro...*\n\n**Apri un ticket per acquistare** 🎫').setFooter({ text: 'LYX RL • Premium Accounts' }).setTimestamp();
        await message.reply({ embeds: [embed] });
    }
});

client.on('interactionCreate', async interaction => {
    try {
        // /talk - STEP 1
        if (interaction.isChatInputCommand() && interaction.commandName === 'talk') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: '❌ Non hai i permessi', ephemeral: true });
            }
            const selectMenu = new StringSelectMenuBuilder().setCustomId('talk_from_lang').setPlaceholder('🌍 Scegli la lingua del tuo messaggio').addOptions([{ label: 'Italiano', value: 'it', emoji: '🇮🇹' },{ label: 'English', value: 'en', emoji: '🇬🇧' },{ label: 'Español', value: 'es', emoji: '🇪🇸' },{ label: 'Français', value: 'fr', emoji: '🇫🇷' },{ label: 'Deutsch', value: 'de', emoji: '🇩🇪' }]);
            await interaction.reply({ content: '**Step 1/3:** In che lingua scriverai il messaggio?', components: [new ActionRowBuilder().addComponents(selectMenu)], ephemeral: true });
        }

        // /clean - NUOVO COMANDO
        if (interaction.isChatInputCommand() && interaction.commandName === 'clean') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: '❌ Non hai i permessi per eliminare messaggi', ephemeral: true });
            }
            const amount = interaction.options.getInteger('quantità') || 100;
            await interaction.deferReply({ ephemeral: true });

            try {
                const messages = await interaction.channel.bulkDelete(amount, true);
                await interaction.editReply({ content: `✅ Eliminati ${messages.size} messaggi!` });
            } catch (error) {
                await interaction.editReply({ content: '❌ Non posso eliminare messaggi più vecchi di 14 giorni o ho avuto un errore.' });
            }
        }

        // /talk - STEP 2
        if (interaction.isStringSelectMenu() && interaction.customId === 'talk_from_lang') {
            const fromLang = interaction.values[0];
            translationCache.set(interaction.user.id, { from: fromLang });
            const selectMenu = new StringSelectMenuBuilder().setCustomId('talk_to_lang').setPlaceholder('🌍 Scegli in che lingua tradurre').addOptions([{ label: 'Italiano', value: 'it', emoji: '🇮🇹' },{ label: 'English', value: 'en', emoji: '🇬🇧' },{ label: 'Español', value: 'es', emoji: '🇪🇸' },{ label: 'Français', value: 'fr', emoji: '🇫🇷' },{ label: 'Deutsch', value: 'de', emoji: '🇩🇪' }]);
            await interaction.update({ content: `**Step 2/3:** Lingua di partenza: \`${fromLang}\`\nIn che lingua vuoi tradurre?`, components: [new ActionRowBuilder().addComponents(selectMenu)] });
        }

        // /talk - STEP 3
        if (interaction.isStringSelectMenu() && interaction.customId === 'talk_to_lang') {
            const toLang = interaction.values[0];
            const cache = translationCache.get(interaction.user.id);
            cache.to = toLang;
            translationCache.set(interaction.user.id, cache);
            const modal = new ModalBuilder().setCustomId('talk_modal').setTitle('Scrivi il messaggio da tradurre');
            const messageInput = new TextInputBuilder().setCustomId('message_input').setLabel('Messaggio').setStyle(TextInputStyle.Paragraph).setPlaceholder('Scrivi qui...').setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
            await interaction.showModal(modal);
        }

        // /talk - STEP 4 TRADUCI
        if (interaction.isModalSubmit() && interaction.customId === 'talk_modal') {
            await interaction.deferReply({ ephemeral: true });
            const cache = translationCache.get(interaction.user.id);
            const message = interaction.fields.getTextInputValue('message_input');
            try {
                const res = await translate(message, { from: cache.from, to: cache.to });
                await interaction.channel.send(`**${interaction.user.displayName}:** ${res}`);
                await interaction.editReply({ content: `✅ Inviato! \`${cache.from} → ${cache.to}\`` });
                translationCache.delete(interaction.user.id);
            } catch (error) {
                console.error('Errore traduzione:', error);
                await interaction.editReply({ content: '❌ Errore traduzione. Riprova con un messaggio diverso.' });
            }
        }

        // TUTTO IL RESTO UGUALE...
        if (interaction.isButton() && interaction.customId === 'refresh_stats') {
            await interaction.deferUpdate();
            const uptime = Math.floor(client.uptime / 1000);
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor(uptime / 3600) % 24;
            const minutes = Math.floor(uptime / 60) % 60;
            const embed = new EmbedBuilder().setColor('#FF0000').setTitle('📊 LYX RL Live Statistics').setDescription('**Statistiche in tempo reale del server LYX RL**').setThumbnail(CONFIG.LOGO_URL).addFields({ name: '🤖 Bot Status', value: '`🟢 Online`', inline: true },{ name: '📡 Ping', value: `\`${client.ws.ping}ms\``, inline: true },{ name: '⏱️ Uptime', value: `\`${days}g ${hours}h ${minutes}m\``, inline: true },{ name: '👥 Membri Totali', value: `\`${interaction.guild.memberCount}\``, inline: true },{ name: '💬 Canali', value: `\`${interaction.guild.channels.cache.size}\``, inline: true },{ name: '🎭 Ruoli', value: `\`${interaction.guild.roles.cache.size}\``, inline: true },{ name: '🖥️ Server', value: '`Railway Cloud`', inline: true },{ name: '📅 Creazione Server', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:R>`, inline: true },{ name: '⚡ Node.js', value: `\`${process.version}\``, inline: true }).setImage(CONFIG.BANNER_URL).setFooter({ text: `Ultimo aggiornamento`, iconURL: CONFIG.LOGO_URL }).setTimestamp();
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('refresh_stats').setLabel('Aggiorna Stats').setEmoji('🔄').setStyle(ButtonStyle.Danger), new ButtonBuilder().setLabel('Website').setEmoji('🌐').setStyle(ButtonStyle.Link).setURL(CONFIG.WEBSITE_URL));
            await interaction.editReply({ embeds: [embed], components: [row] });
        }

        if (interaction.isButton() && interaction.customId === 'open_ticket') {
            const selectMenu = new StringSelectMenuBuilder().setCustomId('select_language').setPlaceholder('🌍 Select your language / Seleziona la lingua').addOptions([{ label: 'Italiano', value: 'it', emoji: '🇮🇹', description: 'Continua in Italiano' },{ label: 'English', value: 'en', emoji: '🇬🇧', description: 'Continue in English' },{ label: 'Español', value: 'es', emoji: '🇪🇸', description: 'Continuar en Español' }]);
            await interaction.reply({ content: '**Seleziona la lingua del ticket:**', components: [new ActionRowBuilder().addComponents(selectMenu)], ephemeral: true });
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'select_language') {
            await interaction.deferUpdate();
            const lang = interaction.values[0];
            const t = LANG[lang];
            const cleanUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
            const channelName = `ticket-${cleanUsername}`;
            const existing = interaction.guild.channels.cache.find(c => c.name === channelName);
            if (existing) {
                return interaction.followUp({ content: t.alreadyOpen.replace('{channel}', existing), ephemeral: true });
            }
            const ticketChannel = await interaction.guild.channels.create({ name: channelName, type: ChannelType.GuildText, parent: CONFIG.TICKET_CATEGORY, permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },{ id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },{ id: CONFIG.STAFF_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] }] });
            const embedTicket = new EmbedBuilder().setColor('#FF0000').setTitle(`🎫 LYX RL Support - ${lang.toUpperCase()}`).setDescription(t.welcome.replace('{user}', interaction.user)).setFooter({ text: `User ID: ${interaction.user.id}` }).setTimestamp();
            const reasonMenu = new StringSelectMenuBuilder().setCustomId(`ticket_reason_${lang}`).setPlaceholder(t.selectReason).addOptions([{ label: t.reasons.support, value: 'support', emoji: '🆘' },{ label: t.reasons.replace, value: 'replace', emoji: '🔄' },{ label: t.reasons.notdelivered, value: 'notdelivered', emoji: '📦' },{ label: t.reasons.other, value: 'other', emoji: '❓' }]);
            const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel(t.close).setEmoji('🔒').setStyle(ButtonStyle.Secondary);
            await ticketChannel.send({ content: `${interaction.user} ${interaction.guild.roles.cache.get(CONFIG.STAFF_ROLE)}`, embeds: [embedTicket], components: [new ActionRowBuilder().addComponents(reasonMenu), new ActionRowBuilder().addComponents(closeButton)] });
            await interaction.followUp({ content: t.ticketCreated.replace('{channel}', ticketChannel), ephemeral: true });
        }

        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket_reason_')) {
            const lang = interaction.customId.split('_')[2];
            const reason = interaction.values[0];
            const t = LANG[lang];
            const reasonText = { support: t.reasons.support, replace: t.reasons.replace, notdelivered: t.reasons.notdelivered, other: t.reasons.other };
            await interaction.reply({ content: `✅ **Motivo selezionato:** ${reasonText[reason]}\n\n> Lo staff ti risponderà al più presto. Descrivi il tuo problema qui sotto.`, ephemeral: false });
        }

        if (interaction.isButton() && interaction.customId === 'close_ticket') {
            await interaction.reply('🔒 Chiusura ticket in corso...');
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }

        if (interaction.isButton() && interaction.customId === 'buy_product') {
            await interaction.reply({ content: '**Per acquistare apri un ticket** 🎫', ephemeral: true });
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'rules_menu') {
            const rules = { general: '**📋 REGOLE GENERALI**\n\n1. Rispetta tutti i membri dello staff e gli utenti\n2. No spam/flood/mass ping\n3. No NSFW o contenuti inappropriati\n4. No pubblicità o self-promo\n5. No discussioni politiche/religiose', chat: '**💬 REGOLE CHAT**\n\n1. No bestemmie o linguaggio eccessivo\n2. No flame o tossicità\n3. Usa i canali giusti per ogni argomento\n4. Rispetta lo staff e le decisioni\n5. No spoiler senza tag', ticket: '**🎫 REGOLE TICKET**\n\n1. Apri ticket solo per problemi reali con ordini\n2. No spam ticket - 1 ticket alla volta\n3. Sii educato con lo staff\n4. Fornisci prove/screen se richieste\n5. I ticket inattivi vengono chiusi dopo 24h', tos: '**📑 TERMINI DI SERVIZIO**\n\n1. Nessun rimborso dopo consegna del prodotto\n2. Garanzia lifetime valida se non cambi password\n3. Ban immediato per chargeback\n4. Non condividere account con altri\n5. Lo staff si riserva il diritto di rifiutare il servizio' };
            await interaction.reply({ content: rules[interaction.values[0]], ephemeral: true });
        }

    } catch (error) {
        console.error('Errore:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
