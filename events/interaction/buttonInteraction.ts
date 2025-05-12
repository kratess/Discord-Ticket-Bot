import {
  ButtonInteraction,
  Events,
  MessageFlags,
  TextChannel
} from "discord.js";
import data from "../../src/data";
import { createTranscript, openTicket } from "../../services/ticket";
import { log } from "../../src/utils";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return;

    // close ticket
    if (interaction.customId === data.ticket_close.customId) {
      if (data.ticket_close.delay > 0) {
        await interaction.reply({
          content: data.ticket_close.message,
          flags: MessageFlags.Ephemeral
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
          log(
            `Close ticket ${ticketChannel.name} by ${interaction.user.displayName}`
          );
        }
      }, data.ticket_close.delay);
    } else if (
      interaction.customId.startsWith(data.message.selector.customId)
    ) {
      // open ticket with button
      const ticketName = interaction.customId.replace(
        data.message.selector.customId + "_",
        ""
      );

      openTicket(interaction, ticketName);
    }
  }
};
