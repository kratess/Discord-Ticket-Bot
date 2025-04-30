import {
  ButtonInteraction,
  Events,
  Message,
  MessageFlags,
  TextChannel,
  User,
} from "discord.js";
import data from "../../src/data";
import { AttachmentBuilder } from "discord.js";
import { formatMessage } from "../../src/utils";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== data.ticket_close.customId) return;

    if (data.ticket_close.delay > 0) {
      await interaction.reply({
        content: data.ticket_close.message,
        flags: MessageFlags.Ephemeral,
      });
    }

    setTimeout(async () => {
      const ticketChannel = interaction.channel;
      if (ticketChannel && ticketChannel instanceof TextChannel) {
        const channel = await interaction.client.channels.fetch(
          data.transcript.channelId
        );
        if (channel && channel instanceof TextChannel) {
          await createTranscript(ticketChannel, channel, interaction.user);
        }

        await ticketChannel.delete();
      }
    }, data.ticket_close.delay);
  },
};

async function createTranscript(
  sourceChannel: TextChannel,
  targetChannel: TextChannel,
  user: User
) {
  // Fetch messages from the source channel (you can increase the limit as needed)
  const messages = await sourceChannel.messages.fetch({
    limit: data.transcript.limit,
  });

  // Sort messages from oldest to newest
  const sortedMessages = messages.sort(
    (a, b) => a.createdTimestamp - b.createdTimestamp
  );

  // Generate the transcript
  let transcript = "";
  sortedMessages.forEach((message: Message) => {
    // If the message has media or attachments, we handle it
    let content = message.content;

    // Handle embeds or other attachments by appending a simple string for reference
    if (message.embeds.length > 0) {
      content += `\n[Embed Content: ${message.embeds.length} embed(s)]`;
    }

    if (message.attachments.size > 0) {
      content += `\n[Attachment(s): ${message.attachments.size} file(s)]`;
    }

    // Append message details to transcript
    transcript += `${message.author.displayName}: ${content}\n`;
  });

  // If the transcript is too long, truncate it (Discord message character limit is 2000)
  if (transcript.length > 2000) {
    transcript = transcript.substring(0, 2000) + "... (transcript too long)";
  }

  // Send the transcript as a file to the target channel
  await targetChannel.send({
    content: formatMessage(data.transcript.message, {
      ticket: sourceChannel.name,
      user: `<@${user.id}>`,
    }),
    files: [
      new AttachmentBuilder(Buffer.from(transcript), {
        name: "transcript.txt",
      }),
    ],
  });
}
