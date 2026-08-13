const { ChannelType, PermissionFlagsBits } = require('discord.js');
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    
    // Handler per i 3 pulsanti nuovi
    if (interaction.customId === 'ticket_general' || 
        interaction.customId === 'ticket_product' || 
        interaction.customId === 'ticket_payment') {
        
        let category = "General Support";
        if (interaction.customId === 'ticket_product') category = "Product Not Received";
        if (interaction.customId === 'ticket_payment') category = "Payment Delivery";
        
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: null, // metti l'ID di una categoria se vuoi
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
        
        await interaction.reply({ 
            content: `✅ Ticket creato: ${channel} - **${category}**`, 
            ephemeral: true 
        });
        
        await channel.send(`Ciao ${interaction.user}! Hai aperto un ticket per **${category}**.\nDescrivi il problema e lo staff ti risponderà al più presto.`);
    }
});
