import {
  Client,
  Events,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  TextChannel,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import data from "../src/data"; // Import your data that contains guildId and channelId

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    if (!client.user) return;

    console.log(
      `Ready! Logged in as ${client.user.tag}. Bot created by kratess <https://kratess.dev/>`
    ); // Keep this to give credits

    try {
      const guild = await client.guilds.fetch(data.guildId);

      const channel = await guild.channels.fetch(data.channelId);
      if (!channel || !(channel instanceof TextChannel)) {
        console.error("Channel not found or is not a text channel!");
        return;
      }

      const embed = getEmbedMessage();
      let components: ActionRowBuilder<any>[] = [];

      switch (data.message.selectorType) {
        case "buttons":
          components = getSelectorButtons(); // returns an array
          break;
        case "list":
        default:
          components = [getSelectorList()]; // wrap single row in array
          break;
      }

      const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
      // Check if last message in channel is the bot's message
      if (lastMessage && lastMessage.author.id === client.user.id) {
        // If last message is from bot then edit it
        await lastMessage.edit({
          embeds: [embed],
          components
        });
      } else {
        // Else send new message
        await channel.send({
          embeds: [embed],
          components
        });
      }
    } catch (error) {
      console.error("Guild not found!", error);
    }
  }
};

const getEmbedMessage = () => {
  const embed = new EmbedBuilder()
    .setColor(data.message.color)
    .setTitle(data.message.title)
    .setDescription(data.message.desc)
    .setThumbnail(data.message.thumbnail)
    .setImage(data.message.image)
    .setFooter({
      text: "Developed by kratess.dev", // Keep this to give credits
      iconURL: "https://kratess.dev/favicon.png" // Keep this to give credits
    })
    .setTimestamp();

  if (data.message.autoFields) {
    embed.addFields(
      ...data.tickets.map((ticket) => ({
        name: ticket.name,
        value: ticket.desc || ""
      }))
    );
  } else if (data.message.customFields) {
    embed.addFields(data.message.customFields);
  }

  return embed;
};

const getSelectorList = () => {
  const selector = new StringSelectMenuBuilder()
    .setCustomId(data.message.selector.customId)
    .setPlaceholder(data.message.selector.placeholder)
    .addOptions(
      ...data.tickets.map((ticket) => {
        const option = new StringSelectMenuOptionBuilder()
          .setLabel(ticket.name)
          .setValue(ticket.name);

        if (ticket.desc) {
          option.setDescription(ticket.desc); // Only set description if it is defined
        }

        return option;
      })
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selector
  );
};

const getSelectorButtons = () => {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let currentRow = new ActionRowBuilder<ButtonBuilder>();

  data.tickets.forEach((ticket, index) => {
    const button = new ButtonBuilder()
      .setCustomId(`${data.message.selector.customId}_${ticket.name}`)
      .setLabel(ticket.name)
      .setStyle(ticket.buttonColor || ButtonStyle.Secondary);

    if (ticket.emoji) {
      button.setEmoji(ticket.emoji);
    }

    currentRow.addComponents(button);

    // Add the row if it's full or it's the last button
    if (
      currentRow.components.length === 5 ||
      index === data.tickets.length - 1
    ) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>();
    }
  });

  return rows;
};
