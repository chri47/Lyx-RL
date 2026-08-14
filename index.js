const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once(Events.ClientReady, c => {
    console.log(`[OK] BOT ONLINE: ${c.user.tag}`);
});

// COMANDO !setup-ticket PER CREARE IL PANNELLO
client.on('messageCreate', async message => {
    if (message.content === '!setup-ticket' && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        
        const embed = {
            title: "Support Ticket System",
            description: "Welcome to LYX premium support system\n\nSelect the category that best fits your issue below to open a ticket.\nOur team will get back to you as soon as possible.",
            color: 0x2b2d31
        };

        const row = {
            type: 1,
            components: [
                { type: 2, style: 2, label: "Questions", custom_id: "ticket_questions" },
                { type: 2, style: 2, label: "General Support", custom_id: "ticket_general" },
                { type: 2, style: 2, label: "Product Not Received", custom_id: "ticket_product" },
                { type: 2, style: 2, label: "Manual Delivery", custom_id: "ticket_payment" },
                { type: 2, style: 2, label: "Replacement", custom_id: "ticket_replacement" }
            ]
        };

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }
});

// GESTIONE CLICK SUI PULSANTI
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    
    console.log(`[CLICK] ${interaction.user.tag} ha cliccato: ${interaction.customId}`);
    
    // Risponde subito per evitare "Lyx non ha risposto in tempo"
    await interaction.deferReply({ ephemeral: true });
    
    try {
        // Pulsante chiudi ticket
        if (interaction.customId === 'close_ticket') {
            await interaction.editReply('Chiusura ticket in corso...');
            setTimeout(() => interaction.channel.delete(), 2000);
            return;
        }
        
        // Mappa i customId in nomi leggibili
        const categorie = {
            'ticket_questions': 'Questions',
            'ticket_general': 'General Support', 
            'ticket_product': 'Product Not Received',
            'ticket_payment': 'Manual Delivery',
            'ticket_replacement': 'Replacement'
        };
        
        const categoria = categorie[interaction.customId] || interaction.customId;
        
        // Crea il canale ticket
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
            ],
        });
        
        await interaction.editReply(`✅ Ticket creato: ${channel}`);
        
        // Messaggio nel ticket con pulsante chiudi
        await channel.send({
            content: `Ciao <@${interaction.user.id}>, hai aperto un ticket per: **${categoria}**\nUn membro dello staff ti risponderà al più presto.`,
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    style: 4,
                    label: "Chiudi Ticket",
                    custom_id: "close_ticket"
                }]
            }]
        });
        
    } catch (error) {
        console.error('[ERRORE CREAZIONE TICKET]', error);
        await interaction.editReply(`❌ Errore: ${error.message}\nControlla che il bot abbia il permesso **Manage Channels** sul server.`);
    }
});

client.login(process.env.DISCORD_TOKEN);
