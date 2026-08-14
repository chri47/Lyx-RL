const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, PermissionsBitField } = require('discord.js');

let Canvas;
try {
    Canvas = require('canvas');
} catch (e) {
    console.log('Canvas non caricato, welcome userà solo testo');
}

// --- CONFIG ---
const VERIFIED_ROLE_ID = '1530144188333817897';
const STAFF_ROLE_ID = '1530144125599612978';
const WELCOME_CHANNEL_NAME = 'welcome';
const VOUCHES_CHANNEL_NAME = '🔍・vouches';
const LOGS_CHANNEL_NAME = 'logs';
const LTC_ADDRESS = 'ltc1q4cunrt3ahlcktl7gdn9svq9uwenvzkacmgyq35'; // CAMBIA COL TUO
const WEBSITE_URL = https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428'; // CAMBIA COL TUO
const BANNER_URL = 'https://media.discordapp.net/attachments/1529233083801407690/1537640293019557909/B817CFC1-8E2C-4FEF-9B69-632FA585D7AC.png?ex=6a806f5d&is=6a7f1ddd&hm=3cf40269e7b1f7e9fce71a0d6a3cc1810a5700360714dd017e07c31e7c600d97&=&format=webp&quality=lossless&width=768&height=428'; // CAMBIA COL TUO
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

// --- WELCOME CON BANNER + FALLBACK ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === WELCOME_CHANNEL_NAME);
    if (!channel) return console.log('Canale welcome non trovato');

    // Se Canvas non funziona, manda solo testo
    if (!Canvas) {
        return channel.send(`🎉 Benvenuto ${member}!\nSei il membro #${member.guild.memberCount}`);
    }

    try {
        const { createCanvas, loadImage } = Canvas;
        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext('2d');

        const background = await loadImage(BANNER_URL);
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
        await channel.send({ content: `🎉 Benvenuto ${member}!`, files: [attachment] });
    } catch (error) {
        console.error('Errore banner, uso fallback testo:', error);
        await channel.send(`🎉 Benvenuto ${member}!\nSei il membro #${member.guild.memberCount}`);
    }
});

// --- COMANDI ---
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        // PING
        if (command === 'ping') {
            return message.reply('Pong! 🏓 Bot online');
        }

        // TEST WELCOME
        if (command === 'testwelcome' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            client.emit('guildMemberAdd', message.member);
            return message.reply('Test welcome inviato ✅');
        }

        // LTC ADDRESS
        if (command === 'ltc') {
            const embed = new EmbedBuilder()
             .setTitle('💰 INDIRIZZO LTC LYX RL')
             .setDescription(`\`\`\`${LTC_ADDRESS}\`\`\``)
             .setColor('#345D9D')
             .setFooter({ text: 'Invia solo LTC a questo indirizzo' });
            return message.reply({ embeds: [embed] });
        }

        // SETUP VERIFY
        if (command === 'setupverify' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
             .setTitle('✅ VERIFICA ACCOUNT')
             .setDescription('Clicca il pulsante qui sotto per verificarti e accedere al server.')
             .setColor('#00ff00');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_button').setLabel('Verificati').setStyle(ButtonStyle.Success).setEmoji('✅')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // SETUP RECENSIONE
        if (command === 'setuprecensione' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
             .setTitle('⭐ LASCIA UNA RECENSIONE')
             .setDescription('Hai acquistato da noi? Lascia una recensione cliccando il pulsante!')
             .setColor('#FFD700');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('review_button').setLabel('Lascia Recensione').setStyle(ButtonStyle.Primary).setEmoji('⭐')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // SETUP TICKET
        if (command === 'setupticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
             .setTitle('🎫 APRI UN TICKET')
             .setDescription('**IT:** Hai bisogno di supporto? Apri un ticket.\n**EN:** Need support? Open a ticket.\n**FR:** Besoin d\'aide? Ouvrez un ticket.')
             .setColor('#0099ff');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_it').setLabel('Italiano').setStyle(ButtonStyle.Secondary).setEmoji('🇮🇹'),
                new ButtonBuilder().setCustomId('ticket_en').setLabel('English').setStyle(ButtonStyle.Secondary).setEmoji('🇬🇧'),
                new ButtonBuilder().setCustomId('ticket_fr').setLabel('Français').setStyle(ButtonStyle.Secondary).setEmoji('🇫🇷')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // SETUP STATS
        if (command === 'setupstats' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const online = message.guild.members.cache.filter(m => m.presence?.status === 'online').size;
            const embed = new EmbedBuilder()
             .setTitle('📊 STATISTICHE SERVER LYX RL')
             .setDescription(`👥 **Membri Totali:** ${message.guild.memberCount}\n🟢 **Membri Online:** ${online}\n🤖 **Bot:** ${message.guild.members.cache.filter(m => m.user.bot).size}\n📅 **Server Creato:** <t:${parseInt(message.guild.createdTimestamp / 1000)}:R>`)
             .setColor('#00ff00')
             .setThumbnail(message.guild.iconURL())
             .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            return message.delete();
        }

        // SETUP WEBSITE
        if (command === 'setupwebsite' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
             .setTitle('🌐 SITO UFFICIALE LYX RL')
             .setDescription(`Clicca il pulsante qui sotto per visitare il nostro sito ufficiale.`)
             .setColor('#5865F2');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Visita il Sito').setStyle(ButtonStyle.Link).setURL(WEBSITE_URL).setEmoji('🔗')
            );

            await message.channel.send({ embeds: [embed], components: [row] });
            return message.delete();
        }

        // SAY
        if (command === 'say' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const text = args.join(' ');
            if (!text) return message.reply('Scrivi qualcosa dopo `!say` bro');
            await message.delete();
            return message.channel.send(text);
        }

        // BAN
        if (command === 'ban' && message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const user = message.mentions.users.first();
            if (!user) return message.reply('Tagga qualcuno: `!ban @utente motivo`');

            const reason = args.slice(1).join(' ') || 'Nessun motivo';
            const member = message.guild.members.cache.get(user.id);

            if (!member) return message.reply('Utente non trovato');
            if (!member.bannable) return message.reply('Non posso bannare questo utente');

            await member.ban({ reason: reason });
            return message.reply(`🔨 ${user.tag} è stato bannato. Motivo: ${reason}`);
        }

    } catch (error) {
        console.error(`Errore comando ${command}:`, error);
        message.reply('Errore durante il comando. Controlla i log bro').catch(() => {});
    }
});

