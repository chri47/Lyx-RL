const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');

// --- CONFIG LYX RL ---
const VERIFIED_ROLE_ID = '1530144188333817897';
const STAFF_ROLE_ID = '1530144125599612978';
const WELCOME_CHANNEL_NAME = 'welcome';
const VOUCHES_CHANNEL_NAME = '🔍・vouches';
const LOGS_CHANNEL_NAME = 'logs';
const LTC_ADDRESS = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35'; // IL TUO VERO
const WEBSITE_URL = 'https://lyxrlservices.mysellauth.com/'; // IL TUO VERO
const BANNER_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428'; // METTI LINK BANNER LYX
const LOGO_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428'; // METTI LINK LOGO LYX
// --------------

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`✅ Bot LYX RL online come ${client.user.tag}`);
});

// --- WELCOME CON GRAFICA ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === WELCOME_CHANNEL_NAME);
    if (!channel) return;

    const embed = new EmbedBuilder()
    .setTitle('🎉 BENVENUTO SU LYX RL')
    .setDescription(`Ciao ${member}, benvenuto nel server!\n\n**Sei il membro #${member.guild.memberCount}**\n\n✅ Verificati per accedere a tutto`)
    .setThumbnail(member.user.displayAvatarURL())
    .setImage(BANNER_URL)
    .setColor('#00ff00')
    .setFooter({ text: 'LYX RL Services', iconURL: LOGO_URL })
    .setTimestamp();

    await channel.send({ content: `${member}`, embeds: [embed] });
});

