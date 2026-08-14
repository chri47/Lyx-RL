const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

console.log('[BOOT] LYX RL Modular Bot v8 - COMPLETO');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

// ========== CONFIG ==========
const TICKET_CATEGORY_ID = null;
const STAFF_ROLE_ID = null;
const LTC_WALLET = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35';
const BANNER_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a7fc69d&is=6a7e751d&hm=8db49fa8387aac86eadf61006bf726c4a633805f35c598496e2bf8554db60dc1&=&format=webp&quality=lossless&width=768&height=428';
const REVIEW_CHANNEL_NAME = '🔍・vouches';
const WEBSITE_URL = 'https://lyxrlservices.mysellauth.com/';
const ORDER_CHANNEL_ID = '1530144020154552380';
const ORDER_WEBHOOK_SECRET = 'lyx_rl_secret_2026';
const GUILD_ID = '1530144020154552380'; // OBBLIGATORIO PER /recensione
const STAFF_MEMBERS = [
    { name: 'iDanger', id: '1327759048858140794' },
    { name: 'iCocoo', id: '1143252603342438490' },
    { name: 'Lyx RL', id: '1530147790687174677' }
];
// ============================

// ========== SLASH COMMANDS ==========
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
    console.log(`[ONLINE] ${c.user.tag} V8 ATTIVO`);

    if (GUILD_ID === '1530144020154552380') {
        console.log('[WARN] METTI GUILD_ID nel config per attivare /recensione');
        return;
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(c.user.id, GUILD_ID), { body: commands });
        console.log('[SLASH] /recensione registrato');
    } catch (error) {
        console.error('[SLASH ERROR]', error);
    }
});

