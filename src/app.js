const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const translate = require('@vitalets/google-translate-api');
require('dotenv').config();

const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN;
const MONGO_URL = process.env.MONGO_URL;
const MAKE_WEBHOOK = process.env.MAKE_WEBHOOK;
const RESELLME_WEBHOOK = 'https://resellme.xyz/api/reseller/webhook/mzsDGCAz2Gg-weuPFh3Cbs1RmlLnjtpX';
const PORT = process.env.PORT || 3000;
const GUILD_ID = process.env.GUILD_ID;
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID;
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
const SELL_LOG_CHANNEL_ID = process.env.SELL_LOG_CHANNEL_ID;
const SERVER_NAME = process.env.SERVER_NAME || 'LYX RL Services';

const TICKET_BANNER_URL = 'https://i.imgur.com/jzZKsqR.png';

const EMOJI_QUESTIONS = '<:10:1538317499203063808>';
const EMOJI_GENERAL = '<:11:1538317571344834590>';
const EMOJI_NOT_RECEIVED = '<:12:1538317664953303200>';
const EMOJI_MANUAL = '<:13:1538317705759825930>';
const EMOJI_REPLACEMENT = '<:14:1538317750253002964>';

const PRODUCT_IMAGES = {
  'Netflix [ Lifetime]': 'https://i.imgur.com/TcVHY8I.png',
  'CrunchyRoll [Lifetime]': 'https://media.discordapp.net/attachments/1529233083801407690/1538342014666547220/1045021.png?ex=6a825425&is=6a8102a5&hm=7b963c95f8e0df90ed489627438e5034013b5af5b307e9cb02f91cf8ba7b2283&=&format=webp&quality=lossless&width=475&height=640',
  'Spotify Premium Lifetime Full Access': 'https://i.imgur.com/FDoAcMa.png',
  'Youtube Premium Lifetime Full Access': 'https://i.imgur.com/wWgOUMz.png',
  'Prime Video 1': 'https://i.imgur.com/dTEs4Vk.png',
  'Prime Video 6': 'https://i.imgur.com/tQjX7Au.png',
  'Dazn ( LIFETIME )': 'https://i.imgur.com/cPG3dek.png',
  'Disney+ [LIFETIME]': 'https://i.imgur.com/6yavlZF.png',
  'Capcut [Lifetime]': 'https://i.imgur.com/2PIr4WC.png',
  'Gemini Pro+ [LINK - 18 Months]': 'https://i.imgur.com/s7kZUFc.png',
  'Nord VPN [LIFETIME]': 'https://i.imgur.com/nmK5hv0.png',
  'default': 'https://i.imgur.com/9Tmd5nW.png'
};

let KEYS = require('./keys.json');
const saveKeys = () => fs.writeFileSync('./keys.json', JSON.stringify(KEYS, null, 2));

mongoose.connect(MONGO_URL);
const OrderLog = mongoose.model('OrderLog', new mongoose.Schema({
  key: String, orderid: String, email: String, product: String, quantity: { type: Number, default: 1 },
  payment: String, discordId: String, discordUsername: String, createdAt: { type: Date, default: Date.now }
}));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent]
});

client.once('ready', async () => {
  console.log(`Bot online come ${client.user.tag} 🔴`);
  const commands = [
    new SlashCommandBuilder().setName('setup-ticket').setDescription('Send the ticket panel'),
    new SlashCommandBuilder().setName('stock').setDescription('Check remaining keys'),
    new SlashCommandBuilder().setName('talk').setDescription('Traduci messaggi per parlare con clienti stranieri')
  ].map(cmd => cmd.toJSON());
  await new REST({ version: '10' }).setToken(TOKEN).put(Routes.applicationCommands(client.user.id), { body: commands });
});

