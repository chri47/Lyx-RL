import {
    Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits,
    ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType
} from 'discord.js';
import { createCanvas, loadImage } from 'canvas';

const CONFIG = {
    TICKET_CATEGORY: '1530144246055829626', // ID categoria dove crea i ticket
    STAFF_ROLE: '1530144125599612978', // ID ruolo staff che vede i ticket
    RULES_CHANNEL: '1537664486033596446', // ID canale #regole per il link nel welcome
    VERIFY_ROLE_ID: '1530144188333817897', // ID del ruolo "Membres" da dare
    BANNER_URL: 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428' // URL banner LYX rosso/nero
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // OBBLIGATORIO PER WELCOME
    ]
});

// ===== STARTUP =====
client.once('ready', () => {
    console.log(`✅ Bot online come ${client.user.tag}`);
    client.user.setActivity('LYX RL Services', { type: ActivityType.Playing });
});

// ===== WELCOME CANVAS =====
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(ch =>
        ch.name === 'welcome' || ch.name === 'benvenuto'
    );

    if (!welcomeChannel) {
        console.log('❌ Canale welcome non trovato');
        return;
    }

    try {
        // Crea canvas 1200x600
        const canvas = createCanvas(1200, 600);
        const ctx = canvas.getContext('2d');

        // 1. Banner di sfondo
        const background = await loadImage(CONFIG.BANNER_URL);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // 2. Overlay scuro per leggibilità
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Avatar tondo
        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        const avatarX = canvas.width / 2;
        const avatarY = 200;
        const avatarRadius = 100;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();

        // Bordo avatar rosso LYX
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2, true);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();

        // 4. Testo Welcome
        ctx.font = 'bold 60px Sans';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`Welcome ${member.user.username}`, canvas.width / 2, 380);

        // 5. Testo member count
        ctx.font = '30px Sans';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`You are member #${member.guild.memberCount}`, canvas.width / 2, 440);

        // 6. Testo regole
        ctx.font = '25px Sans';
        ctx.fillText(`Please check <#${CONFIG.RULES_CHANNEL}>`, canvas.width / 2, 500);

        // Invia immagine
        const attachment = canvas.toBuffer();
        await welcomeChannel.send({
            content: `🎉 ${member} è entrato in LYX RL Services!`,
            files: [{ attachment, name: 'welcome-lyx.png' }]
        });

    } catch (error) {
        console.error('❌ Errore Welcome Canvas:', error);
        // Fallback se canvas crasha
        await welcomeChannel.send(`🎉 Welcome ${member}! Controlla <#${CONFIG.RULES_CHANNEL}>`);
    }
});

// ===== COMANDI & INTERAZIONI =====
client.on('interactionCreate', async (interaction) => {
    // SLASH COMMANDS
    if (interaction.isCommand()) {
        // /ping
        if (interaction.commandName === 'ping') {
            await interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);
        }

        // /say
        if (interaction.commandName === 'say') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: '❌ Non hai i permessi.', ephemeral: true });
            }
            const message = interaction.options.getString('message');
            await interaction.reply({ content: '✅ Messaggio inviato!', ephemeral: true });
            await interaction.channel.send(message);
        }

        // /createticket
        if (interaction.commandName === 'createticket') {
            const topic = interaction.options.getString('topic');

            try {
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

                const embed = new EmbedBuilder()
                .setTitle('🎫 Ticket Aperto')
                .setDescription(`**Utente:** ${interaction.user}\n**Motivo:** ${topic}`)
                .setColor(0xff0000)
                .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Chiudi Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
                );

                await ticketChannel.send({
                    content: `<@&${CONFIG.STAFF_ROLE}> Nuovo ticket!`,
                    embeds: [embed],
                    components: [row]
                });

                await interaction.reply({
                    content: `✅ Ticket creato: ${ticketChannel}`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('❌ Errore creazione ticket:', error);
                await interaction.reply({
                    content: '❌ Errore. Controlla gli ID nel CONFIG e i miei permessi.',
                    ephemeral: true
                });
            }
        }
    }

    // PULSANTI
    if (interaction.isButton()) {
        // Pulsante Chiudi Ticket
        if (interaction.customId === 'close_ticket') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
                return interaction.reply({ content: '❌ Solo lo staff può chiudere i ticket.', ephemeral: true });
            }
            await interaction.reply('🔒 Il ticket verrà chiuso tra 5 secondi...');
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }

        // Pulsante Verifica
        if (interaction.customId === 'verify_button') {
            const role = interaction.guild.roles.cache.get(CONFIG.VERIFY_ROLE_ID);

            if (!role) {
                return interaction.reply({
                    content: '❌ Ruolo "Membres" non trovato! Controlla VERIFY_ROLE_ID nel CONFIG.',
                    ephemeral: true
                });
            }

            if (interaction.member.roles.cache.has(CONFIG.VERIFY_ROLE_ID)) {
                return interaction.reply({
                    content: '✅ Sei già verificato!',
                    ephemeral: true
                });
            }

            try {
                await interaction.member.roles.add(role);
                await interaction.reply({
                    content: '✅ **Verificato!** Benvenuto in LYX RL Services 🎮',
                    ephemeral: true
                });
            } catch (error) {
                console.error('❌ Errore verifica:', error);
                await interaction.reply({
                    content: '❌ Non ho i permessi. Metti il mio ruolo SOPRA a "Membres".',
                    ephemeral: true
                });
            }
        }
    }
});

// ===== COMANDI PREFIX! =====
client.on('messageCreate', async (message) => {
    if (message.author.bot ||!message.content.startsWith('!')) return;

    //!setupverify - Crea il pannello di verifica
    if (message.content === '!setupverify') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Solo gli admin possono usare questo comando.');
        }

        const embed = new EmbedBuilder()
        .setTitle('🔐 Verifica LYX RL Services')
        .setDescription('**Clicca il pulsante qui sotto per verificarti**\n\nRiceverai accesso a tutti i canali del server!')
        .setColor(0x00FF00)
        .setImage(CONFIG.BANNER_URL)
        .setFooter({ text: 'LYX RL Services' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('Verificami')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }
});

// ===== REGISTRA SLASH COMMANDS =====
client.on('ready', async () => {
    try {
        await client.application.commands.set([
            { name: 'ping', description: 'Mostra il ping del bot' },
            {
                name: 'say',
                description: 'Fai parlare il bot',
                options: [{ name: 'message', description: 'Messaggio da inviare', type: 3, required: true }]
            },
            {
                name: 'createticket',
                description: 'Apri un ticket di supporto',
                options: [{ name: 'topic', description: 'Motivo del ticket', type: 3, required: true }]
            }
        ]);
        console.log('✅ Slash commands registrati');
    } catch (error) {
        console.error('❌ Errore registrazione comandi:', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
