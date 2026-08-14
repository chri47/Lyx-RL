const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');

// --- CONFIG ---
const VERIFIED_ROLE_ID = '1530144188333817897';
const STAFF_ROLE_ID = '1530144125599612978';
const WELCOME_CHANNEL_NAME = 'welcome';
const VOUCHES_CHANNEL_NAME = '🔍・vouches';
const LOGS_CHANNEL_NAME = 'logs';
const LTC_ADDRESS = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35'; // CAMBIA COL TUO
const WEBSITE_URL = 'https://lyxrlservices.mysellauth.com/'; // CAMBIA COL TUO
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
    console.log(`✅ Bot online come ${client.user.tag}`);
});

// --- WELCOME SOLO TESTO ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === WELCOME_CHANNEL_NAME);
    if (!channel) return;

    const embed = new EmbedBuilder()
     .setTitle('🎉 Benvenuto su LYX RL!')
     .setDescription(`Ciao ${member}, sei il membro #${member.guild.memberCount}!\n\nVerificati per accedere al server completo.`)
     .setThumbnail(member.user.displayAvatarURL())
     .setColor('#00ff00')
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
            return message.reply('Pong! 🏓 Bot attivo');
        }

        if (command === 'testwelcome' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            client.emit('guildMemberAdd', message.member);
            return message.reply('Test welcome inviato ✅');
        }

        if (command === 'ltc') {
            const embed = new EmbedBuilder()
            .setTitle('💰 INDIRIZZO LTC LYX RL')
            .setDescription(`\`\`\`${LTC_ADDRESS}\`\`\``)
            .setColor('#345D9D');
            return message.reply({ embeds: [embed] });
        }

        if (command === 'setupverify' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
            .setTitle('✅ VERIFICA ACCOUNT')
            .setDescription('Clicca il pulsante qui sotto per verificarti e accedere al server.')
            .setColor('#00ff00');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_button').setLabel('Verificati').setStyle(ButtonStyle.Success).setEmoji('✅')
            );
            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setuprecensione' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
            .setTitle('⭐ LASCIA UNA RECENSIONE')
            .setDescription('Hai acquistato da noi? Lascia una recensione!')
            .setColor('#FFD700');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('review_button').setLabel('Lascia Recensione').setStyle(ButtonStyle.Primary).setEmoji('⭐')
            );
            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setupticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
            .setTitle('🎫 APRI UN TICKET')
            .setDescription('**IT:** Supporto\n**EN:** Support\n**FR:** Support')
            .setColor('#0099ff');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_it').setLabel('Italiano').setStyle(ButtonStyle.Secondary).setEmoji('🇮🇹'),
                new ButtonBuilder().setCustomId('ticket_en').setLabel('English').setStyle(ButtonStyle.Secondary).setEmoji('🇬🇧'),
                new ButtonBuilder().setCustomId('ticket_fr').setLabel('Français').setStyle(ButtonStyle.Secondary).setEmoji('🇫🇷')
            );
            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'setupstats' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
            .setTitle('📊 STATISTICHE SERVER')
            .setDescription(`👥 **Membri:** ${message.guild.memberCount}\n🤖 **Bot:** ${message.guild.members.cache.filter(m => m.user.bot).size}\n📅 **Creato:** <t:${parseInt(message.guild.createdTimestamp / 1000)}:R>`)
            .setColor('#00ff00')
            .setThumbnail(message.guild.iconURL());
            await message.channel.send({ embeds: [embed] });
            return message.delete();
        }

        if (command === 'setupwebsite' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
            .setTitle('🌐 SITO UFFICIALE')
            .setDescription('Clicca per visitare il sito')
            .setColor('#5865F2');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Visita il Sito').setStyle(ButtonStyle.Link).setURL(WEBSITE_URL).setEmoji('🔗')
            );
            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        if (command === 'say' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const text = args.join(' ');
            if (!text) return message.reply('Scrivi qualcosa: `!say testo`');
            await message.delete();
            return message.channel.send(text);
        }

        if (command === 'ban' && message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const user = message.mentions.users.first();
            if (!user) return message.reply('Tagga qualcuno: `!ban @utente motivo`');
            const reason = args.slice(1).join(' ') || 'Nessun motivo';
            const member = message.guild.members.cache.get(user.id);
            if (!member?.bannable) return message.reply('Non posso bannarlo');
            await member.ban({ reason });
            return message.reply(`🔨 ${user.tag} bannato. Motivo: ${reason}`);
        }

    } catch (error) {
        console.error(`Errore ${command}:`, error);
        message.reply('Errore comando').catch(() => {});
    }
});