async function sendKrazyTicketEmbed(channel, user, keyData, status = 'Awaiting Key') {
    const ticketCount = await OrderLog.countDocuments({});
    const productName = keyData.product || 'Unknown Product';
    const productImg = PRODUCT_IMAGES[productName] || PRODUCT_IMAGES['default'];

    if (!PRODUCT_IMAGES[productName]) {
        console.log(`[ERRORE] Prodotto non trovato in PRODUCT_IMAGES: "${productName}"`);
    }

    const embed = new EmbedBuilder()
.setColor(status === 'Completed'? '#00FF00' : '#5865F2')
.setAuthor({ name: SERVER_NAME, iconURL: client.user.displayAvatarURL() })
.setTitle(`Ticket #${ticketCount}`)
.setDescription('Thanks for reaching out, our staff will reply shortly.')
.addFields(
  { name: 'User', value: `${user}`, inline: true },
  { name: 'Category', value: 'Manual Delivery', inline: true },
  { name: 'Quantity', value: `${keyData.quantity || 1}`, inline: true },
  { name: 'Reason', value: status === 'Completed'? `Redeemed Key: ${keyData.key}` : `Awaiting LYX-KEY`, inline: false },
  { name: 'Opened', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true },
  { name: 'Ticket ID', value: `${ticketCount}`, inline: true },
  { name: 'Status', value: status === 'Completed'? '🟢 Completed' : '🟡 Awaiting Key', inline: true }
)
.setImage(productImg)
.addFields({
  name: 'Verified Order',
  value: `Invoice: ${keyData.orderid || 'N/A'}\nProduct: ${productName}\nEmail: ${keyData.email || 'N/A'}\nPayment: ${keyData.payment || 'LYX-KEY'}\nStatus: ${status === 'Completed'? 'COMPLETED' : 'PENDING'}`
})
.setFooter({ text: `${SERVER_NAME} • Ticket System` })
.setTimestamp();

    return await channel.send({ embeds: [embed] });
}

async function redeemKeyAuto(codice, user, ticketChannel, ticketEmbedMsg) {
    const keyData = KEYS[codice];
    if (!keyData || keyData.used) return { success: false, error: 'Invalid or already used key' };

    KEYS[codice].used = true;
    KEYS[codice].discordId = user.id;
    KEYS[codice].discordUsername = user.username;
    KEYS[codice].key = codice;
    saveKeys();

    await new OrderLog({
      key: codice, orderid: keyData.orderid, email: keyData.email, product: keyData.product,
      quantity: keyData.quantity || 1, payment: keyData.payment || 'SellAuth',
      discordId: user.id, discordUsername: user.username
    }).save();

    const newEmbedMsg = await sendKrazyTicketEmbed(ticketChannel, user, KEYS[codice], 'Completed');
    await ticketEmbedMsg.edit({ embeds: newEmbedMsg.embeds });

    try {
        await user.send(`**${keyData.product}** - Le tue credenziali:\n\`\`\`${keyData.credentials_raw}\`\`\``);
        return { success: true };
    } catch (err) {
        await ticketChannel.send({ content: `⚠️ <@&${STAFF_ROLE_ID}> **DM chiusi** - Consegna manuale:\n**Product:** ${keyData.product}\n**Credenziali:** \`\`\`${keyData.credentials_raw}\`\`\`\n**Key:** ${codice}` });
        return { success: true, dmFailed: true };
    }
}

