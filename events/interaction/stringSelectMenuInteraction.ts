import {
  ChannelType,
  Events,
  StringSelectMenuInteraction,
  User,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  TextChannel,
  MessageFlags,
  Guild,
  GuildBasedChannel,
} from "discord.js";
import data from "../../src/data";
import { formatMessage } from "../../src/utils";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: StringSelectMenuInteraction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== data.message.selector.customId) return;

    const guild = interaction.guild;
    if (!guild) return;

    const value = interaction.values[0];
    if (!value) return;

    const ticket = data.tickets.find((ticket) => ticket.name === value);
    if (!ticket) return;

    const categoryId = ticket.categoryId;
    const newChannelName = interaction.user.displayName;

    const ticketCategoryAlreadyOpen = getChannelInCategory(
      interaction.guild,
      categoryId,
      newChannelName
    );
    if (ticketCategoryAlreadyOpen) {
      await interaction.reply({
        content: formatMessage(data.message.selector.alreadyOpenCategory, {
          ticket: value,
          channel: `<#${ticketCategoryAlreadyOpen.id}>`,
        }),
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const newChannel = await guild.channels.create({
      name: newChannelName,
      type: ChannelType.GuildText,
      parent: categoryId,
    });

    await interaction.reply({
      content: formatMessage(data.message.selector.message, {
        ticket: value,
        channel: `<#${newChannel.id}>`,
      }),
      flags: MessageFlags.Ephemeral,
    });

    await sendFirstMessage(newChannel, interaction.user, ticket.name);
  },
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

  const content = formatMessage(data.ticketFirstMessge, {
    user: `<@${user.id}>`,
    ticketType: ticketType,
  });

  await channel.send({
    content: content,
    components: [row],
  });
}
