const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

// --- CONFIG LYX RL LUXURY ---
const VERIFIED_ROLE_ID = '1530144188333817897';
const STAFF_ROLE_ID = '1530144125599612978';
const WELCOME_CHANNEL_NAME = 'welcome';
const VOUCHES_CHANNEL_NAME = '🔍・vouches';
const LOGS_CHANNEL_NAME = 'logslyx';
const LTC_ADDRESS = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35';
const WEBSITE_URL = 'https://lyxrlservices.mysellauth.com/';
const BANNER_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428'; // 1920x1080
const LOGO_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428'; // PNG trasparente
const GOLD = '#FFD700';
const LYX_GREEN = '#00ff88';
const DISCORD_BLUE = '#5865F2';
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
    console.log(`✅ LYX RL LUXURY Bot online come ${client.user.tag}`);
    client.user.setActivity('LYX RL Premium', { type: 3 });
});

// --- WELCOME LUXURY ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === WELCOME_CHANNEL_NAME);
    if (!channel) return;

    try {
        const canvas = createCanvas(1920, 1080);
        const ctx = canvas.getContext('2d');

        // Background nero luxury
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 1920, 1080);

        // Banner con opacità
        try {
            const banner = await loadImage(BANNER_URL);
            ctx.globalAlpha = 0.25;
            ctx.drawImage(banner, 0, 0, 1920, 1080);
            ctx.globalAlpha = 1;
        } catch {}

        // Doppio bordo luxury
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 15;
        ctx.strokeRect(50, 50, 1820, 980);
        ctx.strokeStyle = LYX_GREEN;
        ctx.lineWidth = 5;
        ctx.strokeRect(75, 75, 1770, 930);

        // Logo centrato
        try {
            const logo = await loadImage(LOGO_URL);
            ctx.drawImage(logo, 710, 100, 500, 500);
        } catch {}

        // Avatar con bordo oro
        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(960, 680, 180, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 780, 500, 360, 360);
        ctx.restore();

        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(960, 680, 185, 0, Math.PI * 2, true);
        ctx.stroke();

        // Testo
        ctx.font = 'bold 100px Arial';
        ctx.fillStyle = GOLD;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 30;
        ctx.fillText('WELCOME TO LYX RL', 960, 920);

        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(member.user.username.toUpperCase(), 960, 990);

        ctx.font = '45px Arial';
        ctx.fillStyle = LYX_GREEN;
        ctx.fillText(`MEMBER #${member.guild.memberCount}`, 960, 1050);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-luxury.png' });

        const embed = new EmbedBuilder()
       .setTitle('🌟 BENVENUTO SU LYX RL')
       .setDescription(`**${member}** è entrato nel server premium\n\n✅ **Verificati** per accedere a tutto\n💎 **Servizi luxury** disponibili 24/7`)
       .setImage('attachment://welcome-luxury.png')
       .setColor(GOLD)
       .setFooter({ text: 'LYX RL • Premium Services', iconURL: LOGO_URL })
       .setTimestamp();

        await channel.send({ content: `${member}`, embeds: [embed], files: [attachment] });

    } catch (error) {
        console.error('Errore welcome:', error);
        const embed = new EmbedBuilder()
       .setTitle('🌟 BENVENUTO SU LYX RL')
       .setDescription(`Ciao ${member}, benvenuto!\n\n**Sei il membro #${member.guild.memberCount}**\n\n✅ Verificati per accedere`)
       .setThumbnail(member.user.displayAvatarURL())
       .setImage(BANNER_URL)
       .setColor(GOLD);
        await channel.send({ embeds: [embed] });
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
         .setDescription(`**Online** • Latency: \`${client.ws.ping}ms\`\n**Uptime**: 24/7 Premium Hosting`)
         .setColor(LYX_GREEN)
         .setThumbnail(LOGO_URL)
         .setFooter({ text: 'LYX RL System', iconURL: LOGO_URL });
            return message.reply({ embeds: [embed] });
        }

        if (command === 'testwelcome' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            client.emit('guildMemberAdd', message.member);
            return message.reply('✅ Test welcome luxury inviato');
        }

        if (command === 'ltc') {
            const embed = new EmbedBuilder()
         .setTitle('💎 LYX RL • LTC ADDRESS')
         .setDescription(`**Indirizzo Ufficiale per Pagamenti**\n\`\`\`${LTC_ADDRESS}\`\`\`\n⚠️ **Invia solo LTC** - Altri token verranno persi`)
         .setColor('#345D9D')
         .setThumbnail(LOGO_URL)
         .setFooter({ text: 'LYX RL • Secure Payments', iconURL: LOGO_URL });
            return message.reply({ embeds: [embed] });
        }

        if (command === 'setupverify' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
         .setTitle('🔐 VERIFICA PREMIUM LYX RL')
         .setDescription('**Sistema di Verifica Ufficiale**\n\nClicca il pulsante per verificarti con il tuo UID.\n\n✨ **Vantaggi Membri Verificati:**\n• Accesso completo a tutti i canali\n• Ticket di supporto prioritari\n• Offerte e sconti esclusivi\n• Ruolo Verified permanente')
         .setImage(BANNER_URL)
         .setColor(GOLD)
         .setFooter({ text: 'LYX RL Verification System', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_button').setLabel('VERIFICATI ORA').setStyle(ButtonStyle.Success).setEmoji('🔐')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setuprecensione' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
         .setTitle('⭐ FEEDBACK CLIENTI LYX RL')
         .setDescription('**La tua opinione è importante**\n\nHai acquistato da noi? Lascia una recensione pubblica.\n\n💎 **Perché recensire:**\n• Aiuti altri clienti a scegliere\n• Ricevi codici sconto futuri\n• Supporti la community')
         .setImage(BANNER_URL)
         .setColor(GOLD)
         .setFooter({ text: 'LYX RL • Customer Reviews', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('review_button').setLabel('LASCIA RECENSIONE').setStyle(ButtonStyle.Primary).setEmoji('⭐')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setupticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
         .setTitle('🎫 SUPPORTO PREMIUM LYX RL')
         .setDescription('**Hai bisogno di assistenza?**\n\nApri un ticket privato e il nostro staff ti risponderà entro 5 minuti.\n\n🇮🇹 **Italiano** - Supporto 24/7\n🇬🇧 **English** - 24/7 Support\n🇫🇷 **Français** - Support 24/7\n\n⚡ **Tempo medio risposta: <5 min**')
         .setImage(BANNER_URL)
         .setColor(DISCORD_BLUE)
         .setFooter({ text: 'LYX RL • Premium Support', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_it').setLabel('Italiano').setStyle(ButtonStyle.Secondary).setEmoji('🇮🇹'),
                new ButtonBuilder().setCustomId('ticket_en').setLabel('English').setStyle(ButtonStyle.Secondary).setEmoji('🇬🇧'),
                new ButtonBuilder().setCustomId('ticket_fr').setLabel('Français').setStyle(ButtonStyle.Secondary).setEmoji('🇫🇷')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setupstats' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const online = message.guild.members.cache.filter(m => m.presence?.status === 'online').size;
            const bots = message.guild.members.cache.filter(m => m.user.bot).size;

            const embed = new EmbedBuilder()
         .setTitle('📊 LYX RL LIVE STATISTICS')
         .setDescription('**Statistiche in tempo reale del server premium**')
         .addFields(
                { name: '👥 Membri Totali', value: `\`\`\`yaml\n${message.guild.memberCount}\`\`\``, inline: true },
                { name: '🟢 Online Ora', value: `\`\`\`yaml\n${online}\`\`\``, inline: true },
                { name: '🤖 Bot Attivi', value: `\`\`\`yaml\n${bots}\`\`\``, inline: true },
                { name: '💎 Boost Livello', value: `\`\`\`yaml\nLevel ${message.guild.premiumTier}\`\`\``, inline: true },
                { name: '🚀 Boost Totali', value: `\`\`\`yaml\n${message.guild.premiumSubscriptionCount}\`\`\``, inline: true },
                { name: '⚡ Ping Bot', value: `\`\`\`yaml\n${client.ws.ping}ms\`\`\``, inline: true },
                { name: '📅 Server Creato', value: `<t:${parseInt(message.guild.createdTimestamp / 1000)}:F>`, inline: false },
                { name: '🎯 Uptime', value: `\`\`\`yaml\n99.9% Online\`\`\``, inline: true }
            )
         .setThumbnail(LOGO_URL)
         .setImage(BANNER_URL)
         .setColor(GOLD)
         .setFooter({ text: 'LYX RL • Live Stats', iconURL: LOGO_URL })
         .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            return message.delete();
        }

        if (command === 'setupwebsite' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
         .setTitle('🌐 LYX RL OFFICIAL STORE')
         .setDescription('**Visita il nostro sito ufficiale**\n\n🛒 **Catalogo Completo** - Tutti i prodotti\n💰 **Prezzi Aggiornati** - Offerte giornaliere\n📦 **Consegna Istantanea** - Attivazione automatica\n🔒 **Pagamenti Sicuri** - LTC, PayPal, Crypto')
         .setImage(BANNER_URL)
         .setColor(DISCORD_BLUE)
         .setFooter({ text: 'LYX RL • Official Store', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('VAI AL SITO').setStyle(ButtonStyle.Link).setURL(WEBSITE_URL).setEmoji('🌐'),
                new ButtonBuilder().setLabel('DISCORD INVITE').setStyle(ButtonStyle.Link).setURL('https://discord.gg/lyxrl').setEmoji('💬')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'say' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const text = args.join(' ');
            if (!text) return message.reply('Uso: `!say messaggio`');
            await message.delete();
            return message.channel.send(text);
        }

        if (command === 'ban' && message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const user = message.mentions.users.first();
            if (!user) return message.reply('Uso: `!ban @utente motivo`');
            const reason = args.slice(1).join(' ') || 'Violazione regolamento LYX RL';
            const member = message.guild.members.cache.get(user.id);
            if (!member?.bannable) return message.reply('❌ Non posso bannare questo utente');
            await member.ban({ reason });

            const embed = new EmbedBuilder()
         .setTitle('🔨 BAN ESEGUITO')
         .setDescription(`**${user.tag}** è stato rimosso dal server`)
         .addFields({ name: 'Motivo', value: reason }, { name: 'Moderatore', value: message.author.tag })
         .setColor('#ff0000')
         .setThumbnail(user.displayAvatarURL())
         .setFooter({ text: 'LYX RL Moderation', iconURL: LOGO_URL })
         .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

    } catch (error) {
        console.error(`Errore ${command}:`, error);
    }
});

// --- INTERAZIONI LUXURY ---
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton()) {
            // VERIFY
            if (interaction.customId === 'verify_button') {
                const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('Verifica LYX RL Premium');
                const uidInput = new TextInputBuilder().setCustomId('uid_input').setLabel('INSERISCI IL TUO UID UNIVOCO').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('Es: 123456789').setMaxLength(20);
                modal.addComponents(new ActionRowBuilder().addComponents(uidInput));
                return await interaction.showModal(modal);
            }

            // REVIEW
            if (interaction.customId === 'review_button') {
                const modal = new ModalBuilder().setCustomId('review_modal').setTitle('Recensione LYX RL');
                const starsInput = new TextInputBuilder().setCustomId('stars_input').setLabel('VALUTAZIONE (1-5 STELLE)').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('5').setMaxLength(1);
                const textInput = new TextInputBuilder().setCustomId('text_input').setLabel('LA TUA RECENSIONE DETTAGLIATA').setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder('Servizio eccellente, consegna immediata, staff professionale...').setMaxLength(1000);
                const linkInput = new TextInputBuilder().setCustomId('link_input').setLabel('SCREENSHOT PROVA (Opzionale)').setStyle(TextInputStyle.Short).setRequired(false).setPlaceholder('https://imgur.com/...');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(starsInput),
                    new ActionRowBuilder().addComponents(textInput),
                    new ActionRowBuilder().addComponents(linkInput)
                );
                return await interaction.showModal(modal);
            }

            // TICKET
            if (interaction.customId.startsWith('ticket_')) {
                await interaction.deferReply({ ephemeral: true });
                const lang = interaction.customId.split('_')[1];
                const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);
                const existing = interaction.guild.channels.cache.find(ch => ch.name === ticketName);
                if (existing) return interaction.editReply({ content: '❌ **Hai già un ticket aperto!**\nControlla la lista canali a sinistra.' });

                const channel = await interaction.guild.channels.create({
                    name: ticketName,
                    type: ChannelType.GuildText,
                    topic: `Ticket Premium di ${interaction.user.tag} | LYX RL Support | Lingua: ${lang.toUpperCase()}`,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.ReadMessageHistory] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ManageChannels] }
                    ]
                });

                const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
                const vouchesTag = vouchesChannel? `<#${vouchesChannel.id}>` : '#vouches';

                const msg = {
                    it: `**🎫 BENVENUTO NEL SUPPORTO LYX RL** ${interaction.user} 👋\n\n📝 **Descrivi dettagliatamente il tuo problema**\n🖼️ **Allega screenshot/video se necessario**\n⏱️ **Tempo medio risposta: <5 minuti**\n\n⭐ **Vedi le recensioni:** ${vouchesTag}\n\n*Un membro dello staff ti risponderà a breve*`,
                    en: `**🎫 WELCOME TO LYX RL SUPPORT** ${interaction.user} 👋\n\n📝 **Describe your issue in detail**\n🖼️ **Attach screenshots/video if needed**\n⏱️ **Average response time: <5 minutes**\n\n⭐ **Check reviews:** ${vouchesTag}\n\n*A staff member will reply shortly*`,
                    fr: `**🎫 BIENVENUE AU SUPPORT LYX RL** ${interaction.user} 👋\n\n📝 **Décrivez votre problème en détail**\n🖼️ **Joignez captures/vidéo si nécessaire**\n⏱️ **Temps de réponse moyen: <5 minutes**\n\n⭐ **Voir les avis:** ${vouchesTag}\n\n*Un membre du staff vous répondra bientôt*`
                };

                const ticketEmbed = new EmbedBuilder()
             .setTitle('🎫 TICKET LYX RL PREMIUM')
             .setDescription(msg[lang] || msg['it'])
             .setColor(DISCORD_BLUE)
             .setThumbnail(LOGO_URL)
             .setFooter({ text: 'LYX RL • Premium Support 24/7', iconURL: LOGO_URL })
             .setTimestamp();

                const closeRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close_ticket').setLabel('CHIUDI TICKET').setStyle(ButtonStyle.Danger).setEmoji('🔒')
                );

                await channel.send({ content: `${interaction.user} | <@&${STAFF_ROLE_ID}>`, embeds: [ticketEmbed], components: [closeRow] });
                return interaction.editReply({ content: `✅ **Ticket creato con successo!**\n${channel}\n\nLo staff ti risponderà a breve.` });
            }

            // CLOSE TICKET
            if (interaction.customId === 'close_ticket') {
                await interaction.reply({ content: '🔒 **Ticket chiuso.**\nIl canale verrà eliminato tra 5 secondi...' });
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }

        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ ephemeral: true });

            // VERIFY SUBMIT
            if (interaction.customId === 'verify_modal') {
                const uid = interaction.fields.getTextInputValue('uid_input');
                const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
                if (!role) return interaction.editReply({ content: '❌ **Errore Sistema:** Ruolo Verificato non configurato!' });

                await interaction.member.roles.add(role);

                const logs = interaction.guild.channels.cache.find(ch => ch.name === LOGS_CHANNEL_NAME);
                if (logs) {
                    const logEmbed = new EmbedBuilder()
                 .setTitle('✅ NUOVA VERIFICA PREMIUM')
                 .setDescription(`**Utente:** ${interaction.user.tag}\n**ID:** ${interaction.user.id}\n**UID:** \`${uid}\``)
                 .setColor(LYX_GREEN)
                 .setThumbnail(interaction.user.displayAvatarURL())
                 .setTimestamp();
                    logs.send({ embeds: [logEmbed] });
                }

                const successEmbed = new EmbedBuilder()
             .setTitle('✅ VERIFICA COMPLETATA')
             .setDescription(`**Benvenuto su LYX RL, ${interaction.user.username}!**\n\n🎉 **UID Registrato:** \`${uid}\`\n💎 **Status:** Membro Verificato Premium\n🚀 **Accesso:** Tutti i canali sbloccati\n\n*Goditi il server LYX RL!*`)
             .setColor(LYX_GREEN)
             .setThumbnail(LOGO_URL)
             .setFooter({ text: 'LYX RL • Verified Member', iconURL: LOGO_URL });

                return interaction.editReply({ embeds: [successEmbed] });
            }

            // REVIEW SUBMIT
            if (interaction.customId === 'review_modal') {
                const stars = parseInt(interaction.fields.getTextInputValue('stars_input'));
                const text = interaction.fields.getTextInputValue('text_input');
                const link = interaction.fields.getTextInputValue('link_input') || 'Nessuna prova allegata';

                if (isNaN(stars) || stars < 1 || stars > 5) return interaction.editReply({ content: '❌ **Errore:** Le stelle devono essere un numero da 1 a 5' });

                const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
                if (!vouchesChannel) return interaction.editReply({ content: '❌ **Errore Sistema:** Canale recensioni non trovato' });

                const reviewEmbed = new EmbedBuilder()
             .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
             .setTitle(`${'⭐'.repeat(stars)}${'☆'.repeat(5-stars)} ${stars}/5 STELLE`)
             .setDescription(text)
             .addFields({ name: '📎 Prova Acquisto', value: link, inline: false })
             .setColor(GOLD)
             .setThumbnail(LOGO_URL)
             .setFooter({ text: 'LYX RL • Verified Customer Review', iconURL: LOGO_URL })
             .setTimestamp();

                await vouchesChannel.send({ embeds: [reviewEmbed] });

                const successEmbed = new EmbedBuilder()
             .setTitle('✅ RECENSIONE PUBBLICATA')
             .setDescription('**Grazie per il tuo feedback!**\n\nLa tua recensione è ora visibile nel canale vouches.\n\n💚 **Il team LYX RL apprezza il tuo supporto**\n🎁 **Controlla i DM per codici sconto esclusivi**')
             .setColor(GOLD)
             .setThumbnail(LOGO_URL)
             .setFooter({ text: 'LYX RL • Customer Feedback', iconURL: LOGO_URL });

                return interaction.editReply({ embeds: [successEmbed] });
            }
        }
    } catch (error) {
        console.error('Errore interazione:', error);
        if (interaction.deferred) await interaction.editReply({ content: '❌ **Errore interno**, riprova tra poco' }).catch(() => {});
        else await interaction.reply({ content: '❌ **Errore interno**, riprova tra poco', ephemeral: true }).catch(() => {});
    }
});

client.login(process.env.DISCORD_TOKEN);