// --- INTERAZIONI ---
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton()) {
            if (interaction.customId === 'verify_button') {
                const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('Verifica UID');
                const uidInput = new TextInputBuilder().setCustomId('uid_input').setLabel('Inserisci il tuo UID').setStyle(TextInputStyle.Short).setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(uidInput));
                return interaction.showModal(modal);
            }

            if (interaction.customId === 'review_button') {
                const modal = new ModalBuilder().setCustomId('review_modal').setTitle('Lascia Recensione');
                const starsInput = new TextInputBuilder().setCustomId('stars_input').setLabel('Stelle da 1 a 5').setStyle(TextInputStyle.Short).setRequired(true);
                const textInput = new TextInputBuilder().setCustomId('text_input').setLabel('Recensione').setStyle(TextInputStyle.Paragraph).setRequired(true);
                const linkInput = new TextInputBuilder().setCustomId('link_input').setLabel('Link prova opzionale').setStyle(TextInputStyle.Short).setRequired(false);
                modal.addComponents(
                    new ActionRowBuilder().addComponents(starsInput),
                    new ActionRowBuilder().addComponents(textInput),
                    new ActionRowBuilder().addComponents(linkInput)
                );
                return interaction.showModal(modal);
            }

            if (interaction.customId.startsWith('ticket_')) {
                const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
                const existing = interaction.guild.channels.cache.find(ch => ch.name === ticketName);
                if (existing) return interaction.reply({ content: 'Hai già un ticket!', ephemeral: true });

                const channel = await interaction.guild.channels.create({
                    name: ticketName,
                    type: 0,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });

                await channel.send(`Ciao ${interaction.user}, lo staff ti risponderà a breve.`);
                return interaction.reply({ content: `Ticket creato: ${channel}`, ephemeral: true });
            }
        }

        if (interaction.isModalSubmit()) {
            await interaction.deferReply({ ephemeral: true });

            if (interaction.customId === 'verify_modal') {
                const uid = interaction.fields.getTextInputValue('uid_input');
                const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
                if (!role) return interaction.editReply({ content: 'Ruolo Verificato non trovato!' });
                await interaction.member.roles.add(role);
                return interaction.editReply({ content: `✅ Verificato! UID: ${uid}` });
            }

            if (interaction.customId === 'review_modal') {
                const stars = parseInt(interaction.fields.getTextInputValue('stars_input'));
                const text = interaction.fields.getTextInputValue('text_input');
                const link = interaction.fields.getTextInputValue('link_input') || 'Nessun allegato';
                if (isNaN(stars) || stars < 1 || stars > 5) return interaction.editReply({ content: 'Stelle da 1 a 5' });

                const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
                if (!vouchesChannel) return interaction.editReply({ content: 'Canale vouches non trovato' });

                const embed = new EmbedBuilder()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTitle(`${'⭐'.repeat(stars)} ${stars}/5`)
                .setDescription(text)
                .addFields({ name: 'Prova', value: link })
                .setColor('#FFD700')
                .setTimestamp();

                await vouchesChannel.send({ embeds: [embed] });
                return interaction.editReply({ content: 'Recensione inviata! Grazie 💚' });
            }
        }
    } catch (error) {
        console.error('Errore interazione:', error);
        if (interaction.deferred) await interaction.editReply({ content: 'Errore' }).catch(() => {});
        else await interaction.reply({ content: 'Errore', ephemeral: true }).catch(() => {});
    }
});

client.login(process.env.DISCORD_TOKEN);    
