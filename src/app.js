const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

console.log('[BOOT] LYX RL Modular Bot v4 - RED/BLACK PREMIUM');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

// ========== CONFIG ==========
const TICKET_CATEGORY_ID = null; // Metti l'ID di una categoria se vuoi tutti i ticket sotto la stessa categoria
const STAFF_ROLE_ID = null; // Metti l'ID del ruolo staff se vuoi che vedano tutti i ticket
const LTC_WALLET = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35';
const BANNER_URL = 'https://i.imgur.com/3JQZ9zL.png'; // Banner rosso/nero, cambia se vuoi
// ============================

client.once(Events.ClientReady, c => {
    console.log(`[ONLINE] ${c.user.tag} RED/BLACK MODE ATTIVO`);
});

// ========== COMANDI MESSAGGIO ==========
client.on(Events.MessageCreate, async message => {
    if (message.author.bot ||!message.guild) return;

    // COMANDO SETUP TICKET PREMIUM
    if (message.content === '!setup-ticket' && message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {

        const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🔥 LYX RL | SUPPORTO PREMIUM')
        .setDescription('**Benvenuto nel centro assistenza ufficiale**\n\n▬▬▬▬\n\n> 🛡️ **Supporto Prioritario 24/7**\n> 🔒 **Ticket 100% Privati**\n> ⚡ **Risposta Garantita**\n\n▬▬▬▬▬\n\n**Seleziona la categoria del tuo problema:**')
        .setImage(BANNER_URL)
        .setThumbnail(message.guild.iconURL())
        .setFooter({
              text: 'LYX RL Services • Premium Support',
              iconURL: client.user.displayAvatarURL()
          })
        .setTimestamp();

        const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('⚡ Seleziona categoria premium...')
        .addOptions([
                {
                    label: 'Domande & Info',
                    description: 'Informazioni generali su servizi e prodotti',
                    value: 'questions',
                    emoji: '❓'
                },
                {
                    label: 'Supporto Tecnico VIP',
                    description: 'Problemi tecnici, accesso, configurazione',
                    value: 'general',
                    emoji: '🛠️'
                },
                {
                    label: 'Ordine Non Ricevuto',
                    description: 'Non hai ricevuto il tuo acquisto',
                    value: 'product',
                    emoji: '📦'
                },
                {
                    label: 'Consegna Prioritaria',
                    description: 'Richiedi consegna manuale immediata',
                    value: 'delivery',
                    emoji: '🚀'
                },
                {
                    label: 'Rimborso/Sostituzione',
                    description: 'Garanzia e assistenza post-vendita',
                    value: 'replacement',
                    emoji: '💎'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await message.channel.send({ embeds: [embed], components: [row] }).catch(() => {});
        await message.delete().catch(() => {});
        console.log('[CMD] Pannello ticket RED/BLACK creato');
        return;
    }

    // COMANDO!LTC PREMIUM
    if (message.content === '!ltc') {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: '❌ Accesso negato. Solo Staff LYX RL.', flags: 64 }).then(m => setTimeout(() => m.delete().catch(()=>{}), 3000));
        }

        const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setAuthor({
              name: 'LYX RL | PAGAMENTO UFFICIALE',
              iconURL: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png'
          })
      .setTitle('💎 LITECOIN [LTC] - GATEWAY PREMIUM')
      .setDescription('```diff\n- ATTENZIONE: INVIARE SOLO LTC SU QUESTO INDIRIZZO\n- ALTRI TOKEN VERRANNO PERSI PER SEMPRE\n```\n**Invia l\'importo esatto per attivazione immediata.**')
      .setThumbnail('https://cryptologos.cc/logos/litecoin-ltc-logo.png')
      .addFields(
              {
                  name: '▬▬▬▬ WALLET ▬▬▬▬▬▬',
                  value: `\`\`\`${LTC_WALLET}\`\`\``,
                  inline: false
              },
              {
                  name: '🌐 Network',
                  value: '`Litecoin`',
                  inline: true
              },
              {
                  name: '⚡ Speed',
                  value: '`Instant`',
                  inline: true
              },
              {
                  name: '🛡️ Security',
                  value: '`Verified`',
                  inline: true
              }
          )
      .setImage(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=litecoin:${LTC_WALLET}&bgcolor=000000&color=FF0000`)
      .setFooter({
              text: 'LYX RL Premium • Scansiona o Copia',
              iconURL: client.user.displayAvatarURL()
          })
      .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
          .setCustomId('delete_wallet_msg')
          .setLabel('Elimina')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️'),
            new ButtonBuilder()
          .setLabel('Copia Wallet')
          .setStyle(ButtonStyle.Secondary)
          .setCustomId('copy_wallet')
          .setEmoji('📋')
          .setDisabled(true)
        );

        await message.channel.send({ embeds: [embed], components: [row] }).catch(() => {});
        await message.delete().catch(() => {});
        console.log(`[PAYMENT] LTC RED/BLACK mostrato da ${message.author.tag}`);
        return;
    }
});

// ========== INTERAZIONI PULSANTI E MENU ==========
client.on(Events.InteractionCreate, async interaction => {
    try {
        // GESTIONE MENU DROPDOWN TICKET
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            if (!interaction.guild) {
                return interaction.reply({ content: '❌ Usa i ticket nel server!', flags: 64 }).catch(() => {});
            }

            await interaction.deferReply({ flags: 64 });

            const ticketType = interaction.values[0];
            const ticketName = `🔥・${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

            const existing = interaction.guild.channels.cache.find(c => c.topic?.includes(`UserID: ${interaction.user.id}`));
            if (existing) {
                return interaction.editReply(`❌ **Hai già un ticket VIP aperto:** ${existing}`).catch(() => {});
            }

            const typeNames = {
                questions: 'Domande & Info',
                general: 'Supporto Tecnico VIP',
                product: 'Ordine Non Ricevuto',
                delivery: 'Consegna Prioritaria',
                replacement: 'Rimborso/Sostituzione'
            };

            const typeColors = {
                questions: 0x3498DB,
                general: 0xFF0000,
                product: 0xE67E22,
                delivery: 0x9B59B6,
                replacement: 0x1ABC9C
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
                topic: `🔥 TICKET VIP | ${interaction.user.tag} | Tipo: ${typeNames[ticketType]} | UserID: ${interaction.user.id}`,
                parent: TICKET_CATEGORY_ID,
                permissionOverwrites: overwrites
            });

            await interaction.editReply(`✅ **Ticket Premium creato:** ${channel}`).catch(() => {});

            const ticketEmbed = new EmbedBuilder()
            .setColor(typeColors[ticketType])
            .setTitle(`🔥 TICKET VIP APERTO`)
            .setDescription(`**Benvenuto <@${interaction.user.id}>**\n\n▬▬▬\n\nSei in contatto con il **Team LYX RL Premium**.\nDescrivi il tuo problema in dettaglio per assistenza prioritaria.\n\n▬▬▬`)
            .addFields(
                    { name: '👤 Cliente VIP', value: `${interaction.user.tag}`, inline: true },
                    { name: '📂 Reparto', value: `${typeNames[ticketType]}`, inline: true },
                    { name: '🕐 Aperto', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true },
                    { name: '🎫 Ticket ID', value: `\`${channel.id.slice(-6)}\``, inline: true },
                    { name: '⚡ Priorità', value: '`MASSIMA`', inline: true },
                    { name: '🛡️ Status', value: '`ATTIVO`', inline: true }
                )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: `LYX RL Premium Support • ID: ${interaction.user.id}` })
            .setTimestamp();

            const closeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Chiudi Ticket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒'),
                new ButtonBuilder()
                .setCustomId('ticket_claim')
                .setLabel('Prendi in Carico')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👑')
            );

            await channel.send({ content: `||<@${interaction.user.id}>||`, embeds: [ticketEmbed], components: [closeButton] }).catch(() => {});
            console.log(`[TICKET] RED/BLACK Creato ${channel.name} per ${ticketType}`);
            return;
        }

        // GESTIONE PULSANTI
        if (interaction.isButton()) {
            if (interaction.customId === 'ticket_close') {
                if (!interaction.guild) return;
                await interaction.reply({ content: '🔒 **Chiusura ticket in corso... 5 secondi**' });
                setTimeout(() => interaction.channel?.delete().catch(() => {}), 5000);
                return;
            }

            if (interaction.customId === 'ticket_claim') {
                await interaction.reply({ content: `👑 **Ticket rivendicato da:** ${interaction.user}`, flags: 64 });
                await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`👑 **${interaction.user}** ha preso in carico il ticket premium.`)] }).catch(() => {});
                return;
            }

            if (interaction.customId === 'delete_wallet_msg') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: '❌ Solo Staff LYX RL può eliminare.', flags: 64 });
                }
                await interaction.message.delete().catch(() => {});
                return;
            }
        }

    } catch (error) {
        console.error('[ERRORE INTERACTION]', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ Errore sistema premium. Riprova.' }).catch(() => {});
        } else {
            await interaction.reply({ content: '❌ Errore sistema premium. Riprova.', flags: 64 }).catch(() => {});
        }
    }
});

// ========== ANTI CRASH ==========
process.on('unhandledRejection', error => console.error('[CRASH]', error));
process.on('uncaughtException', error => console.error('[CRASH]', error));

client.login(process.env.DISCORD_TOKEN);
