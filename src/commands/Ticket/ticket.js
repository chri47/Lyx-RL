import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { handleInteractionError, reportToHub } = require('../../utils/interactionErrorHandler.js');
const { getSettings, saveSettings } = require('../../utils/settings.js');
const { getOrCreateTicket, closeTicket, getGuildConfig, getTicketCount } = require('../../utils/ticketUtils.js');
import ticketConfig from './modules/ticket_dashboard.js';
import { handleTicketCreate, handleTicketClaim, handleTicketClose, handleTicketTranscript, handleTicketPriority, handleTicketRename } from './modules/ticketHandler.js';
import { checkPermissions } from '../../utils/permissionManager.js';

export default {
    data: new SlashCommandBuilder()
       .setName('ticket')
       .setDescription('Gestisce il sistema di ticket del server')
       .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
       .setDMPermission(false)
       .addSubcommand(subcommand =>
            subcommand
               .setName('setup')
               .setDescription('Invia il pannello per creare ticket in un canale')
               .addChannelOption(option =>
                    option.setName('canale')
                       .setDescription('Il canale dove inviare il pannello')
                       .addChannelTypes(ChannelType.GuildText)
                       .setRequired(true)))
       .addSubcommand(subcommand =>
            subcommand
               .setName('dashboard')
               .setDescription('Apri la dashboard di gestione ticket'))
       .addSubcommand(subcommand =>
            subcommand
               .setName('close')
               .setDescription('Chiudi il ticket corrente')
               .addStringOption(option =>
                    option.setName('motivo')
                       .setDescription('Motivo della chiusura del ticket')
                       .setRequired(false)))
       .addSubcommand(subcommand =>
            subcommand
               .setName('add')
               .setDescription('Aggiungi un utente al ticket corrente')
               .addUserOption(option =>
                    option.setName('utente')
                       .setDescription('Utente da aggiungere al ticket')
                       .setRequired(true)))
       .addSubcommand(subcommand =>
            subcommand
               .setName('remove')
               .setDescription('Rimuovi un utente dal ticket corrente')
               .addUserOption(option =>
                    option.setName('utente')
                       .setDescription('Utente da rimuovere dal ticket')
                       .setRequired(true)))
       .addSubcommand(subcommand =>
            subcommand
               .setName('rename')
               .setDescription('Rinomina il ticket corrente')
               .addStringOption(option =>
                    option.setName('nome')
                       .setDescription('Nuovo nome per il ticket')
                       .setRequired(true))),

    async execute(interaction, client) {
        if (!await checkPermissions(interaction, PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: 'Non hai i permessi per usare questo comando.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('canale');
            const guildConfig = await getGuildConfig(interaction.guild.id);

            // MODIFICATO: ESTETICA PANNELLO SETUP
            const embed = new EmbedBuilder()
               .setTitle('🎫 Supporto LYK Community')
               .setDescription('Hai bisogno di aiuto dallo staff?\nClicca **Apri Ticket** e descrivici il tuo problema.')
               .setColor(0xFF0000)
               .setThumbnail(interaction.guild.iconURL())
               .setFooter({ text: 'LYK • Supporto veloce 24/7' })
               .setTimestamp();

            const button = new ActionRowBuilder()
               .addComponents(
                    new ButtonBuilder()
                       .setCustomId('create_ticket')
                       .setLabel('Apri un Ticket')
                       .setStyle(ButtonStyle.Success)
                       .setEmoji('📩')
                );

            try {
                const message = await channel.send({ embeds: [embed], components: [button] });
                const settings = await getSettings(interaction.guild.id);
                settings.ticketPanelMessageId = message.id;
                settings.ticketPanelChannelId = channel.id;
                await saveSettings(interaction.guild.id, settings);

                return interaction.reply({ content: `Pannello ticket creato con successo in ${channel}`, ephemeral: true });
            } catch (error) {
                console.error(error);
                return handleInteractionError(interaction, error);
            }
        }

        if (subcommand === 'dashboard') {
            return ticketConfig.execute(interaction, client);
        }

        if (subcommand === 'close') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Questo comando si può usare solo nei canali ticket.', ephemeral: true });
            }
            const reason = interaction.options.getString('motivo') || 'Nessun motivo specificato';
            return handleTicketClose(interaction, client, reason);
        }

        if (subcommand === 'add') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Questo comando si può usare solo nei canali ticket.', ephemeral: true });
            }
            const user = interaction.options.getUser('utente');
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
            return interaction.reply({ content: `${user} è stato aggiunto al ticket.`, ephemeral: true });
        }

        if (subcommand === 'remove') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Questo comando si può usare solo nei canali ticket.', ephemeral: true });
            }
            const user = interaction.options.getUser('utente');
            await interaction.channel.permissionOverwrites.delete(user.id);
            return interaction.reply({ content: `${user} è stato rimosso dal ticket.`, ephemeral: true });
        }

        if (subcommand === 'rename') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Questo comando si può usare solo nei canali ticket.', ephemeral: true });
            }
            const name = interaction.options.getString('nome');
            return handleTicketRename(interaction, client, name);
        }
    },

    async handleButton(interaction, client) {
        if (interaction.customId === 'create_ticket') {
            const guildConfig = await getGuildConfig(interaction.guild.id);
            const ticketCount = await getTicketCount(interaction.guild.id);

            // MODIFICATO: ESTETICA DENTRO AL TICKET
            const ticketEmbed = new EmbedBuilder()
               .setTitle(`🎧 Ticket #${ticketCount + 1} di ${interaction.user.username}`)
               .setDescription('**Grazie per averci contattato!**\n\nUno staffer prenderà in carico il tuo ticket a breve.\nNel frattempo descrivi il tuo problema nel dettaglio.')
               .setColor(0x57F287)
               .setFooter({ text: 'Non fare ping allo staff, grazie' })
               .setTimestamp();

            const ticketButtons = new ActionRowBuilder()
               .addComponents(
                    new ButtonBuilder()
                       .setCustomId('close_ticket')
                       .setLabel('Chiudi Ticket')
                       .setStyle(ButtonStyle.Danger)
                       .setEmoji('🔒'),
                    new ButtonBuilder()
                       .setCustomId('claim_ticket')
                       .setLabel('Claim')
                       .setStyle(ButtonStyle.Secondary)
                       .setEmoji('🙋'),
                    new ButtonBuilder()
                       .setCustomId('transcript_ticket')
                       .setLabel('Transcript')
                       .setStyle(ButtonStyle.Primary)
                       .setEmoji('📄')
                );

            return handleTicketCreate(interaction, client, ticketEmbed, ticketButtons);
        }

        if (interaction.customId === 'close_ticket') {
            return handleTicketClose(interaction, client, 'Chiuso tramite bottone');
        }

        if (interaction.customId === 'claim_ticket') {
            return handleTicketClaim(interaction, client);
        }

        if (interaction.customId === 'transcript_ticket') {
            return handleTicketTranscript(interaction, client);
        }
    }
};