// ========== COMANDI MESSAGGIO ==========
client.on(Events.MessageCreate, async message => {
    if (message.author.bot ||!message.guild) return;

    //!setup-ticket
    if (message.content === '!setup-ticket' && message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
.setColor(0xFF0000)
.setTitle('🔥 𝙇𝙔𝙓 𝙍𝙇 | 𝙎𝙐𝙋𝙊𝙍𝙏𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈')
.setDescription(`
\`\`\`ansi
[2;31m[1;31m╔═══════════════════════════════════════╗
║ [1;37m𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙏𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝙎𝙐𝙋𝙊𝙍𝙏[0m[1;31m ║
╚═══════════════════════════════════════╝[0m
\`\`\`

> 🛡️ **𝗦𝘂𝗽𝗼𝗿𝘁𝗼 𝗣𝗿𝗶𝗼𝗿𝗶𝘁𝗮𝗿𝗶𝗼 𝟮𝟰/𝟳**
> 🔒 **𝗧𝗶𝗰𝗸𝗲𝘁 𝟭𝟬𝟬% 𝗣𝗿𝗶𝘃𝗮𝘁𝗶 & 𝗦𝗶𝗰𝘂𝗿𝗶**
> ⚡ **𝗥𝗶𝘀𝗽𝗼𝘀𝘁𝗮 𝗚𝗮𝗿𝗮𝗻𝘁𝗶𝘁𝗮 < 𝟱𝗺**

\`\`\`diff
+ SELEZIONA LA CATEGORIA DEL TUO PROBLEMA
\`\`\`
`)
.setImage(BANNER_URL)
.setThumbnail(message.guild.iconURL())
.setFooter({ text: '𝙇𝙔𝙓 𝙍𝙇 𝙎𝙚𝙧𝙫𝙞𝙘𝙚𝙨 • 𝙋𝙧𝙚𝙢𝙞𝙪𝙢 𝘼𝙪𝙧𝙖', iconURL: client.user.displayAvatarURL() })
.setTimestamp();

        const menu = new StringSelectMenuBuilder()
.setCustomId('ticket_select')
.setPlaceholder('⚡ 𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝗶𝗮 𝗽𝗿𝗲𝗺𝗶𝘂𝗺...')
.addOptions([
                { label: '𝗗𝗼𝗺𝗮𝗻𝗱𝗲 & 𝗜𝗻𝗳𝗼', description: 'Informazioni generali su servizi e prodotti', value: 'questions', emoji: '❓' },
                { label: '𝗦𝘂𝗽𝗽𝗼𝗿𝘁𝗼 𝗧𝗲𝗰𝗻𝗶𝗰𝗼 𝗩𝗜𝗣', description: 'Problemi tecnici, accesso, configurazione', value: 'general', emoji: '🛠️' },
                { label: '𝗢𝗿𝗱𝗶𝗻𝗲 𝗡𝗼𝗻 𝗥𝗶𝗰𝗲𝘃𝘂𝘁𝗼', description: 'Non hai ricevuto il tuo acquisto', value: 'product', emoji: '📦' },
                { label: '𝗖𝗼𝗻𝘀𝗲𝗴𝗻𝗮 𝗣𝗿𝗶𝗼𝗿𝗶𝘁𝗮𝗿𝗶𝗮', description: 'Richiedi consegna manuale immediata', value: 'delivery', emoji: '🚀' },
                { label: '𝗥𝗶𝗺𝗯𝗼𝗿𝘀𝗼/𝗦𝗼𝘀𝘁𝗶𝘁𝘂𝘇𝗶𝗼𝗻𝗲', description: 'Garanzia e assistenza post-vendita', value: 'replacement', emoji: '💎' }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);
        await message.channel.send({ embeds: [embed], components: [row] }).catch(() => {});
        await message.delete().catch(() => {});
        return;
    }

    //!ltc
    if (message.content === '!ltc') {
        if (!message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: '❌ 𝗔𝗰𝗲𝘀𝗼 𝗻𝗲𝗴𝗮𝘁𝗼. 𝗦𝗼𝗹𝗼 𝗦𝘁𝗮𝗳 𝗟𝗬𝗫 𝗥𝗟.', flags: 64 }).then(m => setTimeout(() => m.delete().catch(()=>{}), 3000));
        }

        const embed = new EmbedBuilder()
.setColor(0x000000)
.setAuthor({ name: '𝙇𝙔𝙓 𝙍𝙇 | 𝙋𝘼𝙂𝘼𝙈𝙀𝙉𝙏𝙊 𝙐𝙁𝙄𝘾𝙄𝘼𝙇𝙀', iconURL: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png' })
.setTitle('💎 𝗟𝗜𝗧𝗘𝗖𝗢𝗜𝗡 [𝗟𝗧𝗖] - 𝗚𝗔𝗧𝗘𝗪𝗔𝗬 𝗣𝗥𝗘𝗠𝗜𝗨𝗠')
.setDescription(`
\`\`\`ansi
[2;31m[1;31m╔═══════════════════════════════════════╗
║ [1;37m⚠️ 𝗔𝗧𝗘𝗡𝗭𝗜𝗢𝗡𝗘 𝗠𝗔𝗦𝗜𝗠𝗔 ⚠️[0m[1;31m ║
║ [1;37m𝗜𝗡𝗩𝗜𝗔𝗥𝗘 𝗦𝗢𝗟𝗢 𝗟𝗧𝗖 𝗦𝗨 𝗤𝗨𝗘𝗦𝗧𝗢[0m[1;31m ║
║ [1;37m𝗔𝗟𝗧𝗥𝗜 𝗧𝗢𝗞𝗘𝗡 = 𝗣𝗘𝗥𝗦𝗜 𝗣𝗘𝗥 𝗦𝗘𝗠𝗣𝗥𝗘[0m[1;31m ║
╚═══════════════════════════════════════╝[0m
\`\`\`
**𝗜𝗻𝘃𝗶𝗮 𝗹'𝗶𝗺𝗽𝗼𝗿𝘁𝗼 𝗲𝘀𝗮𝘁𝗼 𝗽𝗲𝗿 𝗮𝘁𝗶𝘃𝗮𝘇𝗶𝗼𝗻𝗲 𝗶𝗺𝗲𝗱𝗶𝗮𝘁𝗮.**`)
.setThumbnail('https://cryptologos.cc/logos/litecoin-ltc-logo.png')
.addFields(
              { name: '▬▬▬▬▬ 𝗪𝗔𝗟𝗘𝗧 ▬▬▬▬▬', value: `\`\`\`yaml\n${LTC_WALLET}\n\`\`\``, inline: false },
              { name: '🌐 𝗡𝗲𝘁𝘄𝗼𝗿𝗸', value: '`𝙇𝙞𝙩𝙚𝙘𝙤𝙞𝙣`', inline: true },
              { name: '⚡ 𝗦𝗽𝗲𝗱', value: '`𝙄𝙣𝙨𝙩𝙖𝙣𝙩`', inline: true },
              { name: '🛡️ 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆', value: '`𝙑𝙚𝙧𝙞𝙛𝙞𝙚𝙙`', inline: true }
          )
.setImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=litecoin:${LTC_WALLET}&bgcolor=000000&color=FF0000`)
.setFooter({ text: '𝙇𝙔𝙓 𝙍𝙇 𝙋𝙧𝙚𝙢𝙞𝙪𝙢 • 𝙎𝙘𝙖𝙣𝙨𝙞𝙤𝙣𝙖 𝙤 𝘾𝙤𝙥𝙞𝙖', iconURL: client.user.displayAvatarURL() })
.setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('delete_wallet_msg').setLabel('𝗘𝗹𝗶𝗺𝗶𝗻𝗮').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
            new ButtonBuilder().setCustomId('copy_wallet_btn').setLabel('𝗖𝗼𝗽𝗶𝗮 𝗪𝗮𝗹𝗲𝘁').setStyle(ButtonStyle.Primary).setEmoji('📋')
        );

        await message.channel.send({ embeds: [embed], components: [row] }).catch(() => {});
        await message.delete().catch(() => {});
        return;
    }

    //!web
    if (message.content === '!web') {
        const embed = new EmbedBuilder()
.setColor(0xFF0000)
.setTitle('🌐 𝙎𝙄𝙏𝙊 𝙐𝙁𝙄𝘾𝙄𝘼𝙇𝙀 𝙇𝙔𝙓 𝙍𝙇')
.setDescription(`
\`\`\`ansi
[2;31m[1;31m╔═══════════════════════════════════════╗
║ [1;37m𝙀𝙉𝙏𝙍𝘼 𝙉𝙀𝙇 𝙈𝙊𝙉𝘿𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈[0m[1;31m ║
╚═══════════════════════════════════════╝[0m
\`\`\`

> 🔥 **𝗣𝗿𝗼𝗱𝗼𝘁𝗶 𝗘𝘀𝗰𝗹𝘂𝘀𝗶𝘃𝗶**
> ⚡ **𝗖𝗼𝗻𝘀𝗲𝗴𝗻𝗮 𝗜𝗺𝗲𝗱𝗶𝗮𝘁𝗮**
> 🛡️ **𝗦𝘂𝗽𝗽𝗼𝗿𝘁𝗼 𝗩𝗜𝗣 𝟮𝟰/𝟳**
> 💎 **𝗤𝘂𝗮𝗹𝗶𝘁à 𝗚𝗮𝗿𝗮𝗻𝘁𝗶𝘁𝗮**

\`\`\`diff
+ Clicca il pulsante qui sotto per accedere
\`\`\`
`)
.setThumbnail(message.guild.iconURL())
.setFooter({ text: '𝙇𝙔𝙓 𝙍𝙇 𝙎𝙚𝙧𝙫𝙞𝙘𝙚𝙨 • 𝘼𝙪𝙧𝙖 𝙋𝙧𝙚𝙢𝙞𝙪𝙢', iconURL: client.user.displayAvatarURL() })
.setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
        .setLabel('𝙑𝙄𝙎𝙄𝙏𝘼 𝙄𝙇 𝙎𝙄𝙏𝙊')
        .setStyle(ButtonStyle.Link)
        .setURL(WEBSITE_URL)
        .setEmoji('🌐')
        );

        await message.channel.send({ embeds: [embed], components: [row] }).catch(() => {});
        await message.delete().catch(() => {});
        return;
    }

    //!stats
    if (message.content === '!stats') {
        await message.guild.members.fetch();

        const totalMembers = message.guild.memberCount;
        const onlineMembers = message.guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd').size;
        const bots = message.guild.members.cache.filter(m => m.user.bot).size;
        const humans = totalMembers - bots;
        const boostLevel = message.guild.premiumTier;
        const boostCount = message.guild.premiumSubscriptionCount;

        const embed = new EmbedBuilder()
.setColor(0xFF0000)
.setTitle('📊 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙃𝙀 𝙎𝙀𝙍𝙑𝙀𝙍 𝙇𝙔𝙓 𝙍𝙇')
.setThumbnail(message.guild.iconURL())
.setDescription(`
\`\`\`ansi
[2;31m[1;31m╔═══════════════════════════════════════╗
║ [1;37m𝘿𝘼𝙏𝙄 𝙄𝙉 𝙏𝙀𝙈𝙋𝙊 𝙍𝙀𝘼𝙇𝙀[0m[1;31m ║
╚═══════════════════════════════════════╝[0m
\`\`\`
`)
.addFields(
              { name: '👥 𝗠𝗲𝗺𝗯𝗿𝗶 𝗧𝗼𝘁𝗮𝗹𝗶', value: `\`\`\`yaml\n${totalMembers}\n\`\`\``, inline: true },
              { name: '🟢 𝗢𝗻𝗹𝗶𝗻𝗲', value: `\`\`\`yaml\n${onlineMembers}\n\`\`\``, inline: true },
              { name: '👤 𝗨𝘁𝗲𝗻𝘁𝗶', value: `\`\`\`yaml\n${humans}\n\`\`\``, inline: true },
              { name: '🤖 𝗕𝗼𝘁', value: `\`\`\`yaml\n${bots}\`\`\``, inline: true },
              { name: '💎 𝗕𝗼𝘀𝘁 𝗟𝗶𝘃𝗲𝗹𝗹𝗼', value: `\`\`\`yaml\nLivello ${boostLevel}\n\`\`\``, inline: true },
              { name: '🚀 𝗕𝗼𝗼𝘀𝘁 𝗧𝗼𝘁𝗮𝗹𝗶', value: `\`\`\`yaml\n${boostCount}\n\`\`\``, inline: true }
          )
.setFooter({ text: `𝙍𝙞𝙘𝙝𝙞𝙚𝙨𝙩𝙤 𝙙𝙖 ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
.setTimestamp();

        await message.channel.send({ embeds: [embed] }).catch(() => {});
        await message.delete().catch(() => {});
        return;
    }
});

// ========== INTERAZIONI ==========
client.on(Events.InteractionCreate, async interaction => {
    try {
        // /recensione
        if (interaction.isChatInputCommand() && interaction.commandName === 'recensione') {
            const staffId = interaction.options.getString('staff');
            const motivo = interaction.options.getString('motivo');
            const staffMember = STAFF_MEMBERS.find(s => s.id === staffId);

            const reviewEmbed = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('⭐ 𝙉𝙐𝙊𝙑𝘼 𝙍𝙀𝘾𝙀𝙉𝙎𝙄𝙊𝙉𝙀 𝙋𝙍𝙀𝙈𝙄𝙐𝙈')
    .setThumbnail(interaction.user.displayAvatarURL())
    .setDescription(`
\`\`\`ansi
[2;31m[1;31m╔═══════════════════════════════════════╗
║ [1;37m𝙁𝙀𝘿𝘽𝘼𝘾𝙆 𝘾𝙇𝙄𝙀𝙉𝙏𝙀 𝙑𝙄𝙋[0m[1;31m ║
╚═══════════════════════════════════════╝[0m
\`\`\`
`)
    .addFields(
                { name: '👤 𝗖𝗹𝗶𝗲𝗻𝘁𝗲', value: `${interaction.user}`, inline: true },
                { name: '👑 𝗦𝘁𝗮𝗳𝗳', value: `<@${staffId}>`, inline: true },
                { name: '📅 𝗗𝗮𝘁𝗮', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
                { name: '💬 𝗥𝗲𝗰𝗲𝗻𝘀𝗶𝗼𝗻𝗲', value: `\`\`\`${motivo}\`\`\``, inline: false }
            )
    .setFooter({ text: '𝙇𝙔𝙓 𝙍𝙇 𝙍𝙚𝙫𝙞𝙚𝙬𝙨 𝙎𝙮𝙨𝙩𝙚𝙢 • 𝙂𝙧𝙖𝙯𝙞𝙚 𝙥𝙚𝙧 𝙞𝙡 𝙛𝙚𝙚𝙙𝙗𝙖𝙘𝙠', iconURL: interaction.guild.iconURL() })
    .setTimestamp();

            const reviewChannel = interaction.guild.channels.cache.find(c => c.name.includes(REVIEW_CHANNEL_NAME));
            if (reviewChannel) {
                await reviewChannel.send({ embeds: [reviewEmbed] });
                await interaction.reply({ content: `✅ **𝗥𝗲𝗰𝗲𝗻𝘀𝗶𝗼𝗻𝗲 𝗽𝗲𝗿 ${staffMember.name} 𝗶𝗻𝘃𝗶𝗮𝘁𝗮!** 𝙂𝙧𝙖𝙯𝙞𝙚 𝙥𝙚𝙧 𝙞𝙡 𝙛𝙚𝙙𝙗𝙖𝙘𝙠 𝙥𝙧𝙚𝙢𝙞𝙪𝙢.`, flags: 64 });
            } else {
                await interaction.reply({ content: `❌ 𝗖𝗮𝗻𝗮𝗹𝗲 #${REVIEW_CHANNEL_NAME} 𝗻𝗼𝗻 𝘁𝗿𝗼𝘃𝗮𝘁𝗼. 𝗖𝗿𝗲𝗮𝗹𝗼 𝗽𝗲𝗿 𝗮𝘁𝗶𝘃𝗮𝗿𝗲 𝗹𝗲 𝗿𝗲𝗰𝗲𝗻𝘀𝗶𝗼𝗻𝗶.`, flags: 64 });
            }
            return;
        }

        // MENU TICKET
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            if (!interaction.guild) return interaction.reply({ content: '❌ 𝗨𝘀𝗮 𝗶 𝘁𝗶𝗰𝗸𝗲𝘁 𝗻𝗲𝗹 𝘀𝗲𝗿𝘃𝗲𝗿!', flags: 64 }).catch(() => {});
            await interaction.deferReply({ flags: 64 });

            const ticketType = interaction.values[0];
            const ticketName = `🔥・${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

            const existing = interaction.guild.channels.cache.find(c => c.topic?.includes(`UserID: ${interaction.user.id}`));
            if (existing) return interaction.editReply(`❌ **𝗛𝗮𝗶 𝗴𝗶à 𝘂𝗻 𝘁𝗶𝗰𝗸𝗲𝘁 𝗩𝗜𝗣 𝗮𝗽𝗲𝗿𝘁𝗼:** ${existing}`).catch(() => {});

            const typeNames = { questions: '𝗗𝗼𝗺𝗮𝗻𝗱𝗲 & 𝗜𝗻𝗳𝗼', general: '𝗦𝘂𝗽𝗽𝗼𝗿𝘁𝗼 𝗧𝗲𝗰𝗻𝗶𝗰𝗼 𝗩𝗜𝗣', product: '𝗢𝗿𝗱𝗶𝗻𝗲 𝗡𝗼𝗻 𝗥𝗶𝗰𝗲𝘃𝘂𝘁𝗼', delivery: '𝗖𝗼𝗻𝘀𝗲𝗴𝗻𝗮 𝗣𝗿𝗶𝗼𝗿𝗶𝘁𝗮𝗿𝗶𝗮', replacement: '𝗥𝗶𝗺𝗯𝗼𝗿𝘀𝗼/𝗦𝗼𝘀𝘁𝗶𝘁𝘂𝘇𝗶𝗼𝗻𝗲' };
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

            await interaction.editReply(`✅ **𝗧𝗶𝗰𝗸𝗲𝘁 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗰𝗿𝗲𝗮𝘁𝗼:** ${channel}`).catch(() => {});

            const ticketEmbed = new EmbedBuilder()
    .setColor(typeColors[ticketType])
    .setTitle(`🔥 𝙏𝙄𝘾𝙆𝙀𝙏 𝙑𝙄𝙋 𝘼𝙋𝙀𝙍𝙏𝙊`)
    .setDescription(`
\`\`\`ansi
[2;31m[1;31m╔═══════════════════════════════════════╗
║ [1;37m𝘽𝙀𝙉𝙑𝙀𝙉𝙐𝙏𝙊 𝙉𝙀𝙇 𝙎𝙐𝙋𝙊𝙍𝙏𝙊 𝙑𝙄𝙋[0m[1;31m ║
╚═══════════════════════════════════════╝[0m
\`\`\`

**𝗕𝗲𝗻𝘃𝗲𝗻𝘂𝘁𝗼 <@${interaction.user.id}>**

▬▬▬

𝗦𝗲𝗶 𝗶𝗻 𝗰𝗼𝗻𝘁𝗮𝘁𝗼 𝗰𝗼𝗻 𝗶𝗹 **𝗧𝗲𝗮𝗺 𝗟𝗬𝗫 𝗥𝗟 𝗣𝗿𝗲𝗺𝗶𝘂𝗺**.
𝗗𝗲𝘀𝗰𝗿𝗶𝘃𝗶 𝗶𝗹 𝘁𝘂𝗼 𝗽𝗿𝗼𝗯𝗹𝗲𝗺𝗮 𝗶𝗻 𝗱𝗲𝘁𝘁𝗮𝗴𝗹𝗶𝗼 𝗽𝗲𝗿 𝗮𝘀𝗶𝘀𝘁𝗲𝗻𝘇𝗮 𝗽𝗿𝗶𝗼𝗿𝗶𝘁𝗮𝗿𝗶𝗮.

▬▬▬▬▬▬▬▬▬▬▬
`)
    .addFields(
                    { name: '👤 𝗖𝗹𝗶𝗲𝗻𝘁𝗲 𝗩𝗜𝗣', value: `\`\`\`${interaction.user.tag}\`\`\``, inline: true },
                    { name: '📂 𝗥𝗲𝗽𝗮𝗿𝘁𝗼', value: `\`\`\`${typeNames[ticketType]}\`\`\``, inline: true },
                    { name: '🕐 𝗔𝗽𝗲𝗿𝘁𝗼', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true },
                    { name: '🎫 𝗧𝗶𝗰𝗸𝗲𝘁 𝗜𝗗', value: `\`\`\`${channel.id.slice(-6)}\`\`\``, inline: true },
                    { name: '⚡ 𝗣𝗿𝗶𝗼𝗿𝗶𝘁à', value: '`𝙈𝘼𝙎𝙄𝙈𝘼`', inline: true },
                    { name: '🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀', value: '`𝘼𝙏𝙄𝙑𝙊`', inline: true }
                )
    .setThumbnail(interaction.user.displayAvatarURL())
    .setFooter({ text: `𝙇𝙔𝙓 𝙍𝙇 𝙋𝙧𝙚𝙢𝙞𝙪𝙢 𝙎𝙪𝙥𝙤𝙧𝙩 • 𝙄𝘿: ${interaction.user.id}` })
    .setTimestamp();

            const closeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_close').setLabel('𝗖𝗵𝗶𝘂𝗱𝗶 𝗧𝗶𝗰𝗸𝗲𝘁').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                new ButtonBuilder().setCustomId('ticket_claim').setLabel('𝗣𝗿𝗲𝗻𝗱𝗶 𝗶𝗻 𝗖𝗮𝗿𝗶𝗰𝗼').setStyle(ButtonStyle.Primary).setEmoji('👑')
            );

            await channel.send({ content: `||<@${interaction.user.id}>||`, embeds: [ticketEmbed], components: [closeButton] }).catch(() => {});
            return;
        }

        // PULSANTI
        if (interaction.isButton()) {
            if (interaction.customId === 'ticket_close') {
                await interaction.reply({ content: '🔒 **𝗖𝗵𝗶𝘂𝘀𝘂𝗿𝗮 𝘁𝗶𝗰𝗸𝗲𝘁 𝗶𝗻 𝗰𝗼𝗿𝘀𝗼... 𝟱 𝘀𝗲𝗰𝗼𝗻𝗱𝗶**' });
                setTimeout(() => interaction.channel?.delete().catch(() => {}), 5000);
                return;
            }
            if (interaction.customId === 'ticket_claim') {
                await interaction.reply({ content: `👑 **𝗧𝗶𝗰𝗸𝗲𝘁 𝗿𝗶𝘃𝗲𝗻𝗱𝗶𝗰𝗮𝘁𝗼 𝗱𝗮:** ${interaction.user}`, flags: 64 });
                await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0xFF0000).setDescription(`👑 **${interaction.user}** 𝗵𝗮 𝗽𝗿𝗲𝘀𝗼 𝗶𝗻 𝗰𝗮𝗿𝗶𝗰𝗼 𝗶𝗹 𝘁𝗶𝗰𝗸𝗲𝘁 𝗽𝗿𝗲𝗺𝗶𝘂𝗺.`)] }).catch(() => {});
                return;
            }
            if (interaction.customId === 'delete_wallet_msg') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ 𝗦𝗼𝗹𝗼 𝗦𝘁𝗮𝗳𝗳 𝗟𝗬𝗫 𝗥𝗟 𝗽𝘂ò 𝗲𝗹𝗶𝗺𝗶𝗻𝗮𝗿𝗲.', flags: 64 });
                await interaction.message.delete().catch(() => {});
                return;
            }
            if (interaction.customId === 'copy_wallet_btn') {
                await interaction.reply({
                    content: `📋 **𝗪𝗮𝗹𝗲𝘁 𝗟𝗧𝗖 𝗖𝗼𝗽𝗶𝗮𝗯𝗶𝗹𝗲:**\n\`\`\`yaml\n${LTC_WALLET}\n\`\`\`\n*𝗣𝗖: 𝗖𝗹𝗶𝗰𝗮 𝟯 𝘃𝗼𝗹𝘁𝗲 𝘀𝘂𝗹 𝘁𝗲𝘀𝘁𝗼 𝗽𝗲𝗿 𝘀𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮𝗿𝗲 𝘁𝘂𝘁𝗼*\n*𝗠𝗼𝗯𝗶𝗹𝗲: 𝗧𝗶𝗲𝗻𝗶 𝗽𝗿𝗲𝗺𝘂𝘁𝗼 𝘀𝘂𝗹 𝘁𝗲𝘀𝘁𝗼*`,
                    flags: 64
                });
                return;
            }
        }

    } catch (error) {
        console.error('[ERRORE INTERACTION]', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: '❌ 𝗘𝗿𝗼𝗿𝗲 𝘀𝗶𝘀𝘁𝗲𝗺𝗮 𝗽𝗿𝗲𝗺𝗶𝘂𝗺. 𝗥𝗶𝗽𝗿𝗼𝘃𝗮.' }).catch(() => {});
        } else {
            await interaction.reply({ content: '❌ 𝗘𝗿𝗼𝗿𝗲 𝘀𝗶𝘀𝘁𝗲𝗺𝗮 𝗽𝗿𝗲𝗺𝗶𝘂𝗺. 𝗥𝗶𝗽𝗿𝗼𝘃𝗮.', flags: 64 }).catch(() => {});
        }
    }
});

