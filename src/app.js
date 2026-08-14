const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ChannelType } = require('discord.js');
const express = require('express');
const app = express();
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// ===== TUTTI I TUOI ID CONFERMATI =====
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = '1530144020154552380'; // SERVER LYX RL
const ORDER_CHANNEL_ID = '1537649672318091294'; // CANALE ORDINI
const REVIEW_CHANNEL_ID = '1530144378910277735'; // CANALE VOUCHES

const TICKET_CATEGORY_ID = null; // Metti ID categoria se vuoi i ticket in una categoria
const STAFF_ROLE_ID = null; // Metti ID ruolo staff se vuoi che veda i ticket

const PREFIX = '!';
const SITO_URL = 'https://www.lyxrl.com/';

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'stats') {
        const guild = message.guild;
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'dnd' || m.presence?.status === 'idle').size;
        const embed = new EmbedBuilder()
            .setTitle('📊 Statistiche LYX RL')
            .setColor(0x0099FF)
            .addFields(
                { name: '👥 Membri Totali', value: `${totalMembers}`, inline: true },
                { name: '🟢 Online Ora', value: `${onlineMembers}`, inline: true },
                { name: '🌐 Sito Ufficiale', value: `[lyxrl.com](${SITO_URL})`, inline: true }
            )
            .setFooter({ text: 'LYX RL Stats' })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }

    if (command === 'web') {
        const embed = new EmbedBuilder()
            .setTitle('🌐 Sito Ufficiale LYX RL')
            .setDescription('Clicca il pulsante qui sotto per visitare il nostro shop!')
            .setColor(0x00FF00)
            .setThumbnail('https://i.imgur.com/3QZQZQZ.png');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Visita il Sito')
                .setURL(SITO_URL)
                .setStyle(ButtonStyle.Link)
                .setEmoji('🔗')
        );
        message.channel.send({ embeds: [embed], components: [row] });
    }

    if (command === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('📜 Comandi LYX RL Bot')
            .setColor(0x0099FF)
            .addFields(
                { name: '!stats', value: 'Mostra statistiche server' },
                { name: '!web', value: 'Link al sito ufficiale' },
                { name: '/recensione', value: 'Lascia una recensione 1-5 stelle' },
                { name: '/ticket', value: 'Apri ticket supporto' }
            );
        message.channel.send({ embeds: [embed] });
    }
});

client.once('ready', async () => {
    console.log(`✅ Bot online come ${client.user.tag}`);
    const commands = [
        new SlashCommandBuilder()
            .setName('recensione')
            .setDescription('Lascia una recensione per LYX RL')
            .addIntegerOption(option => option.setName('stelle').setDescription('Da 1 a 5 stelle').setRequired(true).setMinValue(1).setMaxValue(5))
            .addStringOption(option => option.setName('commento').setDescription('Il tuo commento').setRequired(true)),
        new SlashCommandBuilder()
            .setName('ticket')
            .setDescription('Apri un ticket di supporto')
            .addStringOption(option => option.setName('motivo').setDescription('Motivo del ticket').setRequired(true))
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
        console.log('✅ Slash commands registrati');
    } catch (err) {
        console.error('Errore registrazione comandi:', err);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'recensione') {
        const stelle = interaction.options.getInteger('stelle');
        const commento = interaction.options.getString('commento');
        const embed = new EmbedBuilder()
            .setTitle('⭐ Nuova Recensione')
            .setColor(0xFFD700)
            .addFields(
                { name: 'Utente', value: `${interaction.user}`, inline: true },
                { name: 'Valutazione', value: '⭐'.repeat(stelle), inline: true },
                { name: 'Commento', value: commento }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();
        const channel = await client.channels.fetch(REVIEW_CHANNEL_ID);
        channel.send({ embeds: [embed] });
        interaction.reply({ content: '✅ Grazie per la recensione! È stata pubblicata.', ephemeral: true });
    }

    if (interaction.commandName === 'ticket') {
        const motivo = interaction.options.getString('motivo');
        const guild = interaction.guild;
        const channel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ...(STAFF_ROLE_ID ? [{ id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
            ]
        });
        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket Aperto')
            .setDescription(`**Utente:** ${interaction.user}\n**Motivo:** ${motivo}`)
            .setColor(0x00FF00);
        channel.send({ content: `${interaction.user}`, embeds: [embed] });
        interaction.reply({ content: `✅ Ticket creato: ${channel}`, ephemeral: true });
    }
});

app.post('/sellauth', async (req, res) => {
    try {
        const { customer_email, product_name, total, invoice_url } = req.body;
        const embed = new EmbedBuilder()
            .setTitle('💰 NUOVO ORDINE RICEVUTO')
            .setColor(0x00FF00)
            .addFields(
                { name: '👤 Cliente', value: `\`${customer_email || 'N/A'}\``, inline: true },
                { name: '📦 Prodotto', value: `\`${product_name || 'N/A'}\``, inline: true },
                { name: '💵 Prezzo', value: `€${total || '0.00'}`, inline: true }
            )
            .setFooter({ text: 'LYX RL • Pagamento Confermato' })
            .setTimestamp();
        const channel = await client.channels.fetch(ORDER_CHANNEL_ID);
        channel.send({ embeds: [embed] });
        res.status(200).send('OK');
    } catch (err) {
        console.error('Errore webhook:', err);
        res.status(500).send('Errore');
    }
});

app.get('/', (req, res) => res.send('LYX RL Bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webserver attivo su porta ${PORT}`));
client.login(TOKEN);