function getTicketPanel() {
  const embed1 = new EmbedBuilder().setColor('#2B2D31').setImage(TICKET_BANNER_URL);
  const embed2 = new EmbedBuilder().setColor('#2B2D31').setDescription('**Have a quick question about our products?**\nPress `Questions` to open the matching ticket flow.');
  const embed3 = new EmbedBuilder().setColor('#2B2D31').setDescription('**Need help with anything on our store?**\nPress `General Support` to open the matching ticket flow.');
  const embed4 = new EmbedBuilder().setColor('#2B2D31').setDescription('**Did not receive your product after purchase?**\nPress `Product Not Received` to open the matching ticket flow.');
  const embed5 = new EmbedBuilder().setColor('#2B2D31').setDescription('**This ticket is for products delivered manually by us.**\nPress `Manual Delivery` to open the matching ticket flow.');
  const embed6 = new EmbedBuilder().setColor('#2B2D31').setDescription('**Something is not working? Request a replacement.**\nPress `Replacement` to open the matching ticket flow.');

  const row1 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_questions').setLabel('Questions').setStyle(ButtonStyle.Secondary).setEmoji(EMOJI_QUESTIONS));
  const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_general').setLabel('General Support').setStyle(ButtonStyle.Secondary).setEmoji(EMOJI_GENERAL));
  const row3 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_notreceived').setLabel('Product Not Received').setStyle(ButtonStyle.Secondary).setEmoji(EMOJI_NOT_RECEIVED));
  const row4 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_manual').setLabel('Manual Delivery').setStyle(ButtonStyle.Secondary).setEmoji(EMOJI_MANUAL));
  const row5 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_replacement').setLabel('Replacement').setStyle(ButtonStyle.Secondary).setEmoji(EMOJI_REPLACEMENT));

  return { embeds: [embed1, embed2, embed3, embed4, embed5, embed6], components: [row1, row2, row3, row4, row5] };
}

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup-ticket') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ content: 'Admin only bro 💔', ephemeral: true });
      await interaction.deferReply({ ephemeral: true });
      const panel = getTicketPanel();
      await interaction.channel.send({ embeds: panel.embeds, components: panel.components });
      await interaction.editReply({ content: 'Ticket panel sent 🩸' });
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'stock') {
      const available = Object.values(KEYS).filter(k =>!k.used).length;
      await interaction.reply({ content: `Keys disponibili: **${available}** 🩸`, ephemeral: true });
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'talk') {
      const row1 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
       .setCustomId('translate_from')
       .setPlaceholder('🌍 Lingua in cui SCRIVI')
       .addOptions([
            { label: 'Italiano', value: 'it', emoji: '🇮🇹' },
            { label: 'English', value: 'en', emoji: '🇬🇧' },
            { label: 'Español', value: 'es', emoji: '🇪🇸' },
            { label: 'Français', value: 'fr', emoji: '🇫🇷' },
            { label: 'Deutsch', value: 'de', emoji: '🇩🇪' },
          ])
      );
      const row2 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
       .setCustomId('translate_to')
       .setPlaceholder('🎯 Lingua in cui TRADURRE')
       .addOptions([
            { label: 'Italiano', value: 'it', emoji: '🇮🇹' },
            { label: 'English', value: 'en', emoji: '🇬🇧' },
            { label: 'Español', value: 'es', emoji: '🇪🇸' },
            { label: 'Français', value: 'fr', emoji: '🇫🇷' },
            { label: 'Deutsch', value: 'de', emoji: '🇩🇪' },
          ])
      );
      return await interaction.reply({
        content: '🔴 **LYX TRANSLATE** - Scegli le lingue 🩸',
        components: [row1, row2],
        ephemeral: true
      });
    }

    if (interaction.isStringSelectMenu() && (interaction.customId === 'translate_from' || interaction.customId === 'translate_to')) {
      if (!global.lyxTranslate) global.lyxTranslate = {};
      if (!global.lyxTranslate[interaction.user.id]) global.lyxTranslate[interaction.user.id] = {};

      if (interaction.customId === 'translate_from') global.lyxTranslate[interaction.user.id].from = interaction.values[0];
      if (interaction.customId === 'translate_to') global.lyxTranslate[interaction.user.id].to = interaction.values[0];

      if (global.lyxTranslate[interaction.user.id].from && global.lyxTranslate[interaction.user.id].to) {
        const modal = new ModalBuilder()
       .setCustomId('translate_modal')
       .setTitle('LYX Translate');
        const textInput = new TextInputBuilder()
       .setCustomId('text_to_translate')
       .setLabel('Scrivi il testo da tradurre')
       .setStyle(TextInputStyle.Paragraph)
       .setRequired(true)
       .setMaxLength(1000);
        modal.addComponents(new ActionRowBuilder().addComponents(textInput));
        return await interaction.showModal(modal);
      }
      return await interaction.deferUpdate();
    }

    if (interaction.isModalSubmit() && interaction.customId === 'translate_modal') {
      await interaction.deferReply({ ephemeral: true });
      const testo = interaction.fields.getTextInputValue('text_to_translate');
      const langData = global.lyxTranslate[interaction.user.id];

      if (!langData?.from ||!langData?.to) {
        return await interaction.editReply({ content: '❌ Seleziona prima entrambe le lingue bro 💔' });
      }

      try {
        const res = await translate(testo, { from: langData.from, to: langData.to });
        const flags = { it: '🇮🇹', en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪' };

        const embed = new EmbedBuilder()
       .setColor('#FF0000')
       .setTitle('🔴 LYX TRANSLATE')
       .addFields(
            { name: `${flags[langData.from]} Originale`, value: `\`\`\`${testo}\`\`\`` },
            { name: `${flags[langData.to]} Tradotto`, value: `\`\`\`${res.text}\`\`\`` }
          )
       .setFooter({ text: 'LYX Premium • Copia e incolla al cliente' })
       .setTimestamp();

        delete global.lyxTranslate[interaction.user.id];
        return await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        return await interaction.editReply({ content: `❌ Errore traduzione: ${err.message} 💔` });
      }
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_')) {
      const category = interaction.customId.split('_')[1];
      const modal = new ModalBuilder().setCustomId(`ticket_modal_${category}`);

      if (category === 'manual') {
        modal.setTitle('Manual Delivery Ticket');
        const keyInput = new TextInputBuilder().setCustomId('key_input').setLabel('LYX-KEY (Solo Numeri)').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('123456');
        modal.addComponents(new ActionRowBuilder().addComponents(keyInput));
      } else {
        const categoryNames = { questions: 'Questions', general: 'General Support', notreceived: 'Product Not Received', replacement: 'Replacement' };
        modal.setTitle(`${categoryNames[category]} Ticket`);
        const serviceInput = new TextInputBuilder().setCustomId('service_input').setLabel('Service/Product (Optional)').setStyle(TextInputStyle.Short).setRequired(false);
        const issueInput = new TextInputBuilder().setCustomId('issue_input').setLabel('Describe your issue').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(4000);
        modal.addComponents(new ActionRowBuilder().addComponents(serviceInput), new ActionRowBuilder().addComponents(issueInput));
      }
      return await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
      await interaction.deferReply({ ephemeral: true });
      const category = interaction.customId.split('_')[2];

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID,
        topic: `Category: ${category}`,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          { id: STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
        ]
      });

      if (category === 'manual') {
        const keyCode = interaction.fields.getTextInputValue('key_input');

        if (KEYS[keyCode] &&!KEYS[keyCode].used) {
          const ticketEmbedMsg = await sendKrazyTicketEmbed(ticketChannel, interaction.user, KEYS[keyCode], 'Awaiting Key');
          const autoMsg = await ticketChannel.send({ content: `Ciao ${interaction.user}! 💎\nInviami la tua **LYX-KEY** e ti manderò subito il tuo prodotto!` });
          await autoMsg.react('💎');
          await redeemKeyAuto(keyCode, interaction.user, ticketChannel, ticketEmbedMsg);
          await interaction.editReply({ content: `Ticket creato: ${ticketChannel}\n✅ Key riscattata! 🩸` });
        } else {
          await ticketChannel.send({ content: `❌ Key non valida o già usata. Incolla una key valida.` });
          await interaction.editReply({ content: `Ticket creato: ${ticketChannel}\n❌ Key non valida 🩸` });
        }
      } else {
        const service = interaction.fields.getTextInputValue('service_input') || 'Not specified';
        const issue = interaction.fields.getTextInputValue('issue_input');
        const categoryNames = { questions: 'Questions', general: 'General Support', notreceived: 'Product Not Received', replacement: 'Replacement' };

        const ticketEmbed = new EmbedBuilder()
.setColor('#FF0000')
.setTitle(`Ticket - ${categoryNames[category]}`)
.addFields(
        { name: 'User', value: `${interaction.user}`, inline: true },
        { name: 'Category', value: categoryNames[category], inline: true },
        { name: 'Service', value: service, inline: true },
        { name: 'Issue', value: issue }
      )
.setFooter({ text: SERVER_NAME })
.setTimestamp();

        const closeButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await ticketChannel.send({ content: `${interaction.user} <@&${STAFF_ROLE_ID}>`, embeds: [ticketEmbed], components: [closeButton] });
        await interaction.editReply({ content: `Ticket created: ${ticketChannel} 🩸` });
      }
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
      await interaction.reply({ content: 'Ticket will close in 5 seconds...' });
      setTimeout(() => interaction.channel.delete(), 5000);
    }

  } catch (error) {
    console.error('ERROR:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: `Errore: ${error.message} 💔` });
    } else {
      await interaction.reply({ content: `Errore: ${error.message} 💔`, ephemeral: true });
    }
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot ||!message.channel.name.startsWith('ticket-')) return;
  if (!message.channel.topic?.includes('manual')) return;

  const isNumeric = /^\d+$/.test(message.content.trim());
  if (isNumeric) {
    const keyCode = message.content.trim();
    if (KEYS[keyCode] &&!KEYS[keyCode].used) {
      await message.react('⏳');
      const messages = await message.channel.messages.fetch({ limit: 10 });
      const ticketEmbedMsg = messages.find(m => m.embeds.length > 0 && m.author.id === client.user.id);
      if (ticketEmbedMsg) {
        const result = await redeemKeyAuto(keyCode, message.author, message.channel, ticketEmbedMsg);
        if (result.success) {
          await message.react('✅');
          await message.reply('✅ **Key riscattata!** Controlla i DM per le credenziali 🩸');
        }
      }
    }
  }
});

