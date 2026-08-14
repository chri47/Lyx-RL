const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const VERIFIED_ROLE_ID = '1418673474548269076';
const STAFF_ROLE_ID = '1418629328097198150';
const WELCOME_CHANNEL_NAME = 'welcome';
const VOUCHES_CHANNEL_NAME = '🔍・vouches';
const LOGS_CHANNEL_NAME = 'logs';
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

// --- WELCOME CON BANNER ---
client.on('guildMemberAdd', async member => {
    try {
        const channel = member.guild.channels.cache.find(ch => ch.name === WELCOME_CHANNEL_NAME);
        if (!channel) return;

        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        const background = await loadImage('https://i.imgur.com/YourBanner.png'); // CAMBIA LINK BANNER
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(512, 200, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 412, 100, 200, 200);
        ctx.restore();

        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`Benvenuto ${member.user.username}`, 512, 380);

        ctx.font = '40px Arial';
        ctx.fillText(`Sei il membro #${member.guild.memberCount}`, 512, 440);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
        await channel.send({ content: `Benvenuto ${member}!`, files: [attachment] });
    } catch (error) {
        console.error('Errore welcome:', error);
        const channel = member.guild.channels.cache.find(ch => ch.name === WELCOME_CHANNEL_NAME);
        if (channel) await channel.send(`Benvenuto ${member}!`);
    }
});

