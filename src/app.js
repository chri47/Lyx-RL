const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder, REST, Routes } = require('discord.js');

console.log('[BOOT] LYX RL Modular Bot v5 - PREMIUM PLUS COMPLETO');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

// ========== CONFIG - MODIFICA QUI ==========
const TICKET_CATEGORY_ID = null; // ID categoria ticket
const STAFF_ROLE_ID = null; // ID ruolo staff per ticket e recensioni
const LTC_WALLET = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35';
const BANNER_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428'; // CARICA TU UN BANNER SU DISCORD E METTI IL LINK
const REVIEW_CHANNEL_NAME = '🔍・vouches'; // Nome canale dove mandare le recensioni
const STAFF_MEMBERS = [ // AGGIUNGI GLI ID REALI DELLO STAFF
    { name: 'iDanger', id: '1327759048858140794' },
    { name: 'iCocoo', id: '1143252603342438490' },
    { name: 'Lyt RL', id: '1530147790687174677' }
];
// ============================

// ========== REGISTRA SLASH COMMANDS ==========
const commands = [
    new SlashCommandBuilder()
    .setName('recensione')
    .setDescription('Lascia una recensione per lo staff LYX RL')
    .addStringOption(option =>
            option.setName('staff')
              .setDescription('Scegli lo staff da recensire')
              .setRequired(true)
              .addChoices(...STAFF_MEMBERS.map(s => ({ name: s.name, value: s.id }))))
    .addStringOption(option =>
            option.setName('motivo')
              .setDescription('Descrivi la tua esperienza')
              .setRequired(true))
].map(command => command.toJSON());

client.once(Events.ClientReady, async c => {
    console.log(`[ONLINE] ${c.user.tag} RED/BLACK PREMIUM PLUS ATTIVO`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(c.user.id), { body: commands });
        console.log('[SLASH] Comando /recensione registrato');
    } catch (error) {
        console.error('[SLASH ERROR]', error);
    }
});

