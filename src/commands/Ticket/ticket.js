import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

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
              .setName('close')
              .setDescription('Chiudi il ticket corrente')),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('canale');

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

            await channel.send({ embeds: [embed], components: [button] });
            return interaction.reply({ content: `Pannello ticket creato in ${channel}`, ephemeral: true });
        }

        if (subcommand === 'close') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: 'Usa questo comando solo nei ticket.', ephemeral: true });
            }
            await interaction.channel.delete();
        }
    },

    async handleButton(interaction, client) {
        if (interaction.customId === 'create_ticket') {
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                ],
            });

            const ticketEmbed = new EmbedBuilder()
              .setTitle(`🎧 Ticket di ${interaction.user.username}`)
              .setDescription('**Grazie per averci contattato!**\n\nUno staffer prenderà in carico il tuo ticket a breve.')
              .setColor(0x57F287)
              .setFooter({ text: 'Non fare ping allo staff, grazie' })
              .setTimestamp();

            await ticketChannel.send({ content: `${interaction.user}`, embeds: [ticketEmbed] });
            return interaction.reply({ content: `Ticket creato! ${ticketChannel}`, ephemeral: true });
        }
    }
};
