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

// CONFIG - CAMBIA QUESTI ID
const CONFIG = {
    TICKET_CATEGORY: '1530144375575679187', // ID categoria ticket
    STAFF_ROLE: '1530144125599612978', // ID ruolo staff
    WEBSITE_URL: 'https://lyxrlservices.mysellauth.com/', // Tuo link
    BANNER_URL: 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428', // Banner rosso 1024x500
    LOGO_URL: 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428' // Logo tondo per footer
};

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} è online!`);
    client.user.setActivity('LYX RL Premium', { type: 3 });
});

// COMANDI SETUP - SOLO ADMIN
client.on('messageCreate', async message => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    // 1. SETUP TICKET PANEL
    if (message.content === '!setupticket') {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('<:ticket:123> LYX RL Support System')
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

    // 2. SETUP STOCK PANEL
    if (message.content === '!setupstock') {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('<:cart:123> LYX RL Premium Stock')
          .setDescription('**Seleziona un prodotto per acquistare**\n\n> Tutti i prodotti sono Lifetime Warranty\n> Consegna instantanea dopo il pagamento')
          .addFields(
                { name: '<:spotify:> Spotify Premium', value: '`€5` Lifetime | Stock: `∞`', inline: true },
                { name: '<:netflix:> Netflix ', value: '`€3` Lifetime | Stock: `∞`', inline: true },
                { name: '<:disney:> Disney+ ', value: '`€0.70` Lifetime | Stock: `∞`', inline: true }
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

    // 3. SETUP WEBSITE PANEL
    if (message.content === '!setupwebsite') {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('<:link:123> LYX RL Official Website')
          .setDescription('**Visita il nostro sito ufficiale per:**\n\n> `🛍️` Catalogo completo prodotti\n> `💳` Pagamenti automatici\n> `📦` Consegna istantanea\n> `🎁` Sconti esclusivi')
          .setImage(CONFIG.BANNER_URL)
          .setFooter({ text: 'LYX RL • Official Store', iconURL: CONFIG.LOGO_URL });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel('Vai al Sito')
              .setEmoji('🌐')
              .setStyle(ButtonStyle.Link)
              .setURL(CONFIG.WEBSITE_URL),
            new ButtonBuilder()
              .setLabel('Discord')
              .setEmoji('💬')
              .setStyle(ButtonStyle.Link)
              .setURL('https://discord.gg/tuoinvito')
        );
        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    // 4. SETUP RULES CON DROPDOWN
    if (message.content === '!setuprules') {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('<:rules:123> LYX RL Server Rules')
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
          .setTitle('<:online:123> LYX RL Status')
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

// GESTIONE INTERAZIONI
client.on('interactionCreate', async interaction => {
    // TICKET: Bottone Apri Ticket
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

    // TICKET: Scelta lingua
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_language') {
        const lang = interaction.values[0];
        const channelName = `ticket-${interaction.user.username.toLowerCase()}`;

        if (interaction.guild.channels.cache.find(c => c.name === channelName)) {
            return interaction.update({ content: `❌ Hai già un ticket aperto!`, components: [] });
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CONFIG.TICKET_CATEGORY,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: CONFIG.STAFF_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const messages = {
            it: `Ciao ${interaction.user}, descrivi il tuo problema e uno staffer ti risponderà.`,
            en: `Hello ${interaction.user}, describe your issue and staff will reply soon.`,
            es: `Hola ${interaction.user}, describe tu problema y el staff responderá pronto.`
        };

        const embedTicket = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('🎫 Ticket Aperto')
          .setDescription(messages[lang])
          .setFooter({ text: `User ID: ${interaction.user.id}` });

        const closeButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('close_ticket')
              .setLabel('Chiudi Ticket')
              .setEmoji('🔒')
              .setStyle(ButtonStyle.Secondary)
        );

        await ticketChannel.send({ content: `${interaction.user}`, embeds: [embedTicket], components: [closeButton] });
        await interaction.update({ content: `✅ Ticket creato: ${ticketChannel}`, components: [] });
    }

    // CHIUDI TICKET
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 Ticket chiuso tra 5 secondi...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }

    // BOTTONE BUY PRODUCT
    if (interaction.isButton() && interaction.customId === 'buy_product') {
        await interaction.reply({ content: '**Per acquistare apri un ticket** 🎫\nClicca il pulsante ticket e seleziona la lingua.', ephemeral: true });
    }

    // MENU REGOLE
    if (interaction.isStringSelectMenu() && interaction.customId === 'rules_menu') {
        const rules = {
            general: '**📋 REGOLE GENERALI**\n\n1. Rispetta tutti i membri\n2. No spam/flood\n3. No NSFW\n4. No pubblicità',
            chat: '**💬 REGOLE CHAT**\n\n1. No bestemmie\n2. No flame\n3. Usa i canali giusti\n4. Rispetta lo staff',
            ticket: '**🎫 REGOLE TICKET**\n\n1. Apri ticket solo per problemi reali\n2. No spam ticket\n3. Sii educato con lo staff\n4. Fornisci prove se richieste',
            tos: '**📑 TOS**\n\n1. Nessun rimborso dopo consegna\n2. Garanzia lifetime sui prodotti\n3. Ban per chargeback'
        };
        await interaction.reply({ content: rules[interaction.values[0]], ephemeral: true });
    }
});

// AUTO-RISPOSTA "rm sells" COME NEL VIDEO
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content.toLowerCase() === 'rm sells') {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('<:sell:123> LYX RL SELLS')
          .setDescription('**Cosa vendiamo:**\n\n<:spotify:123> Spotify Premium Lifetime\n<:netflix:123> Netflix 4K Lifetime\n<:disney:123> Disney+ 4K Lifetime\n<:prime:123> Amazon Prime Video\n\n**Apri un ticket per acquistare** 🎫')
          .setFooter({ text: 'LYX RL • Premium Accounts' });
        await message.reply({ embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
