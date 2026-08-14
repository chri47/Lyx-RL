const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

console.log('[BOOT] LYX RL Modular Bot v2 - FANCY MODE');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

const TICKET_CATEGORY_ID = null; // Metti l'ID di una categoria se vuoi tutti i ticket sotto la stessa categoria
const STAFF_ROLE_ID = null; // Metti l'ID del ruolo staff se vuoi che vedano tutti i ticket

client.once(Events.ClientReady, c => {
    console.log(`[ONLINE] ${c.user.tag} PRONTO CON STILE`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    if (message.content === '!setup-ticket' && message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
        
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🎫 Centro Assistenza LYX RL')
            .setDescription('**Hai bisogno di supporto?**\n\nSeleziona dal menu qui sotto la categoria che descrive meglio il tuo problema.\n\n> ⏱️ Rispondiamo entro 24h\n> 🔒 Solo tu e lo staff potete vedere il ticket')
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: 'LYX RL Support', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('📂 Seleziona una categoria...')
            .addOptions([
                {
                    label: 'Domande Generali',
                    description: 'Informazioni sul server, eventi, regole',
                    value: 'questions',
                    emoji: '❓'
                },
                {
                    label: 'Supporto Tecnico',
                    description: 'Problemi con bot, ruoli, canali',
                    value: 'general',
                    emoji: '🛠️'
                },
                {
                    label: 'Prodotto Non Ricevuto',
                    description: 'Non hai ricevuto un acquisto',
                    value: 'product',
                    emoji: '📦'
                },
                {
                    label: 'Consegna Manuale',
                    description: 'Richiedi consegna manuale',
                    value: 'delivery',
                    emoji: '🚚'
                },
                {
                    label: 'Sostituzione/Rimborso',
                    description: 'Problemi con un prodotto',
                    value: 'replacement',
                    emoji: '🔄'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await message.channel.send({ embeds: [embed], components: [row] }).catch(() => {});
        await message.delete().catch(() => {});
        console.log('[CMD] Pannello ticket FANCY creato');
        return;
    }
});

client.on(Events.InteractionCreate, async interaction => {
    try {
        // GESTIONE MENU DROPDOWN
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            if (!interaction.guild) {
                return interaction.reply({ content: '❌ Usa i ticket nel server!', flags: 64 }).catch(() => {});
            }

            await interaction.deferReply({ flags: 64 });

            const ticketType = interaction.values[0];
            const ticketName = `🎫・${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);
            
            const existing = interaction.guild.channels.cache.find(c => c.topic?.includes(`UserID: ${interaction.user.id}`));
            if (existing) {
                return interaction.editReply(`❌ Hai già un ticket aperto: ${existing}`).catch(() => {});
            }

            const typeNames = {
                questions: 'Domande Generali',
                general: 'Supporto Tecnico', 
                product: 'Prodotto Non Ricevuto',
                delivery: 'Consegna Manuale',
                replacement: 'Sostituzione/Rimborso'
            };

            const overwrites = [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
            ];

            if (STAFF_ROLE_ID) {
                overwrites.push({ id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages] });
            }

            const channel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                topic: `Ticket di ${interaction.user.tag} | Tipo: ${typeNames[ticketType]} | UserID: ${interaction.user.id}`,
                parent: TICKET_CATEGORY_ID,
                permissionOverwrites: overwrites
            });

            await interaction.editReply(`✅ Ticket creato: ${channel}`).catch(() => {});

            const ticketEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle(`Ticket Aperto: ${typeNames[ticketType]}`)
                .setDescription(`Ciao <@${interaction.user.id}>! 👋\n\nLo staff ti risponderà il prima possibile.\nNel frattempo descrivi il tuo problema in dettaglio.`)
                .addFields(
                    { name: '👤 Utente', value: `${interaction.user.tag}`, inline: true },
                    { name: '📂 Categoria', value: `${typeNames[ticketType]}`, inline: true },
                    { name: '🕐 Aperto', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true }
                )
                .setFooter({ text: `ID: ${interaction.user.id}` })
                .setTimestamp();

            const closeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Chiudi Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_claim')
                    .setLabel('Claim Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✋')
            );

            await channel.send({ content: `<@${interaction.user.id}>`, embeds: [ticketEmbed], components: [closeButton] }).catch(() => {});
            console.log(`[TICKET] Creato ${channel.name} per ${ticketType}`);
            return;
        }

        // GESTIONE PULSANTI
        if (interaction.isButton()) {
            if (interaction.customId === 'ticket_close') {
                if (!interaction.guild) return;
                await interaction.reply({ content: '🔒 Il ticket verrà chiuso tra 5 secondi...' });
                setTimeout(() => interaction.channel?.delete().catch(() => {}), 5000);
                return;
            }

            if (interaction.customId === 'ticket_claim') {
                await interaction.reply({ content: `✋ Ticket preso in carico da ${interaction.user}`, flags: 64 });
                await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0xFFFF00).setDescription(`✋ ${interaction.user} ha preso in carico il ticket.`)] }).catch(() => {});
                return;
            }
        }

    } catch (error) {
        console.error('[ERRORE INTERACTION]', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ Errore interno. Riprova.' }).catch(() => {});
        } else {
            await interaction.reply({ content: '❌ Errore interno. Riprova.', flags: 64 }).catch(() => {});
        }
    }
});

process.on('unhandledRejection', error => console.error('[CRASH]', error));
process.on('uncaughtException', error => console.error('[CRASH]', error));

client.login(process.env.DISCORD_TOKEN);