// --- INTERAZIONI ---
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton()) {
            // VERIFY
            if (interaction.customId === 'verify_button') {
                const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('Verifica UID');
                const uidInput = new TextInputBuilder().setCustomId('uid_input').setLabel('Inserisci il tuo UID').setStyle(TextInputStyle.Short).setRequired(true);
                const row = new ActionRowBuilder().addComponents(uidInput);
                modal.addComponents(row);
                return interaction.showModal(modal);
            }

            // REVIEW
            if (interaction.customId === 'review_button') {
                const modal = new ModalBuilder().setCustomId('review_modal').setTitle('Lascia una Recensione');
                const starsInput = new TextInputBuilder().setCustomId('stars_input').setLabel('Stelle da 1 a 5').setStyle(TextInputStyle.Short).setRequired(true);
                const textInput = new TextInputBuilder().setCustomId('text_input').setLabel('Scrivi la tua recensione').setStyle(TextInputStyle.Paragraph).setRequired(true);
                const linkInput = new TextInputBuilder().setCustomId('link_input').setLabel('Link prova opzionale').setStyle(TextInputStyle.Short).setRequired(false);
                modal.addComponents(
                    new ActionRowBuilder().addComponents(starsInput),
                    new ActionRowBuilder().addComponents(textInput),
                    new ActionRowBuilder().addComponents(linkInput)
                );
                return interaction.showModal(modal);
            }

            // TICKET
            if (interaction.customId.startsWith('ticket_')) {
                const lang = interaction.customId.split('_')[1];
                const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
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

                const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
                const vouchesTag = vouchesChannel? `<#${vouchesChannel.id}>` : '#vouches';

                const msg = {
                    it: `Ciao ${interaction.user}, lo staff ti risponderà a breve.\nGuarda le recensioni su ${vouchesTag}`,
                    en: `Hi ${interaction.user}, staff will reply soon.\nCheck reviews at ${vouchesTag}`,
                    fr: `Salut ${interaction.user}, le staff vous répondra bientôt.\nVoir avis sur ${vouchesTag}`
                };

                await channel.send(msg[lang] || msg['it']);
                return interaction.reply({ content: `Ticket creato: ${channel}`, ephemeral: true });
            }
        }

        if (interaction.isModalSubmit()) {
            // VERIFY SUBMIT
            if (interaction.customId === 'verify_modal') {
                await interaction.deferReply({ ephemeral: true });
                const uid = interaction.fields.getTextInputValue('uid_input');
                const role = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);
                if (!role) return interaction.editReply({ content: 'Ruolo Verificato non trovato!' });

                await interaction.member.roles.add(role);

                const logs = interaction.guild.channels.cache.find(ch => ch.name === LOGS_CHANNEL_NAME);
                if (logs) logs.send(`✅ ${interaction.user.tag} verificato con UID: ${uid}`);

                return interaction.editReply({ content: `✅ Verificato! UID: ${uid}` });
            }

            // REVIEW SUBMIT
            if (interaction.customId === 'review_modal') {
                await interaction.deferReply({ ephemeral: true });
                const stars = parseInt(interaction.fields.getTextInputValue('stars_input'));
                const text = interaction.fields.getTextInputValue('text_input');
                const link = interaction.fields.getTextInputValue('link_input') || 'Nessun allegato';

                if (isNaN(stars) || stars < 1 || stars > 5) return interaction.editReply({ content: 'Le stelle devono essere un numero da 1 a 5' });

                const vouchesChannel = interaction.guild.channels.cache.find(ch => ch.name === VOUCHES_CHANNEL_NAME);
                if (!vouchesChannel) return interaction.editReply({ content: 'Canale vouches non trovato' });

                const embed = new EmbedBuilder()
                 .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                 .setTitle(`${'⭐'.repeat(stars)} ${stars}/5`)
                 .setDescription(text)
                 .addFields({ name: 'Prova', value: link })
                 .setColor('#FFD700')
                 .setTimestamp();

                await vouchesChannel.send({ embeds: [embed] });
                return interaction.editReply({ content: 'Recensione inviata! Grazie 💚' });
            }
        }
    } catch (error) {
        console.error('Errore interazione:', error);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: 'Errore, riprova bro' }).catch(() => {});
        } else {
            await interaction.reply({ content: 'Errore, riprova bro', ephemeral: true }).catch(() => {});
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
