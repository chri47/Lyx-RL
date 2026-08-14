import {
    Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits,
    ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType
} from 'discord.js';
import { createCanvas, loadImage } from 'canvas';

const CONFIG = {
    TICKET_CATEGORY: '1530144246055829626',
    STAFF_ROLE: '1530144125599612978',
    RULES_CHANNEL: '1537664486033596446',
    VERIFY_ROLE_ID: '1530144188333817897',
    BANNER_URL: 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428'
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`✅ Bot online come ${client.user.tag}`);
    client.user.setActivity('LYX RL Services', { type: ActivityType.Playing });

    const commands = await client.application.commands.set([
        { name: 'ping', description: 'Mostra il ping del bot' },
        {
            name: 'createticket',
            description: 'Apri un ticket di supporto',
            options: [{ name: 'topic', description: 'Motivo del ticket', type: 3, required: true }]
        },
        { name: 'setupverify', description: 'Crea il messaggio di verifica con pulsante' }
    ]);
    console.log(`✅ Slash commands registrati: ${commands.size}`);
});

client.on('guildMemberAdd', async (member) => {
    console.log(`Nuovo membro: ${member.user.tag}`);
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
    if (!welcomeChannel) return;
    try {
        const canvas = createCanvas(1200, 600);
        const ctx = canvas.getContext('2d');
        const background = await loadImage(CONFIG.BANNER_URL);
        ctx.drawImage(background, 0, 0, 1200, 600);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 1200, 600);
        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        const x = 600, y = 200, r = 100;
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(avatar, x - r, y - r, r * 2, r * 2); ctx.restore();
        ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2);
        ctx.lineWidth = 8; ctx.strokeStyle = '#ff0000'; ctx.stroke();
        ctx.font = 'bold 60px Sans'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
        ctx.fillText(`Welcome ${member.user.username}`, 600, 380);
        ctx.font = '30px Sans'; ctx.fillStyle = '#cccccc';
        ctx.fillText(`You are member #${member.guild.memberCount}`, 600, 440);
        ctx.font = '25px Sans'; ctx.fillText(`Please check <#${CONFIG.RULES_CHANNEL}>`, 600, 500);
        await welcomeChannel.send({
            content: `🎉 ${member} è entrato in LYX RL Services!`,
            files: [{ attachment: canvas.toBuffer(), name: 'welcome.png' }]
        });
    } catch (err) { console.error('Errore Canvas:', err); }
});

client.on('interactionCreate', async (interaction) => {
    console.log(`Interazione ricevuta: ${interaction.type} da ${interaction.user.tag}`);
    try {
        if (interaction.isButton() && interaction.customId === 'verify_button') {
            await interaction.deferReply({ ephemeral: true });
            const role = interaction.guild.roles.cache.get(CONFIG.VERIFY_ROLE_ID);
            if (!role) return interaction.editReply('❌ Ruolo Membres non trovato.');
            if (interaction.member.roles.cache.has(CONFIG.VERIFY_ROLE_ID)) {
                return interaction.editReply('✅ Sei già verificato!');
            }
            await interaction.member.roles.add(role);
            return interaction.editReply('✅ **Verificato!** Benvenuto in LYX RL Services 🎮');
        }

        if (interaction.isButton() && interaction.customId === 'close_ticket') {
            if (!interaction.member.roles.cache.has(CONFIG.STAFF_ROLE)) {
                return interaction.reply({ content: '❌ Solo lo staff può chiudere i ticket.', ephemeral: true });
            }
            await interaction.reply('🔒 Il ticket verrà chiuso tra 5 secondi...');
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }

        if (interaction.isCommand()) {
            console.log(`Comando: /${interaction.commandName}`);
            if (interaction.commandName === 'ping') {
                await interaction.reply(`🏓 Pong! Latenza: ${client.ws.ping}ms`);
            }
            if (interaction.commandName === 'createticket') {
                await interaction.deferReply({ ephemeral: true });
                const topic = interaction.options.getString('topic');
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
                 .setColor(0xff0000).setTimestamp();
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close_ticket').setLabel('Chiudi Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
                );
                await ticketChannel.send({ content: `<@&${CONFIG.STAFF_ROLE}> Nuovo ticket!`, embeds: [embed], components: [row] });
                await interaction.editReply(`✅ Ticket creato: ${ticketChannel}`);
            }
            if (interaction.commandName === 'setupverify') {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: '❌ Solo gli admin.', ephemeral: true });
                }
                const embed = new EmbedBuilder()
                 .setTitle('🔐 Verifica LYX RL Services')
                 .setDescription(`**Clicca il pulsante qui sotto per verificarti**\n\nLeggi le regole in <#${CONFIG.RULES_CHANNEL}> prima di cliccare.`)
                 .setColor(0x00FF00).setImage(CONFIG.BANNER_URL);
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('verify_button').setLabel('Verificami').setStyle(ButtonStyle.Success).setEmoji('✅')
                );
                await interaction.channel.send({ embeds: [embed], components: [row] });
                await interaction.reply({ content: '✅ Messaggio di verifica creato!', ephemeral: true });
            }
        }
    } catch (error) {
        console.error('ERRORE INTERACTION:', error);
        const errorMsg = '❌ Errore. Il bot ha i permessi Gestisci Ruoli? Il mio ruolo è sopra a Membres?';
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(errorMsg);
        } else {
            await interaction.reply({ content: errorMsg, ephemeral: true });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    console.log(`Messaggio ricevuto: ${message.content}`);
    if (!message.content.startsWith('!setupverify')) return;
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
    const embed = new EmbedBuilder()
     .setTitle('🔐 Verifica LYX RL Services')
     .setDescription(`**Clicca il pulsante qui sotto per verificarti**\n\nLeggi le regole in <#${CONFIG.RULES_CHANNEL}> prima di cliccare.`)
     .setColor(0x00FF00).setImage(CONFIG.BANNER_URL);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('verify_button').setLabel('Verificami').setStyle(ButtonStyle.Success).setEmoji('✅')
    );
    await message.channel.send({ embeds: [embed], components: [row] });
    await message.delete();
});

client.login(process.env.DISCORD_TOKEN);