// --- COMANDI ---
client.on('messageCreate', async message => {
    if (message.author.bot ||!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        if (command === 'ping') {
            return message.reply('🏓 Pong! Bot LYX RL Online');
        }

        if (command === 'testwelcome' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            client.emit('guildMemberAdd', message.member);
            return message.reply('✅ Test welcome inviato');
        }

        if (command === 'ltc') {
            const embed = new EmbedBuilder()
           .setTitle('💰 INDIRIZZO LTC LYX RL')
           .setDescription(`\`\`\`${LTC_ADDRESS}\`\`\`\nClicca per copiare`)
           .setColor('#345D9D')
           .setThumbnail(LOGO_URL)
           .setFooter({ text: 'Invia solo LTC - LYX RL', iconURL: LOGO_URL });
            return message.reply({ embeds: [embed] });
        }

        if (command === 'setupverify' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
           .setTitle('✅ VERIFICA LYX RL')
           .setDescription('**Clicca il pulsante qui sotto per verificarti**\n\nDopo la verifica avrai accesso completo al server.')
           .setImage(BANNER_URL)
           .setColor('#00ff00')
           .setFooter({ text: 'LYX RL Verification', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_button').setLabel('VERIFICATI ORA').setStyle(ButtonStyle.Success).setEmoji('✅')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setuprecensione' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
           .setTitle('⭐ RECENSIONI LYX RL')
           .setDescription('**Hai acquistato da noi?**\nLascia una recensione e aiuta altri utenti!\n\n⭐⭐⭐⭐⭐')
           .setImage(BANNER_URL)
           .setColor('#FFD700')
           .setFooter({ text: 'LYX RL Feedback', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('review_button').setLabel('LASCIA RECENSIONE').setStyle(ButtonStyle.Primary).setEmoji('⭐')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setupticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
           .setTitle('🎫 SUPPORTO LYX RL')
           .setDescription('**Hai bisogno di aiuto?**\nApri un ticket e lo staff ti risponderà ASAP\n🇮🇹 Italiano\n🇬🇧 English\n🇫🇷 Français')
           .setImage(BANNER_URL)
           .setColor('#0099ff')
           .setFooter({ text: 'LYX RL Support', iconURL: LOGO_URL });

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
           .setTitle('📊 LIVE STATS LYX RL')
           .setDescription('**Statistiche in tempo reale del server**')
           .addFields(
                { name: '👥 Membri Totali', value: `${message.guild.memberCount}`, inline: true },
                { name: '🟢 Online', value: `${online}`, inline: true },
                { name: '🤖 Bot', value: `${bots}`, inline: true },
                { name: '📅 Creato', value: `<t:${parseInt(message.guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🚀 Uptime Bot', value: 'Online 24/7', inline: true },
                { name: '⚡ Ping', value: `${client.ws.ping}ms`, inline: true }
            )
           .setThumbnail(LOGO_URL)
           .setImage(BANNER_URL)
           .setColor('#00ff00')
           .setFooter({ text: 'LYX RL Stats', iconURL: LOGO_URL })
           .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            return message.delete();
        }

        if (command === 'setupwebsite' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
           .setTitle('🌐 SITO UFFICIALE LYX RL')
           .setDescription('**Visita il nostro sito ufficiale**\n\nTrovi tutti i prodotti, prezzi e info.')
           .setImage(BANNER_URL)
           .setColor('#5865F2')
           .setFooter({ text: 'LYX RL Official', iconURL: LOGO_URL });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('VAI AL SITO').setStyle(ButtonStyle.Link).setURL(WEBSITE_URL).setEmoji('🔗'),
                new ButtonBuilder().setLabel('DISCORD').setStyle(ButtonStyle.Link).setURL('https://discord.gg/lyxrl').setEmoji('💬')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'say' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const text = args.join(' ');
            if (!text) return message.reply('Uso: `!say testo`');
            await message.delete();
            return message.channel.send(text);
        }

        if (command === 'ban' && message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const user = message.mentions.users.first();
            if (!user) return message.reply('Uso: `!ban @utente motivo`');
            const reason = args.slice(1).join(' ') || 'Nessun motivo';
            const member = message.guild.members.cache.get(user.id);
            if (!member?.bannable) return message.reply('Non posso bannare questo utente');
            await member.ban({ reason });
            return message.reply(`🔨 ${user.tag} bannato. Motivo: ${reason}`);
        }

    } catch (error) {
        console.error(`Errore ${command}:`, error);
    }
});

// --- INTERAZIONI FIXATE ---
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton()) {
            // VERIFY
            if (interaction.customId === 'verify_button') {
                const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('Verifica LYX RL');
                const uidInput = new TextInputBuilder().setCustomId('uid_input').setLabel('Inserisci il tuo UID').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('Il tuo UID...');
                modal.addComponents(new ActionRowBuilder().addComponents(uidInput));
                return await interaction.showModal(modal);
            }

            // REVIEW
            if (interaction.customId === 'review_button') {
                const modal = new ModalBuilder().setCustomId('review_modal').setTitle('Recensione LYX RL');
                const starsInput = new TextInputBuilder().setCustomId('stars_input').setLabel('Stelle da 1 a 5').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('5');
                const textInput = new TextInputBuilder().setCustomId('text_input').setLabel('La tua recensione').setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder('Servizio perfetto...');
                const linkInput = new TextInputBuilder().setCustomId('link_input').setLabel('Link prova (opzionale)').setStyle(TextInputStyle.Short).setRequired(false);
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
                if (existing) return interaction.editReply({ content: '❌ Hai già un ticket aperto!' });

                const channel = await interaction.guild.channels.create({
                    name: ticketName,
                    type: 0,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages] }
                    ]
                });

                const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
                const vouchesTag = vouchesChannel? `<#${vouchesChannel.id}>` : '#vouches';

                const msg = {
                    it: `Ciao ${interaction.user} 👋\n\nLo staff LYX RL ti risponderà a breve.\n\n📝 Descrivi il tuo problema\n🖼️ Allega screenshot se serve\n⭐ Guarda le recensioni: ${vouchesTag}`,
                    en: `Hi ${interaction.user} 👋\n\nLYX RL staff will reply soon.\n\n📝 Describe your issue\n🖼️ Attach screenshots if needed\n⭐ Check reviews: ${vouchesTag}`,
                    fr: `Salut ${interaction.user} 👋\n\nLe staff LYX RL vous répondra bientôt.\n\n📝 Décrivez votre problème\n🖼️ Joignez captures si nécessaire\n⭐ Voir avis: ${vouchesTag}`
                };

                const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 TICKET LYX RL')
                .setDescription(msg[lang] || msg['it'])
                .setColor('#0099ff')
                .setFooter({ text: 'LYX RL Support', iconURL: LOGO_URL });

                await channel.send({ embeds: [ticketEmbed] });
                return interaction.editReply({ content: `✅ Ticket creato: ${channel}` });
            }
        }

        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ ephemeral: true });

            // VERIFY SUBMIT
            if (interaction.customId === 'verify_modal') {
                const uid = interaction.fields.getTextInputValue('uid_input');
                const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
                if (!role) return interaction.editReply({ content: '❌ Ruolo Verificato non trovato!' });

                await interaction.member.roles.add(role);

                const logs = interaction.guild.channels.cache.find(ch => ch.name === LOGS_CHANNEL_NAME);
                if (logs) logs.send(`✅ ${interaction.user.tag} verificato | UID: ${uid}`);

                return interaction.editReply({ content: `✅ **Verificato!**\nUID registrato: ${uid}\n\nBenvenuto su LYX RL 💚` });
            }

            // REVIEW SUBMIT
            if (interaction.customId === 'review_modal') {
                const stars = parseInt(interaction.fields.getTextInputValue('stars_input'));
                const text = interaction.fields.getTextInputValue('text_input');
                const link = interaction.fields.getTextInputValue('link_input') || 'Nessuna prova allegata';

                if (isNaN(stars) || stars < 1 || stars > 5) return interaction.editReply({ content: '❌ Le stelle devono essere da 1 a 5' });

                const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
                if (!vouchesChannel) return interaction.editReply({ content: '❌ Canale vouches non trovato' });

                const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTitle(`${'⭐'.repeat(stars)} ${stars}/5`)
                .setDescription(text)
                .addFields({ name: '📎 Prova', value: link })
                .setColor('#FFD700')
                .setThumbnail(LOGO_URL)
                .setFooter({ text: 'LYX RL Vouches', iconURL: LOGO_URL })
                .setTimestamp();

                await vouchesChannel.send({ embeds: [embed] });
                return interaction.editReply({ content: '✅ **Recensione pubblicata!**\nGrazie per il feedback 💚' });
            }
        }
    } catch (error) {
        console.error('Errore interazione:', error);
        if (interaction.deferred) await interaction.editReply({ content: '❌ Errore, riprova' }).catch(() => {});
        else await interaction.reply({ content: '❌ Errore, riprova', ephemeral: true }).catch(() => {});
    }
});

client.login(process.env.DISCORD_TOKEN);
