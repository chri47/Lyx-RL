const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

let ticketCount = 0;

module.exports = {
    data: new SlashCommandBuilder()
   .setName('ticket')
   .setDescription('Sistema ticket LYK completo')
   .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
   .setDMPermission(false)
   .addSubcommand(subcommand =>
        subcommand.setName('setup')
       .setDescription('Crea il pannello per aprire ticket')
       .addChannelOption(option =>
            option.setName('canale')
           .setDescription('Canale dove inviare il pannello')
           .setRequired(true)
           .addChannelTypes(ChannelType.GuildText)))
   .addSubcommand(subcommand =>
        subcommand.setName('dashboard')
       .setDescription('Apri la dashboard staff per gestire i ticket'))
   .addSubcommand(subcommand =>
        subcommand.setName('close')
       .setDescription('Chiudi il ticket corrente')
       .addStringOption(option =>
            option.setName('motivo')
           .setDescription('Motivo della chiusura')
           .setRequired(false)))
   .addSubcommand(subcommand =>
        subcommand.setName('add')
       .setDescription('Aggiungi un utente al ticket')
       .addUserOption(option =>
            option.setName('utente')
           .setDescription('Utente da aggiungere')
           .setRequired(true)))
   .addSubcommand(subcommand =>
        subcommand.setName('remove')
       .setDescription('Rimuovi un utente dal ticket')
       .addUserOption(option =>
            option.setName('utente')
           .setDescription('Utente da rimuovere')
           .setRequired(true)))
   .addSubcommand(subcommand =>
        subcommand.setName('rename')
       .setDescription('Rinomina il ticket corrente')
       .addStringOption(option =>
            option.setName('nome')
           .setDescription('Nuovo nome del ticket')
           .setRequired(true))),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        // SETUP PANNELLO
        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('canale');

            const embed = new EmbedBuilder()
           .setAuthor({ name: 'LYK Services', iconURL: interaction.guild.iconURL() })
           .setTitle('🎫 Centro Assistenza LYK')
           .setDescription('**Hai bisogno di supporto?**\n\nSeleziona la categoria che descrive meglio il tuo problema e apri un ticket.\n\n> Lo staff ti risponderà il prima possibile.')
           .setColor(0x2b2d31)
           .setImage('https://i.imgur.com/8QZQZQZ.png') // Banner LYK - cambialo col tuo
           .setFooter({ text: 'LYK Community • Supporto 24/7', iconURL: interaction.guild.iconURL() })
           .setTimestamp();

            const menu = new ActionRowBuilder()
           .addComponents(
                new StringSelectMenuBuilder()
               .setCustomId('category_ticket')
               .setPlaceholder('📂 Seleziona una categoria')
               .addOptions([
                    {
                        label: 'Supporto Generale',
                        description: 'Domande generiche sul server',
                        value: 'general',
                        emoji: '❓',
                    },
                    {
                        label: 'Segnala Utente',
                        description: 'Segnala un comportamento scorretto',
                        value: 'report',
                        emoji: '🚨',
                    },
                    {
                        label: 'Problema Tecnico',
                        description: 'Bug, errori, problemi col bot',
                        value: 'technical',
                        emoji: '🛠️',
                    },
                    {
                        label: 'Partnership',
                        description: 'Proposte di collaborazione',
                        value: 'partner',
                        emoji: '🤝',
                    },
                ]),
            );

            await channel.send({ embeds: [embed], components: [menu] });
            return interaction.reply({ content: `Pannello ticket creato in ${channel}`, ephemeral: true });
        }

        // DASHBOARD STAFF
        if (subcommand === 'dashboard') {
            const tickets = interaction.guild.channels.cache.filter(c => c.name.startsWith('ticket-')).size;

            const embed = new EmbedBuilder()
           .setTitle('📊 Dashboard Ticket LYK')
           .setColor(0x5865F2)
           .setDescription(`**Statistiche Server**\n\n> **Ticket Aperti:** \`${tickets}\`\n> **Ticket Totali:** \`${ticketCount}\`\n\nUsa i bottoni qui sotto per gestire rapidamente i ticket.`)
           .setThumbnail(interaction.guild.iconURL())
           .setFooter({ text: `Richiesto da ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
           .setTimestamp();

            const buttons = new ActionRowBuilder()
           .addComponents(
                new ButtonBuilder()
               .setCustomId('refresh_dashboard')
               .setLabel('Aggiorna Stats')
               .setStyle(ButtonStyle.Primary)
               .setEmoji('🔄'),
                new ButtonBuilder()
               .setCustomId('close_all_tickets')
               .setLabel('Chiudi Tutti')
               .setStyle(ButtonStyle.Danger)
               .setEmoji('🗑️'),
            );

            return interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
        }

        // CLOSE
        if (subcommand === 'close') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Questo comando si usa solo nei ticket.', ephemeral: true });
            }
            const reason = interaction.options.getString('motivo') || 'Nessun motivo specificato';

            const embed = new EmbedBuilder()
           .setTitle('🔒 Ticket in Chiusura')
           .setDescription(`**Chiuso da:** ${interaction.user}\n**Motivo:** ${reason}\n\n*Il canale verrà eliminato tra 5 secondi...*`)
           .setColor(0xED4245);

            await interaction.reply({ embeds: [embed] });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }

        // ADD
        if (subcommand === 'add') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Questo comando si usa solo nei ticket.', ephemeral: true });
            }
            const user = interaction.options.getUser('utente');
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });

            const embed = new EmbedBuilder()
           .setDescription(`✅ ${user} è stato aggiunto al ticket da ${interaction.user}`)
           .setColor(0x57F287);

            return interaction.reply({ embeds: [embed] });
        }

        // REMOVE
        if (subcommand === 'remove') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Questo comando si usa solo nei ticket.', ephemeral: true });
            }
            const user = interaction.options.getUser('utente');
            await interaction.channel.permissionOverwrites.delete(user.id);

            const embed = new EmbedBuilder()
           .setDescription(`❌ ${user} è stato rimosso dal ticket da ${interaction.user}`)
           .setColor(0xED4245);

            return interaction.reply({ embeds: [embed] });
        }

        // RENAME
        if (subcommand === 'rename') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Questo comando si usa solo nei ticket.', ephemeral: true });
            }
            const name = interaction.options.getString('nome');
            const oldName = interaction.channel.name;
            await interaction.channel.setName(`ticket-${name}`);

            const embed = new EmbedBuilder()
           .setDescription(`✏️ Ticket rinominato da \`${oldName}\` a \`ticket-${name}\` da ${interaction.user}`)
           .setColor(0xFEE75C);

            return interaction.reply({ embeds: [embed] });
        }
    },

    // GESTIONE MENU E BOTTONI
    async handleButton(interaction, client) {
        // CREAZIONE TICKET DAL MENU
        if (interaction.isStringSelectMenu() && interaction.customId === 'category_ticket') {
            await interaction.deferReply({ ephemeral: true });

            const category = interaction.values[0];
            const categoryNames = {
                general: 'generale',
                report: 'segnalazione',
                technical: 'tecnico',
                partner: 'partnership'
            };

            ticketCount++;
            const ticketName = `ticket-${categoryNames[category]}-${interaction.user.username}`;

            const existing = interaction.guild.channels.cache.find(c => c.name.includes(interaction.user.username));
            if (existing) return interaction.editReply({ content: `Hai già un ticket aperto: ${existing}` });

            try {
                const ticketChannel = await interaction.guild.channels.create({
                    name: ticketName,
                    type: ChannelType.GuildText,
                    parent: null, // Metti qui l'ID della categoria se vuoi
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                        { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
                    ],
                });

                const ticketEmbed = new EmbedBuilder()
               .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
               .setTitle(`🎧 Ticket #${ticketCount} - ${categoryNames[category].toUpperCase()}`)
               .setDescription(`**Grazie per averci contattato!**\n\n> Uno staffer prenderà in carico il tuo ticket a breve.\n> Descrivi il tuo problema nel dettaglio qui sotto.\n\n**Categoria:** \`${categoryNames[category]}\``)
               .setColor(0x57F287)
               .setFooter({ text: 'LYK Services • Non pingare lo staff', iconURL: interaction.guild.iconURL() })
               .setTimestamp();

                const ticketButtons = new ActionRowBuilder()
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
                    new ButtonBuilder()
                   .setCustomId('transcript_ticket')
                   .setLabel('Transcript')
                   .setStyle(ButtonStyle.Secondary)
                   .setEmoji('📄'),
                );

                await ticketChannel.send({ content: `${interaction.user} ||@here||`, embeds: [ticketEmbed], components: [ticketButtons] });
                return interaction.editReply({ content: `Ticket creato: ${ticketChannel}` });
            } catch (error) {
                console.error(error);
                return interaction.editReply({ content: 'Errore nella creazione del ticket.' });
            }
        }

        // BOTTONI DENTRO AL TICKET
        if (interaction.customId === 'close_ticket') {
            const embed = new EmbedBuilder()
           .setTitle('🔒 Conferma Chiusura')
           .setDescription('Sei sicuro di voler chiudere questo ticket?')
           .setColor(0xED4245);

            const buttons = new ActionRowBuilder()
           .addComponents(
                new ButtonBuilder()
               .setCustomId('confirm_close')
               .setLabel('Conferma')
               .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
               .setCustomId('cancel_close')
               .setLabel('Annulla')
               .setStyle(ButtonStyle.Secondary),
            );

            return interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
        }

        if (interaction.customId === 'confirm_close') {
            await interaction.update({ content: 'Chiusura in corso...', embeds: [], components: [] });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }

        if (interaction.customId === 'cancel_close') {
            return interaction.update({ content: 'Chiusura annullata.', embeds: [], components: [] });
        }

        if (interaction.customId === 'claim_ticket') {
            const embed = new EmbedBuilder()
           .setDescription(`🙋 Ticket preso in carico da ${interaction.user}`)
           .setColor(0x5865F2);

            await interaction.channel.send({ embeds: [embed] });
            return interaction.reply({ content: 'Ticket claimato!', ephemeral: true });
        }

        if (interaction.customId === 'refresh_dashboard') {
            // Rilancia il comando dashboard
            const command = client.commands.get('ticket');
            return command.execute(interaction, client);
        }
    }
};
