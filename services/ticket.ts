import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildBasedChannel,
  MessageFlags,
  PermissionFlagsBits,
  StringSelectMenuInteraction,
  TextChannel,
  User
} from "discord.js";
import data from "../src/data";
import { formatMessage } from "../src/utils";

export const openTicket = async (
  interaction: ButtonInteraction | StringSelectMenuInteraction,
  ticketName: string
) => {
  const guild = interaction.guild;
  if (!guild) return;

  const ticket = data.tickets.find((ticket) => ticket.name === ticketName);
  if (!ticket) return;

  const categoryId = ticket.categoryId;
  const newChannelName = formatMessage(data.ticketChannelName, {
    user: interaction.user.displayName
  });

  const ticketCategoryAlreadyOpen = getChannelInCategory(
    guild,
    categoryId,
    newChannelName
  );
  if (ticketCategoryAlreadyOpen) {
    await interaction.reply({
      content: formatMessage(data.message.selector.alreadyOpenCategory, {
        ticket: ticket.name,
        channel: `<#${ticketCategoryAlreadyOpen.id}>`
      }),
      flags: MessageFlags.Ephemeral
    });

    return;
  }

  const category = await guild.channels.fetch(categoryId);
  if (!category || category.type !== ChannelType.GuildCategory) return;

  // Clone permission overwrites from the category
  const botMember = await guild.members.fetchMe();

  const permissionOverwrites = category.permissionOverwrites.cache
    .filter((overwrite) => {
      // Filter permissions over bot
      const targetRole = guild.roles.cache.get(overwrite.id);
      if (targetRole) {
        return botMember.roles.highest.comparePositionTo(targetRole) >= 0;
      }
      return true;
    })
    .map((overwrite) => ({
      id: overwrite.id,
      allow: overwrite.allow.toArray(),
      deny: overwrite.deny.toArray()
    }));

  const newChannel = await guild.channels.create({
    name: newChannelName,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: [
      ...permissionOverwrites,
      {
        // Allow access to the specific user
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ]
  });

  await interaction.reply({
    content: formatMessage(data.message.selector.message, {
      ticket: ticket.name,
      channel: `<#${newChannel.id}>`
    }),
    flags: MessageFlags.Ephemeral
  });

  await sendFirstMessage(newChannel, interaction.user, ticket.name);
};

function getChannelInCategory(
  guild: Guild,
  categoryId: string,
  name: string
): GuildBasedChannel | undefined {
  return guild.channels.cache.find(
    (channel) =>
      channel.parentId === categoryId &&
      channel.name.toLowerCase() === name.toLowerCase()
  );
}

async function sendFirstMessage(
  channel: TextChannel,
  user: User,
  ticketType: string
) {
  const commonButton = new ButtonBuilder()
    .setCustomId(data.ticket_close.customId)
    .setLabel(data.ticket_close.label)
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(commonButton);

  const formattedMessage = formatMessage(data.ticketFirstMessge, {
    user: `<@${user.id}>`,
    ticketType: ticketType
  });

  await channel.send({
    embeds: [getEmbedMessage(formattedMessage)],
    components: [row]
  });
}

const getEmbedMessage = (desc: string) => {
  const embed = new EmbedBuilder()
    .setColor(data.message.color)
    .setTitle(data.message.title)
    .setDescription(desc)
    .setFooter({
      text: "Developed by kratess.dev", // Keep this to give credits
      iconURL: "https://kratess.dev/favicon.png" // Keep this to give credits
    })
    .setTimestamp();

  return embed;
};