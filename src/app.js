const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionFlagsBits, ChannelType, AttachmentBuilder, SlashCommandBuilder, Routes, REST } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

// CONFIG - CAMBIA QUESTI ID CON I TUOI
const CONFIG = {
    TICKET_CATEGORY: '1530144246055829626', // ID della categoria TICKETS
    STAFF_ROLE: '1530144125599612978', // ID ruolo staff
    RULES_CHANNEL: '1537664486033596446', // ID canale #rules
    BANNER_URL: 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428' // CAMBIA CON IL TUO BANNER LYX
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences // Per contare online
    ],
    partials: [Partials.Channel]
});

client.once('ready', async () => {
    console.log(`✅ Bot online come ${client.user.tag}`);

    // Registra slash commands
    const commands = [
        new SlashCommandBuilder().setName('ping').setDescription('Controlla se il bot è online')
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Slash commands registrati');
});

// ===== WELCOME SYSTEM CON CANVAS =====
client.on('guildMemberAdd', async member => {
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === '📊・welcome' || ch.name === 'benvenuto');
    if (!welcomeChannel) return;

    const canvas = createCanvas(1024, 500);
    const ctx = canvas.getContext('2d');

    // Background gradiente LYX
    const gradient = ctx.createLinearGradient(0, 0, 1024, 500);
    gradient.addColorStop(0, '#8B0000');
    gradient.addColorStop(1, '#4B0082');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 500);

    // Banner
    try {
        const banner = await loadImage(CONFIG.BANNER_URL);
        ctx.drawImage(banner, 0, 0, 1024, 200);
    } catch (e) {}

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, 1024, 500);

    // Logo LYX
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.fillText('LYX', 50, 450);

    // Testo
    ctx.font = 'bold 60px Arial';
    ctx.fillText('Welcome', 250, 320);

    ctx.font = 'bold 45px Arial';
    ctx.fillStyle = '#FF0000';
    ctx.fillText(`@${member.user.username}`, 250, 380);

    ctx.font = '25px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('We\'re happy to have you in the community.', 250, 420);

    // Member count
    ctx.fillStyle = '#2B2D31';
    ctx.fillRect(250, 440, 200, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Member #${member.guild.memberCount}`, 260, 465);

    ctx.fillStyle = '#2B2D31';
    ctx.fillRect(470, 440, 250, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('LYX RL Services', 480, 465);

    // Avatar
    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(850, 250, 120, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 730, 130, 240, 240);
    ctx.restore();

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(850, 250, 120, 0, Math.PI * 2, true);
    ctx.stroke();

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });

    const welcomeEmbed = new EmbedBuilder()
       .setColor(0xFF0000)
       .setDescription(`👋 Welcome to the community!\n\nHello ${member}, welcome to **LYX RL** 🎮\nYou are our member **#${member.guild.memberCount}**\n\nPlease check <#${CONFIG.RULES_CHANNEL}> and enjoy your stay!`)
       .setImage('attachment://welcome.png')
       .setFooter({ text: 'LYX RL Services • Welcome System' })
       .setTimestamp();

    await welcomeChannel.send({ embeds: [welcomeEmbed], files: [attachment] });
});

// ===== COMANDI MESSAGGIO =====
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    //!setupticket
    if (message.content === '!setupticket') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const embed = new EmbedBuilder()
           .setTitle('🎫 LYX RL - Support Tickets')
           .setDescription('**Select your language to open a ticket**\n\nOur staff will assist you as soon as possible.')
           .setColor(0xFF0000)
           .setImage(CONFIG.BANNER_URL);

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
               .setCustomId('ticket_language')
               .setPlaceholder('🌐 Select Language')
               .addOptions([
                    { label: 'English', value: 'en', emoji: '🇬🇧' },
                    { label: 'Italiano', value: 'it', emoji: '🇮🇹' },
                    { label: 'Español', value: 'es', emoji: '🇪🇸' }
                ])
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }

    //!setupstats
    if (message.content === '!setupstats') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const totalMembers = message.guild.memberCount;
        const onlineMembers = message.guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd').size;
        const boostCount = message.guild.premiumSubscriptionCount || 0;
        const boostLevel = message.guild.premiumTier;

        const statsEmbed = new EmbedBuilder()
           .setTitle('📊 LYX RL Live Statistics')
           .setDescription('Statistiche in tempo reale del server LYX RL')
           .addFields(
                { name: '🟢 Bot Status', value: 'Online', inline: true },
                { name: '🌐 Site Status', value: 'Online', inline: true },
                { name: '👥 Membri Online', value: `${onlineMembers}/${totalMembers}`, inline: true },
                { name: '🚀 Potenziamenti', value: `${boostCount} Boost - Livello ${boostLevel}`, inline: true },
                { name: '💎 Membri Totali', value: `${totalMembers}`, inline: true },
                { name: '📅 Uptime Bot', value: '0g 0h 0m', inline: true }
            )
           .setColor(0xFF0000)
           .setImage(CONFIG.BANNER_URL)
           .setFooter({ text: 'LYX RL Services • Aggiornato' })
           .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('refresh_stats').setLabel('Aggiorna Stats').setStyle(ButtonStyle.Danger).setEmoji('🔄')
        );

        await message.channel.send({ embeds: [statsEmbed], components: [row] });
        await message.delete();
    }

    //!say
    if (message.content.startsWith('!say ')) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const text = message.content.slice(5);
        if (!text) return;
        await message.channel.send(text);
        await message.delete();
    }

    //!embed
    if (message.content.startsWith('!embed ')) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const text = message.content.slice(7);
        const embed = new EmbedBuilder().setDescription(text).setColor(0xFF0000).setFooter({ text: 'LYX RL Services' });
        await message.channel.send({ embeds: [embed] });
        await message.delete();
    }

    //!clear
    if (message.content.startsWith('!clear ')) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
        const amount = parseInt(message.content.split(' ')[1]);
        if (isNaN(amount) || amount > 100) return message.reply('Metti un numero da 1 a 100');
        await message.channel.bulkDelete(amount, true);
        message.channel.send(`✅ Cancellati ${amount} messaggi`).then(m => setTimeout(() => m.delete(), 3000));
    }

    //!lock
    if (message.content === '!lock') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        message.reply('🔒 Canale bloccato');
    }

    //!unlock
    if (message.content === '!unlock') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        message.reply('🔓 Canale sbloccato');
    }
});

