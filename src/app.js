const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, PermissionsBitField, ChannelType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

// --- CONFIG LYX RL LUXURY RED ---
const VERIFIED_ROLE_ID = '1530144188333817897';
const STAFF_ROLE_ID = '1530144125599612978';
const WELCOME_CHANNEL_NAME = 'welcome';
const VOUCHES_CHANNEL_NAME = ':mag:・vouches';
const LOGS_CHANNEL_NAME = 'logslyx';
const RULES_CHANNEL_NAME = ':loudspeaker:・rules';
const LTC_ADDRESS = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35';
const WEBSITE_URL = 'https://lyxrlservices.mysellauth.com/';
const BANNER_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428'; // Banner rosso LYX
const LOGO_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428';
const LYX_RED = '#FF0000';
const LYX_DARK = '#0a0a0a';
const GOLD = '#FFD700';
// --------------

// TRADUZIONI COMPLETE - 5 LINGUE
const LANGS = {
    it: {
        name: 'Italiano', flag: '🇮🇹',
        select_category: '🎫 Seleziona il tipo di problema',
        categories: {
            support: { label: 'Supporto Generale', desc: 'Domande generali sui prodotti', emoji: '💬' },
            order: { label: 'Problema Ordine', desc: 'Ordine non ricevuto o problemi', emoji: '📦' },
            not_delivered: { label: 'Non Ricevuto', desc: 'Acquisto non consegnato', emoji: '❌' },
            refund: { label: 'Rimborso', desc: 'Richiesta di rimborso', emoji: '💰' }
        },
        ticket_title: '🎫 TICKET LYX RL PREMIUM',
        welcome: 'Benvenuto', category: 'Categoria', language: 'Lingua',
        describe: 'Descrivi il tuo problema in dettaglio', attach: 'Allega screenshot se necessario',
        response_time: 'Risposta media: <5 minuti', staff_reply: 'Lo staff ti risponderà a breve',
        close_ticket: 'CHIUDI TICKET', send_ltc: 'INVIA WALLET LTC'
    },
    en: {
        name: 'English', flag: '🇬🇧',
        select_category: '🎫 Select issue type',
        categories: {
            support: { label: 'General Support', desc: 'General product questions', emoji: '💬' },
            order: { label: 'Order Issue', desc: 'Order not received or problems', emoji: '📦' },
            not_delivered: { label: 'Not Delivered', desc: 'Purchase not delivered', emoji: '❌' },
            refund: { label: 'Refund', desc: 'Refund request', emoji: '💰' }
        },
        ticket_title: '🎫 LYX RL PREMIUM TICKET',
        welcome: 'Welcome', category: 'Category', language: 'Language',
        describe: 'Describe your issue in detail', attach: 'Attach screenshots if needed',
        response_time: 'Average response: <5 minutes', staff_reply: 'Staff will reply shortly',
        close_ticket: 'CLOSE TICKET', send_ltc: 'SEND LTC WALLET'
    },
    fr: {
        name: 'Français', flag: '🇫🇷',
        select_category: '🎫 Sélectionnez le type de problème',
        categories: {
            support: { label: 'Support Général', desc: 'Questions générales sur les produits', emoji: '💬' },
            order: { label: 'Problème de Commande', desc: 'Commande non reçue ou problèmes', emoji: '📦' },
            not_delivered: { label: 'Non Livré', desc: 'Achat non livré', emoji: '❌' },
            refund: { label: 'Remboursement', desc: 'Demande de remboursement', emoji: '💰' }
        },
        ticket_title: '🎫 TICKET LYX RL PREMIUM',
        welcome: 'Bienvenue', category: 'Catégorie', language: 'Langue',
        describe: 'Décrivez votre problème en détail', attach: 'Joignez des captures si nécessaire',
        response_time: 'Réponse moyenne: <5 minutes', staff_reply: 'Le staff vous répondra bientôt',
        close_ticket: 'FERMER TICKET', send_ltc: 'ENVOYER WALLET LTC'
    },
    pt: {
        name: 'Português', flag: '🇵🇹',
        select_category: '🎫 Selecione o tipo de problema',
        categories: {
            support: { label: 'Suporte Geral', desc: 'Perguntas gerais sobre produtos', emoji: '💬' },
            order: { label: 'Problema de Pedido', desc: 'Pedido não recebido ou problemas', emoji: '📦' },
            not_delivered: { label: 'Não Entregue', desc: 'Compra não entregue', emoji: '❌' },
            refund: { label: 'Reembolso', desc: 'Pedido de reembolso', emoji: '💰' }
        },
        ticket_title: '🎫 TICKET LYX RL PREMIUM',
        welcome: 'Bem-vindo', category: 'Categoria', language: 'Idioma',
        describe: 'Descreva seu problema em detalhes', attach: 'Anexe capturas se necessário',
        response_time: 'Resposta média: <5 minutos', staff_reply: 'A equipe responderá em breve',
        close_ticket: 'FECHAR TICKET', send_ltc: 'ENVIAR WALLET LTC'
    },
    de: {
        name: 'Deutsch', flag: '🇩🇪',
        select_category: '🎫 Wählen Sie den Problemtyp',
        categories: {
            support: { label: 'Allgemeiner Support', desc: 'Allgemeine Produktfragen', emoji: '💬' },
            order: { label: 'Bestellproblem', desc: 'Bestellung nicht erhalten oder Probleme', emoji: '📦' },
            not_delivered: { label: 'Nicht Geliefert', desc: 'Kauf nicht geliefert', emoji: '❌' },
            refund: { label: 'Rückerstattung', desc: 'Rückerstattungsanfrage', emoji: '💰' }
        },
        ticket_title: '🎫 LYX RL PREMIUM TICKET',
        welcome: 'Willkommen', category: 'Kategorie', language: 'Sprache',
        describe: 'Beschreiben Sie Ihr Problem im Detail', attach: 'Fügen Sie Screenshots bei, falls nötig',
        response_time: 'Durchschnittliche Antwort: <5 Minuten', staff_reply: 'Das Team wird in Kürze antworten',
        close_ticket: 'TICKET SCHLIESSEN', send_ltc: 'LTC WALLET SENDEN'
    }
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

client.once('ready', () => {
    console.log(`✅ LYX RL LUXURY RED Bot online come ${client.user.tag}`);
    client.user.setActivity('LYX RL Premium', { type: 3 });
});

// --- WELCOME LUXURY RED CON FONT FIGO ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === WELCOME_CHANNEL_NAME);
    if (!channel) return;

    try {
        const canvas = createCanvas(1920, 1080);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = LYX_DARK;
        ctx.fillRect(0, 0, 1920, 1080);

        // Pattern luxury
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 3;
        for (let i = 0; i < 1920; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 1080, 1080);
            ctx.stroke();
        }

        try {
            const banner = await loadImage(BANNER_URL);
            ctx.globalAlpha = 0.6;
            ctx.drawImage(banner, 0, 0, 1920, 1080);
            ctx.globalAlpha = 1;
        } catch {}

        ctx.strokeStyle = LYX_RED;
        ctx.lineWidth = 25;
        ctx.strokeRect(60, 60, 1800, 960);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 8;
        ctx.strokeRect(95, 95, 1730, 890);

        try {
            const logo = await loadImage(LOGO_URL);
            ctx.drawImage(logo, 710, 100, 500, 500);
        } catch {}

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(960, 700, 220, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 740, 480, 440, 440);
        ctx.restore();

        ctx.strokeStyle = LYX_RED;
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(960, 700, 228, 0, Math.PI * 2, true);
        ctx.stroke();

        // FONT LUXURY - BEBAS NEUE / ANTON STYLE
        ctx.font = 'bold 130px "Bebas Neue", Impact, "Arial Black", sans-serif';
        ctx.fillStyle = LYX_RED;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 50;
        ctx.fillText('WELCOME TO LYX RL', 960, 1000);

        ctx.font = 'bold 90px "Bebas Neue", Impact, "Arial Black", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 30;
        ctx.fillText(member.user.username.toUpperCase(), 960, 1080);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-luxury.png' });

        const embed = new EmbedBuilder()
.setTitle('🔥 BENVENUTO SU LYX RL')
.setDescription(`**${member}** è entrato nel server\n\n⚡ **Verificati** per accesso completo\n💎 **Premium Services** 24/7`)
.setImage('attachment://welcome-luxury.png')
.setColor(LYX_RED)
.setFooter({ text: 'LYX RL • Premium Services', iconURL: LOGO_URL })
.setTimestamp();

        await channel.send({ content: `${member}`, embeds: [embed], files: [attachment] });

    } catch (error) {
        console.error('Errore welcome:', error);
    }
});