app.post('/api/crea-key', async (req, res) => {
  try {
    console.log('=== ORDINE DA SELLAUTH ===', req.body);

    const { id, email, product, product_id, quantity } = req.body;

    const resellmeResponse = await axios.post(RESELLME_WEBHOOK, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    console.log('Risposta ResellMe:', resellmeResponse.data);

    const credentials = resellmeResponse.data.delivered ||
                       resellmeResponse.data.message ||
                       resellmeResponse.data.credentials ||
                       resellmeResponse.data.data;

    if (!credentials || JSON.stringify(credentials) === '{}') {
      console.log('ResellMe non ha inviato credenziali');
      return res.status(500).json({ success: false, error: 'Fornitore non ha consegnato il prodotto' });
    }

    let newKey;
    do {
      newKey = Math.floor(100000 + Math.random() * 900000).toString();
    } while (KEYS[newKey]);

    KEYS[newKey] = {
      orderid: id || 'N/A',
      email: email || 'N/A',
      product: product || 'Prodotto Sconosciuto',
      product_id: product_id || product,
      quantity: quantity || 1,
      payment: 'SellAuth',
      credentials_raw: credentials,
      used: false
    };
    saveKeys();

    await new OrderLog({
      key: newKey,
      orderid: id || 'N/A',
      email: email || 'N/A',
      product: product || 'Prodotto Sconosciuto',
      quantity: quantity || 1,
      payment: 'SellAuth',
      used: false
    }).save();

    res.json({
      success: true,
      deliverable: newKey,
      message: `Grazie! Apri ticket Manual Delivery su Discord e incolla: ${newKey}`
    });

  } catch (err) {
    console.log('ERRORE RESELLME:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: 'Errore fornitore. Contatta supporto.'
    });
  }
});

app.get('/', (req, res) => res.send('LYX RL Services Online 🔴'));
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
client.login(DISCORD_TOKEN); // CORRETTO - USA LA VARIABILE TOKEN DEFINITA SOPRA
