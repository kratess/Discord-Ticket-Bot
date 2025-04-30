import {
  Client,
  Events,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  TextChannel,
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
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        getSelector()
      );

      const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
      // Check if last message in channel is the bot's message
      if (lastMessage && lastMessage.author.id === client.user.id) {
        // If last message is from bot then edit it
        await lastMessage.edit({ embeds: [embed], components: [row.toJSON()] });
      } else {
        // Else send new message
        await channel.send({ embeds: [embed], components: [row] });
      }
    } catch (e) {
      console.error("Guild not found!");
    }
  },
};

const getEmbedMessage = () => {
  return new EmbedBuilder()
    .setColor("#097969")
    .setTitle(data.message.title)
    .setDescription(data.message.desc)
    .setThumbnail(data.message.thumbnail)
    .addFields(
      ...data.tickets.map((ticket) => ({
        name: ticket.name,
        value: ticket.desc,
      }))
    )
    .setImage(data.message.image)
    .setFooter({
      text: "Developed by kratess.dev", // Keep this to give credits
      iconURL: "https://kratess.dev/favicon.png", // Keep this to give credits
    })
    .setTimestamp();
};

const getSelector = () => {
  return new StringSelectMenuBuilder()
    .setCustomId(data.message.selector.customId)
    .setPlaceholder(data.message.selector.placeholder)
    .addOptions(
      ...data.tickets.map((ticket) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(ticket.name)
          .setDescription(ticket.desc)
          .setValue(ticket.name)
      )
    );
};