// ========== COMANDI MESSAGGIO ==========
client.on(Events.MessageCreate, async message => {
    if (message.author.bot ||!message.guild) return;

    // COMANDO SETUP TICKET PREMIUM
    if (message.content === '!setup-ticket' && message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {

        const embed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('🔥 LYX RL | SUPPORTO PREMIUM')
    .setDescription('**Benvenuto nel centro assistenza ufficiale**\n\n▬▬▬\n\n> 🛡️ **Supporto Prioritario 24/7**\n> 🔒 **Ticket 100% Privati**\n> ⚡ **Risposta Garantita**\n\n▬▬▬\n\n**Seleziona la categoria del tuo problema:**')
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
                { label: 'Domande & Info', description: 'Informazioni generali su servizi e prodotti', value: 'questions', emoji: '❓' },
                { label: 'Supporto Tecnico VIP', description: 'Problemi tecnici, accesso, configurazione', value: 'general', emoji: '🛠️' },
                { label: 'Ordine Non Ricevuto', description: 'Non hai ricevuto il tuo acquisto', value: 'product', emoji: '📦' },
                { label: 'Consegna Prioritaria', description: 'Richiedi consegna manuale immediata', value: 'delivery', emoji: '🚀' },
                { label: 'Rimborso/Sostituzione', description: 'Garanzia e assistenza post-vendita', value: 'replacement', emoji: '💎' }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);
        await message.channel.send({ embeds: [embed], components: [row] }).catch(() => {});
        await message.delete().catch(() => {});
        return;
    }

    // COMANDO!LTC PREMIUM - QR PICCOLO + COPIA FUNZIONANTE
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
              { name: '▬▬▬ WALLET ▬▬▬', value: `\`\`\`${LTC_WALLET}\`\`\``, inline: false },
              { name: '🌐 Network', value: '`Litecoin`', inline: true },
              { name: '⚡ Speed', value: '`Instant`', inline: true },
              { name: '🛡️ Security', value: '`Verified`', inline: true }
          )
  .setImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=litecoin:${LTC_WALLET}&bgcolor=000000&color=FF0000`)
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
      .setCustomId('copy_wallet_btn')
      .setLabel('Copia Wallet')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📋')
        );

        await message.channel.send({ embeds: [embed], components: [row] }).catch(() => {});
        await message.delete().catch(() => {});
        return;
    }
});

// ========== INTERAZIONI ==========
client.on(Events.InteractionCreate, async interaction => {
    try {
        // SLASH COMMAND /recensione
        if (interaction.isChatInputCommand() && interaction.commandName === 'recensione') {
            const staffId = interaction.options.getString('staff');
            const motivo = interaction.options.getString('motivo');
            const staffMember = STAFF_MEMBERS.find(s => s.id === staffId);

            const reviewEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('⭐ NUOVA RECENSIONE PREMIUM')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
                { name: '👤 Cliente', value: `${interaction.user}`, inline: true },
                { name: '👑 Staff', value: `<@${staffId}>`, inline: true },
                { name: '📅 Data', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
                { name: '💬 Recensione', value: `\`\`\`${motivo}\`\`\``, inline: false }
            )
        .setFooter({ text: 'LYX RL Reviews System • Grazie per il feedback', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

            const reviewChannel = interaction.guild.channels.cache.find(c => c.name.includes(REVIEW_CHANNEL_NAME));
            if (reviewChannel) {
                await reviewChannel.send({ embeds: [reviewEmbed] });
                await interaction.reply({ content: `✅ **Recensione per ${staffMember.name} inviata!** Grazie per il feedback premium.`, flags: 64 });
            } else {
                await interaction.reply({ content: `❌ Canale #${REVIEW_CHANNEL_NAME} non trovato. Crealo per attivare le recensioni.`, flags: 64 });
            }
            return;
        }

        // MENU TICKET
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            if (!interaction.guild) return interaction.reply({ content: '❌ Usa i ticket nel server!', flags: 64 }).catch(() => {});
            await interaction.deferReply({ flags: 64 });

            const ticketType = interaction.values[0];
            const ticketName = `🔥・${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

            const existing = interaction.guild.channels.cache.find(c => c.topic?.includes(`UserID: ${interaction.user.id}`));
            if (existing) return interaction.editReply(`❌ **Hai già un ticket VIP aperto:** ${existing}`).catch(() => {});

            const typeNames = { questions: 'Domande & Info', general: 'Supporto Tecnico VIP', product: 'Ordine Non Ricevuto', delivery: 'Consegna Prioritaria', replacement: 'Rimborso/Sostituzione' };
            const typeColors = { questions: 0x3498DB, general: 0xFF0000, product: 0xE67E22, delivery: 0x9B59B6, replacement: 0x1ABC9C };

            const overwrites = [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
            ];
            if (STAFF_ROLE_ID) overwrites.push({ id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages] });

            const channel = await interaction.guild.channels.create({
                name: ticketName, type: ChannelType.GuildText,
                topic: `🔥 TICKET VIP | ${interaction.user.tag} | Tipo: ${typeNames[ticketType]} | UserID: ${interaction.user.id}`,
                parent: TICKET_CATEGORY_ID, permissionOverwrites: overwrites
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
                new ButtonBuilder().setCustomId('ticket_close').setLabel('Chiudi Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                new ButtonBuilder().setCustomId('ticket_claim').setLabel('Prendi in Carico').setStyle(ButtonStyle.Primary).setEmoji('👑')
            );

            await channel.send({ content: `||<@${interaction.user.id}>||`, embeds: [ticketEmbed], components: [closeButton] }).catch(() => {});
            return;
        }

        // PULSANTI
        if (interaction.isButton()) {
            if (interaction.customId === 'ticket_close') {
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
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ Solo Staff LYX RL può eliminare.', flags: 64 });
                await interaction.message.delete().catch(() => {});
                return;
            }
            if (interaction.customId === 'copy_wallet_btn') {
                await interaction.reply({
                    content: `📋 **Wallet LTC Copiabile:**\n\`\`\`${LTC_WALLET}\`\`\`\n*PC: Clicca 3 volte sul testo per selezionare tutto*\n*Mobile: Tieni premuto sul testo*`,
                    flags: 64
                });
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

process.on('unhandledRejection', error => console.error('[CRASH]', error));
process.on('uncaughtException', error => console.error('[CRASH]', error));

client.login(process.env.DISCORD_TOKEN);