// --- COMANDI ---
client.on('messageCreate', async message => {
    if (message.author.bot ||!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        if (command === 'ping') {
            const embed = new EmbedBuilder()
.setTitle('🏓 LYX RL STATUS')
.setDescription(`**Online** • Latency: \`${client.ws.ping}ms\`\n**Uptime**: 24/7 Premium`)
.setColor(LYX_RED)
.setThumbnail(LOGO_URL);
            return message.reply({ embeds: [embed] });
        }

        if (command === 'testwelcome' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            client.emit('guildMemberAdd', message.member);
            return message.reply('✅ Test welcome luxury inviato');
        }

        if (command === 'ltc') {
            const embed = new EmbedBuilder()
.setTitle('💎 LYX RL • LTC ADDRESS')
.setDescription(`**Indirizzo Ufficiale**\n\`\`\`${LTC_ADDRESS}\`\`\`\n⚠️ **Invia solo LTC**`)
.setColor('#345D9D')
.setThumbnail(LOGO_URL)
.setFooter({ text: 'LYX RL • Secure Payments', iconURL: LOGO_URL });
            return message.reply({ embeds: [embed] });
        }

        // SETUP RULES - FONT FIGO
        if (command === 'setuprules' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
.setTitle('📜 LYX RL • SERVER RULES')
.setDescription('**Regolamento Ufficiale LYX RL**\n\n🔴 **1. Rispetto** - No insulti, razzismo, doxxing\n🔴 **2. No Spam** - No flood, no pubblicità non autorizzata\n🔴 **3. No Scam** - Ban immediato per truffe\n🔴 **4. Ticket Only** - Supporto solo via ticket\n🔴 **5. Pagamenti** - Solo metodi ufficiali LTC/PayPal\n\n⚠️ **La violazione comporta ban permanente senza avviso**')
.setImage(BANNER_URL)
.setColor(LYX_RED)
.setFooter({ text: 'LYX RL • Rules', iconURL: LOGO_URL });

            const select = new StringSelectMenuBuilder()
.setCustomId('rules_category')
.setPlaceholder('📋 Seleziona categoria regole')
.addOptions(
                new StringSelectMenuOptionBuilder()
.setLabel('Regole Generali')
.setDescription('Regole base del server')
.setValue('general')
.setEmoji('📜'),
                new StringSelectMenuOptionBuilder()
.setLabel('Regole Chat')
.setDescription('Comportamento in chat')
.setValue('chat')
.setEmoji('💬'),
                new StringSelectMenuOptionBuilder()
.setLabel('Termini di Servizio')
.setDescription('Regole acquisti e pagamenti')
.setValue('tos')
.setEmoji('🛒')
            );

            const row = new ActionRowBuilder().addComponents(select);
            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // SETUP TICKET LUXURY CON 5 LINGUE
        if (command === 'setupticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
.setTitle('`🎫 SUPPORTO PREMIUM LYX RL`')
.setDescription('*Apri un ticket privato e il nostro staff ti risponderà entro 5 minuti.*\n\n🇮🇹 `Italiano` - Supporto 24/7\n🇬🇧 `English` - 24/7 Support\n🇫🇷 `Français` - Support 24/7\n🇵🇹 `Português` - Suporte 24/7\n🇩🇪 `Deutsch` - 24/7 Support\n\n⚡ ||Tempo medio risposta: 45 sec||\n💎 ||Supporto prioritario per verificati||')
.setImage(BANNER_URL)
.setColor(LYX_RED)
.setFooter({ text: 'LYX RL • Premium Support 24/7', iconURL: LOGO_URL });

            const select = new StringSelectMenuBuilder()
.setCustomId('ticket_panel')
.setPlaceholder('🌍 Seleziona lingua / Select language / Sélectionner langue')
.addOptions(
                new StringSelectMenuOptionBuilder()
.setLabel('Italiano')
.setDescription('Supporto in Italiano 24/7')
.setValue('it')
.setEmoji('🇮🇹'),
                new StringSelectMenuOptionBuilder()
.setLabel('English')
.setDescription('24/7 English Support')
.setValue('en')
.setEmoji('🇬🇧'),
                new StringSelectMenuOptionBuilder()
.setLabel('Français')
.setDescription('Support Français 24/7')
.setValue('fr')
.setEmoji('🇫🇷'),
                new StringSelectMenuOptionBuilder()
.setLabel('Português')
.setDescription('Suporte Português 24/7')
.setValue('pt')
.setEmoji('🇵🇹'),
                new StringSelectMenuOptionBuilder()
.setLabel('Deutsch')
.setDescription('24/7 Deutscher Support')
.setValue('de')
.setEmoji('🇩🇪')
            );

            const row = new ActionRowBuilder().addComponents(select);
            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // VERIFY SEMPLICE - SOLO BOTTONE, NO MODAL
        if (command === 'setupverify' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
.setTitle('🔐 VERIFICA LYX RL')
.setDescription('**Sistema di Verifica Ufficiale**\n\nClicca il pulsante qui sotto per verificarti e accedere a tutti i canali.\n\n✨ **Vantaggi Membri Verificati:**\n• Accesso completo a tutti i canali\n• Ticket di supporto prioritari\n• Offerte e sconti esclusivi\n• Ruolo Verified permanente')
.setImage(BANNER_URL)
.setColor(LYX_RED)
.setFooter({ text: 'LYX RL Verification System', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_simple').setLabel('VERIFICA').setStyle(ButtonStyle.Danger).setEmoji('🔐')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setuprecensione' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
.setTitle('⭐ FEEDBACK CLIENTI LYX RL')
.setDescription('**La tua opinione conta**\n\nHai acquistato? Lascia una recensione pubblica.\n\n💎 **Ogni recensione = codice sconto**')
.setImage(BANNER_URL)
.setColor(GOLD)
.setFooter({ text: 'LYX RL • Customer Reviews', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('review_button').setLabel('LASCIA RECENSIONE').setStyle(ButtonStyle.Primary).setEmoji('⭐')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setupstats' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const online = message.guild.members.cache.filter(m => m.presence?.status === 'online').size;
            const embed = new EmbedBuilder()
.setTitle('📊 LYX RL LIVE STATS')
.setDescription('**Statistiche in tempo reale**')
.addFields(
                { name: '👥 Membri', value: `\`\`${message.guild.memberCount}\`\`\``, inline: true },
                { name: '🟢 Online', value: `\`\`\`${online}\`\`\``, inline: true },
                { name: '💎 Boost', value: `\`\`\`Level ${message.guild.premiumTier}\`\`\``, inline: true },
                { name: '⚡ Ping', value: `\`\`\`${client.ws.ping}ms\`\`\``, inline: true }
            )
.setThumbnail(LOGO_URL)
.setImage(BANNER_URL)
.setColor(LYX_RED)
.setTimestamp();
            await message.channel.send({ embeds: [embed] });
            return message.delete();
        }

        if (command === 'setupwebsite' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
.setTitle('🌐 LYX RL OFFICIAL STORE')
.setDescription('**Sito Ufficiale**\n\n🛒 Catalogo completo\n💰 Prezzi aggiornati\n📦 Consegna istantanea\n🔒 Pagamenti sicuri')
.setImage(BANNER_URL)
.setColor('#5865F2')
.setFooter({ text: 'LYX RL • Official Store', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('VAI AL SITO').setStyle(ButtonStyle.Link).setURL(WEBSITE_URL).setEmoji('🌐')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // SETUP STOCK - FIXATO
        if (command === 'setupstock' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
.setTitle('`📦 LYX RL PREMIUM STOCK`')
.setDescription('*Prodotti Disponibili Ora. Ma molti altri prodotti sul sito*\n\n🎮 `Spotify Premium` - €5 Lifetime | Stock: 0\n📺 `Netflix ` - €3.00 Lifetime | Stock: 50\n🎬 `Disney+` - €3.00 Lifetime | Stock: 1500\n🎥 `YOUTUBE LIFETIME` - €3,50 Lifetime | Stock: 70\n\n✅ `Consegna Istantanea`\n🔒 `Garanzia Lifetime`\n💳 `Pagamenti: LTC/PayPal`')
.setImage(BANNER_URL)
.setColor(LYX_RED)
.setFooter({ text: '*LYX RL • Premium Stock*', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('ACQUISTA ORA').setStyle(ButtonStyle.Link).setURL(WEBSITE_URL).setEmoji('🛒')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

    } catch (error) {
        console.error(`Errore ${command}:`, error);
    }
});

// --- INTERAZIONI LUXURY ---
client.on('interactionCreate', async interaction => {
    try {
        // MENU TICKET - PRIMA SCELTA LINGUA
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_panel') {
            const lang = interaction.values[0];
            const langData = LANGS[lang];

            const categorySelect = new StringSelectMenuBuilder()
.setCustomId(`ticket_category_${lang}`)
.setPlaceholder(langData.select_category)
.addOptions(
                new StringSelectMenuOptionBuilder()
.setLabel(langData.categories.support.label)
.setDescription(langData.categories.support.desc)
.setValue('support')
.setEmoji('💬'),
                new StringSelectMenuOptionBuilder()
.setLabel(langData.categories.order.label)
.setDescription(langData.categories.order.desc)
.setValue('order')
.setEmoji('📦'),
                new StringSelectMenuOptionBuilder()
.setLabel(langData.categories.not_delivered.label)
.setDescription(langData.categories.not_delivered.desc)
.setValue('not_delivered')
.setEmoji('❌'),
                new StringSelectMenuOptionBuilder()
.setLabel(langData.categories.refund.label)
.setDescription(langData.categories.refund.desc)
.setValue('refund')
.setEmoji('💰')
            );

            const row = new ActionRowBuilder().addComponents(categorySelect);

            const embed = new EmbedBuilder()
.setTitle(langData.select_category)
.setDescription(`**${langData.name}** ${langData.flag}`)
.setColor(LYX_RED);

            return await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        // MENU TICKET - SECONDA SCELTA CATEGORIA + CREA TICKET
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket_category_')) {
            await interaction.deferReply({ ephemeral: true });
            const lang = interaction.customId.split('_')[2];
            const category = interaction.values[0];
            const langData = LANGS[lang];

            const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);
            const existing = interaction.guild.channels.cache.find(ch => ch.name === ticketName);
            if (existing) return interaction.editReply({ content: `❌ **${lang === 'it'? 'Hai già un ticket aperto!' : lang === 'en'? 'You already have an open ticket!' : lang === 'fr'? 'Vous avez déjà un ticket ouvert!' : lang === 'pt'? 'Você já tem um ticket aberto!' : 'Du hast bereits ein offenes Ticket!'}` });

            const channel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                topic: `Ticket LYX RL | User: ${interaction.user.tag} | Lang: ${lang.toUpperCase()} | Cat: ${category}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory] },
                    { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageChannels] }
                ]
            });

            const ticketEmbed = new EmbedBuilder()
.setTitle(langData.ticket_title)
.setDescription(`**${langData.welcome} ${interaction.user}** 👋\n\n**${langData.category}:** ${langData.categories[category].label}\n**${langData.language}:** ${langData.name} ${langData.flag}\n\n📝 **${langData.describe}**\n🖼️ **${langData.attach}**\n⏱️ **${langData.response_time}**\n\n*${langData.staff_reply}*`)
.setColor(LYX_RED)
.setThumbnail(LOGO_URL)
.setFooter({ text: 'LYX RL • Premium Support 24/7', iconURL: LOGO_URL })
.setTimestamp();

            const buttonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel(langData.close_ticket).setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                new ButtonBuilder().setCustomId(`send_ltc_${lang}`).setLabel(langData.send_ltc).setStyle(ButtonStyle.Primary).setEmoji('💎')
            );

            await channel.send({ content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, embeds: [ticketEmbed], components: [buttonRow] });
            return interaction.editReply({ content: `✅ **Ticket creato!**\n${channel}` });
        }

        // BOTTONI
        if (interaction.isButton()) {
            // VERIFY SEMPLICE - DA RUOLO SUBITO, NO MODAL
            if (interaction.customId === 'verify_simple') {
                await interaction.deferReply({ ephemeral: true });
                const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
                if (!role) return interaction.editReply({ content: '❌ **Errore:** Ruolo non trovato!' });

                if (interaction.member.roles.cache.has(VERIFIED_ROLE_ID)) {
                    return interaction.editReply({ content: '✅ **Sei già verificato!**' });
                }

                await interaction.member.roles.add(role);

                const logs = interaction.guild.channels.cache.find(ch => ch.name === LOGS_CHANNEL_NAME);
                if (logs) {
                    const logEmbed = new EmbedBuilder()
.setTitle('✅ NUOVA VERIFICA')
.setDescription(`**Utente:** ${interaction.user.tag}\n**ID:** ${interaction.user.id}`)
.setColor('#00ff00')
.setThumbnail(interaction.user.displayAvatarURL())
.setTimestamp();
                    logs.send({ embeds: [logEmbed] });
                }

                const successEmbed = new EmbedBuilder()
.setTitle('✅ VERIFICATO')
.setDescription(`**Benvenuto ${interaction.user.username}!**\n\n💎 **Status:** Verificato\n🚀 **Accesso:** Completo\n\n*Goditi LYX RL!*`)
.setColor(LYX_RED)
.setThumbnail(LOGO_URL);

                return interaction.editReply({ embeds: [successEmbed] });
            }

            // BOTTONE LTC DENTRO TICKET
            if (interaction.customId.startsWith('send_ltc_')) {
                const embed = new EmbedBuilder()
.setTitle('💎 LYX RL • LTC WALLET')
.setDescription(`**Indirizzo Ufficiale per Pagamenti**\n\`\`\`${LTC_ADDRESS}\`\`\`\n⚠️ **Invia solo LTC** - Altri token verranno persi\n\n📸 **Dopo il pagamento, invia screenshot della transazione**`)
.setColor('#345D9D')
.setThumbnail(LOGO_URL)
.setFooter({ text: 'LYX RL • Secure Payments', iconURL: LOGO_URL });

                return await interaction.reply({ embeds: [embed], ephemeral: false });
            }

            if (interaction.customId === 'review_button') {
                const modal = new ModalBuilder().setCustomId('review_modal').setTitle('Recensione LYX RL');
                const starsInput = new TextInputBuilder().setCustomId('stars_input').setLabel('VALUTAZIONE (1-5)').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('5').setMaxLength(1);
                const textInput = new TextInputBuilder().setCustomId('text_input').setLabel('LA TUA RECENSIONE').setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder('Servizio perfetto...').setMaxLength(1000);
                const linkInput = new TextInputBuilder().setCustomId('link_input').setLabel('SCREENSHOT (Opzionale)').setStyle(TextInputStyle.Short).setRequired(false);
                modal.addComponents(
                    new ActionRowBuilder().addComponents(starsInput),
                    new ActionRowBuilder().addComponents(textInput),
                    new ActionRowBuilder().addComponents(linkInput)
                );
                return await interaction.showModal(modal);
            }

            if (interaction.customId === 'close_ticket') {
                await interaction.reply({ content: '🔒 **Ticket in chiusura...**\nIl canale verrà eliminato tra 5 secondi' });
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }

        // MODAL
        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ ephemeral: true });

            if (interaction.customId === 'review_modal') {
                const stars = parseInt(interaction.fields.getTextInputValue('stars_input'));
                const text = interaction.fields.getTextInputValue('text_input');
                const link = interaction.fields.getTextInputValue('link_input') || 'Nessuna prova';

                if (isNaN(stars) || stars < 1 || stars > 5) return interaction.editReply({ content: '❌ **Errore:** Stelle da 1 a 5' });

                const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
                if (!vouchesChannel) return interaction.editReply({ content: '❌ **Errore:** Canale vouches non trovato' });

                const reviewEmbed = new EmbedBuilder()
.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
.setTitle(`${'⭐'.repeat(stars)}${'☆'.repeat(5-stars)} ${stars}/5 STELLE`)
.setDescription(text)
.addFields({ name: '📎 Prova', value: link })
.setColor(GOLD)
.setThumbnail(LOGO_URL)
.setFooter({ text: 'LYX RL • Verified Review', iconURL: LOGO_URL })
.setTimestamp();

                await vouchesChannel.send({ embeds: [reviewEmbed] });

                const successEmbed = new EmbedBuilder()
.setTitle('✅ RECENSIONE PUBBLICATA')
.setDescription('**Grazie per il feedback!**\n\n💚 Il team LYX RL apprezza\n🎁 Controlla i DM per sconti')
.setColor(GOLD)
.setThumbnail(LOGO_URL);

                return interaction.editReply({ embeds: [successEmbed] });
            }
        }

        // MENU REGOLE
        if (interaction.isStringSelectMenu() && interaction.customId === 'rules_category') {
            const category = interaction.values[0];
            const rules = {
                general: '📜 **REGOLE GENERALI**\n\n1. Rispetto per tutti i membri\n2. No contenuti NSFW/18+\n3. No spam o flood\n4. No pubblicità non autorizzata\n5. Italiano/Inglese in chat pubblica',
                chat: '💬 **REGOLE CHAT**\n\n1. No caps lock eccessivo\n2. No off-topic nei canali\n3. No discussioni politiche/religiose\n4. Usa i canali appropriati\n5. Rispetta lo staff e le decisioni',
                tos: '🛒 **TERMINI DI SERVIZIO**\n\n1. Nessun rimborso dopo consegna\n2. Garanzia solo se documentata\n3. Pagamenti solo via metodi ufficiali\n4. Ban per chargeback/frode\n5. Account personali, no sharing/resell'
            };

            const embed = new EmbedBuilder()
.setTitle('📜 LYX RL RULES')
.setDescription(rules[category] || 'Seleziona categoria')
.setColor(LYX_RED)
.setFooter({ text: 'LYX RL • Rules', iconURL: LOGO_URL });

            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

    } catch (error) {
        console.error('Errore interazione:', error);
        if (interaction.deferred) await interaction.editReply({ content: '❌ **Errore**, riprova' }).catch(() => {});
        else await interaction.reply({ content: '❌ **Errore**, riprova', ephemeral: true }).catch(() => {});
    }
});

client.login(process.env.DISCORD_TOKEN);