// ===== INTERAZIONI =====
client.on('interactionCreate', async interaction => {
    // Slash commands
    if (interaction.isCommand()) {
        if (interaction.commandName === 'ping') {
            await interaction.reply({ content: `🏓 Pong! ${client.ws.ping}ms`, ephemeral: true });
        }
    }

    // Menu lingua ticket
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_language') {
        const lang = interaction.values[0];
        const existingTicket = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
        if (existingTicket) return interaction.reply({ content: 'Hai già un ticket aperto!', ephemeral: true });

        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CONFIG.TICKET_CATEGORY,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: CONFIG.STAFF_ROLE, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const messages = {
            en: { title: 'Support Request', desc: 'Select the reason for your ticket below' },
            it: { title: 'Richiesta Supporto', desc: 'Seleziona il motivo del ticket qui sotto' },
            es: { title: 'Solicitud de Soporte', desc: 'Selecciona el motivo del ticket abajo' }
        };

        const reasons = {
            en: ['General Support', 'Purchase Credits', 'Partnerships', 'Other'],
            it: ['Supporto Generale', 'Acquisto Crediti', 'Partnerships', 'Altro'],
            es: ['Soporte General', 'Comprar Créditos', 'Partnerships', 'Otro']
        };

        const embed = new EmbedBuilder().setTitle(messages[lang].title).setDescription(messages[lang].desc).setColor(0xFF0000);
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
               .setCustomId(`ticket_reason_${lang}_${interaction.user.id}`)
               .setPlaceholder(messages[lang].desc)
               .addOptions(reasons[lang].map(r => ({ label: r, value: r })))
        );

        await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
        await interaction.reply({ content: `Ticket creato: ${ticketChannel}`, ephemeral: true });
    }

    // Menu motivo ticket
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket_reason_')) {
        const [,, lang, userId] = interaction.customId.split('_');
        const reason = interaction.values[0];

        const closeEmbed = new EmbedBuilder()
           .setTitle('🎫 Ticket Aperto')
           .setDescription(`**Motivo:** ${reason}\n\nLo staff ti risponderà a breve.`)
           .setColor(0xFF0000);

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Chiudi Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await interaction.update({ embeds: [closeEmbed], components: [closeRow] });
    }

    // Bottone chiudi ticket
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 Ticket chiuso tra 5 secondi...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }

    // Bottone refresh stats
    if (interaction.isButton() && interaction.customId === 'refresh_stats') {
        await interaction.deferUpdate();

        const totalMembers = interaction.guild.memberCount;
        const onlineMembers = interaction.guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd').size;
        const boostCount = interaction.guild.premiumSubscriptionCount || 0;
        const boostLevel = interaction.guild.premiumTier;
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;

        const updatedEmbed = new EmbedBuilder()
           .setTitle('📊 LYX RL Live Statistics')
           .setDescription('Statistiche in tempo reale del server LYX RL')
           .addFields(
                { name: '🟢 Bot Status', value: 'Online', inline: true },
                { name: '🌐 Site Status', value: 'Online', inline: true },
                { name: '👥 Membri Online', value: `${onlineMembers}/${totalMembers}`, inline: true },
                { name: '🚀 Potenziamenti', value: `${boostCount} Boost - Livello ${boostLevel}`, inline: true },
                { name: '💎 Membri Totali', value: `${totalMembers}`, inline: true },
                { name: '📅 Uptime Bot', value: `${days}g ${hours}h ${minutes}m`, inline: true }
            )
           .setColor(0xFF0000)
           .setImage(CONFIG.BANNER_URL)
           .setFooter({ text: 'LYX RL Services • Aggiornato' })
           .setTimestamp();

        await interaction.editReply({ embeds: [updatedEmbed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
