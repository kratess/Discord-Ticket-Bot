import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  Guild,
  GuildBasedChannel,
  Message,
  PermissionFlagsBits,
  StringSelectMenuInteraction,
  TextChannel,
  User
} from "discord.js";
import data from "../src/data";
import { formatMessage, log } from "../src/utils";
import path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

export const openTicket = async (
  interaction: ButtonInteraction | StringSelectMenuInteraction,
  ticketName: string
) => {
  await interaction.deferReply({ ephemeral: true });

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
    await interaction.editReply({
      content: formatMessage(data.message.selector.alreadyOpenCategory, {
        ticket: ticket.name,
        channel: `<#${ticketCategoryAlreadyOpen.id}>`
      })
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

  await interaction.editReply({
    content: formatMessage(data.message.selector.message, {
      ticket: ticket.name,
      channel: `<#${newChannel.id}>`
    })
  });

  await sendFirstMessage(newChannel, interaction.user, ticket.name);

  log(`Open ticket ${newChannelName}`);
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

  if (data.ticketFirstMessage?.embed) {
    const embed = getEmbedMessage(
      formatMessage(data.ticketFirstMessage?.embed, {
        user: `<@${user.id}>`,
        ticketType: ticketType
      })
    );

    await channel.send({
      content: data.ticketFirstMessage?.content || undefined,
      embeds: [embed],
      components: [row]
    });
  } else {
    await channel.send({
      content: data.ticketFirstMessage?.content || undefined,
      components: [row]
    });
  }
}

const getEmbedMessage = (msg: string) => {
  const embed = new EmbedBuilder()
    .setColor(data.message.color)
    .setTitle(data.message.title)
    .setDescription(msg)
    .setFooter({
      text: "Developed by kratess.dev", // Keep this to give credits
      iconURL: "https://kratess.dev/favicon.png" // Keep this to give credits
    })
    .setTimestamp();

  return embed;
};

export async function createTranscript(
  sourceChannel: TextChannel,
  targetChannel: TextChannel,
  user: User
) {
  const messages = await sourceChannel.messages.fetch({
    limit: data.transcript.limit
  });

  const sortedMessages = messages.sort(
    (a, b) => a.createdTimestamp - b.createdTimestamp
  );

  let transcript = "";
  sortedMessages.forEach((message: Message) => {
    let content = message.content;

    if (message.embeds.length > 0) {
      content += `\n[Embed Content: ${message.embeds.length} embed(s)]`;
    }

    if (message.attachments.size > 0) {
      content += `\n[Attachment(s): ${message.attachments.size} file(s)]`;
    }

    transcript += `${message.author.displayName}: ${content}\n`;
  });

  if (transcript.length > 2000) {
    transcript = transcript.substring(0, 2000) + "... (transcript too long)";
  }

  // Save the transcript locally
  const dir = path.resolve("transcripts");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const date = new Date().toISOString().split("T")[0];
  const filePath = path.join(dir, `${date}_${sourceChannel.id}_transcript.txt`);
  writeFileSync(filePath, transcript, "utf-8");

  // Send the transcript file to the target channel
  await targetChannel.send({
    content: formatMessage(data.transcript.message, {
      ticket: sourceChannel.name,
      user: `<@${user.id}>`
    }),
    files: [
      new AttachmentBuilder(Buffer.from(transcript), {
        name: "transcript.txt"
      })
    ]
  });
}
