import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

let ticketCount = 0;

export default {
    data: new SlashCommandBuilder()
.setName('ticket')
.setDescription('Sistema ticket LYK')
.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
.setDMPermission(false)
.addSubcommand(subcommand =>
        subcommand.setName('setup')
    .setDescription('Crea il pannello ticket')
    .addChannelOption(option =>
            option.setName('canale')
        .setDescription('Canale pannello')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)))
.addSubcommand(subcommand =>
        subcommand.setName('dashboard')
    .setDescription('Dashboard staff ticket'))
.addSubcommand(subcommand =>
        subcommand.setName('close')
    .setDescription('Chiudi il ticket corrente'))
.addSubcommand(subcommand =>
        subcommand.setName('add')
    .setDescription('Aggiungi utente al ticket')
    .addUserOption(option =>
            option.setName('utente')
        .setDescription('Utente da aggiungere')
        .setRequired(true)))
.addSubcommand(subcommand =>
        subcommand.setName('remove')
    .setDescription('Rimuovi utente dal ticket')
    .addUserOption(option =>
            option.setName('utente')
        .setDescription('Utente da rimuovere')
        .setRequired(true)))
.addSubcommand(subcommand =>
        subcommand.setName('rename')
    .setDescription('Rinomina il ticket')
    .addStringOption(option =>
            option.setName('nome')
        .setDescription('Nuovo nome')
        .setRequired(true))),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('canale');
            const embed = new EmbedBuilder()
        .setTitle('🎫 Supporto LYK Community')
        .setDescription('**Hai bisogno di aiuto dallo staff?**\n\nClicca il bottone qui sotto per aprire un ticket.\nLo staff ti risponderà il prima possibile.')
        .setColor(0xFF0000)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: 'LYK • Supporto veloce 24/7' });

            const button = new ActionRowBuilder()
        .addComponents(
                new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Apri un Ticket')
            .setStyle(ButtonStyle.Success)
            .setEmoji('📩')
            );

            await channel.send({ embeds: [embed], components: [button] });
            return interaction.reply({ content: `Pannello creato in ${channel}`, ephemeral: true });
        }

        if (subcommand === 'dashboard') {
            const tickets = interaction.guild.channels.cache.filter(c => c.name.startsWith('ticket-')).size;
            const embed = new EmbedBuilder()
        .setTitle('📊 Dashboard Ticket')
        .setDescription(`**Ticket Aperti:** \`${tickets}\`\n**Ticket Totali:** \`${ticketCount}\``)
        .setColor(0x5865F2)
        .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'close') {
            if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: 'Solo nei ticket.', ephemeral: true });
            await interaction.reply({ content: 'Chiusura tra 5 secondi...' });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }

        if (subcommand === 'add') {
            if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: 'Solo nei ticket.', ephemeral: true });
            const user = interaction.options.getUser('utente');
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
            return interaction.reply({ content: `✅ ${user} aggiunto.` });
        }

        if (subcommand === 'remove') {
            if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: 'Solo nei ticket.', ephemeral: true });
            const user = interaction.options.getUser('utente');
            await interaction.channel.permissionOverwrites.delete(user.id);
            return interaction.reply({ content: `❌ ${user} rimosso.` });
        }

        if (subcommand === 'rename') {
            if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: 'Solo nei ticket.', ephemeral: true });
            const name = interaction.options.getString('nome');
            await interaction.channel.setName(`ticket-${name}`);
            return interaction.reply({ content: `✏️ Rinominato in ticket-${name}` });
        }
    },

    async handleButton(interaction, client) {
        if (interaction.customId === 'create_ticket') {
            await interaction.deferReply({ ephemeral: true });
            ticketCount++;
            const ticketName = `ticket-${interaction.user.username}-${ticketCount}`;

            const existing = interaction.guild.channels.cache.find(c => c.name.includes(interaction.user.username));
            if (existing) return interaction.editReply({ content: `Hai già un ticket: ${existing}` });

            const ticketChannel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ],
            });

            const embed = new EmbedBuilder()
        .setTitle(`🎧 Ticket #${ticketCount} di ${interaction.user.username}`)
        .setDescription('**Grazie per averci contattato!**\n\nDescrivi il tuo problema qui sotto. Lo staff ti risponderà a breve.')
        .setColor(0x57F287)
        .setFooter({ text: 'Non pingare lo staff' })
        .setTimestamp();

            const closeBtn = new ActionRowBuilder()
        .addComponents(
                new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Chiudi Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
            );

            await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed], components: [closeBtn] });
            return interaction.editReply({ content: `Ticket creato: ${ticketChannel}` });
        }

        if (interaction.customId === 'close_ticket') {
            await interaction.reply({ content: 'Chiusura tra 3 secondi...' });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    }
};
