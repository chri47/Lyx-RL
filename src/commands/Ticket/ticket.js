import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

let ticketCount = 0;

export default {
    data: new SlashCommandBuilder()
   .setName('ticket')
   .setDescription('Sistema ticket LYX')
   .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
   .setDMPermission(false)
   .addSubcommand(subcommand =>
        subcommand.setName('setup')
       .setDescription('Crea il pannello ticket con categorie')
       .addChannelOption(option =>
            option.setName('canale')
           .setDescription('Canale dove inviare il pannello')
           .setRequired(true)
           .addChannelTypes(ChannelType.GuildText)))
   .addSubcommand(subcommand =>
        subcommand.setName('close')
       .setDescription('Chiudi il ticket corrente'))
   .addSubcommand(subcommand =>
        subcommand.setName('add')
       .setDescription('Aggiungi utente al ticket')
       .addUserOption(option =>
            option.setName('utente')
           .setDescription('Utente da aggiungere')
           .setRequired(true))),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('canale');

            const embed = new EmbedBuilder()
           .setTitle('Support Ticket System')
           .setDescription('**Welcome to our premium support system**\n\nPlease select the category that best describes your issue below to open a ticket.\nOur team will get back to you as soon as possible.\n\n**Have a quick question about our products?**\nPress `Questions` to open the matching ticket flow\n\n**Need help with anything on our store?**\nPress `General Support` to open the matching ticket flow\n\n**Did not receive your product after purchase?**\nPress `Product Not Received` to open the matching ticket flow\n\n**Manual delivery is needed for your purchase?**\nPress `Manual Delivery` to open the matching ticket flow\n\n**Something is not working?**\nPress `Replacement` to open the matching ticket flow')
           .setColor(0x2b2d31)
           .setImage('https://discord.com/channels/@me/1530941725256716331/1537551598291648623') // Metti il tuo banner LYX qui
           .setFooter({ text: 'LYX Services', iconURL: interaction.guild.iconURL() });

            const row1 = new ActionRowBuilder()
           .addComponents(
                new ButtonBuilder()
               .setCustomId('ticket_questions')
               .setLabel('Questions')
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('❓'),
                new ButtonBuilder()
               .setCustomId('ticket_general')
               .setLabel('General Support')
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('🎧'),
            );

            const row2 = new ActionRowBuilder()
           .addComponents(
                new ButtonBuilder()
               .setCustomId('ticket_notreceived')
               .setLabel('Product Not Received')
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('📦'),
                new ButtonBuilder()
               .setCustomId('ticket_manual')
               .setLabel('Manual Delivery')
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('📬'),
            );

            const row3 = new ActionRowBuilder()
           .addComponents(
                new ButtonBuilder()
               .setCustomId('ticket_replacement')
               .setLabel('Replacement')
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('🔄'),
            );

            await channel.send({ embeds: [embed], components: [row1, row2, row3] });
            return interaction.reply({ content: `Pannello ticket creato in ${channel}`, ephemeral: true });
        }

        if (subcommand === 'close') {
            if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: 'Solo nei ticket.', ephemeral: true });
            await interaction.reply({ content: 'Chiusura tra 3 secondi...' });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }

        if (subcommand === 'add') {
            if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: 'Solo nei ticket.', ephemeral: true });
            const user = interaction.options.getUser('utente');
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
            return interaction.reply({ content: `✅ ${user} aggiunto al ticket.` });
        }
    },

    async handleButton(interaction, client) {
        const categories = {
            'ticket_questions': { name: 'questions', label: 'Questions', emoji: '❓' },
            'ticket_general': { name: 'general', label: 'General Support', emoji: '🎧' },
            'ticket_notreceived': { name: 'not-received', label: 'Product Not Received', emoji: '📦' },
            'ticket_manual': { name: 'manual', label: 'Manual Delivery', emoji: '📬' },
            'ticket_replacement': { name: 'replacement', label: 'Replacement', emoji: '🔄' }
        };

        // CREAZIONE TICKET
        if (categories[interaction.customId]) {
            await interaction.deferReply({ ephemeral: true });
            ticketCount++;

            const cat = categories[interaction.customId];
            const ticketName = `ticket-${cat.name}-${interaction.user.username}`;

            const existing = interaction.guild.channels.cache.find(c => c.name.includes(interaction.user.username));
            if (existing) return interaction.editReply({ content: `Hai già un ticket aperto: ${existing}` });

            const ticketChannel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                topic: `Ticket di ${interaction.user.tag} | Categoria: ${cat.label} | ID: ${ticketCount}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
                ],
            });

            const embed = new EmbedBuilder()
           .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
           .setTitle(`${cat.emoji} Ticket #${ticketCount} - ${cat.label}`)
           .setDescription(`**Grazie per averci contattato!**\n\n> Descrivi il tuo problema nel dettaglio.\n> Lo staff ti risponderà il prima possibile.\n\n**Categoria:** \`${cat.label}\`\n**Utente:** ${interaction.user}`)
           .setColor(0x57F287)
           .setFooter({ text: 'LYK Services • Ticket System', iconURL: interaction.guild.iconURL() })
           .setTimestamp();

            const buttons = new ActionRowBuilder()
           .addComponents(
                new ButtonBuilder()
               .setCustomId('claim_ticket')
               .setLabel('Claim')
               .setStyle(ButtonStyle.Primary)
               .setEmoji('🙋'),
                new ButtonBuilder()
               .setCustomId('close_ticket')
               .setLabel('Chiudi')
               .setStyle(ButtonStyle.Danger)
               .setEmoji('🔒'),
            );

            await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed], components: [buttons] });
            return interaction.editReply({ content: `✅ Ticket creato: ${ticketChannel}` });
        }

        // BOTTONI DENTRO AL TICKET
        if (interaction.customId === 'close_ticket') {
            await interaction.reply({ content: 'Chiusura tra 3 secondi...' });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }

        if (interaction.customId === 'claim_ticket') {
            const embed = new EmbedBuilder()
           .setDescription(`🙋 Ticket preso in carico da ${interaction.user}`)
           .setColor(0x5865F2);
            await interaction.channel.send({ embeds: [embed] });
            return interaction.reply({ content: 'Ticket claimato!', ephemeral: true });
        }
    }
};
