const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, PermissionsBitField, ChannelType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

// --- CONFIG LYX RL LUXURY RED ---
const VERIFIED_ROLE_ID = '1530144188333817897';
const STAFF_ROLE_ID = '1530144125599612978';
const WELCOME_CHANNEL_NAME = 'welcome';
const VOUCHES_CHANNEL_NAME = '🔍・vouches';
const LOGS_CHANNEL_NAME = 'logslyx';
const RULES_CHANNEL_NAME = '📢・rules';
const LTC_ADDRESS = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35';
const WEBSITE_URL = 'https://lyxrlservices.mysellauth.com/';
const BANNER_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428'; // Banner rosso LYX
const LOGO_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428';
const LYX_RED = '#FF0000';
const LYX_DARK = '#0a0a0a';
const GOLD = '#FFD700';
// --------------

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

// --- WELCOME LUXURY ROSSO ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === WELCOME_CHANNEL_NAME);
    if (!channel) return;

    try {
        const canvas = createCanvas(1920, 1080);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = LYX_DARK;
        ctx.fillRect(0, 0, 1920, 1080);

        try {
            const banner = await loadImage(BANNER_URL);
            ctx.globalAlpha = 0.4;
            ctx.drawImage(banner, 0, 0, 1920, 1080);
            ctx.globalAlpha = 1;
        } catch {}

        // Bordo rosso luxury
        ctx.strokeStyle = LYX_RED;
        ctx.lineWidth = 15;
        ctx.strokeRect(50, 50, 1820, 980);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 5;
        ctx.strokeRect(75, 75, 1770, 930);

        // Logo
        try {
            const logo = await loadImage(LOGO_URL);
            ctx.drawImage(logo, 710, 100, 500, 500);
        } catch {}

        // Avatar
        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(960, 680, 180, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 780, 500, 360, 360);
        ctx.restore();

        ctx.strokeStyle = LYX_RED;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(960, 680, 185, 0, Math.PI * 2, true);
        ctx.stroke();

        ctx.font = 'bold 100px Arial';
        ctx.fillStyle = LYX_RED;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 30;
        ctx.fillText('WELCOME TO LYX RL', 960, 920);

        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(member.user.username.toUpperCase(), 960, 990);

        ctx.font = '45px Arial';
        ctx.fillStyle = GOLD;
        ctx.fillText(`MEMBER #${member.guild.memberCount}`, 960, 1050);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-luxury.png' });

        const embed = new EmbedBuilder()
     .setTitle('🔥 BENVENUTO SU LYX RL')
     .setDescription(`**${member}** è entrato nel server\n\n✅ **Verificati** per accedere a tutto\n💎 **Premium Services** disponibili`)
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

        // SETUP RULES - FIXATO
        if (command === 'setuprules' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
       .setTitle('📜 LYX RL • SERVER RULES')
       .setDescription('**Regolamento Ufficiale LYX RL**\n\n1️⃣ **Rispetto** - No insulti, no razzismo\n2️⃣ **No Spam** - No flood, no pubblicità\n3️⃣ **No Scam** - Ban immediato per truffe\n4️⃣ **Ticket** - Usa i ticket per supporto\n5️⃣ **Pagamenti** - Solo metodi ufficiali\n\n⚠️ **La violazione comporta ban permanente**')
       .setImage(BANNER_URL)
       .setColor(LYX_RED)
       .setFooter({ text: 'LYX RL • Rules', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('accept_rules').setLabel('ACCETTO LE REGOLE').setStyle(ButtonStyle.Danger).setEmoji('✅')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // SETUP TICKET LUXURY CON MENU A TENDINA
        if (command === 'setupticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
       .setTitle('🎫 SUPPORTO PREMIUM LYX RL')
       .setDescription('**Apri un ticket privato e il nostro staff ti risponderà entro 5 minuti.**\n\n🇮🇹 **Italiano** - Supporto 24/7\n🇬🇧 **English** - 24/7 Support\n🇫🇷 **Français** - Support 24/7\n\n⚡ **Tempo medio risposta: 45 sec**\n💎 **Supporto prioritario per verificati**')
       .setImage(BANNER_URL)
       .setColor(LYX_RED)
       .setFooter({ text: 'LYX RL • Premium Support 24/7', iconURL: LOGO_URL });

            const select = new StringSelectMenuBuilder()
         .setCustomId('ticket_panel')
         .setPlaceholder('🌍 Seleziona lingua / Select language')
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
             .setEmoji('🇫🇷')
            );

            const row = new ActionRowBuilder().addComponents(select);
            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setupverify' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
       .setTitle('🔐 VERIFICA PREMIUM LYX RL')
       .setDescription('**Sistema di Verifica Ufficiale**\n\nClicca il pulsante per verificarti con il tuo UID.\n\n✨ **Vantaggi Verificati:**\n• Accesso completo\n• Ticket prioritari\n• Sconti esclusivi')
       .setImage(BANNER_URL)
       .setColor(GOLD)
       .setFooter({ text: 'LYX RL Verification', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_button').setLabel('VERIFICATI ORA').setStyle(ButtonStyle.Danger).setEmoji('🔐')
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
                { name: '👥 Membri', value: `\`\`\`${message.guild.memberCount}\`\`\``, inline: true },
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

            const categorySelect = new StringSelectMenuBuilder()
         .setCustomId(`ticket_category_${lang}`)
         .setPlaceholder('🎫 Seleziona il tipo di problema')
         .addOptions(
                new StringSelectMenuOptionBuilder()
             .setLabel('Supporto Generale')
             .setDescription('Domande generali sui prodotti')
             .setValue('support')
             .setEmoji('💬'),
                new StringSelectMenuOptionBuilder()
             .setLabel('Problema Ordine')
             .setDescription('Ordine non ricevuto o problemi')
             .setValue('order')
             .setEmoji('📦'),
                new StringSelectMenuOptionBuilder()
             .setLabel('Non Ricevuto')
             .setDescription('Acquisto non consegnato')
             .setValue('not_delivered')
             .setEmoji('❌'),
                new StringSelectMenuOptionBuilder()
             .setLabel('Rimborso')
             .setDescription('Richiesta di rimborso')
             .setValue('refund')
             .setEmoji('💰')
            );

            const row = new ActionRowBuilder().addComponents(categorySelect);

            const embed = new EmbedBuilder()
         .setTitle('🎫 SELEZIONA CATEGORIA')
         .setDescription('**Scegli il tipo di assistenza di cui hai bisogno**')
         .setColor(LYX_RED);

            return await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        // MENU TICKET - SECONDA SCELTA CATEGORIA + CREA TICKET
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket_category_')) {
            await interaction.deferReply({ ephemeral: true });
            const lang = interaction.customId.split('_')[2];
            const category = interaction.values[0];

            const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);
            const existing = interaction.guild.channels.cache.find(ch => ch.name === ticketName);
            if (existing) return interaction.editReply({ content: '❌ **Hai già un ticket aperto!**\nControlla la lista canali.' });

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

            const categoryNames = {
                support: '💬 Supporto Generale',
                order: '📦 Problema Ordine',
                not_delivered: '❌ Non Ricevuto',
                refund: '💰 Richiesta Rimborso'
            };

            const ticketEmbed = new EmbedBuilder()
         .setTitle('🎫 TICKET LYX RL PREMIUM')
         .setDescription(`**Benvenuto ${interaction.user}** 👋\n\n**Categoria:** ${categoryNames[category]}\n**Lingua:** ${lang.toUpperCase()}\n\n📝 **Descrivi il tuo problema in dettaglio**\n🖼️ **Allega screenshot se necessario**\n⏱️ **Risposta media: <5 minuti**\n\n*Lo staff ti risponderà a breve*`)
         .setColor(LYX_RED)
         .setThumbnail(LOGO_URL)
         .setFooter({ text: 'LYX RL • Premium Support 24/7', iconURL: LOGO_URL })
         .setTimestamp();

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('CHIUDI TICKET').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, embeds: [ticketEmbed], components: [closeRow] });
            return interaction.editReply({ content: `✅ **Ticket creato con successo!**\n${channel}` });
        }

        // BOTTONI
        if (interaction.isButton()) {
            if (interaction.customId === 'verify_button') {
                const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('Verifica LYX RL Premium');
                const uidInput = new TextInputBuilder().setCustomId('uid_input').setLabel('INSERISCI IL TUO UID').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('Es: 123456789').setMaxLength(20);
                modal.addComponents(new ActionRowBuilder().addComponents(uidInput));
                return await interaction.showModal(modal);
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

            if (interaction.customId === 'accept_rules') {
                await interaction.reply({ content: '✅ **Regole accettate!**\nOra puoi verificarti.', ephemeral: true });
            }

            if (interaction.customId === 'close_ticket') {
                await interaction.reply({ content: '🔒 **Ticket in chiusura...**\nIl canale verrà eliminato tra 5 secondi' });
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }

        // MODAL
        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ ephemeral: true });

            if (interaction.customId === 'verify_modal') {
                const uid = interaction.fields.getTextInputValue('uid_input');
                const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
                if (!role) return interaction.editReply({ content: '❌ **Errore:** Ruolo non trovato!' });

                await interaction.member.roles.add(role);

                const logs = interaction.guild.channels.cache.find(ch => ch.name === LOGS_CHANNEL_NAME);
                if (logs) {
                    const logEmbed = new EmbedBuilder()
                 .setTitle('✅ NUOVA VERIFICA')
                 .setDescription(`**Utente:** ${interaction.user.tag}\n**UID:** \`${uid}\``)
                 .setColor(LYX_GREEN)
                 .setThumbnail(interaction.user.displayAvatarURL())
                 .setTimestamp();
                    logs.send({ embeds: [logEmbed] });
                }

                const successEmbed = new EmbedBuilder()
             .setTitle('✅ VERIFICA COMPLETATA')
             .setDescription(`**Benvenuto ${interaction.user.username}!**\n\n🎉 **UID:** \`${uid}\`\n💎 **Status:** Verificato Premium\n🚀 **Accesso:** Completo`)
             .setColor(LYX_GREEN)
             .setThumbnail(LOGO_URL);

                return interaction.editReply({ embeds: [successEmbed] });
            }

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
    } catch (error) {
        console.error('Errore interazione:', error);
        if (interaction.deferred) await interaction.editReply({ content: '❌ **Errore**, riprova' }).catch(() => {});
        else await interaction.reply({ content: '❌ **Errore**, riprova', ephemeral: true }).catch(() => {});
    }
});

client.login(process.env.TOKEN);