// ========== WEBHOOK SERVER PER ORDINI DAL SITO ==========
const app = express();
app.use(express.json());

app.post('/order', async (req, res) => {
    if (req.headers['x-webhook-secret']!== ORDER_WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { customer, product, price, order_id, anonymous } = req.body;

    if (!product ||!price) {
        return res.status(400).json({ error: 'Missing product or price' });
    }

    try {
        const orderChannel = await client.channels.fetch(ORDER_CHANNEL_ID).catch(() => null);
        if (!orderChannel) {
            return res.status(500).json({ error: 'Order channel not found' });
        }

        const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('💰 𝙉𝙐𝙊𝙑𝙊 𝙊𝙍𝘿𝙄𝙉𝙀 𝙍𝙄𝘾𝙀𝙑𝙐𝙏𝙊')
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/3144/3144456.png')
    .setDescription(`
\`\`\`ansi
[2;32m[1;32m╔═══════════════════════════════════════╗
║ [1;37m𝙆𝘼-𝘾𝙃𝙄𝙉𝙂! 𝙑𝙀𝙉𝘿𝙄𝙏𝘼 𝘾𝙊𝙈𝙋𝙇𝙀𝙏𝘼𝙏𝘼[0m[1;32m ║
╚═══════════════════════════════════════╝[0m
\`\`\`
`)
    .addFields(
                { name: '👤 𝗖𝗹𝗶𝗲𝗻𝘁𝗲', value: anonymous? '`𝘼𝙣𝙤𝙣𝙞𝙢𝙤`' : `\`\`\`${customer || 'N/A'}\`\`\``, inline: true },
                { name: '📦 𝗣𝗿𝗼
