import {
    Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits,
    ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType
} from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import 'dotenv/config';

const CONFIG = {
    welcomeChannel: 'welcome',
    verifiedRole: 'Membres',
    ticketCategory: 'TICKETS',
    logsChannel: 'logs',
    websiteUrl: 'https://lyxrl.com' // METTI IL TUO SITO QUI
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('clientReady', () => {
    console.log(`✅ Bot online come ${client.user.tag}`);
    client.user.setActivity('LYX RL Services', { type: ActivityType.Watching });

    // REGISTRA TUTTI I COMANDI SLASH /
    const commands = [
        { name: 'ping', description: 'Controlla se il bot è online' },
        { name: 'setupverify', description: 'Manda il pannello di verifica' },
        { name: 'createticket', description: 'Apri un ticket di supporto' },
        { name: 'setupstock', description: 'Manda il pannello stock LYX RL' },
        { name: 'setupticket', description: 'Manda il pannello per aprire ticket' },
        { name: 'setupweb', description: 'Manda il pannello del sito web' },
        { name: 'website', description: 'Link al sito ufficiale LYX RL' }
    ];
    client.application.commands.set(commands);
    console.log(`Slash commands registrati: ${commands.length}`);
});

// WELCOME CON IMMAGINE
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.find(ch => ch.name === CONFIG.welcomeChannel);
    if (!channel) return console.log('Canale welcome non trovato');

    try {
        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        const background = await loadImage('https://i.imgur.com/0N3fZ3s.png');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.font = '60px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`Benvenuto,`, 512, 360);
        ctx.fillText(`${member.user.username}!`, 512, 430);

        ctx.beginPath();
        ctx.arc(512, 180, 128, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.drawImage(avatar, 384, 52, 256, 256);

        await channel.send({
            content: `Benvenuto ${member} su LYX RL Services!`,
            files: [{ attachment: canvas.toBuffer(), name: 'welcome.png' }]
        });
    } catch (error) {
        console.error('Errore welcome:', error);
        await channel.send(`Benvenuto ${member} su LYX RL Services!`);
    }
});

// GESTIONE COMANDI SLASH /
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'ping') {
            const sent = await interaction.reply({ content: 'Calcolo ping...', fetchReply: true });
            interaction.editReply(`Pong! ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
        }

        if (interaction.commandName === 'setupverify') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Solo gli admin possono usare questo comando.', ephemeral: true });
            }
            const embed = new EmbedBuilder()
               .setTitle('✅ Verifica LYX RL')
               .setDescription('Clicca il pulsante qui sotto per verificarti e accedere al server.')
               .setColor('#00FF7F');
            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_button').setLabel('Verificami').setStyle(ButtonStyle.Success).setEmoji('✅')
            );
            await interaction.channel.send({ embeds: [embed], components: [button] });
            await interaction.reply({ content: 'Pannello verifica creato!', ephemeral: true });
        }

        if (interaction.commandName === 'createticket') {
            const category = interaction.guild.channels.cache.find(c => c.name === CONFIG.ticketCategory && c.type === ChannelType.GuildCategory);
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: category?.id,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ],
            });
            const embed = new EmbedBuilder()
               .setTitle('🎫 Ticket Aperto')
               .setDescription(`Ciao ${interaction.user}, descrivi il tuo problema.`)
               .setColor('#0099FF');
            await channel.send({ content: `${interaction.user}`, embeds: [embed] });
            await interaction.reply({ content: `Ticket creato: ${channel}`, ephemeral: true });
        }

        if (interaction.commandName === 'setupstock') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Solo gli admin possono usare questo comando.', ephemeral: true });
            }
            const embed = new EmbedBuilder()
               .setTitle('📦 Stock LYX RL Services')
               .setDescription('**Prodotti Disponibili:**\n\n🚗 **Accounts** - GTA, Steam, Epic\n🔑 **Keys** - Windows, Office\n💎 **Boost** - Server & Account\n\n*Clicca sotto per aprire un ticket e ordinare*')
               .setColor('#FFD700');
            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('stock_ticket').setLabel('Ordina Ora').setStyle(ButtonStyle.Primary).setEmoji('🛒')
            );
            await interaction.channel.send({ embeds: [embed], components: [button] });
            await interaction.reply({ content: 'Pannello stock creato!', ephemeral: true });
        }

        if (interaction.commandName === 'setupticket') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Solo gli admin possono usare questo comando.', ephemeral: true });
            }
            const embed = new EmbedBuilder()
               .setTitle('🎫 Supporto LYX RL')
               .setDescription('Hai bisogno di aiuto?\nClicca il pulsante qui sotto per aprire un ticket.\n\n*Lo staff ti risponderà il prima possibile*')
               .setColor('#0099FF');
            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('open_ticket').setLabel('Apri Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')
            );
            await interaction.channel.send({ embeds: [embed], components: [button] });
            await interaction.reply({ content: 'Pannello ticket creato!', ephemeral: true });
        }

        if (interaction.commandName === 'setupweb') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: 'Solo gli admin possono usare questo comando.', ephemeral: true });
            }
            const embed = new EmbedBuilder()
               .setTitle('🌐 Sito Ufficiale LYX RL')
               .setDescription('Visita il nostro sito per vedere tutti i prodotti e le offerte!')
               .setColor('#5865F2');
            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Vai al Sito').setStyle(ButtonStyle.Link).setURL(CONFIG.websiteUrl).setEmoji('🔗')
            );
            await interaction.channel.send({ embeds: [embed], components: [button] });
            await interaction.reply({ content: 'Pannello web creato!', ephemeral: true });
        }

        if (interaction.commandName === 'website') {
            const embed = new EmbedBuilder()
               .setTitle('🌐 LYX RL Services')
               .setDescription(`**Sito Ufficiale:**\n${CONFIG.websiteUrl}`)
               .setColor('#5865F2');
            await interaction.reply({ embeds: [embed] });
        }
    }

    // GESTIONE PULSANTI
    if (interaction.isButton()) {
        if (interaction.customId === 'verify_button') {
            const role = interaction.guild.roles.cache.find(r => r.name === CONFIG.verifiedRole);
            if (!role) return interaction.reply({ content: 'Ruolo Membres non trovato!', ephemeral: true });
            await interaction.member.roles.add(role);
            await interaction.reply({ content: 'Sei stato verificato con successo!', ephemeral: true });
        }

        if (interaction.customId === 'open_ticket' || interaction.customId === 'stock_ticket') {
            const category = interaction.guild.channels.cache.find(c => c.name === CONFIG.ticketCategory && c.type === ChannelType.GuildCategory);
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: category?.id,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ],
            });
            const embed = new EmbedBuilder()
               .setTitle('🎫 Ticket Aperto')
               .setDescription(`Ciao ${interaction.user}, descrivi la tua richiesta.`)
               .setColor('#0099FF');
            await channel.send({ content: `${interaction.user}`, embeds: [embed] });
            await interaction.reply({ content: `Ticket creato: ${channel}`, ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