// --- COMANDI ---
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // PING
    if (command === 'ping') {
        await message.reply('Pong! 🏓');
    }

    // TEST WELCOME
    if (command === 'testwelcome' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        client.emit('guildMemberAdd', message.member);
        await message.reply('Test welcome inviato ✅');
    }

    // SETUP VERIFY
    if (command === 'setupverify' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
           .setTitle('✅ VERIFICA ACCOUNT')
           .setDescription('Clicca il pulsante qui sotto per verificarti e accedere al server.')
           .setColor('#00ff00');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
               .setCustomId('verify_button')
               .setLabel('Verificati')
               .setStyle(ButtonStyle.Success)
               .setEmoji('✅')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    // SETUP RECENSIONE
    if (command === 'setuprecensione' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
           .setTitle('⭐ LASCIA UNA RECENSIONE')
           .setDescription('Hai acquistato da noi? Lascia una recensione cliccando il pulsante!')
           .setColor('#FFD700');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
               .setCustomId('review_button')
               .setLabel('Lascia Recensione')
               .setStyle(ButtonStyle.Primary)
               .setEmoji('⭐')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    // SETUP TICKET
    if (command === 'setupticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
           .setTitle('🎫 APRI UN TICKET')
           .setDescription('**IT:** Hai bisogno di supporto? Apri un ticket.\n**EN:** Need support? Open a ticket.\n**FR:** Besoin d\'aide? Ouvrez un ticket.')
           .setColor('#0099ff');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
               .setCustomId('ticket_it')
               .setLabel('Italiano')
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('🇮🇹'),
            new ButtonBuilder()
               .setCustomId('ticket_en')
               .setLabel('English')
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('🇬🇧'),
            new ButtonBuilder()
               .setCustomId('ticket_fr')
               .setLabel('Français')
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('🇫🇷')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    // SAY - SOLO ADMIN
    if (command === 'say' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const text = args.join(' ');
        if (!text) return message.reply('Scrivi qualcosa dopo `!say` bro');
        await message.delete();
        await message.channel.send(text);
    }

    // BAN - SOLO ADMIN
    if (command === 'ban' && message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        const user = message.mentions.users.first();
        if (!user) return message.reply('Tagga qualcuno da bannare: `!ban @utente motivo`');

        const reason = args.slice(1).join(' ') || 'Nessun motivo';
        const member = message.guild.members.cache.get(user.id);

        if (!member) return message.reply('Utente non trovato nel server');
        if (!member.bannable) return message.reply('Non posso bannare questo utente');

        await member.ban({ reason: reason });
        await message.reply(`🔨 ${user.tag} è stato bannato. Motivo: ${reason}`);
    }
});

// --- INTERAZIONI BOTTONI E MODAL ---
client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        // VERIFY
        if (interaction.customId === 'verify_button') {
            const modal = new ModalBuilder()
               .setCustomId('verify_modal')
               .setTitle('Verifica UID');

            const uidInput = new TextInputBuilder()
               .setCustomId('uid_input')
               .setLabel('Inserisci il tuo UID')
               .setStyle(TextInputStyle.Short)
               .setRequired(true);

            const row = new ActionRowBuilder().addComponents(uidInput);
            modal.addComponents(row);
            await interaction.showModal(modal);
        }

        // REVIEW
        if (interaction.customId === 'review_button') {
            const modal = new ModalBuilder()
               .setCustomId('review_modal')
               .setTitle('Lascia una Recensione');

            const starsInput = new TextInputBuilder()
               .setCustomId('stars_input')
               .setLabel('Stelle da 1 a 5')
               .setStyle(TextInputStyle.Short)
               .setRequired(true);

            const textInput = new TextInputBuilder()
               .setCustomId('text_input')
               .setLabel('Scrivi la tua recensione')
               .setStyle(TextInputStyle.Paragraph)
               .setRequired(true);

            const linkInput = new TextInputBuilder()
               .setCustomId('link_input')
               .setLabel('Link prova opzionale')
               .setStyle(TextInputStyle.Short)
               .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(starsInput),
                new ActionRowBuilder().addComponents(textInput),
                new ActionRowBuilder().addComponents(linkInput)
            );
            await interaction.showModal(modal);
        }

        // TICKET
        if (interaction.customId.startsWith('ticket_')) {
            const lang = interaction.customId.split('_')[1];
            const ticketName = `ticket-${interaction.user.username}`.toLowerCase();

            const existing = interaction.guild.channels.cache.find(ch => ch.name === ticketName);
            if (existing) return interaction.reply({ content: 'Hai già un ticket aperto!', ephemeral: true });

            const channel = await interaction.guild.channels.create({
                name: ticketName,
                type: 0,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });

            const msg = {
                it: `Ciao ${interaction.user}, lo staff ti risponderà a breve.`,
                en: `Hi ${interaction.user}, staff will reply soon.`,
                fr: `Salut ${interaction.user}, le staff vous répondra bientôt.`
            };

            await channel.send(msg[lang]);
            await interaction.reply({ content: `Ticket creato: ${channel}`, ephemeral: true });
        }
    }

    if (interaction.isModalSubmit()) {
        // VERIFY SUBMIT
        if (interaction.customId === 'verify_modal') {
            const uid = interaction.fields.getTextInputValue('uid_input');
            const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
            if (!role) return interaction.reply({ content: 'Ruolo Verificato non trovato!', ephemeral: true });

            await interaction.member.roles.add(role);
            await interaction.reply({ content: `✅ Verificato! UID: ${uid}`, ephemeral: true });
        }

        // REVIEW SUBMIT
        if (interaction.customId === 'review_modal') {
            const stars = interaction.fields.getTextInputValue('stars_input');
            const text = interaction.fields.getTextInputValue('text_input');
            const link = interaction.fields.getTextInputValue('link_input') || 'Nessun allegato';

            if (stars < 1 || stars > 5) return interaction.reply({ content: 'Le stelle devono essere da 1 a 5', ephemeral: true });

            const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
            if (!vouchesChannel) return interaction.reply({ content: 'Canale vouches non trovato', ephemeral: true });

            const embed = new EmbedBuilder()
               .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
               .setTitle(`${'⭐'.repeat(stars)} ${stars}/5`)
               .setDescription(text)
               .addFields({ name: 'Prova', value: link })
               .setColor('#FFD700')
               .setTimestamp();

            await vouchesChannel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Recensione inviata! Grazie 💚', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
